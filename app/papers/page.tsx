"use client";

import { useState, useMemo } from "react";
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
import { papers } from "@/lib/data";
import { FileText, BookOpen, Sparkles } from "lucide-react";

const paperTypes = ["All", "Previous Year", "Mock"];
const subjects = ["All", "PCM", "Physics", "Chemistry", "Mathematics"];

export default function PapersPage() {
  const [activeType, setActiveType] = useState("All");
  const [activeSubject, setActiveSubject] = useState("All");
  const [selectedYear, setSelectedYear] = useState("all");

  // Get unique years from papers, sorted descending
  const availableYears = useMemo(() => {
    const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a);
    return years;
  }, []);

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      // Type filter
      if (activeType === "Previous Year" && paper.type !== "previous-year") return false;
      if (activeType === "Mock" && paper.type !== "mock") return false;

      // Subject filter
      if (activeSubject !== "All" && paper.subject !== activeSubject) return false;

      // Year filter
      if (selectedYear !== "all" && paper.year !== parseInt(selectedYear)) return false;

      return true;
    });
  }, [activeType, activeSubject, selectedYear]);

  const pyqCount = papers.filter((p) => p.type === "previous-year").length;
  const mockCount = papers.filter((p) => p.type === "mock").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#0f172a] pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-primary/20 text-primary border-0 mb-6 py-1.5 px-4">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Free Download — No Login Required
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight text-balance">
              Practice Papers &{" "}
              <span className="text-primary">Previous Year Questions</span>
            </h1>

            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Download MHTCET previous year question papers and mock practice
              papers. Perfect for exam preparation and self-assessment.
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-violet-500/10 text-violet-400 px-4 py-2 rounded-full">
                <BookOpen className="h-4 w-4" />
                <span>{pyqCount} Previous Year Papers</span>
              </div>
              <div className="flex items-center gap-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-full">
                <FileText className="h-4 w-4" />
                <span>{mockCount} Mock Papers</span>
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
            {/* Type Tabs */}
            <Tabs value={activeType} onValueChange={setActiveType}>
              <TabsList className="bg-muted/50 h-auto flex-wrap">
                {paperTypes.map((type) => (
                  <TabsTrigger
                    key={type}
                    value={type}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {type}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Subject Pills */}
            <Tabs value={activeSubject} onValueChange={setActiveSubject}>
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
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredPapers.length} paper{filteredPapers.length !== 1 ? "s" : ""}{" "}
              available
            </p>
            <Badge variant="secondary">Free to download</Badge>
          </div>

          {filteredPapers.length > 0 ? (
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
                Try adjusting your filters to find more papers.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
