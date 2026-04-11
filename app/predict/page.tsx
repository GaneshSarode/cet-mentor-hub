"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  Target,
  Rocket,
  Users,
  GraduationCap,
  Search,
  TrendingUp,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client — uses env vars on Vercel, hardcoded fallback for reliability
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://viumptzaddtysapjtskk.supabase.co";
// Use service_role key if anon key is not a valid JWT
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith("eyJ")
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdW1wdHphZGR0eXNhcGp0c2trIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgwODg0NywiZXhwIjoyMDkxMzg0ODQ3fQ.edjV25oydKGyy2paV2ONwz7n_wZ2NQLvyqVu4Iocvg4";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── MHT-CET Category Definitions ───
// These map exactly to what's stored in the Supabase `cutoffs.category` column
const MHT_CET_CATEGORIES = [
  { value: "GOPENS", label: "General Open (GOPENS)", group: "General" },
  { value: "GOBCS", label: "OBC (GOBCS)", group: "General" },
  { value: "GSCS", label: "SC (GSCS)", group: "General" },
  { value: "GSTS", label: "ST (GSTS)", group: "General" },
  { value: "GVJS", label: "VJ/DT-NT (GVJS)", group: "General" },
  { value: "GNT1S", label: "NT-1 (GNT1S)", group: "General" },
  { value: "GNT2S", label: "NT-2 (GNT2S)", group: "General" },
  { value: "GNT3S", label: "NT-3 (GNT3S)", group: "General" },
  { value: "GSEBCS", label: "SEBC (GSEBCS)", group: "General" },
  { value: "EWS", label: "EWS", group: "General" },
  { value: "TFWS", label: "TFWS (Tuition Fee Waiver)", group: "Special" },
  { value: "LOPENS", label: "Ladies Open (LOPENS)", group: "Ladies" },
  { value: "LOBCS", label: "Ladies OBC (LOBCS)", group: "Ladies" },
  { value: "LSCS", label: "Ladies SC (LSCS)", group: "Ladies" },
  { value: "LSTS", label: "Ladies ST (LSTS)", group: "Ladies" },
  { value: "LVJS", label: "Ladies VJ (LVJS)", group: "Ladies" },
  { value: "LSEBCS", label: "Ladies SEBC (LSEBCS)", group: "Ladies" },
  { value: "MI", label: "Minority (MI)", group: "Special" },
  { value: "ORPHAN", label: "Orphan", group: "Special" },
  { value: "PWDOPENS", label: "PWD Open (PWDOPENS)", group: "PWD" },
  { value: "PWDOBCS", label: "PWD OBC (PWDOBCS)", group: "PWD" },
  { value: "PWDSCS", label: "PWD SC (PWDSCS)", group: "PWD" },
];

// ─── Branch Groups (covers ALL 98 branches from the database) ───
const BRANCH_GROUPS = [
  {
    label: "🔥 All Branches",
    branches: [] as string[], // empty = no branch filter applied
  },
  {
    label: "Computer / IT",
    branches: [
      "Computer Engineering",
      "Computer Science and Engineering",
      "Information Technology",
      "Computer Engineering (Software Engineering)",
      "Computer Science",
      "Computer Science and Business Systems",
      "Computer Science and Design",
      "Computer Science and Information Technology",
      "Computer Science and Technology",
      "Computer Technology",
      "Data Engineering",
      "Data Science",
      "Cyber Security",
      "Computer Science and Engineering (Cyber Security)",
      "Computer Science and Engineering(Cyber Security)",
      "Computer Science and Engineering(Data Science)",
      "Computer Science and Engineering (Internet of Things and Cyber Security Including Block Chain",
      "Computer Science and Engineering (IoT)",
    ],
  },
  {
    label: "AI / ML / Data Science",
    branches: [
      "Artificial Intelligence",
      "Artificial Intelligence and Data Science",
      "Artificial Intelligence (AI) and Data Science",
      "Artificial Intelligence and Machine Learning",
      "Computer Science and Engineering (Artificial Intelligence)",
      "Computer Science and Engineering(Artificial Intelligence and Machine Learning)",
      "Computer Science and Engineering (Artificial Intelligence and Data Science)",
      "Robotics and Artificial Intelligence",
      "Robotics and Automation",
      "Automation and Robotics",
      "Internet of Things (IoT)",
      "Industrial IoT",
      "5G",
      "VLSI",
    ],
  },
  {
    label: "Electronics / EXTC",
    branches: [
      "Electronics and Telecommunication Engg",
      "Electronics Engineering",
      "Electronics Engineering ( VLSI Design and Technology)",
      "Electronics and Communication Engineering",
      "Electronics and Communication (Advanced Communication Technology)",
      "Electronics and Communication(Advanced Communication Technology)",
      "Electronics and Computer Science",
      "Electronics and Computer Engineering",
      "Electronics and Biomedical Engineering",
      "Electrical and Computer Engineering",
    ],
  },
  {
    label: "Mechanical",
    branches: [
      "Mechanical Engineering",
      "Mechanical & Automation Engineering",
      "Mechanical and Automation Engineering",
      "Mechanical Engineering Automobile",
      "Mechanical Engineering[Sandwich]",
      "Mechanical and Mechatronics Engineering (Additive Manufacturing)",
      "Mechatronics Engineering",
      "Automobile Engineering",
      "Production Engineering",
      "Production Engineering[Sandwich]",
      "Manufacturing Science and Engineering",
      "Aeronautical Engineering",
      "Mining Engineering",
    ],
  },
  {
    label: "Electrical / Instrumentation",
    branches: [
      "Electrical Engineering",
      "Electrical and Electronics Engineering",
      "Electrical Engg[Electronics and Power]",
      "Electrical, Electronics and Power",
      "Instrumentation Engineering",
      "Instrumentation and Control Engineering",
    ],
  },
  {
    label: "Civil / Structural",
    branches: [
      "Civil Engineering",
      "Civil Engineering (Structural Engineering)",
      "Civil and Environmental Engineering",
      "Civil and infrastructure Engineering",
      "Structural Engineering",
      "Architectural Assistantship",
      "Safety and Fire Engineering",
      "Fire Engineering",
    ],
  },
  {
    label: "Chemical / Pharma / Bio",
    branches: [
      "Chemical Engineering",
      "Bio Technology",
      "Bio Medical Engineering",
      "Pharmaceutical and Fine Chemical Technology",
      "Pharmaceuticals Chemistry and Technology",
      "Petro Chemical Engineering",
      "Food Technology",
      "Food Engineering",
      "Food Engineering and Technology",
      "Food Technology And Management",
      "Agricultural Engineering",
    ],
  },
  {
    label: "Textile / Polymer / Other",
    branches: [
      "Textile Engineering / Technology",
      "Textile Technology",
      "Textile Chemistry",
      "Technical Textiles",
      "Man Made Textile Technology",
      "Fibres and Textile Processing Technology",
      "Fashion Technology",
      "Plastic Technology",
      "Plastic and Polymer Engineering",
      "Polymer Engineering and Technology",
      "Dyestuff Technology",
      "Oil Technology",
      "Oil Fats and Waxes Technology",
      "Oil and Paints Technology",
      "Paints Technology",
      "Surface Coating Technology",
      "Paper and Pulp Technology",
      "Printing and Packing Technology",
      "Metallurgy and Material Technology",
    ],
  },
];

interface PredictionResult {
  collegeName: string;
  branchName: string;
  cutoffPercentile: number;
  cutoffCategory: string;
  meritNo: number | null;
  probability: number;
  status: "safe" | "moderate" | "reach";
}

export default function PredictPage() {
  // ─── State ───
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [percentileInput, setPercentileInput] = useState("85.0000");
  const [category, setCategory] = useState("GOPENS");
  const [selectedBranchGroups, setSelectedBranchGroups] = useState<string[]>([
    "🔥 All Branches",
  ]);

  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalFound, setTotalFound] = useState(0);

  // Derive the actual percentile number from input
  const userPercentile = parseFloat(percentileInput) || 0;

  // If "All Branches" is selected, pass empty array (= no filter)
  const isAllBranches = selectedBranchGroups.includes("🔥 All Branches");
  const selectedBranches = isAllBranches
    ? []
    : BRANCH_GROUPS.filter((g) => selectedBranchGroups.includes(g.label)).flatMap((g) => g.branches);

  // ─── Toggle Branch Group ───
  const toggleBranchGroup = (label: string) => {
    if (label === "🔥 All Branches") {
      // "All Branches" is exclusive — toggles off everything else
      setSelectedBranchGroups((prev) =>
        prev.includes(label) ? [] : [label]
      );
    } else {
      setSelectedBranchGroups((prev) => {
        // Remove "All Branches" when selecting specific groups
        const without = prev.filter((l) => l !== "🔥 All Branches");
        return without.includes(label)
          ? without.filter((l) => l !== label)
          : [...without, label];
      });
    }
  };

  // ─── Fetch Predictions from Supabase ───
  useEffect(() => {
    if (!showResults) return;

    async function fetchPredictions() {
      setIsLoading(true);
      setError(null);
      setPredictions([]);

      try {
        // Query cutoffs table with joins to branches and colleges
        const { data, error: dbError } = await supabaseClient
          .from("cutoffs")
          .select(
            `
            percentile,
            category,
            merit_no,
            cap_round,
            branch:branches!inner(
              name,
              college:colleges!inner(
                name
              )
            )
          `
          )
          .eq("category", category)
          .eq("cap_round", 3)
          .gte("percentile", userPercentile - 15)
          .lte("percentile", userPercentile + 5)
          .order("percentile", { ascending: false })
          .limit(500);

        if (dbError) {
          throw new Error(dbError.message);
        }

        if (!data || data.length === 0) {
          setPredictions([]);
          setTotalFound(0);
          setIsLoading(false);
          return;
        }

        // Process results
        const results: PredictionResult[] = [];

        data.forEach((row: any) => {
          const collegeName = row.branch?.college?.name;
          const branchName = row.branch?.name;
          const cutoff = row.percentile;

          if (!collegeName || !branchName) return;

          // Filter by selected branches (skip if "All Branches" / empty array)
          if (selectedBranches.length > 0 && !selectedBranches.includes(branchName))
            return;

          // Calculate probability
          const diff = userPercentile - cutoff;
          let probability: number;
          let status: "safe" | "moderate" | "reach";

          if (diff >= 3) {
            probability = Math.min(98, 85 + diff * 1.5);
            status = "safe";
          } else if (diff >= 0.5) {
            probability = Math.min(84, 60 + diff * 8);
            status = "safe";
          } else if (diff >= -1) {
            probability = Math.max(25, 50 + diff * 20);
            status = "moderate";
          } else if (diff >= -3) {
            probability = Math.max(10, 30 + diff * 7);
            status = "reach";
          } else {
            probability = Math.max(2, 15 + diff * 3);
            status = "reach";
          }

          results.push({
            collegeName,
            branchName,
            cutoffPercentile: cutoff,
            cutoffCategory: row.category,
            meritNo: row.merit_no,
            probability: Math.round(probability),
            status,
          });
        });

        // Sort: safe first, then moderate, then reach
        // Within each group sort by probability descending, then by cutoff descending (hardest colleges first)
        results.sort((a, b) => {
          const order = { safe: 0, moderate: 1, reach: 2 };
          if (order[a.status] !== order[b.status])
            return order[a.status] - order[b.status];
          if (b.probability !== a.probability)
            return b.probability - a.probability;
          return b.cutoffPercentile - a.cutoffPercentile;
        });

        setTotalFound(results.length);
        setPredictions(results);
      } catch (err: any) {
        console.error("Prediction error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPredictions();
  }, [showResults, userPercentile, category, selectedBranches.join(",")]);

  // ─── Navigation ───
  const handleNext = () => {
    if (step < 3) {
      setStep((s) => (s + 1) as 1 | 2 | 3);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
    } else if (step > 1) {
      setStep((s) => (s - 1) as 1 | 2 | 3);
    }
  };

  const resetPredictor = () => {
    setStep(1);
    setShowResults(false);
    setPredictions([]);
    setError(null);
    setPercentileInput("85.0000");
    setCategory("GOPENS");
    setSelectedBranchGroups(["Computer / IT"]);
  };

  // ─── Status Helpers ───
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <Shield className="h-4 w-4 text-emerald-500" />;
      case "moderate":
        return <Target className="h-4 w-4 text-amber-500" />;
      case "reach":
        return <Rocket className="h-4 w-4 text-blue-500" />;
    }
  };

  const statusColors = {
    safe: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-500/30",
      accent: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      badge:
        "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
      glow: "shadow-emerald-500/20",
    },
    moderate: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/30",
      accent: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      badge:
        "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
      glow: "shadow-amber-500/20",
    },
    reach: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-500/30",
      accent: "bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      badge:
        "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
      glow: "shadow-blue-500/20",
    },
  };

  const safeCount = predictions.filter((p) => p.status === "safe").length;
  const moderateCount = predictions.filter(
    (p) => p.status === "moderate"
  ).length;
  const reachCount = predictions.filter((p) => p.status === "reach").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              College Predictor
            </h1>
          </div>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Enter your exact MHT-CET percentile and category to get accurate
            college predictions based on official CAP Round 3 cutoff data.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {!showResults ? (
            <>
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Step {step} of 3
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {step === 1
                      ? "Your Score"
                      : step === 2
                      ? "Branch Selection"
                      : "Review & Predict"}
                  </span>
                </div>
                <Progress value={(step / 3) * 100} className="h-2" />
              </div>

              <Card className="border-border/50">
                <CardContent className="p-8">
                  {/* ─── Step 1: Percentile & Category ─── */}
                  {step === 1 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground mb-1">
                          Enter Your MHT-CET Score
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">
                          Enter your exact percentile for precise predictions
                        </p>

                        {/* Percentile Input - Text Field for precision */}
                        <div className="space-y-4">
                          <Label className="text-base font-medium">
                            Your Percentile
                          </Label>
                          <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-xs">
                              <Input
                                id="percentile-input"
                                type="number"
                                step="0.000001"
                                min="0"
                                max="100"
                                value={percentileInput}
                                onChange={(e) =>
                                  setPercentileInput(e.target.value)
                                }
                                placeholder="e.g. 99.214234"
                                className="text-2xl font-bold h-14 pr-12"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                %ile
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            💡 Enter your full percentile with all decimal
                            places (e.g., 99.214234) for the most accurate
                            results
                          </p>
                        </div>
                      </div>

                      {/* Category Selection */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">
                          Your Category
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="h-12" id="category-select">
                            <SelectValue placeholder="Select your category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem disabled value="__general_header">
                              ── General ──
                            </SelectItem>
                            {MHT_CET_CATEGORIES.filter(
                              (c) => c.group === "General"
                            ).map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                            <SelectItem disabled value="__ladies_header">
                              ── Ladies ──
                            </SelectItem>
                            {MHT_CET_CATEGORIES.filter(
                              (c) => c.group === "Ladies"
                            ).map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                            <SelectItem disabled value="__special_header">
                              ── Special ──
                            </SelectItem>
                            {MHT_CET_CATEGORIES.filter(
                              (c) => c.group === "Special"
                            ).map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                            <SelectItem disabled value="__pwd_header">
                              ── PWD ──
                            </SelectItem>
                            {MHT_CET_CATEGORIES.filter(
                              (c) => c.group === "PWD"
                            ).map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* ─── Step 2: Branch Selection ─── */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground mb-1">
                          Select Branch Groups
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">
                          Choose the engineering fields you are interested in
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {BRANCH_GROUPS.map((group) => {
                          const isSelected = selectedBranchGroups.includes(
                            group.label
                          );
                          return (
                            <div
                              key={group.label}
                              onClick={() => toggleBranchGroup(group.label)}
                              className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-md"
                                  : "border-border hover:border-primary/40 hover:bg-muted/30"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {group.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {group.branches.length} branches
                                  </p>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? "bg-primary border-primary"
                                      : "border-muted-foreground/30"
                                  }`}
                                >
                                  {isSelected && (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {selectedBranchGroups.length === 0 && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Select at least one branch group for predictions
                        </p>
                      )}
                    </div>
                  )}

                  {/* ─── Step 3: Review ─── */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground mb-6">
                        Review Your Details
                      </h2>

                      <div className="space-y-4 bg-muted/30 rounded-xl p-6">
                        <div className="flex justify-between py-3 border-b border-border/50">
                          <span className="text-muted-foreground">
                            Percentile
                          </span>
                          <span className="font-bold text-primary text-lg">
                            {percentileInput}%ile
                          </span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-border/50">
                          <span className="text-muted-foreground">
                            Category
                          </span>
                          <span className="font-semibold text-foreground">
                            {MHT_CET_CATEGORIES.find(
                              (c) => c.value === category
                            )?.label || category}
                          </span>
                        </div>
                        <div className="flex justify-between py-3">
                          <span className="text-muted-foreground">
                            Branch Groups
                          </span>
                          <span className="font-semibold text-foreground text-right max-w-[250px]">
                            {selectedBranchGroups.length > 0
                              ? selectedBranchGroups.join(", ")
                              : "All branches"}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Data Source:</strong> Official MHT-CET CAP
                          Round 3 Cutoff Data (2024-25). Predictions are based
                          on last year&apos;s closing cutoffs.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={step === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="bg-primary hover:bg-primary/90"
                      disabled={
                        (step === 1 &&
                          (userPercentile <= 0 || userPercentile > 100)) ||
                        (step === 2 && selectedBranchGroups.length === 0)
                      }
                    >
                      {step === 3 ? (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Get Predictions
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* ─── Results Section ─── */
            <div>
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Your College Predictions
                  </h2>
                  <p className="text-muted-foreground">
                    {percentileInput}%ile •{" "}
                    {MHT_CET_CATEGORIES.find((c) => c.value === category)
                      ?.label || category}
                  </p>
                </div>
                <Button variant="outline" onClick={resetPredictor}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </div>

              {/* Summary Stats */}
              {!isLoading && predictions.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-4 text-center">
                    <Shield className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {safeCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Safe</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-4 text-center">
                    <Target className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {moderateCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Moderate</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 p-4 text-center">
                    <Rocket className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {reachCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Reach</p>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">
                    Safe (&gt;60% chance)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Moderate (25-60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    Reach (&lt;25%)
                  </span>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="mt-4 text-muted-foreground">
                    Querying official cutoff database...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <Card className="border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
                  <CardContent className="py-8 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                    <p className="font-medium text-red-700 dark:text-red-400 mb-1">
                      Connection Error
                    </p>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                      {error}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowResults(false);
                        setTimeout(() => setShowResults(true), 100);
                      }}
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Results List */}
              {!isLoading && !error && predictions.length > 0 && (
                <div className="space-y-4">
                  {predictions.slice(0, 150).map((result, index) => {
                    const colors = statusColors[result.status];

                    return (
                      <Card
                        key={`${result.collegeName}-${result.branchName}-${index}`}
                        className={`border ${colors.border} ${colors.bg} overflow-hidden transition-all duration-300 hover:shadow-lg ${colors.glow}`}
                      >
                        <CardContent className="p-0">
                          <div className="flex items-stretch">
                            {/* Status Indicator Bar */}
                            <div className={`w-1.5 ${colors.accent}`} />
                            <div className="flex-1 p-5">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex-1">
                                  {/* Header with Status Badge */}
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="font-semibold text-foreground text-lg">
                                      {result.collegeName}
                                    </h3>
                                    <Badge
                                      className={`${colors.badge} border font-medium`}
                                    >
                                      {getStatusIcon(result.status)}
                                      <span className="ml-1.5">
                                        {result.status === "safe"
                                          ? "Safe Choice"
                                          : result.status === "moderate"
                                          ? "Moderate"
                                          : "Reach"}
                                      </span>
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1.5">
                                    {result.branchName}
                                  </p>

                                  {/* Probability Progress Bar */}
                                  <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Admission Probability
                                      </span>
                                      <span
                                        className={`font-bold ${colors.text}`}
                                      >
                                        {result.probability}%
                                      </span>
                                    </div>
                                    <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${colors.accent} rounded-full transition-all duration-700 ease-out`}
                                        style={{
                                          width: `${result.probability}%`,
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {/* Cutoff Details */}
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                                    <span>
                                      Cutoff:{" "}
                                      <span className="font-semibold text-foreground">
                                        {result.cutoffPercentile.toFixed(7)}
                                        %ile
                                      </span>
                                    </span>
                                    <span>•</span>
                                    <span>
                                      Your Score:{" "}
                                      <span className="font-semibold text-foreground">
                                        {percentileInput}%ile
                                      </span>
                                    </span>
                                    {result.meritNo && (
                                      <>
                                        <span>•</span>
                                        <span>
                                          Merit No:{" "}
                                          <span className="font-semibold text-foreground">
                                            {result.meritNo.toLocaleString()}
                                          </span>
                                        </span>
                                      </>
                                    )}
                                    <span>•</span>
                                    <span>
                                      Category:{" "}
                                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                                        {result.cutoffCategory}
                                      </Badge>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && predictions.length === 0 && (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium text-foreground mb-1">
                      No colleges found for your criteria
                    </p>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                      This could mean the database doesn&apos;t have cutoff data for
                      the selected category, or your percentile is outside the
                      range of available colleges. Try selecting a different
                      category or branch group.
                    </p>
                    <Button variant="outline" onClick={resetPredictor}>
                      Modify Preferences
                    </Button>
                  </CardContent>
                </Card>
              )}

              {predictions.length > 150 && (
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Showing top 150 of {totalFound} results
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
