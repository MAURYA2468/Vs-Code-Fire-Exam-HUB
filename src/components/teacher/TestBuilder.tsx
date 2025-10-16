
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, XCircle, FileText, BarChart, Clock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { Test } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Label } from "../ui/label";

const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Option text cannot be empty"),
});

const questionSchema = z.object({
  id: z.string(),
  type: z.enum(["mcq", "short-answer", "essay"]),
  text: z.string().min(1, "Question text cannot be empty"),
  points: z.coerce.number().min(1, "Points must be at least 1"),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  category: z.string().min(1, "Category is required"),
  negativeMarks: z.coerce.number().optional(),
  explanation: z.string().optional(),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.string().optional(),
});

const testSchema = z.object({
  title: z.string().min(1, "Test title is required"),
  description: z.string().optional(),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  questions: z.array(questionSchema).min(1, "A test must have at least one question"),
  accessCode: z.string().optional(),
  maxAttempts: z.coerce.number().min(0, "Maximum attempts cannot be negative").optional(),
}).superRefine((data, ctx) => {
    data.questions.forEach((q, index) => {
        if (q.type === "mcq" && (!q.correctAnswer || q.correctAnswer === "")) {
            ctx.addIssue({
                path: [`questions`, index, `correctAnswer`],
                message: "A correct answer must be selected for MCQs.",
                code: z.ZodIssueCode.custom
            })
        }
    })
});

type TestFormData = z.infer<typeof testSchema>;

const TESTS_STORAGE_KEY = "exam-hub-tests";

interface TestBuilderProps {
    existingTest?: Test | null;
}

const QuizSummary = ({ form }: { form: any }) => {
    const questions = form.watch('questions');
    const totalQuestions = questions.length;
    const totalMarks = questions.reduce((acc: number, q: any) => acc + (q.points || 0), 0);
    const duration = form.watch('duration');

    return (
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle>Quiz Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around">
                <div className="text-center">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <p className="text-2xl font-bold">{totalQuestions}</p>
                    <p className="text-muted-foreground">Questions</p>
                </div>
                <div className="text-center">
                    <BarChart className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <p className="text-2xl font-bold">{totalMarks}</p>
                    <p className="text-muted-foreground">Total Marks</p>
                </div>
                 <div className="text-center">
                    <Clock className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <p className="text-2xl font-bold">{duration || 0}</p>
                    <p className="text-muted-foreground">Minutes</p>
                </div>
            </CardContent>
        </Card>
    );
};


export default function TestBuilder({ existingTest }: TestBuilderProps) {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const isEditMode = !!existingTest;

    const form = useForm<TestFormData>({
        resolver: zodResolver(testSchema),
        defaultValues: {
            title: "",
            description: "",
            duration: 30,
            questions: [],
            accessCode: "",
            maxAttempts: 1,
        },
    });

    useEffect(() => {
        if (existingTest) {
            form.reset({
                ...existingTest,
                description: existingTest.description ?? "",
                accessCode: existingTest.accessCode ?? "",
                maxAttempts: existingTest.maxAttempts ?? 1,
                questions: existingTest.questions.map(q => ({
                    ...q,
                    negativeMarks: q.negativeMarks ?? 0,
                    explanation: q.explanation ?? "",
                }))
            });
        }
    }, [existingTest, form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "questions",
    });

    const onSubmit = (data: TestFormData) => {
        if (!user) return;

        const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
        let allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
        
        const finalData = {
            ...data,
            accessCode: data.accessCode?.trim() === '' ? undefined : data.accessCode,
        }

        if (isEditMode && existingTest) {
            // Update existing test
            const testIndex = allTests.findIndex(t => t.id === existingTest.id);
            if (testIndex !== -1) {
                allTests[testIndex] = { ...allTests[testIndex], ...finalData, id: existingTest.id };
                toast({
                    title: "Test Updated!",
                    description: `"${data.title}" has been saved successfully.`,
                });
            }
        } else {
            // Create new test
            const newTest: Test = {
                id: crypto.randomUUID(),
                teacherId: user.id,
                createdAt: new Date().toISOString(),
                ...finalData,
            };
            allTests.push(newTest);
            toast({
                title: "Test Created!",
                description: `"${data.title}" has been saved successfully.`,
            });
        }

        localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(allTests));
        router.push("/teacher/tests");
    };

    const addQuestion = (type: "mcq" | "short-answer" | "essay") => {
        append({
            id: crypto.randomUUID(),
            type,
            text: "",
            points: 10,
            difficulty: 'Medium',
            category: '',
            negativeMarks: 0,
            explanation: '',
            options: type === "mcq" ? [{id: crypto.randomUUID(), text: ""}, {id: crypto.randomUUID(), text: ""}] : [],
            correctAnswer: "",
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 <QuizSummary form={form} />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField name="title" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Test Title</FormLabel>
                            <FormControl><Input placeholder="e.g., Algebra Basics Quiz" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="duration" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 60" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="description" control={form.control} render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl><Textarea placeholder="A brief description of the test content." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                     <FormField name="accessCode" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Access Code (Optional)</FormLabel>
                            <FormDescription>If set, students must enter this code to start the test.</FormDescription>
                            <FormControl><Input placeholder="e.g., ALGEBRA101" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField name="maxAttempts" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Max Attempts</FormLabel>
                            <FormDescription>Set to 0 for unlimited attempts.</FormDescription>
                            <FormControl><Input type="number" min={0} {...field} value={field.value ?? 0} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Questions</h3>
                    {fields.map((field, index) => (
                        <QuestionBuilder key={field.id} form={form} index={index} removeQuestion={remove} />
                    ))}
                     {form.formState.errors.questions && !form.formState.errors.questions.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.questions.message}</p>}

                    <div className="flex flex-wrap gap-2 rounded-lg border border-dashed p-4 justify-center">
                        <Button type="button" variant="outline" onClick={() => addQuestion("mcq")}>
                            <PlusCircle className="mr-2" /> Add Multiple Choice
                        </Button>
                        <Button type="button" variant="outline" onClick={() => addQuestion("short-answer")}>
                            <PlusCircle className="mr-2" /> Add Short Answer
                        </Button>
                        <Button type="button" variant="outline" onClick={() => addQuestion("essay")}>
                            <PlusCircle className="mr-2" /> Add Essay
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Save Test"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function QuestionBuilder({ form, index, removeQuestion }: { form: any; index: number, removeQuestion: (index: number) => void }) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: `questions.${index}.options`,
    });
    
    const questionType = form.watch(`questions.${index}.type`);

    return (
        <Card className="bg-card/50 border-border/70" key={index}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Question {index + 1}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <FormField name={`questions.${index}.type`} control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                                    <SelectItem value="short-answer">Short Answer</SelectItem>
                                    <SelectItem value="essay">Essay</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField name={`questions.${index}.points`} control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Points</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name={`questions.${index}.negativeMarks`} control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Negative Marks</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 0.25" {...field} value={field.value ?? 0} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name={`questions.${index}.difficulty`} control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name={`questions.${index}.category`} control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category/Topic</FormLabel>
                            <FormControl><Input placeholder="e.g., Algebra" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <FormField name={`questions.${index}.text`} control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Question Text</FormLabel>
                        <FormControl><Textarea placeholder="What is the question?" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                {questionType === 'mcq' && (
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name={`questions.${index}.correctAnswer`}
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Options</FormLabel>
                                    <FormDescription>Select the correct answer by clicking the radio button.</FormDescription>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                            {fields.map((option, optionIndex) => {
                                                const optionId = (option as any).id;
                                                return (
                                                <div key={optionId} className="flex items-center gap-2 space-y-0">
                                                    <RadioGroupItem value={optionId} id={`${field.name}-${optionId}`} />
                                                    <Label htmlFor={`${field.name}-${optionId}`} className="w-full">
                                                        <FormField
                                                            control={form.control}
                                                            name={`questions.${index}.options.${optionIndex}.text`}
                                                            render={({ field: optionField }) => (
                                                                <FormItem className="flex-1">
                                                                    <FormControl>
                                                                        <Input placeholder={`Option ${optionIndex + 1}`} {...optionField} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </Label>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(optionIndex)} disabled={fields.length <= 2}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )})}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Button type="button" variant="outline" size="sm" onClick={() => append({ id: crypto.randomUUID(), text: "" })}>
                            <PlusCircle className="mr-2" /> Add Option
                        </Button>
                    </div>
                )}
                 <FormField name={`questions.${index}.explanation`} control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Explanation (Optional)</FormLabel>
                         <FormDescription>This will be shown to the student after they complete the test.</FormDescription>
                        <FormControl><Textarea placeholder="Explain why the correct answer is right." {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </CardContent>
        </Card>
    );
}

    