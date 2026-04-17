"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PaperCard } from "@/components/paper-card";
import { FileText, BookOpen, Sparkles, AlertCircle } from "lucide-react";
import { PyqPaper } from "@/lib/types/database";

const paperTypes = ["All", "Previous Year", "Mock"];
const subjects = ["All", "PCM", "PCB"];
const shifts = ["All", "Morning", "Evening"];

export default function PapersPage() {
  const [activeType, setActiveType] = useState("All");
  const [activeGroup, setActiveGroup] = useState("All");
  const [activeShift, setActiveShift] = useState("All");
  const [selectedYear, setSelectedYear] = useState("all");
  const [papers, setPapers] = useState<PyqPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPapers() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/pyq/papers");
        if (!res.ok) {
          throw new Error("Failed to fetch papers");
        }
        const data = await res.json();
        setPapers(data.papers || []);
      } catch (err: any) {
        console.error("Error fetching papers:", err);
        setError(err.message || "Failed to load papers. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPapers();
  }, []);

  // Get unique years from papers, sorted descending
  const availableYears = useMemo(() => {
    const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a);
    return years;
  }, [papers]);

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      // Type filter (Mock vs PYQ isn't in schema yet, assuming all are PYQ for now based on context)
      // but if you had a type field, you'd filter it here.
      
      // Subject filter
      if (activeGroup !== "All" && paper.subject_group !== activeGroup) return false;

      // Shift filter
      if (activeShift !== "All" && paper.shift.toLowerCase() !== activeShift.toLowerCase()) return false;

      // Year filter
      if (selectedYear !== "all" && paper.year !== parseInt(selectedYear)) return false;

      return true;
    });
  }, [papers, activeGroup, activeShift, selectedYear]);

  const pyqCount = papers.length; // all are PYQ in this schema
  const mockCount = 0; // Assuming mock tests could be added later

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#0f172a] pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-primary/20 text-primary border-0 mb-6 py-1.5 px-4">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Real MHT-CET Exam Experience
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight text-balance">
              Take Previous Year Papers{" "}
              <span className="text-primary">As Online Tests</span>
            </h1>

            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Practice MHT-CET PYQs (2019-2025) with exact exam interface, auto-grading, and detailed solutions.
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-violet-500/10 text-violet-400 px-4 py-2 rounded-full">
                <BookOpen className="h-4 w-4" />
                <span>{pyqCount > 0 ? pyqCount : 'Loading'} Previous Year Papers</span>
              </div>
               <div className="flex items-center gap-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-full">
                <FileText className="h-4 w-4" />
                <span>150 Questions / Paper</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full text-background"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-16 z-40 bg-background/80 backdrop-blur-lg border-b py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            
            {/* Subject Pills */}
            <Tabs value={activeGroup} onValueChange={setActiveGroup}>
              <TabsList className="bg-muted/50 h-auto flex-wrap">
                {subjects.map((subject) => (
                  <TabsTrigger
                    key={subject}
                    value={subject}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
                  >
                    {subject}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Shift Tabs */}
             <Tabs value={activeShift} onValueChange={setActiveShift}>
              <TabsList className="bg-muted/50 h-auto flex-wrap">
                {shifts.map((shift) => (
                  <TabsTrigger
                    key={shift}
                    value={shift}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
                  >
                    {shift}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Year Dropdown */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[130px] bg-muted/50" id="year-filter">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Papers Grid */}
      <section className="py-8 flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredPapers.length} paper{filteredPapers.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>

          {isLoading ? (
             <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-sm text-muted-foreground">Loading papers...</p>
             </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Failed to load papers</h3>
               <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          ) : filteredPapers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                No papers found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We might be adding more papers soon. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
