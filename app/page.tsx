"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  ArrowRight,
  Users,
  FileQuestion,
  BarChart3,
  CheckCircle,
  Sparkles,
  Bell,
  ExternalLink,
} from "lucide-react";
import { mentors } from "@/lib/data";

export default function HomePage() {
  const [showCETPopup, setShowCETPopup] = useState(false);

  // Show CET Cell popup after 2 seconds on load
  useEffect(() => {
    const timer = setTimeout(() => setShowCETPopup(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ✅ CET Cell Official Announcement Popup */}
      <Dialog open={showCETPopup} onOpenChange={setShowCETPopup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-5 w-5 text-primary" />
              <DialogTitle>Official CET Cell Update</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm font-semibold text-foreground mb-1">
                MHTCET 2025 — Important Notice
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                MHT-CET 2025 registration is now open. Last date to apply is
                <span className="font-semibold text-foreground"> April 30, 2025</span>.
                Exam scheduled for May–June 2025.
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                CAP Round Dates
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                CAP Round 1 expected in August 2025. Keep your documents ready.
                Check cetcell.mahacet.org for latest updates.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full"
              onClick={() => setShowCETPopup(false)}
            >
              
                href="https://cetcell.mahacet.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit CET Cell Official Site
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setShowCETPopup(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0f172a] pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">

            {/* ✅ Honest beta badge */}
            <Badge className="bg-primary/20 text-primary border-0 mb-6 py-1.5 px-4">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Early Access — Free for All Students
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight text-balance">
              Get Mentored by Students from{" "}
              <span className="text-primary">VJTI, ICT, COEP, PICT</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed text-pretty">
              1:1 sessions with real students who cracked MHTCET. Get honest guidance on
              college selection, CAP rounds, and what engineering life is actually like.{" "}
              <span className="text-white font-semibold">Completely free right now.</span>
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base"
              >
                <Link href="/mentors">
                  Talk to a Mentor — Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-transparent border-slate-600 text-white hover:bg-white/10 h-12 px-8 text-base"
              >
                <Link href="/mock-tests">Take Free Mock Test</Link>
              </Button>
            </div>

            {/* ✅ Honest trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Real VJTI Student Mentor</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>No Payment Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Honest Guidance — No Scripts</span>
              </div>
            </div>
          </div>

          {/* Mentor Card Preview — only shows Ganesh */}
          <div className="mt-16 flex justify-center">
            {mentors.slice(0, 1).map((mentor) => (
              <div
                key={mentor.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 w-72"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-slate-600">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {mentor.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white text-sm">{mentor.name}</p>
                    <p className="text-xs text-slate-400">{mentor.college}</p>
                  </div>
                </div>
                <Badge className="mt-3 bg-primary/20 text-primary text-xs border-0">
                  {mentor.achievement}
                </Badge>
                <p className="mt-2 text-xs text-slate-400">
                  2nd Year • Available for free sessions
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ✅ Honest Stats Section */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Early access — growing every week
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "Free", label: "Sessions Right Now" },
              { value: "VJTI", label: "Top College Mentor" },
              { value: "99.21%ile", label: "Mentor's CET Score" },
              { value: "12+", label: "Colleges in Database" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section — unchanged, still accurate */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              Everything you need to crack MHTCET
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              From college prediction to mock tests, we&apos;ve got you covered
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "College Predictor",
                description:
                  "Enter your percentile and get college recommendations. Based on past CAP cutoff data — use as a guide, not a guarantee.",
                href: "/predict",
                color: "bg-blue-500/10 text-blue-600",
              },
              {
                icon: Users,
                title: "Talk to a Mentor",
                description:
                  "Get honest 1:1 guidance from a real VJTI student. College selection, CAP rounds, branch insights — completely free.",
                href: "/mentors",
                color: "bg-purple-500/10 text-purple-600",
              },
              {
                icon: FileQuestion,
                title: "Mock Tests",
                description:
                  "Practice with CET-pattern tests. More tests being added regularly.",
                href: "/mock-tests",
                color: "bg-amber-500/10 text-amber-600",
              },
            ].map((feature) => (
              <Link key={feature.title} href={feature.href} className="group">
                <Card className="h-full border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-8">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center text-primary font-medium text-sm">
                      Learn more
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Colleges Section — data is real, keep it */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Top Maharashtra Colleges
              </h2>
              <p className="mt-2 text-muted-foreground">
                Explore cutoffs, branches, and find mentors from these colleges
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/colleges">
                View All Colleges
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { name: "VJTI", city: "Mumbai", grade: "A++" },
              { name: "ICT", city: "Mumbai", grade: "A++" },
              { name: "COEP", city: "Pune", grade: "A++" },
              { name: "PICT", city: "Pune", grade: "A+" },
              { name: "SPIT", city: "Mumbai", grade: "A+" },
              { name: "WCE", city: "Sangli", grade: "A+" },
              { name: "DJSCE", city: "Mumbai", grade: "A+" },
            ].map((college) => (
              <Link key={college.name} href={`/colleges?search=${college.name.toLowerCase()}`} className="group">
                <Card className="border border-border/50 bg-card/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {college.name[0]}
                    </div>
                    <p className="mt-3 font-semibold text-foreground group-hover:text-primary transition-colors">
                      {college.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{college.city}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {college.grade}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Testimonials section DELETED — add back when you have real ones */}

      {/* CTA Section — updated copy */}
      <section className="py-20 bg-[#0f172a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-balance">
              Ready to get real guidance for MHTCET?
            </h2>
            <p className="mt-4 text-slate-300 text-lg">
              Talk directly to a VJTI student who has been through exactly what you are facing.
              Free, honest, no sales pitch.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8">
                <Link href="/mentors">
                  Book Free Session
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent border-slate-600 text-white hover:bg-white/10 h-12 px-8">
                <Link href="/predict">Try College Predictor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
