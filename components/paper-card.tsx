"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  BookOpen,
  Calendar,
  FileQuestion,
} from "lucide-react";

interface PaperCardProps {
  paper: {
    id: string;
    title: string;
    type: "previous-year" | "mock";
    subject: string;
    year: number;
    pages: number;
    questions: number;
    downloadUrl: string;
    description: string;
  };
}

export function PaperCard({ paper }: PaperCardProps) {
  const subjectColors: Record<string, string> = {
    PCM: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    PCB: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    Physics: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    Chemistry: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Mathematics: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  const typeConfig = {
    "previous-year": {
      label: "Previous Year",
      color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      icon: BookOpen,
    },
    mock: {
      label: "Mock Paper",
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      icon: FileText,
    },
  };

  const config = typeConfig[paper.type];
  const TypeIcon = config.icon;

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      {/* Subtle gradient accent at top */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          paper.type === "previous-year"
            ? "from-violet-500 to-indigo-500"
            : "from-rose-500 to-orange-500"
        }`}
      />

      <CardContent className="p-6 pt-7">
        {/* Header: Type + Subject badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${config.color} border-0 font-medium text-xs`}>
              <TypeIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            <Badge
              className={`${subjectColors[paper.subject] || "bg-muted"} border-0 font-medium text-xs`}
            >
              {paper.subject}
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
        <h3 className="mt-4 font-semibold text-foreground text-base leading-tight group-hover:text-primary transition-colors">
          {paper.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {paper.description}
        </p>

        {/* Meta info */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileQuestion className="h-3.5 w-3.5" />
            <span>{paper.questions} Qs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>{paper.pages} pages</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{paper.year}</span>
          </div>
        </div>

        {/* Download Button */}
        <Button
          asChild
          className="mt-5 w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
        >
          <a
            href={paper.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
