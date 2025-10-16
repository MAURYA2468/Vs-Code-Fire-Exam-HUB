
"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Test, Submission, Answer, Question, QuestionStatus } from "@/lib/types";
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
import { Loader2, AlertTriangle, Clock, CameraOff, Bookmark, List, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";

type FormData = {
  answers: { [questionId: string]: string };
};

type QuestionState = {
  id: string;
  status: QuestionStatus;
}

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
  
  const [test, setTest] = useState<Test | null>(null);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveCount, setLeaveCount] = useState(0);

  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout>();

  const getQuestionStatesStorageKey = useCallback(() => {
    if (!user || !testId) return null;
    return `exam-hub-q-states-${user.id}-${testId}-${attemptNumber}`;
  }, [user, testId, attemptNumber]);


  const { handleSubmit, control, getValues, setValue, watch } = useForm<FormData>({
    defaultValues: { answers: {} },
  });
  
  const watchedAnswers = watch("answers");

  // Load test and initialize states
  useEffect(() => {
    const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
    const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
    const foundTest = allTests.find(t => t.id === testId);

    if (foundTest) {
      // Anti-cheating measures: Shuffle questions and options once per attempt.
      // This state is not saved, so a refresh won't reshuffle.
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

      // Initialize or load question states from localStorage
      const storageKey = getQuestionStatesStorageKey();
      const savedStatesJson = storageKey ? localStorage.getItem(storageKey) : null;
      if (savedStatesJson) {
        setQuestionStates(JSON.parse(savedStatesJson));
        // Also load saved answers
        const savedAnswers = JSON.parse(localStorage.getItem(`answers-${storageKey}`) || '{}');
        setValue('answers', savedAnswers);
      } else {
        const initialStates = randomizedTest.questions.map(q => ({ id: q.id, status: 'unattempted' as QuestionStatus }));
        setQuestionStates(initialStates);
      }
    }
    setIsLoading(false);
  }, [testId, getQuestionStatesStorageKey, setValue]);

  // Handle Carousel API and slide changes
  useEffect(() => {
    if (!carouselApi || questionStates.length === 0) return;
    
    const onSelect = () => {
      const selectedIndex = carouselApi.selectedScrollSnap();
      setCurrentSlide(selectedIndex);
      
      // Update question status to 'visited' if it was 'unattempted'
      const questionId = test?.questions[selectedIndex]?.id;
      if (questionId) {
        setQuestionStates(prevStates => {
          const newStates = [...prevStates];
          const stateIndex = newStates.findIndex(s => s.id === questionId);
          if (stateIndex !== -1 && newStates[stateIndex].status === 'unattempted') {
            newStates[stateIndex].status = 'visited';
            return newStates;
          }
          return prevStates; // No change needed
        });
      }
    };

    onSelect(); // Initial setup
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi, test?.questions, questionStates.length]);


  // Update question status when an answer is provided or cleared
  useEffect(() => {
    setQuestionStates(prevStates => {
      let hasChanged = false;
      const newStates = prevStates.map(state => {
        const answer = watchedAnswers[state.id];
        const isAnswered = answer !== undefined && answer !== null && answer !== '';
        
        if (isAnswered && state.status !== 'attempted' && state.status !== 'markedForReview') {
          hasChanged = true;
          return { ...state, status: 'attempted' };
        }
        if (!isAnswered && state.status === 'attempted') {
            hasChanged = true;
            // if it was attempted, now it's just visited
            return { ...state, status: 'visited'};
        }
        return state;
      });
      return hasChanged ? newStates : prevStates;
    });
  }, [watchedAnswers]);


  // Save states and answers to localStorage
  useEffect(() => {
    const storageKey = getQuestionStatesStorageKey();
    if (storageKey && questionStates.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(questionStates));
      localStorage.setItem(`answers-${storageKey}`, JSON.stringify(getValues('answers')));
    }
  }, [questionStates, getQuestionStatesStorageKey, getValues]);


  const getCameraPermission = useCallback(async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({ variant: 'destructive', title: 'Camera Not Supported' });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        setHasCameraPermission(false);
        toast({ variant: 'destructive', title: 'Camera Access Denied' });
      }
  }, [toast]);

  useEffect(() => {
    getCameraPermission();
  }, [getCameraPermission]);

  useEffect(() => {
    if (test && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft <= 0 && test && !isSubmitting) {
      if (timerRef.current) clearInterval(timerRef.current);
      submitTest(getValues());
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) };
  }, [test, timeLeft, getValues, isSubmitting]);

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
      questionId, value,
    }));
    
    const newSubmission: Submission = {
      id: crypto.randomUUID(),
      testId: test.id,
      studentId: user.id,
      answers,
      submittedAt: new Date().toISOString(),
      attemptNumber,
      score: 0,
      leaveCount: leaveCount,
    };

    const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
    allSubmissions.push(newSubmission);
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(allSubmissions));

    // Clean up localStorage for this attempt
    const storageKey = getQuestionStatesStorageKey();
    if (storageKey) {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`answers-${storageKey}`);
    }

    toast({ title: "Test Submitted!", description: `Your submission for "${test.title}" is awaiting grading.` });
    router.push(`/student/results/${newSubmission.id}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast({ variant: "destructive", title: "Pasting is disabled" });
  };
  
  const handleQuestionJump = (questionIndex: number) => {
    if (carouselApi) carouselApi.scrollTo(questionIndex);
  };
  
  const toggleMarkForReview = () => {
    const questionId = test?.questions[currentSlide]?.id;
    if (questionId) {
      setQuestionStates(prevStates => {
        return prevStates.map(state => {
          if (state.id === questionId) {
            const isMarked = state.status === 'markedForReview';
            const answer = getValues(`answers.${questionId}`);
            const isAnswered = answer !== undefined && answer !== '';
            let newStatus: QuestionStatus;
            if (isMarked) {
                newStatus = isAnswered ? 'attempted' : 'visited';
            } else {
                newStatus = 'markedForReview';
            }
            return { ...state, status: newStatus };
          }
          return state;
        });
      });
    }
  };

  const attemptedCount = useMemo(() => {
    return questionStates.filter(q => q.status === 'attempted' || q.status === 'markedForReview').length;
  }, [questionStates]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!test) {
    return <div className="text-center text-destructive">Test not found.</div>;
  }

  const progressPercentage = test.questions.length > 0 ? ((currentSlide + 1) / test.questions.length) * 100 : 0;
  
  const statusColors: Record<QuestionStatus, string> = {
    unattempted: 'bg-muted hover:bg-muted/80 text-muted-foreground',
    attempted: 'bg-green-500 hover:bg-green-600 text-white',
    visited: 'bg-yellow-400 hover:bg-yellow-500 text-black',
    markedForReview: 'bg-purple-500 hover:bg-purple-600 text-white',
  };

  const QuestionNavigatorContent = () => (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Question Palette</h3>
      <div className="grid grid-cols-5 gap-2">
        {test.questions.map((q, index) => {
            const state = questionStates.find(s => s.id === q.id);
            return (
              <Button
                key={q.id}
                variant="outline"
                size="icon"
                className={cn(
                    "h-9 w-9",
                    state ? statusColors[state.status] : statusColors.unattempted,
                    index === currentSlide && 'ring-2 ring-offset-2 ring-primary'
                )}
                onClick={() => handleQuestionJump(index)}
              >
                {index + 1}
              </Button>
            );
        })}
      </div>
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex items-center"><div className="h-4 w-4 rounded-full bg-green-500 mr-2 border"></div> Attempted</div>
        <div className="flex items-center"><div className="h-4 w-4 rounded-full bg-yellow-400 mr-2 border"></div> Visited</div>
        <div className="flex items-center"><div className="h-4 w-4 rounded-full bg-purple-500 mr-2 border"></div> Marked for Review</div>
        <div className="flex items-center"><div className="h-4 w-4 rounded-full bg-muted mr-2 border"></div> Unattempted</div>
      </div>
    </div>
  );


  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:block w-72 border-r p-4">
        <div className="sticky top-4 space-y-6">
            <div>
              <CardTitle>Proctoring</CardTitle>
              <CardDescription>Camera is active.</CardDescription>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                {!hasCameraPermission && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                    <CameraOff className="h-10 w-10" />
                    <p className="mt-2 text-center font-semibold">Camera Denied</p>
                </div>
                )}
            </div>
            {!hasCameraPermission && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>Your test may be invalidated without it.</AlertDescription>
            </Alert>
            )}
            <QuestionNavigatorContent />
        </div>
      </aside>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-4xl mx-auto bg-card/70 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{test.title}</CardTitle>
            <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 pt-4">
              <div className="flex items-center justify-center gap-2 font-semibold text-lg text-primary">
                <Clock className="h-6 w-6" />
                <span>Time Left: {formatTime(timeLeft)}</span>
              </div>
              <div className="font-semibold text-lg">Attempted: {attemptedCount} / {test.questions.length}</div>
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
              <div className="w-full max-w-sm mx-auto mb-4">
                  <Progress value={progressPercentage} className="w-full" />
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Question {currentSlide + 1} of {test.questions.length}
                  </p>
              </div>

              <Carousel setApi={setCarouselApi} className="w-full">
                <CarouselContent>
                  {test.questions.map((q, index) => (
                    <CarouselItem key={q.id}>
                      <div className="p-1">
                        <Card className="bg-background">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>Question {index + 1} <span className="text-sm font-normal text-muted-foreground">({q.points} points)</span></CardTitle>
                                <Button
                                  variant={questionStates.find(s => s.id === q.id)?.status === 'markedForReview' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={toggleMarkForReview}
                                  className={cn(questionStates.find(s => s.id === q.id)?.status === 'markedForReview' && 'bg-purple-500 hover:bg-purple-600')}
                                >
                                  <Bookmark className="mr-2 h-4 w-4" />
                                  {questionStates.find(s => s.id === q.id)?.status === 'markedForReview' ? 'Unmark' : 'Mark for Review'}
                                </Button>
                            </div>
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
                                  {q.type === 'short-answer' && <Input {...field} placeholder="Your answer..." onPaste={handlePaste} />}
                                  {q.type === 'essay' && <Textarea {...field} placeholder="Your essay..." rows={8} onPaste={handlePaste} />}
                                </>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </form>
          </CardContent>
          <CardFooter className="flex-col sm:flex-row justify-between items-center gap-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="secondary" className="lg:hidden">
                        <List className="mr-2 h-4 w-4" />
                        View Questions
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Question Navigator</SheetTitle>
                    </SheetHeader>
                    <QuestionNavigatorContent />
                </SheetContent>
            </Sheet>
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
      </main>
      
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
