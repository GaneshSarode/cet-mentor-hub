"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { colleges, categories, branches, districts } from "@/lib/data";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Target,
  Rocket,
  Shield,
  Users,
  GraduationCap,
} from "lucide-react";

type Step = 1 | 2 | 3;

interface PredictionResult {
  college: (typeof colleges)[0];
  branch: string;
  probability: number;
  cutoff: number;
  status: "safe" | "moderate" | "reach";
}

export default function PredictPage() {
  const [step, setStep] = useState<Step>(1);
  const [percentile, setPercentile] = useState([85]);
  const [category, setCategory] = useState("open");
  const [homeDistrict, setHomeDistrict] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    "Computer Engineering",
    "IT",
  ]);
  const [cityPreference, setCityPreference] = useState("any");
  const [govtOnly, setGovtOnly] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const toggleBranch = (branch: string) => {
    if (selectedBranches.includes(branch)) {
      setSelectedBranches(selectedBranches.filter((b) => b !== branch));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const predictions = useMemo((): PredictionResult[] => {
    if (!showResults) return [];

    const results: PredictionResult[] = [];
    const userPercentile = percentile[0];

    colleges.forEach((college) => {
      // Filter by govt only
      if (govtOnly && college.type !== "Government") return;

      // Filter by city preference
      if (cityPreference !== "any" && college.city !== cityPreference) return;

      Object.entries(college.cutoffs).forEach(([branch, cutoffs]) => {
        // Filter by selected branches
        if (!selectedBranches.includes(branch)) return;

        const cutoff = cutoffs[category as keyof typeof cutoffs] || cutoffs.open;
        if (!cutoff) return;

        // Calculate probability based on percentile difference
        const diff = userPercentile - cutoff;
        let probability: number;
        let status: "safe" | "moderate" | "reach";

        if (diff >= 2) {
          probability = Math.min(95, 80 + diff * 2);
          status = "safe";
        } else if (diff >= -1) {
          probability = 50 + diff * 15;
          status = "moderate";
        } else {
          probability = Math.max(5, 30 + diff * 10);
          status = "reach";
        }

        // Only show if probability is above 5%
        if (probability > 5) {
          results.push({
            college,
            branch,
            probability: Math.round(probability),
            cutoff,
            status,
          });
        }
      });
    });

    // Sort by probability
    return results.sort((a, b) => b.probability - a.probability);
  }, [
    showResults,
    percentile,
    category,
    selectedBranches,
    cityPreference,
    govtOnly,
  ]);

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as Step);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
    } else if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const resetPredictor = () => {
    setStep(1);
    setShowResults(false);
    setPercentile([85]);
    setCategory("open");
    setHomeDistrict("");
    setSelectedBranches(["Computer Engineering", "IT"]);
    setCityPreference("any");
    setGovtOnly(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <Shield className="h-4 w-4 text-accent" />;
      case "moderate":
        return <Target className="h-4 w-4 text-amber-500" />;
      case "reach":
        return <Rocket className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "safe":
        return (
          <Badge className="bg-accent/10 text-accent border-0">Safe Choice</Badge>
        );
      case "moderate":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-0">
            Moderate
          </Badge>
        );
      case "reach":
        return (
          <Badge className="bg-primary/10 text-primary border-0">Reach</Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            College Predictor
          </h1>
          <p className="mt-2 text-muted-foreground">
            Get personalized college recommendations based on your percentile
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {!showResults ? (
            <>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Step {step} of 3
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {step === 1
                      ? "Your Score"
                      : step === 2
                      ? "Preferences"
                      : "Review"}
                  </span>
                </div>
                <Progress value={(step / 3) * 100} className="h-2" />
              </div>

              <Card className="border-border/50">
                <CardContent className="p-8">
                  {/* Step 1: Your Score */}
                  {step === 1 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground mb-6">
                          Enter Your Score
                        </h2>

                        {/* Percentile Slider */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base">Your Percentile</Label>
                            <span className="text-2xl font-bold text-primary">
                              {percentile[0]}%
                            </span>
                          </div>
                          <Slider
                            value={percentile}
                            onValueChange={setPercentile}
                            min={50}
                            max={100}
                            step={0.1}
                            className="py-4"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="space-y-3">
                        <Label className="text-base">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Home District */}
                      <div className="space-y-3">
                        <Label className="text-base">Home District</Label>
                        <Select value={homeDistrict} onValueChange={setHomeDistrict}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                          <SelectContent>
                            {districts.map((district) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Preferences */}
                  {step === 2 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground mb-6">
                          Your Preferences
                        </h2>

                        {/* Branch Selection */}
                        <div className="space-y-3">
                          <Label className="text-base">
                            Preferred Branches (select multiple)
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {branches.map((branch) => (
                              <Badge
                                key={branch}
                                variant={
                                  selectedBranches.includes(branch)
                                    ? "default"
                                    : "outline"
                                }
                                className={`cursor-pointer py-1.5 px-3 ${
                                  selectedBranches.includes(branch)
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => toggleBranch(branch)}
                              >
                                {branch === "Computer Engineering"
                                  ? "CS/CE"
                                  : branch}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* City Preference */}
                      <div className="space-y-3">
                        <Label className="text-base">City Preference (optional)</Label>
                        <Select
                          value={cityPreference}
                          onValueChange={setCityPreference}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any city</SelectItem>
                            {["Mumbai", "Pune", "Nagpur", "Sangli", "Amravati"].map(
                              (city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Govt Only Toggle */}
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <Label className="text-base">
                            Government Colleges Only
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Show only government and aided colleges
                          </p>
                        </div>
                        <Switch checked={govtOnly} onCheckedChange={setGovtOnly} />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-foreground mb-6">
                        Review Your Details
                      </h2>

                      <div className="space-y-4">
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-muted-foreground">Percentile</span>
                          <span className="font-semibold text-foreground">
                            {percentile[0]}%
                          </span>
                        </div>
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-muted-foreground">Category</span>
                          <span className="font-semibold text-foreground">
                            {categories.find((c) => c.value === category)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-muted-foreground">Home District</span>
                          <span className="font-semibold text-foreground">
                            {homeDistrict || "Not specified"}
                          </span>
                        </div>
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-muted-foreground">
                            Preferred Branches
                          </span>
                          <span className="font-semibold text-foreground text-right max-w-[200px]">
                            {selectedBranches.length > 0
                              ? selectedBranches.join(", ")
                              : "All branches"}
                          </span>
                        </div>
                        <div className="flex justify-between py-3 border-b">
                          <span className="text-muted-foreground">
                            City Preference
                          </span>
                          <span className="font-semibold text-foreground">
                            {cityPreference === "any" ? "Any" : cityPreference}
                          </span>
                        </div>
                        <div className="flex justify-between py-3">
                          <span className="text-muted-foreground">College Type</span>
                          <span className="font-semibold text-foreground">
                            {govtOnly ? "Government Only" : "All Types"}
                          </span>
                        </div>
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
                    >
                      {step === 3 ? "Get Predictions" : "Next"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Results */
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Your College Predictions
                  </h2>
                  <p className="text-muted-foreground">
                    Based on {percentile[0]}%ile in{" "}
                    {categories.find((c) => c.value === category)?.label} category
                  </p>
                </div>
                <Button variant="outline" onClick={resetPredictor}>
                  Start Over
                </Button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  <span className="text-sm">Safe (&gt;75% chance)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Moderate (40-75%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-primary" />
                  <span className="text-sm">Reach (&lt;40%)</span>
                </div>
              </div>

              {predictions.length > 0 ? (
                <div className="space-y-4">
                  {predictions.slice(0, 15).map((result, index) => {
                    const statusColors = {
                      safe: {
                        bg: "bg-emerald-50 dark:bg-emerald-500/10",
                        border: "border-emerald-200 dark:border-emerald-500/30",
                        accent: "bg-emerald-500",
                        text: "text-emerald-600 dark:text-emerald-400",
                        badge: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
                        glow: "shadow-emerald-500/20",
                      },
                      moderate: {
                        bg: "bg-amber-50 dark:bg-amber-500/10",
                        border: "border-amber-200 dark:border-amber-500/30",
                        accent: "bg-amber-500",
                        text: "text-amber-600 dark:text-amber-400",
                        badge: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
                        glow: "shadow-amber-500/20",
                      },
                      reach: {
                        bg: "bg-blue-50 dark:bg-blue-500/10",
                        border: "border-blue-200 dark:border-blue-500/30",
                        accent: "bg-blue-500",
                        text: "text-blue-600 dark:text-blue-400",
                        badge: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
                        glow: "shadow-blue-500/20",
                      },
                    };
                    const colors = statusColors[result.status];

                    return (
                      <Card
                        key={`${result.college.id}-${result.branch}`}
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
                                      {result.college.name}
                                    </h3>
                                    <Badge className={`${colors.badge} border font-medium`}>
                                      {getStatusIcon(result.status)}
                                      <span className="ml-1.5">
                                        {result.status === "safe" ? "Safe Choice" : result.status === "moderate" ? "Moderate" : "Reach"}
                                      </span>
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1.5">
                                    {result.branch} • {result.college.city}
                                  </p>
                                  
                                  {/* Probability Progress Bar */}
                                  <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-muted-foreground">Admission Probability</span>
                                      <span className={`font-bold ${colors.text}`}>
                                        {result.probability}%
                                      </span>
                                    </div>
                                    <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${colors.accent} rounded-full transition-all duration-700 ease-out`}
                                        style={{ width: `${result.probability}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Cutoff Info */}
                                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                    <span>
                                      Last year cutoff:{" "}
                                      <span className="font-semibold text-foreground">
                                        {result.cutoff.toFixed(1)}%ile
                                      </span>
                                    </span>
                                    <span>•</span>
                                    <span>
                                      Your score:{" "}
                                      <span className="font-semibold text-foreground">
                                        {percentile[0]}%ile
                                      </span>
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Action Button */}
                                <div className="flex flex-col items-end justify-center">
                                  <Button
                                    asChild
                                    size="sm"
                                    className="whitespace-nowrap bg-foreground text-background hover:bg-foreground/90"
                                  >
                                    <Link
                                      href={`/mentors?college=${result.college.id}`}
                                    >
                                      <Users className="h-3.5 w-3.5 mr-1.5" />
                                      Find Mentor
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No colleges match your criteria. Try adjusting your preferences.
                    </p>
                    <Button variant="outline" onClick={handleBack} className="mt-4">
                      Modify Preferences
                    </Button>
                  </CardContent>
                </Card>
              )}

              {predictions.length > 15 && (
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Showing top 15 results. Adjust filters to see more options.
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
