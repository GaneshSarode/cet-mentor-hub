"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, GraduationCap } from "lucide-react";

interface CollegeCardProps {
  college: {
    id: string;
    name: string;
    fullName: string;
    city: string;
    type: string;
    naacGrade: string;
    branches: string[];
    cutoffs: Record<string, Record<string, number>>;
    rating: number;
    reviewCount: number;
  };
}

export function CollegeCard({ college }: CollegeCardProps) {
  const lowestCutoff = Math.min(
    ...Object.values(college.cutoffs).map((c) => c.open || 100)
  );
  const highestCutoff = Math.max(
    ...Object.values(college.cutoffs).map((c) => c.open || 0)
  );

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {college.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{college.city}</span>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`shrink-0 ${
              college.naacGrade === "A++"
                ? "bg-accent/10 text-accent"
                : college.naacGrade === "A+"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            NAAC {college.naacGrade}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {college.branches.slice(0, 4).map((branch) => (
            <Badge
              key={branch}
              variant="outline"
              className="text-xs font-normal bg-background"
            >
              {branch === "Computer Engineering" ? "CS" : branch === "Mechanical" ? "Mech" : branch}
            </Badge>
          ))}
          {college.branches.length > 4 && (
            <Badge variant="outline" className="text-xs font-normal bg-background">
              +{college.branches.length - 4}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Cutoff: </span>
            <span className="font-semibold text-foreground">
              {lowestCutoff.toFixed(1)} - {highestCutoff.toFixed(1)}%ile
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-sm">{college.rating}</span>
            <span className="text-xs text-muted-foreground">({college.reviewCount})</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/colleges/${college.id}`}>View Details</Link>
          </Button>
          <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
            <Link href={`/mentors?college=${college.id}`}>Find Mentor</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
