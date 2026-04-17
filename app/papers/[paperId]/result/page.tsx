"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PyqPaper, PyqTestSession, PyqTestAnswer, PyqQuestion } from "@/lib/types/database";
import { calculateTestResult } from "@/lib/pyq-utils";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy, 
  Target, 
  AlertCircle,
  ArrowRight,
  Home
} from "lucide-react";

export default function ResultPage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const router = useRouter();
  const { paperId } = use(params);
  const { isLoaded, isSignedIn } = useUser();

  const [session, setSession] = useState<PyqTestSession & { pyq_papers: PyqPaper } | null>(null);
  const [answers, setAnswers] = useState<(PyqTestAnswer & { pyq_questions: PyqQuestion })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResultData() {
      if (!isLoaded || !isSignedIn) {
         if (isLoaded && !isSignedIn) router.push('/sign-in');
         return;
      }

      try {
        setIsLoading(true);
        // 1. Fetch user's sessions to find the most recent completed one for this paper
        const sRes = await fetch('/api/pyq/sessions');
        const sData = await sRes.json();
        
        if (sData.error) throw new Error(sData.error);
        
        // Find the completed session for this paper
        const currentSession = sData.sessions?.find((s: any) => s.paper_id === paperId && s.status === 'completed');
        
        if (!currentSession) {
          throw new Error("No completed test found for this paper.");
        }
        
        setSession(currentSession);

        // 2. Fetch answers
        const aRes = await fetch(`/api/pyq/sessions/${currentSession.id}/answers`);
        const aData = await aRes.json();
        if (aData.error) throw new Error(aData.error);
        setAnswers(aData.answers || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResultData();
  }, [paperId, isLoaded, isSignedIn, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Analyzing test results...</div>;
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Result not found</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button className="mt-6" onClick={() => router.push('/papers')}>Back to Papers</Button>
      </div>
    );
  }

  const paper = session.pyq_papers;
  const analysis = calculateTestResult(session, paper, answers);

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Excellent': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Good': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'Average': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      default: return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-2xl font-bold text-foreground">Test Analysis</h1>
              <p className="text-muted-foreground mt-1">{paper.title} — {paper.shift} Shift</p>
           </div>
           <Button variant="outline" asChild>
             <Link href="/papers"><Home className="w-4 h-4 mr-2"/> Back to Library</Link>
           </Button>
        </div>

        {/* Top Score Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-primary/20 bg-primary/5">
             <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex flex-col items-center justify-center bg-background shadow-inner shrink-0 relative overflow-hidden">
                   <div className="absolute inset-0 bg-primary/10 bottom-0 top-auto" style={{ height: `${(analysis.totalScore / Math.max(analysis.maxScore, 1)) * 100}%` }}></div>
                   <span className="text-4xl font-black text-foreground relative z-10">{analysis.totalScore}</span>
                   <span className="text-sm font-medium text-muted-foreground relative z-10">/ {analysis.maxScore}</span>
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-4">
                   <div>
                     <h2 className="text-2xl font-bold text-foreground">Your Score</h2>
                     <p className="text-muted-foreground">Scored {analysis.totalScore} out of {analysis.maxScore} marks</p>
                   </div>
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                     <Badge className={`text-sm py-1 px-3 border ${getTagColor(analysis.performanceTag)}`}>
                        {analysis.performanceTag} Performance
                     </Badge>
                     <Badge variant="outline" className="text-sm py-1 px-3 bg-background">
                       <Target className="w-4 h-4 mr-1"/> {analysis.accuracy.toFixed(1)}% Accuracy
                     </Badge>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Overall Summary</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4 pt-2">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground"><CheckCircle className="w-4 h-4 mr-2 text-green-500"/> Correct</div>
                    <span className="font-semibold">{session.correct_count}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground"><XCircle className="w-4 h-4 mr-2 text-red-500"/> Incorrect</div>
                    <span className="font-semibold">{session.wrong_count}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground"><Clock className="w-4 h-4 mr-2 text-slate-500"/> Unattempted</div>
                    <span className="font-semibold">{paper.total_questions - session.correct_count - session.wrong_count}</span>
                 </div>
                 <div className="pt-3 flex items-center justify-between border-t border-border">
                    <div className="flex items-center text-sm font-medium text-foreground"><Trophy className="w-4 h-4 mr-2 text-yellow-500"/> Total Marks</div>
                    <span className="font-bold text-primary">{analysis.totalScore} / {analysis.maxScore}</span>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject wise breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Analysis</CardTitle>
            <CardDescription>Breakdown of your performance across each subject.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-lg">Subject</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Total Qs</th>
                    <th className="px-6 py-4 text-green-600">Correct</th>
                    <th className="px-6 py-4 text-red-600">Wrong</th>
                    <th className="px-6 py-4">Skipped</th>
                    <th className="px-6 py-4 rounded-tr-lg">Time Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analysis.subjectResults.map((sub) => (
                    <tr key={sub.subject} className="bg-card hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-foreground">{sub.subject}</td>
                      <td className="px-6 py-4 font-bold text-primary">{sub.score} <span className="text-xs text-muted-foreground font-normal">/ {sub.maxScore}</span></td>
                      <td className="px-6 py-4">{sub.correct + sub.wrong + sub.unattempted}</td>
                      <td className="px-6 py-4">{sub.correct}</td>
                      <td className="px-6 py-4">{sub.wrong}</td>
                      <td className="px-6 py-4 text-muted-foreground">{sub.unattempted}</td>
                      <td className="px-6 py-4 text-muted-foreground">{Math.floor(sub.timeSpent / 60)}m {sub.timeSpent % 60}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Question Review Section */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Solutions</CardTitle>
            <CardDescription>Review all questions, your answers, and official solutions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                 <TabsList className="bg-transparent h-auto p-0">
                    <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-2">All</TabsTrigger>
                    <TabsTrigger value="incorrect" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 border-b-2 border-transparent data-[state=active]:border-red-500 rounded-none px-4 py-2">Incorrect</TabsTrigger>
                    <TabsTrigger value="unattempted" className="data-[state=active]:bg-slate-500/10 data-[state=active]:text-slate-600 border-b-2 border-transparent data-[state=active]:border-slate-500 rounded-none px-4 py-2">Unattempted</TabsTrigger>
                 </TabsList>
              </div>

              {['all', 'incorrect', 'unattempted'].map(tabValue => {
                 const qs = answers.filter(a => {
                    if (tabValue === 'all') return true;
                    if (tabValue === 'incorrect') return a.selected_option && !a.is_correct;
                    if (tabValue === 'unattempted') return !a.selected_option;
                    return true;
                 });

                 return (
                   <TabsContent key={tabValue} value={tabValue} className="space-y-6 mt-6">
                      {qs.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">No questions in this category.</div>
                      ) : (
                        qs.map((ans, idx) => {
                          const q = ans.pyq_questions;
                          const isCorrect = ans.is_correct;
                          const isSkipped = !ans.selected_option;

                          return (
                            <div key={q.id} className="border rounded-xl p-5 md:p-6 bg-card relative overflow-hidden">
                               {/* Status Banner */}
                               <div className={`absolute top-0 left-0 w-1.5 h-full ${isSkipped ? 'bg-slate-300' : isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                               
                               <div className="flex items-start justify-between gap-4 mb-4">
                                  <div className="flex items-center gap-3">
                                     <Badge variant="outline" className="text-sm font-mono border-muted-foreground/30">Q.{q.question_number}</Badge>
                                     <Badge variant="secondary">{q.subject}</Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs font-semibold">
                                     {isSkipped ? (
                                        <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Skipped</span>
                                     ) : isCorrect ? (
                                        <span className="text-green-600 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">+ {q.marks_positive} Marks</span>
                                     ) : (
                                        <span className="text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">- {q.marks_negative} Marks</span>
                                     )}
                                     <span className="text-muted-foreground flex items-center ml-2 border-l pl-2 border-border">
                                       <Clock className="w-3 h-3 mr-1"/> {ans.time_spent_seconds}s
                                     </span>
                                  </div>
                               </div>

                               <div className="prose dark:prose-invert max-w-none text-foreground mb-6" dangerouslySetInnerHTML={{__html: q.question_text}} />

                               <div className="grid sm:grid-cols-2 gap-3 mb-6">
                                  {['A', 'B', 'C', 'D'].map(opt => {
                                     const isSelected = ans.selected_option === opt;
                                     const isCorrectOption = q.correct_option === opt;
                                     
                                     let st = "border-border bg-background text-muted-foreground";
                                     if (isSelected && isCorrectOption) st = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                                     else if (isSelected && !isCorrectOption) st = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                                     else if (!isSelected && isCorrectOption) st = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";

                                     return (
                                       <div key={opt} className={`flex items-start gap-3 p-3 rounded-lg border ${st} relative`}>
                                          <div className="font-bold pt-0.5">{opt}.</div>
                                          {/* @ts-ignore */}
                                          <div className="flex-1 overflow-x-auto" dangerouslySetInnerHTML={{__html: q[`option_${opt.toLowerCase()}` as keyof PyqQuestion] as string}} />
                                          {isSelected && <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shadow">Your Answer</span>}
                                          {isCorrectOption && !isSelected && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shadow">Correct</span>}
                                       </div>
                                     )
                                  })}
                               </div>

                               {(q.solution_text || q.solution_image_url) && (
                                  <div className="mt-6 pt-4 border-t border-border/50 bg-muted/20 -mx-5 md:-mx-6 -mb-5 md:-mb-6 p-5 md:p-6 rounded-b-xl">
                                     <h4 className="flex items-center text-sm font-bold text-foreground mb-3">
                                       <ArrowRight className="w-4 h-4 mr-2 text-primary" /> Solution
                                     </h4>
                                     <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground" dangerouslySetInnerHTML={{__html: q.solution_text || ''}} />
                                  </div>
                               )}
                            </div>
                          )
                        })
                      )}
                   </TabsContent>
                 )
              })}
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
