"use client";

import { use, useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { mockTests } from "@/lib/data";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Flag,
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  TrendingUp,
} from "lucide-react";

// Sample questions (in a real app, these would come from a database)
const sampleQuestions = [
  {
    id: 1,
    question:
      "A particle moves along the x-axis with velocity v = 3t² - 2t + 1 m/s. What is the acceleration at t = 2s?",
    options: ["8 m/s²", "10 m/s²", "12 m/s²", "14 m/s²"],
    correct: 1,
  },
  {
    id: 2,
    question:
      "The work done by a force F = (3i + 4j) N in displacing a body through d = (2i + 3j) m is:",
    options: ["18 J", "6 J", "12 J", "24 J"],
    correct: 0,
  },
  {
    id: 3,
    question: "Two bodies of masses m and 4m are moving with equal kinetic energies. The ratio of their linear momenta is:",
    options: ["1:2", "1:4", "1:1", "4:1"],
    correct: 0,
  },
  {
    id: 4,
    question: "A stone is thrown vertically upward with initial velocity 20 m/s. The time taken to return to the ground is (g = 10 m/s²):",
    options: ["2 s", "4 s", "1 s", "3 s"],
    correct: 1,
  },
  {
    id: 5,
    question: "The dimensional formula for angular momentum is:",
    options: ["[ML²T⁻¹]", "[MLT⁻²]", "[ML²T⁻²]", "[MLT⁻¹]"],
    correct: 0,
  },
];

export default function TestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const test = mockTests.find((t) => t.id === resolvedParams.id);

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (started && !submitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, submitted, timeLeft]);

  if (!test) {
    notFound();
  }

  const questions = sampleQuestions.slice(0, Math.min(5, test.questions));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTest = () => {
    setStarted(true);
    setTimeLeft(test.duration * 60);
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: parseInt(value) });
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlagged(newFlagged);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowSubmitDialog(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  // Test not started - Show instructions
  if (!started) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">{test.topic}</CardTitle>
            <Badge className="w-fit">{test.subject}</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold text-foreground">{questions.length}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold text-foreground">{test.duration} min</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <h4 className="font-medium text-foreground">Instructions:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Each question has only one correct answer</li>
                <li>You can flag questions to review later</li>
                <li>No negative marking</li>
                <li>Timer starts once you begin</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()} className="flex-1">
                Go Back
              </Button>
              <Button
                onClick={handleStartTest}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Start Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Test submitted - Show results
  if (submitted) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Test Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-foreground">{score.percentage}%</p>
              <p className="text-muted-foreground">
                {score.correct} out of {score.total} correct
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-accent/10 rounded-lg text-center">
                <CheckCircle className="h-5 w-5 text-accent mx-auto mb-1" />
                <p className="font-bold text-foreground">{score.correct}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg text-center">
                <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
                <p className="font-bold text-foreground">
                  {score.total - score.correct}
                </p>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Target className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <p className="font-bold text-foreground">{test.avgScore}%</p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
            </div>

            {/* Question Review */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Review Answers</h4>
              <div className="space-y-2">
                {questions.map((q, index) => {
                  const isCorrect = answers[index] === q.correct;
                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        isCorrect ? "bg-accent/10" : "bg-destructive/10"
                      }`}
                    >
                      <span className="text-sm font-medium">Q{index + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Your answer: {q.options[answers[index]] || "Not answered"}
                        </span>
                        {isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/mock-tests")}
                className="flex-1"
              >
                Back to Tests
              </Button>
              <Button
                onClick={() => {
                  setStarted(false);
                  setSubmitted(false);
                  setAnswers({});
                  setFlagged(new Set());
                  setCurrentQuestion(0);
                }}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Retry Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Test in progress
  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-foreground">{test.topic}</h1>
              <p className="text-sm text-muted-foreground">{test.subject}</p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeLeft < 60 ? "bg-destructive/10 text-destructive" : "bg-muted"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
              <Button
                onClick={() => setShowSubmitDialog(true)}
                className="bg-primary hover:bg-primary/90"
              >
                Submit Test
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-3 h-1" />
        </div>
      </header>

      <div className="pt-28 pb-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Question */}
            <div className="lg:col-span-3">
              <Card className="border-border/50">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                  <Badge variant="secondary">
                    Question {currentQuestion + 1} of {questions.length}
                  </Badge>
                  <Button
                    variant={flagged.has(currentQuestion) ? "default" : "outline"}
                    size="sm"
                    onClick={toggleFlag}
                    className={
                      flagged.has(currentQuestion)
                        ? "bg-amber-500 hover:bg-amber-600"
                        : ""
                    }
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    {flagged.has(currentQuestion) ? "Flagged" : "Flag"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg text-foreground leading-relaxed">
                    {question.question}
                  </p>

                  <RadioGroup
                    value={answers[currentQuestion]?.toString()}
                    onValueChange={handleAnswer}
                    className="space-y-3"
                  >
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                          answers[currentQuestion] === index
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleAnswer(index.toString())}
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      onClick={() =>
                        setCurrentQuestion(
                          Math.min(questions.length - 1, currentQuestion + 1)
                        )
                      }
                      disabled={currentQuestion === questions.length - 1}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Palette */}
            <div className="lg:col-span-1">
              <Card className="border-border/50 sticky top-32">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Question Palette</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                          currentQuestion === index
                            ? "bg-primary text-primary-foreground"
                            : answers[index] !== undefined
                            ? "bg-accent text-accent-foreground"
                            : flagged.has(index)
                            ? "bg-amber-500 text-white"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-accent" />
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-muted" />
                      <span>Not Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-amber-500" />
                      <span>Flagged</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Test?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} out of {questions.length} questions.
              {questions.length - answeredCount > 0 && (
                <span className="block text-amber-600 mt-2">
                  {questions.length - answeredCount} question(s) are still unanswered.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Test
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              Submit Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
