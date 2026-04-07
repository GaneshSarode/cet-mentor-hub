"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { colleges, mentors, categories } from "@/lib/data";
import {
  MapPin,
  Star,
  Calendar,
  Building2,
  ArrowLeft,
  Users,
  ExternalLink,
} from "lucide-react";

export default function CollegeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const college = colleges.find((c) => c.id === resolvedParams.slug);

  if (!college) {
    notFound();
  }

  const collegeMentors = mentors.filter((m) => m.collegeId === college.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-[#0f172a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/colleges"
            className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Colleges
          </Link>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold">
              {college.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {college.name}
                </h1>
                <Badge className="bg-accent/20 text-accent border-0">
                  NAAC {college.naacGrade}
                </Badge>
              </div>
              <p className="text-slate-300 text-lg">{college.fullName}</p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{college.city}, Maharashtra</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  <span>{college.type}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Est. {college.established}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-white">{college.rating}</span>
                  <span>({college.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href={`/mentors?college=${college.id}`}>
                  <Users className="h-4 w-4 mr-2" />
                  Find Mentors
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cutoffs">Cutoffs</TabsTrigger>
              <TabsTrigger value="branches">Branches</TabsTrigger>
              <TabsTrigger value="mentors">Mentors</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Branches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">
                      {college.branches.length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Available Mentors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">
                      {collegeMentors.length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Highest Cutoff
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">
                      {Math.max(
                        ...Object.values(college.cutoffs).map((c) => c.open || 0)
                      ).toFixed(1)}
                      %
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>About {college.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  <p>
                    {college.fullName} is one of the premier engineering institutions in
                    Maharashtra, established in {college.established}. Located in{" "}
                    {college.city}, it is known for its excellent academic programs and
                    distinguished faculty.
                  </p>
                  <p className="mt-4">
                    The college offers {college.branches.length} undergraduate programs
                    across various engineering disciplines. With a NAAC grade of{" "}
                    {college.naacGrade}, it maintains high academic standards and provides
                    excellent placement opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Available Branches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {college.branches.map((branch) => (
                      <Badge
                        key={branch}
                        variant="secondary"
                        className="text-sm py-1.5 px-3"
                      >
                        {branch}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cutoffs">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Cutoff Percentiles (2024)</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Minimum percentile required for admission in different categories
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-foreground">
                            Branch
                          </th>
                          {categories.slice(0, 4).map((cat) => (
                            <th
                              key={cat.value}
                              className="text-center py-3 px-4 font-medium text-foreground"
                            >
                              {cat.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(college.cutoffs).map(([branch, cutoffs]) => (
                          <tr key={branch} className="border-b last:border-0">
                            <td className="py-3 px-4 font-medium text-foreground">
                              {branch}
                            </td>
                            <td className="py-3 px-4 text-center text-muted-foreground">
                              {cutoffs.open?.toFixed(1) || "-"}
                            </td>
                            <td className="py-3 px-4 text-center text-muted-foreground">
                              {cutoffs.obc?.toFixed(1) || "-"}
                            </td>
                            <td className="py-3 px-4 text-center text-muted-foreground">
                              {cutoffs.sc?.toFixed(1) || "-"}
                            </td>
                            <td className="py-3 px-4 text-center text-muted-foreground">
                              {cutoffs.st?.toFixed(1) || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branches">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {college.branches.map((branch) => {
                  const branchCutoff = college.cutoffs[branch];
                  return (
                    <Card key={branch} className="border-border/50">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground">{branch}</h3>
                        {branchCutoff && (
                          <div className="mt-3 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Open Cutoff:</span>
                              <span className="font-medium text-foreground">
                                {branchCutoff.open?.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">OBC Cutoff:</span>
                              <span className="font-medium text-foreground">
                                {branchCutoff.obc?.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full mt-4"
                        >
                          <Link href={`/mentors?college=${college.id}&branch=${branch}`}>
                            Find {branch} Mentors
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="mentors">
              {collegeMentors.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collegeMentors.map((mentor) => (
                    <Card key={mentor.id} className="border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {mentor.firstName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {mentor.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {mentor.branch} • {mentor.year}
                            </p>
                          </div>
                        </div>
                        <Badge className="mt-3 bg-primary/10 text-primary border-0">
                          {mentor.achievement}
                        </Badge>
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {mentor.bio}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{mentor.rating}</span>
                          <span className="text-muted-foreground">
                            • {mentor.sessionCount} sessions
                          </span>
                        </div>
                        <Button
                          asChild
                          className="w-full mt-4 bg-primary hover:bg-primary/90"
                        >
                          <Link href={`/mentors?id=${mentor.id}`}>
                            Book @ ₹{mentor.price}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No mentors available from this college yet.
                    </p>
                    <Button asChild variant="link" className="mt-2">
                      <Link href="/mentors">Browse all mentors</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
