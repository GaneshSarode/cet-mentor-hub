"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { MathRenderer } from "@/components/MathRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { PyqPaper, PyqQuestion, PyqTestSession, PyqTestAnswer } from "@/lib/types/database";

export default function ReviewPage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const router = useRouter();
  const { paperId } = use(params);
  const { isSignedIn, isLoaded } = useUser();

  const [paper, setPaper] = useState<PyqPaper | null>(null);
  const [questions, setQuestions] = useState<PyqQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, PyqTestAnswer>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSubject, setActiveSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'all'>('Physics');

  useEffect(() => {
    async function loadReviewData() {
      if (!isLoaded || !isSignedIn) {
         if (isLoaded && !isSignedIn) router.push('/sign-in');
         return;
      }
      
      try {
        setIsLoading(true);
        // Load paper
        const pRes = await fetch('/api/pyq/papers');
        const pData = await pRes.json();
        const currentPaper = pData.papers?.find((p: any) => p.id === paperId);
        if (!currentPaper) throw new Error("Paper not found");
        setPaper(currentPaper);
        
        // Load completed session answers
        const sRes = await fetch('/api/pyq/sessions');
        const sData = await sRes.json();
        const currentSession = sData.sessions?.find((s: any) => s.paper_id === paperId && s.status === 'completed');
        if (!currentSession) throw new Error("No completed test found");

        const aRes = await fetch(`/api/pyq/sessions/${currentSession.id}/answers`);
        const aData = await aRes.json();
        const answersMap: Record<string, PyqTestAnswer> = {};
        aData.answers?.forEach((ans: PyqTestAnswer) => {
          answersMap[ans.question_id] = ans;
        });
        setAnswers(answersMap);

        // Load all questions
        const qRes = await fetch(`/api/pyq/papers/${paperId}/questions`);
        const qData = await qRes.json();
        let loadedQs = qData.questions || [];
        setQuestions(loadedQs);
        
        // Set active subject to first question's subject
         if (loadedQs.length > 0) {
             setActiveSubject(loadedQs[0].subject as any);
         }

      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadReviewData();
  }, [paperId, isLoaded, isSignedIn, router]);


  if (isLoading) return <div className="min-h-screen bg-[#1E2530] text-slate-200 flex items-center justify-center">Loading Review...</div>;
  if (!questions.length || !paper) return <div className="min-h-screen bg-[#1E2530] text-white flex items-center justify-center">Error loading review data.</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];

  const filteredQuestions = activeSubject === 'all' ? questions : questions.filter(q => q.subject === activeSubject);

  // Status computation for palette shapes
  const getShapeAndColor = (qId: string) => {
     const ans = answers[qId];
     if (!ans || !ans.selected_option) {
         // Not answered -> Grey Box
         return <div className="w-8 h-8 rounded shrink-0 bg-[#334155] border border-slate-600 flex items-center justify-center text-xs font-semibold text-slate-300"></div>;
     } else if (ans.is_correct) {
         // Correct -> Green Capsule
         return <div className="w-8 h-8 rounded-full shrink-0 bg-[#22c55e] flex items-center justify-center text-xs font-semibold text-white"></div>;
     } else {
         // Incorrect -> Red Diamond/Hexagon (approximated with a rotated square or polygon effect)
         return <div className="w-8 h-8 shrink-0 bg-[#ef4444] transform flex items-center justify-center text-xs font-semibold text-white" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>;
     }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1A202C] text-slate-200 font-sans h-screen overflow-hidden">
       {/* Top Navigation Row */}
       <div className="bg-[#1E2530] border-b border-slate-700/50 shrink-0">
          <div className="flex items-center px-4 py-3 gap-6 overflow-x-auto select-none">
             <Button variant="ghost" size="icon" onClick={() => router.push(`/papers/${paperId}/result`)} className="shrink-0 hover:bg-slate-800 text-slate-300">
                <ArrowLeft className="w-6 h-6" />
             </Button>

             <div className="flex items-center gap-2 flex-nowrap">
                {filteredQuestions.map((q, idx) => {
                   const globalIdx = questions.findIndex(globalQ => globalQ.id === q.id);
                   const isCurrent = globalIdx === currentQuestionIndex;
                   
                   const ShapeIcon = getShapeAndColor(q.id);
                   
                   return (
                      <button 
                         key={q.id}
                         onClick={() => {
                            setCurrentQuestionIndex(globalIdx);
                         }}
                         className={`relative group shrink-0 transition-transform ${isCurrent ? 'scale-110 shadow-lg shadow-black/50 z-10' : 'hover:scale-105'} flex items-center justify-center`}
                      >
                         {ShapeIcon}
                         <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/90 font-mono pointer-events-none drop-shadow-md">
                            {q.question_number}
                         </span>
                         {isCurrent && <div className="absolute -bottom-2.5 w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                      </button>
                   );
                })}
             </div>
          </div>
          
          <div className="flex px-16 border-t border-slate-700/30">
             {['Physics', 'Chemistry', 'Mathematics'].map(subj => (
               <button 
                  key={subj}
                  className={`px-6 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeSubject === subj ? 'border-blue-500 text-slate-100' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
                  onClick={() => {
                     setActiveSubject(subj as any);
                     const firstIdx = questions.findIndex(q => q.subject === subj);
                     if (firstIdx !== -1) setCurrentQuestionIndex(firstIdx);
                  }}
               >
                 {subj}
               </button>
             ))}
          </div>
       </div>

       {/* Main Question Area */}
       <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <span className="text-slate-400 font-semibold">Q{currentQuestion.question_number}</span>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-0">+{currentQuestion.marks_positive}</Badge>
             </div>
             <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">
                View All Qs ›
             </Button>
          </div>

          <MathRenderer 
             className="prose dark:prose-invert max-w-none text-slate-200 text-lg mb-8 leading-relaxed font-sans" 
             html={currentQuestion.question_text} 
          />

          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
             {['A', 'B', 'C', 'D'].map((opt) => {
                const isSelected = currentAnswer?.selected_option === opt;
                const isCorrectOption = currentQuestion.correct_option === opt;
                
                let containerClass = "border-slate-700 bg-[#1E2530]/50 hover:border-slate-500 text-slate-300";
                
                if (isSelected && isCorrectOption) {
                   containerClass = "border-emerald-500 bg-emerald-500/5 text-emerald-400";
                } else if (isSelected && !isCorrectOption) {
                   containerClass = "border-red-500 bg-red-500/5 text-red-400";
                } else if (!isSelected && isCorrectOption && currentAnswer?.selected_option) {
                   containerClass = "border-emerald-500/50 bg-emerald-500/5 text-emerald-400/80 border-dashed";
                } else if (!isSelected && isCorrectOption && !currentAnswer?.selected_option) {
                   // They missed it, but show it's correct
                   containerClass = "border-emerald-500 bg-emerald-500/5 text-emerald-400";
                }

                return (
                   <div key={opt} className={`relative flex items-center gap-4 p-4 rounded-xl border ${containerClass} transition-all`}>
                      <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-current text-[#1A202C]' : 'bg-slate-800 border border-slate-700 text-slate-400'}`}>
                         {opt}
                      </div>
                      <MathRenderer className="flex-1 font-medium select-none overflow-x-auto text-base" html={currentQuestion[`option_${opt.toLowerCase()}` as keyof PyqQuestion] as string} />
                      
                      {isSelected && (
                         <div className="absolute -top-3 right-4 flex items-center gap-1.5 px-3 py-1 bg-[#1A202C] border-x border-t border-current rounded-t-lg text-xs font-bold w-fit z-10 text-current">
                            You Marked 
                            {isCorrectOption ? <CheckCircle className="w-3.5 h-3.5 fill-current text-[#1A202C]" /> : <XCircle className="w-3.5 h-3.5 fill-current text-[#1A202C]" />}
                         </div>
                      )}
                      
                      {isCorrectOption && !isSelected && (
                         <div className="absolute -top-3 right-4 flex items-center gap-1.5 px-3 py-1 bg-[#1A202C] border-x border-t border-emerald-500/50 rounded-t-lg text-xs font-bold w-fit z-10 text-emerald-500/70">
                            Correct Answer
                         </div>
                      )}
                   </div>
                );
             })}
          </div>

          <div className="mt-10 border-t border-slate-700/50 pt-8 mb-24">
             <h4 className="text-sm font-bold text-slate-300 mb-4 inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Solution :
             </h4>
             <MathRenderer 
                  className="prose dark:prose-invert max-w-none text-slate-300 text-base leading-relaxed bg-[#1E2530]/40 p-6 rounded-xl border border-slate-700/30" 
                  html={currentQuestion.solution_text || "<p>No detailed solution available.</p>"} 
             />
          </div>
       </div>

       {/* Bottom Fixed Action Bar */}
       <div className="bg-[#1E2530] border-t border-slate-700/50 h-20 shrink-0 flex items-center justify-center px-4 md:px-8 gap-4 fixed bottom-0 w-full z-20">
          <Button 
             variant="outline" 
             disabled={currentQuestionIndex === 0}
             onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
             className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 rounded-lg h-12 flex-1 max-w-[200px]"
          >
             Previous
          </Button>

          <Button 
             disabled={currentQuestionIndex === questions.length - 1}
             onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
             className="border-0 bg-slate-200 text-slate-900 hover:bg-white font-bold px-8 rounded-lg h-12 flex-1 max-w-[200px]"
          >
             Next
          </Button>
       </div>
    </div>
  );
}
