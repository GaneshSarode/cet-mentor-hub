"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  Download,
  BookOpen,
  Calendar,
  FileQuestion,
  PlayCircle
} from "lucide-react";
import { PyqPaper } from "@/lib/types/database";

interface PaperCardProps {
  paper: PyqPaper;
}

export function PaperCard({ paper }: PaperCardProps) {
  const subjectColors: Record<string, string> = {
    PCM: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    PCB: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  };

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 flex flex-col">
      {/* Subtle gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />

      <CardContent className="p-6 pt-7 flex flex-col flex-1">
        {/* Header: Type + Subject badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-0 font-medium text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              PYQ
            </Badge>
            <Badge
              className={`${subjectColors[paper.subject_group] || "bg-muted"} border-0 font-medium text-xs`}
            >
              {paper.subject_group}
            </Badge>
          </div>
          <Badge
            variant="secondary"
            className="text-xs font-mono shrink-0"
          >
            {paper.year}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="mt-4 font-semibold text-foreground text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {paper.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {paper.shift === 'morning' ? 'Morning Shift (9am-12pm)' : 'Evening Shift (2pm-5pm)'}
        </p>

        {/* Meta info */}
        <div className="mt-auto mb-5 pt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileQuestion className="h-3.5 w-3.5" />
            <span>{paper.total_questions} Qs</span>
          </div>
          {paper.exam_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(paper.exam_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          {paper.pdf_url ? (
            <Button
              asChild
              variant="outline"
              className="w-full text-xs h-9"
            >
              <a
                href={paper.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                PDF
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="w-full text-xs h-9" disabled>
               <Download className="h-3.5 w-3.5 mr-1.5" />
               No PDF
            </Button>
          )}

          <Button
            asChild
            className="w-full text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
          >
            <Link href={`/papers/${paper.id}/test`}>
              <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
              Take Test
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
