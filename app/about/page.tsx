import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Heart, Target, Users, Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | CET Mentor Hub",
  description: "CET Mentor Hub is a free platform by VJTI students providing MHTCET guidance, college prediction, and PYQ online tests.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f172a] pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-primary/20 text-primary border-0 mb-6 py-1.5 px-4">
              <Heart className="h-3.5 w-3.5 mr-1.5" />
              Built by Students, for Students
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight text-balance">
              About CET Mentor Hub
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              A free platform created by a VJTI student to give honest, practical guidance to MHTCET aspirants.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full text-background" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Why I Built This</h2>
          <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
            <p>
              Hi, I&apos;m <strong className="text-foreground">Ganesh Sarode</strong> — a SY BTech EXTC student at VJTI Mumbai. I scored <strong className="text-foreground">99.21 percentile in MHTCET</strong>.
            </p>
            <p>
              When I was preparing for CET, I had no real guidance. Most advice online was generic, confusing, or trying to sell something. I didn&apos;t know how CAP rounds actually worked, which college to prefer, or what engineering life would really be like.
            </p>
            <p>
              I built CET Mentor Hub because I wanted to give future students what I never had — <strong className="text-foreground">honest, practical, free guidance</strong> from someone who&apos;s actually been through the process. No scripts, no sales pitch.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, title: "Free 1:1 Mentorship", desc: "Talk directly to a VJTI student via WhatsApp. No charges, no time limits." },
              { icon: Target, title: "College Predictor", desc: "Enter your percentile and get college recommendations based on actual CAP round cutoff data." },
              { icon: MessageCircle, title: "PYQ Online Tests", desc: "Practice MHT-CET PYQs (2019–2025) with exam-like interface, auto-grading, and answer review." },
            ].map((item) => (
              <Card key={item.title} className="border border-border/50 bg-card/50">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Avatar className="h-20 w-20 mx-auto border-2 border-primary/30">
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">G</AvatarFallback>
          </Avatar>
          <h3 className="mt-4 text-xl font-bold text-foreground">Ganesh Sarode</h3>
          <p className="text-muted-foreground">SY BTech EXTC, VJTI Mumbai</p>
          <p className="text-sm text-muted-foreground mt-1">99.21%ile MHTCET</p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/mentors">
                Talk to Me — Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
          <p className="text-muted-foreground mb-6">
            Have questions, feedback, or want to contribute? Reach out anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:cetmentorhub@gmail.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              cetmentorhub@gmail.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
