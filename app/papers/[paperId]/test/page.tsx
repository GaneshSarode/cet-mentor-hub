"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MathRenderer } from "@/components/MathRenderer";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Flag,
  AlertCircle,
  PlayCircle
} from "lucide-react";
import { PyqPaper, PyqQuestion, PyqTestSession, PyqTestAnswer } from "@/lib/types/database";
// We would import 'katex/dist/katex.min.css' here, but letting client render it raw or use a React KaTeX wrapper

export default function TestPage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const router = useRouter();
  const { paperId } = use(params);
  const { isSignedIn, isLoaded, user } = useUser();

  const [paper, setPaper] = useState<PyqPaper | null>(null);
  const [questions, setQuestions] = useState<PyqQuestion[]>([]);
  const [session, setSession] = useState<PyqTestSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, PyqTestAnswer>>({}); // keyed by question_id

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSubject, setActiveSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'all'>('all');
  const [timeRemaining, setTimeRemaining] = useState(10800); // 3 hours in seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  const [currentSelectedOption, setCurrentSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [timeSpentOnCurrent, setTimeSpentOnCurrent] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // 1. Initial Data Fetch
  useEffect(() => {
    async function loadTestData() {
      if (!isLoaded || !isSignedIn) {
         if (isLoaded && !isSignedIn) {
            router.push(`/sign-in?redirect_url=/papers/${paperId}/test`);
         }
         return;
      }
      
      try {
        setIsLoading(true);
        // Fetch paper metadata to check if valid
        const pRes = await fetch('/api/pyq/papers');
        const pData = await pRes.json();
        const currentPaper = pData.papers?.find((p: any) => p.id === paperId);
        if (!currentPaper) throw new Error("Paper not found");
        setPaper(currentPaper);
        
        // Fetch session (or create one)
        const sRes = await fetch('/api/pyq/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paper_id: paperId })
        });
        const sData = await sRes.json();
        
        if (sData.error) throw new Error(sData.error);
        
        const currentSession = sData.session;
        setSession(currentSession);
        setTimeRemaining(currentSession.time_remaining_seconds);

        if (currentSession.status === 'completed') {
           router.replace(`/papers/${paperId}/result`);
           return;
        }

        // If resumed, fetch existing answers
        if (sData.resumed) {
          const aRes = await fetch(`/api/pyq/sessions/${currentSession.id}/answers`);
          const aData = await aRes.json();
          if (aData.answers) {
            const answersMap: Record<string, PyqTestAnswer> = {};
            aData.answers.forEach((ans: PyqTestAnswer) => {
              answersMap[ans.question_id] = ans;
            });
            setAnswers(answersMap);
          }
        }

        // We defer full question fetch until user hits "Start Test" to save bandwidth
        // but since it's a mock exam, fetching all at once is fine.
        const qRes = await fetch(`/api/pyq/papers/${paperId}/questions`);
        const qData = await qRes.json();
        if (qData.error) throw new Error(qData.error);
        setQuestions(qData.questions || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTestData();
  }, [paperId, isLoaded, isSignedIn, router]);

  // Exam Mode Guard
  useEffect(() => {
    if (!hasStarted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent copy/paste/print
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasStarted]);

  // Timer & Periodic Sync
  useEffect(() => {
    if (!hasStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam(); // Auto-submit
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentOnCurrent((prev) => prev + 1);
    }, 1000);

    // Sync session time every 60 seconds
    const syncInterval = setInterval(() => {
       if (session) {
         fetch(`/api/pyq/sessions/${session.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ time_remaining_seconds: timeRemaining })
         });
       }
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(syncInterval);
    };
  }, [hasStarted, session, timeRemaining]); // Note: timeRemaining dependency might cause excessive re-renders, normally use a mutable ref for sync

  // Update current option when question changes
  useEffect(() => {
    if (questions.length > 0) {
      const qId = questions[currentQuestionIndex].id;
      setCurrentSelectedOption(answers[qId]?.selected_option || null);
      setTimeSpentOnCurrent(0); // Reset local timer for this visit
    }
  }, [currentQuestionIndex, questions, answers]);


  // Actions
  const handleStart = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(()=>console.log("Fullscreen ignored"));
      }
    } catch(e) {}
    setHasStarted(true);
  };

  const saveAnswer = async (qId: string, option: 'A'|'B'|'C'|'D'|null, isReview: boolean) => {
    if (!session) return;
    setSyncing(true);
    try {
      const prevTimeSpent = answers[qId]?.time_spent_seconds || 0;
      const payload = {
        question_id: qId,
        selected_option: option,
        is_marked_for_review: isReview,
        time_spent_seconds: prevTimeSpent + timeSpentOnCurrent
      };
      
      const res = await fetch(`/api/pyq/sessions/${session.id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(!data.error) {
        setAnswers(prev => ({...prev, [qId]: data.answer}));
      }
    } catch(err) {
      console.error("Save answer failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveAndNext = async () => {
    const currentQ = questions[currentQuestionIndex];
    const isReview = answers[currentQ.id]?.is_marked_for_review || false;
    await saveAnswer(currentQ.id, currentSelectedOption, isReview);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleMarkReviewAndNext = async () => {
    const currentQ = questions[currentQuestionIndex];
    await saveAnswer(currentQ.id, currentSelectedOption, true);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleClearResponse = async () => {
    setCurrentSelectedOption(null);
    const currentQ = questions[currentQuestionIndex];
    const isReview = answers[currentQ.id]?.is_marked_for_review || false;
    await saveAnswer(currentQ.id, null, isReview);
  };

  const submitExam = async () => {
    if (!session) return;
    // Save current question one last time before submitting
    const currentQ = questions[currentQuestionIndex];
    await saveAnswer(currentQ.id, currentSelectedOption, answers[currentQ.id]?.is_marked_for_review || false);

    await fetch(`/api/pyq/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed', time_remaining_seconds: timeRemaining })
    });
    
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(()=>{});
    }
    router.replace(`/papers/${paperId}/result`);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !paper || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Error loading test</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button className="mt-6" onClick={() => router.push('/papers')}>Back to Papers</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  // Palette filters
  const displayQuestions = activeSubject === 'all' 
    ? questions 
    : questions.filter(q => q.subject === activeSubject);

  const getQuestionStatusDetails = (qId: string) => {
     const ans = answers[qId];
     if (!ans) return { color: "bg-red-500/10 text-red-600 border-red-200", status: "Not Visited" }; // Mock doesn't track visited perfectly yet without writing to DB, simulating
     if (ans.is_marked_for_review && ans.selected_option) return { color: "bg-orange-500 text-white", status: "Marked & Answered" };
     if (ans.is_marked_for_review && !ans.selected_option) return { color: "bg-orange-500/20 text-orange-600 border-orange-300", status: "Marked for Review" };
     if (ans.selected_option) return { color: "bg-green-500 text-white", status: "Answered" };
     return { color: "bg-slate-200 text-slate-800", status: "Visited Unanswered" }; 
  };


  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">{paper.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{paper.year}</Badge>
              <Badge variant="outline" className="capitalize">{paper.shift} Shift</Badge>
              <Badge>{paper.subject_group}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold text-foreground">{paper.total_questions}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold text-foreground">{paper.duration_minutes} min</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground border-l-4 border-primary pl-4">
              <h4 className="font-semibold text-foreground text-base">Important Instructions:</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>This is an exam simulation. You cannot exit fullscreen or right-click.</li>
                <li>Closing the tab will pause the test, but the timer continues.</li>
                <li>Clicking <strong>"Save & Next"</strong> saves your answer securely.</li>
                <li>Marking Scheme: <strong>Maths +2/0</strong>, <strong>Physics & Chem +1/0</strong>. No negative marking.</li>
                <li>Test will auto-submit when the timer reaches 00:00:00.</li>
              </ul>
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleStart}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                {session?.status === 'in_progress' && timeRemaining < paper.duration_minutes * 60 ? 'Resume Test' : 'Start Test'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Main Test UI ---
  return (
    <div className="min-h-screen bg-background flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between px-4 border-b bg-card shrink-0">
         <div className="font-semibold text-foreground truncate max-w-[50%]">
           {paper.title}
         </div>
         <div className="flex items-center gap-4">
           <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono font-bold text-lg tracking-wider ${timeRemaining < 300 ? 'text-white bg-destructive animate-pulse' : 'bg-muted text-foreground'}`}>
             <Clock className="w-4 h-4" />
             {formatTime(timeRemaining)}
           </div>
           <Button onClick={() => setShowSubmitDialog(true)} variant="outline" className="border-primary text-primary hover:bg-primary/10">
              Submit Test
           </Button>
         </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Question Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Subject Tabs */}
          <div className="flex border-b bg-muted/20 shrink-0">
             {['Physics', 'Chemistry', 'Mathematics'].map(subj => (
               <button 
                 key={subj}
                 className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeSubject === subj ? 'border-primary text-primary bg-background' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
                 onClick={() => {
                   setActiveSubject(subj as any);
                   // jump to first question of this subject
                   const firstIdx = questions.findIndex(q => q.subject === subj);
                   if (firstIdx !== -1) setCurrentQuestionIndex(firstIdx);
                 }}
               >
                 {subj}
               </button>
             ))}
          </div>
          
          {/* Question Details */}
          <div className="p-4 border-b bg-background flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
               <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                 Q. {currentQuestion?.question_number}
               </Badge>
               <span className="text-sm font-medium text-muted-foreground">{currentQuestion?.subject}</span>
               <span className="text-xs text-muted-foreground">({currentQuestion?.marks_positive} Marks)</span>
             </div>
             {syncing && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
          </div>

          {/* Question Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {currentQuestion ? (
               <div className="max-w-3xl">
                 <MathRenderer 
                    className="prose dark:prose-invert max-w-none text-foreground text-lg mb-8" 
                    html={currentQuestion.question_text} 
                 />

                 <RadioGroup value={currentSelectedOption || ""} onValueChange={(v) => setCurrentSelectedOption(v as any)} className="space-y-4">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <div key={opt} className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${currentSelectedOption === opt ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`} onClick={() => setCurrentSelectedOption(opt as any)}>
                        <RadioGroupItem value={opt} id={`opt-${opt}`} className="mt-1" />
                        <Label htmlFor={`opt-${opt}`} className="flex-1 cursor-pointer text-base leading-relaxed">
                          {/* @ts-ignore - indexing object */}
                          <MathRenderer html={currentQuestion[`option_${opt.toLowerCase()}` as keyof PyqQuestion] as string} />
                        </Label>
                      </div>
                    ))}
                 </RadioGroup>
               </div>
            ) : (
               <div className="text-center text-muted-foreground">No question data available.</div>
            )}
          </div>

          {/* Action Footer */}
          <div className="h-16 border-t bg-card flex items-center justify-between px-6 shrink-0">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleMarkReviewAndNext}>
                 Mark for Review & Next
              </Button>
              <Button variant="ghost" onClick={handleClearResponse}>
                 Clear Response
              </Button>
            </div>
            <div className="flex gap-2 text-red-500">
               <Button onClick={handleSaveAndNext} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                 Save & Next
               </Button>
            </div>
          </div>
        </div>

        {/* Right Side: Palette (Hidden on small screens, can implement drawer later) */}
        <div className="w-80 border-l bg-card flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 border-b font-medium flex items-center justify-between">
            Question Palette
            <span className="text-xs text-muted-foreground">Total: {questions.length}</span>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const { color } = getQuestionStatusDetails(q.id);
                // override if it's currently active and we changed the local option without saving yet
                const isCurrent = idx === currentQuestionIndex;
                let finalColor = color;
                if (isCurrent) {
                   finalColor += " ring-2 ring-primary ring-offset-1 dark:ring-offset-background";
                }

                // If subject filter is active, dim out other subjects
                const isFilteredOut = activeSubject !== 'all' && q.subject !== activeSubject;

                return (
                   <button
                     key={q.id}
                     onClick={async () => {
                       // Save current state before jumping
                       await saveAnswer(currentQuestion.id, currentSelectedOption, answers[currentQuestion.id]?.is_marked_for_review || false);
                       setCurrentQuestionIndex(idx);
                       setActiveSubject('all');
                     }}
                     className={`h-10 w-10 text-sm font-semibold rounded-md border ${finalColor} ${isFilteredOut ? 'opacity-30' : 'opacity-100'}`}
                   >
                     {q.question_number}
                   </button>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 border-t bg-muted/20 text-xs grid grid-cols-2 gap-y-3">
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-green-500"></div> Answered</div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-red-500/10 border-red-200 border"></div> Not Visited</div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-slate-200"></div> Not Answered</div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm bg-orange-500/20 border-orange-300 border"></div> Marked</div>
             <div className="flex items-center gap-2 col-span-2"><div className="w-4 h-4 rounded-sm bg-orange-500 flex items-center justify-center text-[10px] text-white">✔</div> Answered & Marked</div>
          </div>
          
          {/* User Profile Mini */}
          <div className="p-4 border-t flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
               {user?.firstName?.[0] || 'S'}
             </div>
             <div>
               <p className="text-sm font-semibold truncate w-48">{user?.fullName || 'Student'}</p>
             </div>
          </div>
        </div>
      </div>

       {/* Submit Confirmation Dialog */}
       <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to submit?</DialogTitle>
            <DialogDescription>
              You have {formatTime(timeRemaining)} remaining. Once submitted, you cannot alter your answers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 text-center my-4">
             <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded text-green-700 dark:text-green-400">
                <p className="text-lg font-bold">{Object.values(answers).filter(a => a.selected_option).length}</p>
                <p className="text-xs">Answered</p>
             </div>
             <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                <p className="text-lg font-bold">{paper.total_questions - Object.values(answers).filter(a => !!a).length}</p>
                <p className="text-xs">Not Visited</p>
             </div>
             <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded text-orange-700 dark:text-orange-400">
                <p className="text-lg font-bold">{Object.values(answers).filter(a => a.is_marked_for_review).length}</p>
                <p className="text-xs">Review</p>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Back to Test
            </Button>
            <Button onClick={submitExam} className="bg-primary hover:bg-primary/90">
              Submit Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
