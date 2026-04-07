import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Star,
  GraduationCap,
  Users,
  Trash2,
  ExternalLink,
} from "lucide-react";

const savedColleges = [
  {
    id: "vjti-mumbai",
    name: "VJTI Mumbai",
    fullName: "Veermata Jijabai Technological Institute",
    city: "Mumbai",
    type: "Government",
    naacGrade: "A++",
    branch: "Computer Engineering",
    cutoff: 99.8,
    yourPercentile: 98.5,
    probability: 35,
    rating: 4.8,
    mentorCount: 12,
  },
  {
    id: "coep-pune",
    name: "COEP Pune",
    fullName: "College of Engineering Pune",
    city: "Pune",
    type: "Government",
    naacGrade: "A++",
    branch: "IT",
    cutoff: 99.4,
    yourPercentile: 98.5,
    probability: 52,
    rating: 4.8,
    mentorCount: 8,
  },
  {
    id: "pict-pune",
    name: "PICT Pune",
    fullName: "Pune Institute of Computer Technology",
    city: "Pune",
    type: "Aided",
    naacGrade: "A+",
    branch: "Computer Engineering",
    cutoff: 99.2,
    yourPercentile: 98.5,
    probability: 68,
    rating: 4.7,
    mentorCount: 6,
  },
  {
    id: "spit-mumbai",
    name: "SPIT Mumbai",
    fullName: "Sardar Patel Institute of Technology",
    city: "Mumbai",
    type: "Aided",
    naacGrade: "A+",
    branch: "IT",
    cutoff: 98.6,
    yourPercentile: 98.5,
    probability: 85,
    rating: 4.6,
    mentorCount: 4,
  },
  {
    id: "djsce-mumbai",
    name: "DJSCE Mumbai",
    fullName: "Dwarkadas J. Sanghvi College of Engineering",
    city: "Mumbai",
    type: "Unaided",
    naacGrade: "A+",
    branch: "Computer Engineering",
    cutoff: 98.5,
    yourPercentile: 98.5,
    probability: 92,
    rating: 4.5,
    mentorCount: 5,
  },
];

export default function SavedCollegesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Saved Colleges
          </h1>
          <p className="text-muted-foreground mt-1">
            Your shortlisted colleges based on predictor results
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/predict">Update Predictions</Link>
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="border-primary/20 bg-primary/5 mb-6">
        <CardContent className="p-4">
          <p className="text-sm text-foreground">
            <span className="font-medium">Your percentile:</span> 98.5% |{" "}
            <span className="font-medium">Category:</span> Open |{" "}
            <span className="font-medium">Home District:</span> Mumbai
          </p>
        </CardContent>
      </Card>

      {/* College List */}
      <div className="space-y-4">
        {savedColleges.map((college) => (
          <Card key={college.id} className="border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-stretch">
                {/* Probability Bar */}
                <div
                  className={`w-2 ${
                    college.probability >= 75
                      ? "bg-accent"
                      : college.probability >= 40
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                />
                <div className="flex-1 p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-lg">
                          {college.name}
                        </h3>
                        <Badge
                          className={`${
                            college.naacGrade === "A++"
                              ? "bg-accent/10 text-accent"
                              : "bg-primary/10 text-primary"
                          } border-0`}
                        >
                          NAAC {college.naacGrade}
                        </Badge>
                        <Badge variant="secondary">{college.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {college.fullName}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {college.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {college.branch}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {college.rating}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="text-center min-w-[100px]">
                        <p className="text-3xl font-bold text-foreground">
                          {college.probability}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          chance of admission
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Cutoff: {college.cutoff}%
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                          <Link href={`/mentors?college=${college.id}`}>
                            <Users className="h-4 w-4 mr-1.5" />
                            {college.mentorCount} Mentors
                          </Link>
                        </Button>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/colleges/${college.id}`}>
                              <ExternalLink className="h-4 w-4 mr-1.5" />
                              Details
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {savedColleges.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No saved colleges yet</p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/predict">Use College Predictor</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
