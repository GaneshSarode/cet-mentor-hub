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
  TrendingUp,
  ArrowRight,
  Target,
  BookOpen,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { PyqTestSession, PyqPaper } from "@/lib/types/database";

type SessionWithPaper = PyqTestSession & { pyq_papers: PyqPaper };

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionWithPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!isLoaded) return;
      if (!isSignedIn) {
        router.push("/sign-in?redirect_url=/dashboard");
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch("/api/pyq/sessions");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setSessions(data.sessions || []);
      } catch {
        // Silently handle — dashboard will show empty state
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [isLoaded, isSignedIn, router]);

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.status === "completed"),
    [sessions]
  );

  const inProgressSessions = useMemo(
    () => sessions.filter((s) => s.status === "in_progress"),
    [sessions]
  );

  const recentCompleted = completedSessions.slice(0, 3);

  const stats = useMemo(() => {
    if (completedSessions.length === 0)
      return { testsTaken: 0, avgScore: 0, avgAccuracy: 0, inProgress: 0 };

    const totalScore = completedSessions.reduce(
      (sum, s) => sum + (s.score || 0),
      0
    );
    const totalMaxMarks = completedSessions.reduce(
      (sum, s) => sum + (s.total_marks || 200),
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

    return {
      testsTaken: completedSessions.length,
      avgScore:
        totalMaxMarks > 0 ? Math.round((totalScore / totalMaxMarks) * 100) : 0,
      avgAccuracy:
        totalAttempted > 0
          ? Math.round((totalCorrect / totalAttempted) * 100)
          : 0,
      inProgress: inProgressSessions.length,
    };
  }, [completedSessions, inProgressSessions]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const getScorePercent = (session: SessionWithPaper) => {
    if (!session.score && session.score !== 0) return 0;
    const maxMarks = session.total_marks || 200;
    return Math.round((session.score / maxMarks) * 100);
  };

  const firstName = user?.firstName || "Student";

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your progress
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tests Completed
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stats.testsTaken}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stats.avgScore}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stats.avgAccuracy}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* In-Progress Tests */}
        <Card className="border-border/50">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Continue Tests</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/papers">
                Browse Papers
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : inProgressSessions.length > 0 ? (
              <div className="space-y-3">
                {inProgressSessions.map((session) => {
                  const paper = session.pyq_papers;
                  const timeLeftMin = Math.floor(
                    session.time_remaining_seconds / 60
                  );
                  return (
                    <div
                      key={session.id}
                      className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate">
                            {paper?.title || "Unknown"}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {paper?.year} • {paper?.shift} •{" "}
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              {timeLeftMin} min left
                            </span>
                          </p>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                        >
                          <Link href={`/papers/${session.paper_id}/test`}>
                            Resume
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  No tests in progress
                </p>
                <Button asChild variant="link" className="mt-2" size="sm">
                  <Link href="/papers">Start a PYQ test</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tests */}
        <Card className="border-border/50">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Recent Results</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/tests">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))
            ) : recentCompleted.length > 0 ? (
              <>
                {recentCompleted.map((session) => {
                  const paper = session.pyq_papers;
                  const scorePercent = getScorePercent(session);
                  return (
                    <Link
                      key={session.id}
                      href={`/papers/${session.paper_id}/result`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate">
                            {paper?.title || "Unknown"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>
                              {session.submitted_at
                                ? formatDate(session.submitted_at)
                                : formatDate(session.created_at)}
                            </span>
                            <span className="flex items-center gap-0.5 text-emerald-500">
                              <CheckCircle className="h-3 w-3" />
                              {session.correct_count}
                            </span>
                            <span className="flex items-center gap-0.5 text-red-500">
                              <XCircle className="h-3 w-3" />
                              {session.wrong_count}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <p className="font-bold text-foreground">
                            {scorePercent}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.score}/{session.total_marks || 200}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link href="/papers">Take Another Test</Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No tests completed yet
                </p>
                <Button asChild variant="link" className="mt-2" size="sm">
                  <Link href="/papers">Take your first test</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
