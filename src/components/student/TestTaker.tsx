
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Test, Submission, Answer, Question } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Clock, CameraOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";

type FormData = {
  answers: { [questionId: string]: string };
};

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface TestTakerProps {
  testId: string;
  attemptNumber: number;
}


export default function TestTaker({ testId, attemptNumber }: TestTakerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleSubmit, control, getValues, setValue } = useForm<FormData>({
    defaultValues: { answers: {} },
  });

  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveCount, setLeaveCount] = useState(0);

  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);


  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to continue.',
        });
      }
    };

    getCameraPermission();
  }, [toast]);

  useEffect(() => {
    const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
    const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
    const foundTest = allTests.find(t => t.id === testId);

    if (foundTest) {
      // Randomize questions and options for anti-cheating
      const randomizedTest: Test = {
        ...foundTest,
        questions: shuffleArray(foundTest.questions).map((question: Question) => {
          if (question.type === 'mcq' && question.options) {
            return { ...question, options: shuffleArray(question.options) };
          }
          return question;
        }),
      };

      setTest(randomizedTest);
      setTimeLeft(randomizedTest.duration * 60);
    }
    setIsLoading(false);
  }, [testId]);

  useEffect(() => {
    if (test && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && test) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!isSubmitting) {
        submitTest(getValues());
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [test, timeLeft, getValues, isSubmitting]);

  useEffect(() => {
    if (!carouselApi) return;
    setSlideCount(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const newLeaveCount = leaveCount + 1;
        setLeaveCount(newLeaveCount);
        toast({
          variant: "destructive",
          title: "Warning: You have left the test page.",
          description: `This is your ${newLeaveCount} time leaving. This activity is recorded.`,
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [leaveCount, toast]);

  const submitTest = async (data: FormData) => {
    if (!user || !test || isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const answers: Answer[] = Object.entries(data.answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));

    // Auto-grade MCQs
    let score = 0;
    // We need the original, unshuffled test to find the correct answer IDs.
    const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
    const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
    const originalTest = allTests.find(t => t.id === testId);

    originalTest?.questions.forEach(q => {
      if (q.type === 'mcq') {
        const studentAnswer = answers.find(a => a.questionId === q.id);
        if (studentAnswer && studentAnswer.value === q.correctAnswer) {
          score += q.points;
        }
      }
    });

    const newSubmission: Submission = {
      id: crypto.randomUUID(),
      testId: test.id,
      studentId: user.id,
      answers,
      submittedAt: new Date().toISOString(),
      attemptNumber,
      score,
      leaveCount: leaveCount,
    };

    const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
    allSubmissions.push(newSubmission);
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(allSubmissions));

    toast({
      title: "Test Submitted!",
      description: `Your submission for "${test.title}" has been recorded.`,
    });

    router.push(`/student/results/${newSubmission.id}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast({
        variant: "destructive",
        title: "Pasting is disabled",
        description: "Please type your own answer."
    });
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!test) {
    return <div className="text-center text-destructive">Test not found.</div>;
  }

  const progressPercentage = slideCount > 0 ? ((currentSlide + 1) / slideCount) * 100 : 0;
  
  const handleQuestionJump = (questionIndex: string) => {
    if (carouselApi) {
      carouselApi.scrollTo(parseInt(questionIndex, 10));
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center py-8">
       <Card className="w-full max-w-sm self-start mb-4 bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Proctoring</CardTitle>
          <CardDescription>Your camera is being monitored.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
            <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
            {!hasCameraPermission && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                <CameraOff className="h-10 w-10" />
                <p className="mt-2 text-center font-semibold">Camera Access Denied</p>
              </div>
            )}
          </div>
           {!hasCameraPermission && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access. Your test may be invalidated without it.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-4xl bg-card/70 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">{test.title}</CardTitle>
          <CardDescription>{test.description}</CardDescription>
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="flex items-center justify-center gap-2 font-semibold text-lg text-primary">
              <Clock className="h-6 w-6" />
              <span>Time Left: {formatTime(timeLeft)}</span>
            </div>
             {leaveCount > 0 && (
              <div className="flex items-center gap-2 text-yellow-500 font-semibold text-lg">
                <AlertTriangle className="h-6 w-6" />
                <span>{leaveCount}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submitTest)}>
            <Carousel setApi={setCarouselApi} className="w-full">
              <CarouselContent>
                {test.questions.map((q, index) => (
                  <CarouselItem key={q.id}>
                    <div className="p-1">
                      <Card className="bg-background">
                        <CardHeader>
                          <CardTitle>Question {index + 1} <span className="text-sm font-normal text-muted-foreground">({q.points} points)</span></CardTitle>
                          <CardDescription className="text-base text-foreground pt-2">{q.text}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Controller
                            name={`answers.${q.id}`}
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <>
                                {q.type === 'mcq' && q.options && (
                                  <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                    {q.options.map(option => (
                                      <div key={option.id} className="flex items-center space-x-2 rounded-md border p-4 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary">
                                        <RadioGroupItem value={option.id} id={option.id} />
                                        <Label htmlFor={option.id} className="flex-1 cursor-pointer">{option.text}</Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                )}
                                {q.type === 'short-answer' && (
                                  <Input {...field} placeholder="Your answer..." onPaste={handlePaste} />
                                )}
                                {q.type === 'essay' && (
                                  <Textarea {...field} placeholder="Your essay..." rows={8} onPaste={handlePaste} />
                                )}
                              </>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="flex" />
              <CarouselNext className="flex" />
            </Carousel>
            
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="w-full max-w-sm">
                <Progress value={progressPercentage} className="w-full" />
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Question {currentSlide + 1} of {slideCount}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Select onValueChange={handleQuestionJump} value={currentSlide.toString()}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Jump to question..." />
                  </SelectTrigger>
                  <SelectContent>
                    {test.questions.map((_, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        Question {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            size="lg"
            variant="destructive"
            onClick={() => setShowSubmitWarning(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Finish & Submit Test"}
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={showSubmitWarning} onOpenChange={setShowSubmitWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
            <AlertDialogDescription>
              You cannot change your answers after submitting. Please review your answers before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitWarning(false)}>Cancel</Button>
            <AlertDialogAction asChild>
                <Button variant="destructive" onClick={handleSubmit(submitTest)} disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Yes, Submit Now"}
                </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
