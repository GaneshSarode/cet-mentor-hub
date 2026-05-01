"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  BookOpen,
  Target,
  XCircle,
  MinusCircle,
} from "lucide-react";
import { PyqTestSession, PyqPaper } from "@/lib/types/database";

type SessionWithPaper = PyqTestSession & { pyq_papers: PyqPaper };

export default function TestHistoryPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionWithPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      if (!isLoaded) return;
      if (!isSignedIn) {
        router.push("/sign-in?redirect_url=/dashboard/tests");
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch("/api/pyq/sessions", { cache: 'no-store' });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setSessions(data.sessions || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSessions();
  }, [isLoaded, isSignedIn, router]);

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.status === "completed"),
    [sessions]
  );

  const inProgressSessions = useMemo(
    () => sessions.filter((s) => s.status === "in_progress"),
    [sessions]
  );

  // Stats from real data
  const stats = useMemo(() => {
    if (completedSessions.length === 0)
      return { testsTaken: 0, avgScore: 0, avgAccuracy: 0, totalTime: 0 };

    const totalScore = completedSessions.reduce(
      (sum, s) => sum + (s.score || 0),
      0
    );
    const totalMaxMarks = completedSessions.reduce(
      (sum, s) => sum + s.total_marks,
      0
    );
    const totalCorrect = completedSessions.reduce(
      (sum, s) => sum + s.correct_count,
      0
    );
    const totalAttempted = completedSessions.reduce(
      (sum, s) => sum + s.correct_count + s.wrong_count,
      0
    );
    const totalTimeSec = completedSessions.reduce((sum, s) => {
      const paperDuration = s.pyq_papers?.duration_minutes
        ? s.pyq_papers.duration_minutes * 60
        : 10800;
      return sum + (paperDuration - s.time_remaining_seconds);
    }, 0);

    return {
      testsTaken: completedSessions.length,
      avgScore:
        totalMaxMarks > 0 ? Math.round((totalScore / totalMaxMarks) * 100) : 0,
      avgAccuracy:
        totalAttempted > 0
          ? Math.round((totalCorrect / totalAttempted) * 100)
          : 0,
      totalTime: Math.round(totalTimeSec / 60),
    };
  }, [completedSessions]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTimeTaken = (session: SessionWithPaper) => {
    const paperDuration = session.pyq_papers?.duration_minutes
      ? session.pyq_papers.duration_minutes * 60
      : 10800;
    const timeTakenSec = paperDuration - session.time_remaining_seconds;
    const min = Math.floor(timeTakenSec / 60);
    return `${min} min`;
  };

  const getScorePercent = (session: SessionWithPaper) => {
    if (!session.score && session.score !== 0) return 0;
    const maxMarks = session.total_marks || 200;
    return Math.round((session.score / maxMarks) * 100);
  };

  const getScoreColor = (percent: number) => {
    if (percent >= 80) return "text-emerald-500";
    if (percent >= 60) return "text-blue-500";
    if (percent >= 40) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Test History
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your progress across all PYQ tests
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/papers">
            Take New Test
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tests Taken</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.testsTaken}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.avgScore}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.avgAccuracy}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalTime} min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* In-Progress Sessions */}
      {inProgressSessions.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
              In Progress ({inProgressSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-amber-500/10">
              {inProgressSessions.map((session) => {
                const paper = session.pyq_papers;
                const timeLeftMin = Math.floor(
                  session.time_remaining_seconds / 60
                );
                return (
                  <div
                    key={session.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">
                        {paper?.title || "Unknown Paper"}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{paper?.year}</span>
                        <Badge
                          variant="outline"
                          className="capitalize text-xs"
                        >
                          {paper?.shift}
                        </Badge>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {timeLeftMin} min left
                        </span>
                      </div>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Link href={`/papers/${session.paper_id}/test`}>
                        Resume Test
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Tests */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Completed Tests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 px-4">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
              <p className="text-foreground font-medium">
                Failed to load test history
              </p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          ) : completedSessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <BookOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                No tests completed yet
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Take your first PYQ test to see your results here.
              </p>
              <Button asChild>
                <Link href="/papers">Browse PYQ Papers</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {completedSessions.map((session) => {
                const paper = session.pyq_papers;
                const scorePercent = getScorePercent(session);
                const scoreColor = getScoreColor(scorePercent);

                return (
                  <div
                    key={session.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">
                          {paper?.title || "Unknown Paper"}
                        </h3>
                        <Badge
                          variant="outline"
                          className="capitalize text-xs"
                        >
                          {paper?.shift}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span>
                          {session.submitted_at
                            ? formatDate(session.submitted_at)
                            : formatDate(session.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {getTimeTaken(session)}
                        </span>
                      </div>
                      {/* Mini stats */}
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle className="h-3 w-3" />
                          {session.correct_count} correct
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                          <XCircle className="h-3 w-3" />
                          {session.wrong_count} wrong
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <MinusCircle className="h-3 w-3" />
                          {session.unattempted_count} skipped
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      {/* Score */}
                      <div className="w-28">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Score</span>
                          <span className={`font-bold ${scoreColor}`}>
                            {session.score}/{session.total_marks || 200}
                          </span>
                        </div>
                        <Progress value={scorePercent} className="h-2" />
                      </div>

                      {/* Score % */}
                      <div className="text-center min-w-[50px]">
                        <p className={`text-xl font-bold ${scoreColor}`}>
                          {scorePercent}%
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/papers/${session.paper_id}/result`}>
                            Result
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/papers/${session.paper_id}/review`}>
                            Review
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
