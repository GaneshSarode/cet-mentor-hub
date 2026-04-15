"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MentorCard } from "@/components/mentor-card";
import { mentors, colleges, branches } from "@/lib/data";
import {
  Search,
  SlidersHorizontal,
  Star,
  MessageSquare,
  CheckCircle,
  MessageCircle,
} from "lucide-react";

export default function MentorsPage() {
  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [selectedMentor, setSelectedMentor] = useState<(typeof mentors)[0] | null>(
    null
  );
  const [showBookingModal, setShowBookingModal] = useState(false);
  const router = useRouter();

  const handleJoinWhatsApp = (whatsappLink: string) => {
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  };

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          mentor.name.toLowerCase().includes(searchLower) ||
          mentor.college.toLowerCase().includes(searchLower) ||
          mentor.branch.toLowerCase().includes(searchLower) ||
          mentor.bio.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // College filter
      if (collegeFilter !== "all" && mentor.collegeId !== collegeFilter) {
        return false;
      }

      // Branch filter
      if (branchFilter !== "all" && mentor.branch !== branchFilter) {
        return false;
      }

      // Year filter
      if (yearFilter !== "all" && !mentor.year.includes(yearFilter)) {
        return false;
      }

      return true;
    });
  }, [search, collegeFilter, branchFilter, yearFilter]);

  const handleViewProfile = (mentor: (typeof mentors)[0]) => {
    setSelectedMentor(mentor);
  };

  const handleBook = (mentor: (typeof mentors)[0]) => {
    setSelectedMentor(mentor);
    setShowBookingModal(true);
  };

  const clearFilters = () => {
    setSearch("");
    setCollegeFilter("all");
    setBranchFilter("all");
    setYearFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Find a Mentor
          </h1>
          <p className="mt-2 text-muted-foreground">
            Book 1:1 sessions with verified students from top colleges
          </p>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-16 z-40 bg-background/80 backdrop-blur-lg border-b py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-3">
              <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="College" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.slice(0, 7).map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.slice(0, 6).map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch === "Computer Engineering" ? "CS/CE" : branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2nd">2nd Year</SelectItem>
                  <SelectItem value="3rd">3rd Year</SelectItem>
                  <SelectItem value="4th">4th Year</SelectItem>
                </SelectContent>
              </Select>

              {(collegeFilter !== "all" || branchFilter !== "all" || yearFilter !== "all") && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[60vh]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">College</label>
                    <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Colleges" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Colleges</SelectItem>
                        {colleges.slice(0, 7).map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            {college.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Branch</label>
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Branches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.slice(0, 6).map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Year</label>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="2nd">2nd Year</SelectItem>
                        <SelectItem value="3rd">3rd Year</SelectItem>
                        <SelectItem value="4th">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredMentors.length} mentor{filteredMentors.length !== 1 ? "s" : ""}{" "}
              available
            </p>
            <Badge className="bg-accent/10 text-accent border-0">
              Free Sessions
            </Badge>
          </div>

          {filteredMentors.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  onBook={() => handleBook(mentor)}
                  onViewProfile={() => handleViewProfile(mentor)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No mentors match your filters</p>
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Mentor Profile Modal */}
      <Dialog
        open={!!selectedMentor && !showBookingModal}
        onOpenChange={(open) => !open && setSelectedMentor(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedMentor && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                      {selectedMentor.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedMentor.name}
                    </DialogTitle>
                    <p className="text-muted-foreground">
                      {selectedMentor.college} • {selectedMentor.branch}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMentor.year}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <Badge className="bg-primary/10 text-primary border-0">
                  {selectedMentor.achievement}
                </Badge>

                <div className="flex items-center gap-6 text-sm">
                  {selectedMentor.rating ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{selectedMentor.rating}</span>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="text-xs">New Mentor</Badge>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{selectedMentor.sessionCount} sessions</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">About</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedMentor.fullBio}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Topics Covered
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.topics.map((topic) => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <SignedIn>
                  <Button
                    className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white h-12"
                    onClick={() => handleJoinWhatsApp(selectedMentor.whatsappLink!)}
                    disabled={!selectedMentor.available}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Join WhatsApp Group — Free
                  </Button>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal" fallbackRedirectUrl="/mentors">
                    <Button
                      className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white h-12"
                      disabled={!selectedMentor.available}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Join WhatsApp Group — Free
                    </Button>
                  </SignInButton>
                </SignedOut>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Modal — WhatsApp redirect */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-md">
          {selectedMentor && (
            <>
              <DialogHeader>
                <DialogTitle>Connect with {selectedMentor.firstName}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-12 w-12 border border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedMentor.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedMentor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMentor.college} • {selectedMentor.branch}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Join our WhatsApp Group
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Get free guidance on CET strategy, college selection, CAP rounds, and more. Ask your doubts directly!
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-muted-foreground">Session Fee</span>
                    <span className="font-medium text-accent">FREE</span>
                  </div>
                </div>

                <SignedIn>
                  <Button
                    className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white h-12"
                    onClick={() => handleJoinWhatsApp(selectedMentor.whatsappLink!)}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Join WhatsApp Group
                  </Button>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal" fallbackRedirectUrl="/mentors">
                    <Button
                      className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white h-12"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Join WhatsApp Group
                    </Button>
                  </SignInButton>
                </SignedOut>

                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-accent" />
                    <span>100% Free</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-accent" />
                    <span>Real VJTI Student</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-accent" />
                    <span>No Spam</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
