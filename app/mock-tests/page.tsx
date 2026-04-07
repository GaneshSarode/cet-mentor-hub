"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TestCard } from "@/components/test-card";
import { mockTests } from "@/lib/data";

const subjects = ["All", "Physics", "Chemistry", "Mathematics", "Full Mock"];

export default function MockTestsPage() {
  const [activeSubject, setActiveSubject] = useState("All");

  const filteredTests =
    activeSubject === "All"
      ? mockTests
      : mockTests.filter((test) => test.subject === activeSubject);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Mock Tests
          </h1>
          <p className="mt-2 text-muted-foreground">
            Practice with CET-pattern tests and track your progress
          </p>
        </div>
      </section>

      {/* Subject Tabs */}
      <section className="sticky top-16 z-40 bg-background/80 backdrop-blur-lg border-b py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs value={activeSubject} onValueChange={setActiveSubject}>
            <TabsList className="bg-muted/50 h-auto flex-wrap">
              {subjects.map((subject) => (
                <TabsTrigger
                  key={subject}
                  value={subject}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {subject}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Tests Grid */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredTests.length} test{filteredTests.length !== 1 ? "s" : ""}{" "}
              available
            </p>
            <Badge variant="secondary">Free to attempt</Badge>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
