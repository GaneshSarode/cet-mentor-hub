"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MathRenderer } from "@/components/MathRenderer";
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Home, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface PracticeQuestion {
  id: string;
  question_number: number;
  subject: string;
  topic: string | null;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  solution_text: string | null;
  marks_positive: number;
  pyq_papers: { title: string; year: number; shift: string };
}

function PracticeSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = searchParams.get("subject") || "Physics";
  const count = searchParams.get("count") || "20";
  const year = searchParams.get("year");

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, wrong: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({ subject, count });
        if (year) params.set("year", year);
        const res = await fetch(`/api/pyq/practice?${params.toString()}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch { /* silently handle */ } finally {
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, [subject, count, year]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + (isRevealed ? 1 : 0)) / questions.length) * 100 : 0;

  const handleSelectOption = (option: string) => {
    if (isRevealed) return;
    setSelectedOption(option);
    setIsRevealed(true);
    const isCorrect = option === currentQuestion.correct_option;
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setIsRevealed(false);
  };

  const handleSkip = () => {
    if (currentIndex === questions.length - 1) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setIsRevealed(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A202C] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-slate-300 text-sm">Loading {subject} questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#1A202C] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">No questions found</p>
          <p className="text-sm text-slate-400 mt-2">Try a different subject or year filter.</p>
          <Button asChild variant="outline" className="mt-4 border-slate-600 text-slate-300">
            <Link href="/practice">Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Finished screen
  if (isFinished) {
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const skipped = questions.length - score.total;
    return (
      <div className="min-h-screen bg-[#1A202C] flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
          <div className="bg-[#1E2530] border border-slate-700/50 rounded-2xl p-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Practice Complete!</h2>
            <p className="text-slate-400 mb-6">{subject} — {questions.length} questions</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-emerald-500/10 rounded-xl p-3">
                <p className="text-2xl font-bold text-emerald-400">{score.correct}</p>
                <p className="text-xs text-slate-400">Correct</p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-3">
                <p className="text-2xl font-bold text-red-400">{score.wrong}</p>
                <p className="text-xs text-slate-400">Wrong</p>
              </div>
              <div className="bg-slate-500/10 rounded-xl p-3">
                <p className="text-2xl font-bold text-slate-300">{skipped}</p>
                <p className="text-xs text-slate-400">Skipped</p>
              </div>
            </div>

            <div className="bg-[#1A202C] rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-400">Accuracy</p>
              <p className="text-3xl font-bold text-white">{accuracy}%</p>
            </div>

            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800">
                <Link href="/practice"><Home className="h-4 w-4 mr-2" />Home</Link>
              </Button>
              <Button onClick={() => { setCurrentIndex(0); setSelectedOption(null); setIsRevealed(false); setScore({ correct: 0, wrong: 0, total: 0 }); setIsFinished(false); }} className="flex-1 bg-primary hover:bg-primary/90">
                <RotateCcw className="h-4 w-4 mr-2" />Retry
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1A202C] text-slate-200">
      {/* Top Bar */}
      <div className="bg-[#1E2530] border-b border-slate-700/50 shrink-0 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => router.push("/practice")} className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <div className="flex items-center gap-3 text-sm">
            <Badge className="bg-primary/20 text-primary border-0">{subject}</Badge>
            <span className="text-slate-400">{currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400">{score.correct}✓</span>
            <span className="text-red-400">{score.wrong}✗</span>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-3">
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-slate-400 font-semibold text-sm">Q{currentIndex + 1}</span>
          {currentQuestion.topic && <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">{currentQuestion.topic}</Badge>}
          <span className="text-xs text-slate-500 ml-auto">{currentQuestion.pyq_papers?.title}</span>
        </div>

        <MathRenderer className="prose dark:prose-invert max-w-none text-slate-200 text-lg mb-6 leading-relaxed" html={currentQuestion.question_text} />

        <div className="grid md:grid-cols-2 gap-3 mb-6">
          {(["A", "B", "C", "D"] as const).map((opt) => {
            const isSelected = selectedOption === opt;
            const isCorrect = currentQuestion.correct_option === opt;
            let cls = "border-slate-700 bg-[#1E2530]/50 hover:border-slate-500 text-slate-300 cursor-pointer";

            if (isRevealed) {
              if (isCorrect) cls = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
              else if (isSelected && !isCorrect) cls = "border-red-500 bg-red-500/10 text-red-400";
              else cls = "border-slate-700/50 bg-[#1E2530]/30 text-slate-500 cursor-default";
            }

            return (
              <button key={opt} onClick={() => handleSelectOption(opt)} disabled={isRevealed} className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${cls}`}>
                <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-sm ${isSelected || (isRevealed && isCorrect) ? "bg-current text-[#1A202C]" : "bg-slate-800 border border-slate-700 text-slate-400"}`}>{opt}</div>
                <MathRenderer className="flex-1 text-sm" html={currentQuestion[`option_${opt.toLowerCase()}` as keyof PracticeQuestion] as string} />
                {isRevealed && isCorrect && <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />}
                {isRevealed && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Solution */}
        {isRevealed && currentQuestion.solution_text && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 border-t border-slate-700/50 pt-6">
            <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Solution</h4>
            <MathRenderer className="prose dark:prose-invert max-w-none text-slate-300 text-sm leading-relaxed bg-[#1E2530]/40 p-5 rounded-xl border border-slate-700/30" html={currentQuestion.solution_text} />
          </motion.div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#1E2530] border-t border-slate-700/50 p-4 shrink-0">
        <div className="flex items-center justify-center gap-3 max-w-4xl mx-auto">
          {!isRevealed ? (
            <Button onClick={handleSkip} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 h-11">
              Skip <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext} className="bg-slate-200 text-slate-900 hover:bg-white font-bold px-8 h-11">
              {currentIndex === questions.length - 1 ? "Finish" : "Next"} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PracticeSessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1A202C] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <PracticeSessionContent />
    </Suspense>
  );
}
