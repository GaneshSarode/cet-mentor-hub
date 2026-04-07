import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const testHistory = [
  {
    id: 1,
    name: "Physics - Mechanics",
    subject: "Physics",
    score: 78,
    total: 100,
    date: "Apr 4, 2026",
    duration: "42 min",
    percentile: 82,
    trend: "up",
  },
  {
    id: 2,
    name: "Maths - Calculus",
    subject: "Mathematics",
    score: 65,
    total: 100,
    date: "Apr 1, 2026",
    duration: "48 min",
    percentile: 71,
    trend: "down",
  },
  {
    id: 3,
    name: "Chemistry - Organic",
    subject: "Chemistry",
    score: 82,
    total: 100,
    date: "Mar 29, 2026",
    duration: "38 min",
    percentile: 88,
    trend: "up",
  },
  {
    id: 4,
    name: "Full Mock Test 1",
    subject: "Full Mock",
    score: 245,
    total: 360,
    date: "Mar 25, 2026",
    duration: "172 min",
    percentile: 79,
    trend: "up",
  },
  {
    id: 5,
    name: "Physics - Electromagnetism",
    subject: "Physics",
    score: 72,
    total: 100,
    date: "Mar 22, 2026",
    duration: "45 min",
    percentile: 76,
    trend: "down",
  },
];

const subjectColors: Record<string, string> = {
  Physics: "bg-blue-500/10 text-blue-600",
  Chemistry: "bg-green-500/10 text-green-600",
  Mathematics: "bg-amber-500/10 text-amber-600",
  "Full Mock": "bg-purple-500/10 text-purple-600",
};

export default function TestHistoryPage() {
  const avgScore = Math.round(
    testHistory.reduce((sum, t) => sum + (t.score / t.total) * 100, 0) /
      testHistory.length
  );

  const avgPercentile = Math.round(
    testHistory.reduce((sum, t) => sum + t.percentile, 0) / testHistory.length
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Test History
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your progress across all tests
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/mock-tests">Take New Test</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tests Taken</p>
                <p className="text-2xl font-bold text-foreground">
                  {testHistory.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Percentile</p>
                <p className="text-2xl font-bold text-foreground">
                  {avgPercentile}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>All Tests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {testHistory.map((test) => (
              <div
                key={test.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{test.name}</h3>
                    <Badge className={`${subjectColors[test.subject]} border-0`}>
                      {test.subject}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{test.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {test.duration}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-32">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-medium text-foreground">
                        {Math.round((test.score / test.total) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(test.score / test.total) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="text-center min-w-[60px]">
                    <div className="flex items-center gap-1 justify-center">
                      <span className="text-lg font-bold text-foreground">
                        {test.percentile}
                      </span>
                      {test.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-accent" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">percentile</span>
                  </div>

                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
