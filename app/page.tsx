"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  ArrowRight,
  Users,
  FileQuestion,
  BarChart3,
  CheckCircle,
  Sparkles,
  ExternalLink,
  FileText,
  Download,
  BookOpenCheck,
  MapPin,
} from "lucide-react";

const TOP_COLLEGES = [
  {
    city: "Mumbai",
    colleges: [
      { name: "VJTI Mumbai", rank: "Top 1", url: "https://vjti.ac.in", branches: ["CS", "IT", "EXTC", "Electronics", "Electrical", "Production", "Mechanical", "Textile"] },
      { name: "SPIT Mumbai", rank: "Top 2", url: "https://www.spit.ac.in", branches: ["Computer", "CE (AI/ML)", "CE (DS)", "EXTC"] },
      { name: "ICT Mumbai", rank: "Top 3", url: "https://www.ictmumbai.edu.in", branches: ["Chemical", "Pharmacy", "Food", "Polymers", "Oils", "Paints"] },
      { name: "DJSCE Mumbai", rank: "Top 4", url: "https://djsce.ac.in", branches: ["CS", "IT", "EXTC", "Mechanical", "Data Science", "AI/ML"] },
    ]
  },
  {
    city: "Pune",
    colleges: [
      { name: "COEP Pune", rank: "Top 1", url: "https://www.coep.org.in", branches: ["Computer", "Mechanical", "Civil", "Electrical", "EnTC", "Meta", "Production"] },
      { name: "PICT Pune", rank: "Top 2", url: "https://pict.edu", branches: ["Computer", "IT", "EnTC", "AI/DS"] },
      { name: "VIT Pune", rank: "Top 3", url: "https://www.vit.edu", branches: ["Computer", "IT", "AI", "Mechanical", "EnTC", "Chemical"] },
      { name: "PCCOE Pune", rank: "Top 4", url: "http://www.pccoepune.com", branches: ["Computer", "IT", "EnTC", "Mechanical", "Civil"] },
    ]
  },
  {
    city: "Other Regions",
    colleges: [
      { name: "WCE Sangli", rank: "Top 1", url: "http://www.walchandsangli.ac.in", branches: ["Computer", "IT", "Mechanical", "Civil", "Electrical", "Electronics"] },
      { name: "SGGS Nanded", rank: "Top 2", url: "https://sggs.ac.in", branches: ["Computer", "IT", "Mechanical", "Civil", "Chemical", "Production"] },
      { name: "GCOE Amravati", rank: "Top 3", url: "https://www.gcoea.ac.in", branches: ["Computer", "IT", "Mechanical", "Civil", "Electrical", "EnTC"] },
      { name: "GCOE Nagpur", rank: "Top 4", url: "https://www.gcoen.ac.in", branches: ["Computer", "Mechanical", "Civil", "Electrical", "Electronics"] },
    ]
  }
];
import { mentors } from "@/lib/data";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useUser, SignInButton } from "@clerk/nextjs";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/json-ld";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const { scrollY } = useScroll();

  // Hero Orb Parallax (moves slower than page)
  const orbY = useTransform(scrollY, [0, 1000], [0, 300]);


  return (
    <div className="min-h-screen bg-background relative">
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <Navbar />


      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0a0e1a] pt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e2a3f_1px,transparent_1px),linear-gradient(to_bottom,#1e2a3f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          <motion.div 
            style={{ y: orbY }}
            className="hero-orb absolute top-1/3 left-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent blur-3xl" 
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left: Graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block w-full max-w-lg mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 rounded-3xl blur-2xl -z-10" />
              <img 
                src="/vjti-campus.png" 
                alt="VJTI Campus" 
                className="w-full aspect-[4/3] object-cover rounded-3xl border border-white/10 drop-shadow-2xl hover:scale-[1.02] transition-transform duration-700" 
              />
            </motion.div>

            {/* Right: Content */}
            <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              {/* ✅ Honest beta badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Badge className="bg-primary/20 text-primary border-0 mb-6 py-1.5 px-4">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Early Access — Free for All Students
                </Badge>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight text-balance">
                  Get Mentored by Students from{" "}
                  <span className="text-gradient bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">VJTI</span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-pretty">
                  1:1 sessions with real students who cracked MHTCET. Get honest guidance on
                  college selection, CAP rounds, and what engineering life is actually like.{" "}
                  <span className="text-white font-semibold">Completely free.</span>
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                {isSignedIn ? (
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#25D366] hover:bg-[#1EBE57] text-white h-12 px-8 text-base"
                  >
                    <Link href="https://chat.whatsapp.com/FT9zIkNqsbt4yNQDDkEGaU" target="_blank" rel="noopener noreferrer">
                      Join WhatsApp Group — Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <SignInButton mode="modal" fallbackRedirectUrl="/">
                    <Button
                      size="lg"
                      className="bg-[#25D366] hover:bg-[#1EBE57] text-white h-12 px-8 text-base cursor-pointer"
                    >
                      Join WhatsApp Group — Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </SignInButton>
                )}
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-slate-600 text-white hover:bg-white/10 h-12 px-8 text-base"
                >
                  <Link href="/papers">Previous Year Papers</Link>
                </Button>
              </motion.div>

              {/* ✅ Honest trust badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-slate-400"
              >
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>Real VJTI Student Mentor</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>No Payment Required</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mt-2 sm:mt-0">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span>Honest Guidance</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full text-background" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" />
          </svg>
        </div>
      </section>


      {/* Features Section — unchanged, still accurate */}
      <section className="py-20 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.1, margin: "-80px" }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              Everything you need to crack MHTCET
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              From college prediction to mock tests, we&apos;ve got you covered
            </p>
          </motion.div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: "College Predictor",
                description:
                  "Enter your percentile and get college recommendations based on past CAP cutoff data.",
                href: "/predict",
                color: "bg-blue-500/10 text-blue-600",
                style: { '--accent-from': '#3b82f6', '--accent-to': '#6366f1' } as React.CSSProperties,
              },
              {
                icon: Users,
                title: "WhatsApp Community",
                description:
                  "Get honest 1:1 guidance from a real VJTI student directly on WhatsApp.",
                href: "#join",
                color: "bg-purple-500/10 text-purple-600",
                style: { '--accent-from': '#8b5cf6', '--accent-to': '#a855f7' } as React.CSSProperties,
              },
              {
                icon: FileQuestion,
                title: "Subject-wise Practice",
                description:
                  "Focus on one subject at a time. No timer, instant answer reveal, and detailed solutions.",
                href: "/practice",
                color: "bg-amber-500/10 text-amber-600",
                style: { '--accent-from': '#f59e0b', '--accent-to': '#ef4444' } as React.CSSProperties,
              },
              {
                icon: BookOpenCheck,
                title: "Practice Papers",
                description:
                  "Download MHTCET PYQs and mock papers for offline practice.",
                href: "/papers",
                color: "bg-emerald-500/10 text-emerald-600",
                style: { '--accent-from': '#10b981', '--accent-to': '#06b6d4' } as React.CSSProperties,
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.1, margin: "-80px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link href={feature.href} className="group">
                  <Card className="card-accent-bar h-full border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5" style={feature.style}>
                    <CardContent className="p-8">
                      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}>
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ MHTCET Official Announcement Section */}
      <section className="py-16 bg-gradient-to-b from-background to-primary/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.1, margin: "-80px" }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0 mb-4 py-1.5 px-4">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Official CET Cell Information
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              MHTCET 2026 Information Brochures
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Download the official information brochures for PCM and PCB groups from the State CET Cell
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* PCM Brochure Card */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.1 }}
              transition={{ duration: 0.5 }}
            >
              <a
                href="https://cetcell.mahacet.org/wp-content/uploads/2023/12/CET-Registration-Notice_-MHT-CET-2026-final-with-late-fees-17-03-2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                title="See official web of CET Cell — Home - State Common Entrance Test Cell"
                className="group"
              >
                <Card className="h-full border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-blue-500/15 flex items-center justify-center">
                        <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          MHTCET PCM Group
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          Physics, Chemistry & Mathematics — Information Brochure for Engineering & Technology admissions
                        </p>
                        <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
                          <Download className="h-4 w-4" />
                          Download PDF
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>

            {/* PCB Brochure Card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.1 }}
              transition={{ duration: 0.5 }}
            >
              <a
                href="https://cetcell.mahacet.org/cet-3/"
                target="_blank"
                rel="noopener noreferrer"
                title="See official web of CET Cell — Home - State Common Entrance Test Cell"
                className="group"
              >
                <Card className="h-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5 transition-all duration-300 hover:border-emerald-400 dark:hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                        <FileText className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          MHTCET PCB Group
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          Physics, Chemistry & Biology — Information Brochure for Pharmacy, Agriculture & Medical admissions
                        </p>
                        <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          <Download className="h-4 w-4" />
                          Download PDF
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          </div>

          {/* CET Cell Official Link — shown on hover tooltip is on the cards above */}
          <div className="mt-8 text-center">
            <a
              href="https://cetcell.mahacet.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <ExternalLink className="h-4 w-4" />
              See official web of CET Cell — Home - State Common Entrance Test Cell
            </a>
          </div>
        </div>
      </section>

      {/* Top Colleges Section — data is real, keep it */}
      <section className="py-20 bg-background noise-bg relative">
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

          <div className="mt-12 space-y-12">
            {TOP_COLLEGES.map((region, regionIndex) => {
              const borderClass = ['border-blue-500/40', 'border-violet-500/40', 'border-amber-500/40'][regionIndex % 3];
              return (
                <motion.div 
                  key={region.city} 
                  className={`border-l-2 ${borderClass} pl-4`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.1, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: regionIndex * 0.2 }}
                >
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Top Colleges in {region.city}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {region.colleges.map((college) => (
                      <Card key={college.name} className="border border-border/50 bg-card/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg flex flex-col h-full">
                        <CardContent className="p-5 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold text-foreground text-lg leading-tight">{college.name}</h4>
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs shrink-0">{college.rank}</Badge>
                          </div>
                          
                          <div className="flex-grow">
                            <p className="text-xs text-muted-foreground mb-3 font-medium">Branches Available:</p>
                            <div className="flex flex-wrap gap-1.5 mb-5">
                              {college.branches.map((branch) => (
                                <span key={branch} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  {branch}
                                </span>
                              ))}
                            </div>
                          </div>

                          <Button asChild variant="outline" size="sm" className="w-full mt-auto group">
                            <Link href={college.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                              Visit Website <ExternalLink className="ml-1.5 h-3.5 w-3.5 group-hover:text-primary" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>



      {/* CTA Section — updated copy */}
      <section id="join" className="py-20 bg-gradient-to-br from-[#0a0e1a] via-[#131835] to-[#0a0e1a] relative noise-bg scroll-mt-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance">
          Ready to get real guidance for MHTCET?
        </h2>
        <p className="mt-4 text-slate-300 text-lg">
          Join our WhatsApp group to talk directly to a VJTI student who has been through exactly what you are facing.
          Free, honest, no sales pitch.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isSignedIn ? (
            <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1EBE57] text-white h-12 px-8">
              <Link href="https://chat.whatsapp.com/FT9zIkNqsbt4yNQDDkEGaU" target="_blank" rel="noopener noreferrer">
                Join WhatsApp Group
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl="/">
              <Button size="lg" className="bg-[#25D366] hover:bg-[#1EBE57] text-white h-12 px-8 cursor-pointer">
                Join WhatsApp Group
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignInButton>
          )}
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