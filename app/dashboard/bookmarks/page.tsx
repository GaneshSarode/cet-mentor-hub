"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MathRenderer } from "@/components/MathRenderer";
import {
  Bookmark,
  BookmarkX,
  FileText,
  CheckCircle,
  XCircle,
  MinusCircle,
  ExternalLink,
} from "lucide-react";

interface BookmarkEntry {
  id: string;
  question_id: string;
  created_at: string;
  pyq_questions: {
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
    paper_id: string;
    pyq_papers: {
      id: string;
      title: string;
      year: number;
      shift: string;
    };
  };
}

export default function BookmarksPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState("All");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookmarks() {
      if (!isLoaded) return;
      if (!isSignedIn) {
        router.push("/sign-in?redirect_url=/dashboard/bookmarks");
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch("/api/pyq/bookmarks", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setBookmarks(data.bookmarks || []);
      } catch {
        // silently handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookmarks();
  }, [isLoaded, isSignedIn, router]);

  const handleRemoveBookmark = async (questionId: string) => {
    setRemovingId(questionId);
    try {
      const res = await fetch("/api/pyq/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId }),
      });
      if (res.ok) {
        setBookmarks((prev) =>
          prev.filter((b) => b.question_id !== questionId)
        );
      }
    } catch {
      // silently handle
    } finally {
      setRemovingId(null);
    }
  };

  const filteredBookmarks = useMemo(() => {
    if (activeSubject === "All") return bookmarks;
    return bookmarks.filter(
      (b) => b.pyq_questions.subject === activeSubject
    );
  }, [bookmarks, activeSubject]);

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = { All: bookmarks.length };
    for (const b of bookmarks) {
      const subj = b.pyq_questions.subject;
      counts[subj] = (counts[subj] || 0) + 1;
    }
    return counts;
  }, [bookmarks]);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <Bookmark className="h-7 w-7 text-primary" />
          Bookmarked Questions
        </h1>
        <p className="text-muted-foreground mt-1">
          Questions you&apos;ve saved for revision
        </p>
      </div>

      {/* Subject Filter */}
      <Tabs value={activeSubject} onValueChange={setActiveSubject} className="mb-6">
        <TabsList className="bg-muted/50 h-auto flex-wrap">
          {["All", "Physics", "Chemistry", "Mathematics"].map((subj) => (
            <TabsTrigger
              key={subj}
              value={subj}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              {subj}{" "}
              {subjectCounts[subj] ? (
                <span className="ml-1 opacity-60">
                  ({subjectCounts[subj]})
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Bookmarks List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bookmark className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No bookmarks yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Bookmark questions from the solution review page to save them here
            for quick revision.
          </p>
          <Button asChild variant="link" className="mt-4" size="sm">
            <Link href="/papers">Take a test first</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((bookmark) => {
            const q = bookmark.pyq_questions;
            const paper = q.pyq_papers;

            return (
              <Card
                key={bookmark.id}
                className="border-border/50 overflow-hidden"
              >
                <CardContent className="p-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                      >
                        Q{q.question_number}
                      </Badge>
                      <Badge
                        className={`text-xs border-0 ${
                          q.subject === "Physics"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : q.subject === "Chemistry"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                        }`}
                      >
                        {q.subject}
                      </Badge>
                      {q.topic && (
                        <Badge variant="outline" className="text-xs">
                          {q.topic}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/papers/${q.paper_id}/review`}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Review
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        disabled={removingId === bookmark.question_id}
                        onClick={() =>
                          handleRemoveBookmark(bookmark.question_id)
                        }
                      >
                        <BookmarkX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Question Preview */}
                  <MathRenderer
                    className="text-foreground text-sm line-clamp-3 mb-3"
                    html={q.question_text}
                  />

                  {/* Correct Answer + Paper Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      <span>
                        Correct: <strong>{q.correct_option}</strong>
                      </span>
                    </div>
                    <span>
                      {paper.title} ({paper.shift})
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
