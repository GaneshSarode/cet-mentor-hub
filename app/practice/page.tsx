"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Atom, FlaskConical, Pi, Sparkles, Play, Zap, BookOpen, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const subjects = [
  { id: "Physics", label: "Physics", icon: Atom, bgColor: "bg-blue-500/10", textColor: "text-blue-600 dark:text-blue-400", borderColor: "border-blue-500/30 hover:border-blue-500/50", description: "Kinematics, electrostatics, magnetism, optics, modern physics & more." },
  { id: "Chemistry", label: "Chemistry", icon: FlaskConical, bgColor: "bg-emerald-500/10", textColor: "text-emerald-600 dark:text-emerald-400", borderColor: "border-emerald-500/30 hover:border-emerald-500/50", description: "Organic reactions, chemical bonding, electrochemistry & more." },
  { id: "Mathematics", label: "Mathematics", icon: Pi, bgColor: "bg-violet-500/10", textColor: "text-violet-600 dark:text-violet-400", borderColor: "border-violet-500/30 hover:border-violet-500/50", description: "Integration, differentiation, matrices, probability & more." },
];

export default function PracticePage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState("20");
  const [selectedYear, setSelectedYear] = useState("all");

  const handleStartPractice = () => {
    if (!selectedSubject) return;
    const params = new URLSearchParams({ subject: selectedSubject, count: questionCount });
    if (selectedYear !== "all") params.set("year", selectedYear);
    router.push(`/practice/session?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0f172a] pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-violet-500/20 text-violet-400 border-0 mb-6 py-1.5 px-4"><Zap className="h-3.5 w-3.5 mr-1.5" />Subject-wise Practice</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight text-balance">Practice by <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300">Subject</span></h1>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">Focus on one subject at a time. No timer, instant answer reveal, and detailed solutions.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-violet-500/10 text-violet-400 px-4 py-2 rounded-full"><Clock className="h-4 w-4" /><span>No Time Limit</span></div>
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full"><BookOpen className="h-4 w-4" /><span>Instant Solutions</span></div>
              <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-full"><Sparkles className="h-4 w-4" /><span>Random PYQ Mix</span></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full text-background" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Choose a subject to practice</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {subjects.map((subject, idx) => {
              const isSelected = selectedSubject === subject.id;
              const Icon = subject.icon;
              return (
                <motion.div key={subject.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <button onClick={() => setSelectedSubject(subject.id)} className="w-full text-left">
                    <Card className={`border-2 transition-all duration-300 cursor-pointer ${isSelected ? `${subject.borderColor} shadow-lg` : "border-border/50 hover:border-primary/20"}`}>
                      <CardContent className="p-6">
                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${subject.bgColor}`}><Icon className={`h-6 w-6 ${subject.textColor}`} /></div>
                        <h3 className={`mt-4 text-lg font-semibold ${isSelected ? subject.textColor : "text-foreground"}`}>{subject.label}</h3>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{subject.description}</p>
                        {isSelected && <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Badge className={`mt-3 ${subject.bgColor} ${subject.textColor} border-0`}>Selected</Badge></motion.div>}
                      </CardContent>
                    </Card>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {selectedSubject && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Configure your practice session</h3>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Number of Questions</label>
                      <Select value={questionCount} onValueChange={setQuestionCount}>
                        <SelectTrigger id="question-count-select"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[10, 20, 30, 50].map((c) => <SelectItem key={c} value={c.toString()}>{c} Questions</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">From Year (Optional)</label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger id="year-select"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years (Random Mix)</SelectItem>
                          {[2025, 2024, 2023, 2022, 2021, 2019].map((y) => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleStartPractice} size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8">
                    <Play className="h-4 w-4 mr-2" />Start Practice<ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
