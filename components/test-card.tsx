"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileQuestion, Users, TrendingUp } from "lucide-react";

interface TestCardProps {
  test: {
    id: string;
    subject: string;
    topic: string;
    questions: number;
    duration: number;
    difficulty: string;
    attempts: number;
    avgScore: number;
  };
}

export function TestCard({ test }: TestCardProps) {
  const subjectColors: Record<string, string> = {
    Physics: "bg-blue-500/10 text-blue-600",
    Chemistry: "bg-green-500/10 text-green-600",
    Mathematics: "bg-amber-500/10 text-amber-600",
    "Full Mock": "bg-purple-500/10 text-purple-600",
  };

  const difficultyColors: Record<string, string> = {
    Easy: "bg-accent/10 text-accent",
    Medium: "bg-amber-500/10 text-amber-600",
    Hard: "bg-red-500/10 text-red-600",
  };

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <Badge className={`${subjectColors[test.subject] || "bg-muted"} border-0 font-medium`}>
              {test.subject}
            </Badge>
            <h3 className="mt-3 font-semibold text-foreground text-lg">{test.topic}</h3>
          </div>
          <Badge className={`${difficultyColors[test.difficulty]} border-0`}>
            {test.difficulty}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileQuestion className="h-4 w-4" />
            <span>{test.questions} Questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{test.duration} mins</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{test.attempts.toLocaleString()} attempts</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Avg: {test.avgScore}%</span>
          </div>
        </div>

        <Button asChild className="mt-5 w-full bg-primary hover:bg-primary/90">
          <Link href={`/mock-tests/${test.id}`}>Start Test</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
