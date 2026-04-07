"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CollegeCard } from "@/components/college-card";
import { colleges, districts, branches, collegeTypes, naacGrades } from "@/lib/data";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function CollegesPage() {
  const [search, setSearch] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rating");

  const filteredColleges = useMemo(() => {
    let result = colleges.filter((college) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          college.name.toLowerCase().includes(searchLower) ||
          college.fullName.toLowerCase().includes(searchLower) ||
          college.city.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // District filter
      if (selectedDistricts.length > 0 && !selectedDistricts.includes(college.district)) {
        return false;
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(college.type)) {
        return false;
      }

      // Branch filter
      if (selectedBranches.length > 0) {
        const hasBranch = selectedBranches.some((branch) =>
          college.branches.includes(branch)
        );
        if (!hasBranch) return false;
      }

      // NAAC Grade filter
      if (selectedGrades.length > 0 && !selectedGrades.includes(college.naacGrade)) {
        return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "cutoff") {
        const aCutoff = Math.max(...Object.values(a.cutoffs).map((c) => c.open || 0));
        const bCutoff = Math.max(...Object.values(b.cutoffs).map((c) => c.open || 0));
        return bCutoff - aCutoff;
      }
      return 0;
    });

    return result;
  }, [search, selectedDistricts, selectedTypes, selectedBranches, selectedGrades, sortBy]);

  const toggleFilter = (
    value: string,
    selected: string[],
    setSelected: (val: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const clearFilters = () => {
    setSelectedDistricts([]);
    setSelectedTypes([]);
    setSelectedBranches([]);
    setSelectedGrades([]);
    setSearch("");
  };

  const activeFilterCount =
    selectedDistricts.length +
    selectedTypes.length +
    selectedBranches.length +
    selectedGrades.length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Districts */}
      <div>
        <h4 className="font-medium text-foreground mb-3">District</h4>
        <div className="space-y-2">
          {districts.slice(0, 8).map((district) => (
            <div key={district} className="flex items-center gap-2">
              <Checkbox
                id={`district-${district}`}
                checked={selectedDistricts.includes(district)}
                onCheckedChange={() =>
                  toggleFilter(district, selectedDistricts, setSelectedDistricts)
                }
              />
              <Label
                htmlFor={`district-${district}`}
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {district}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* College Type */}
      <div>
        <h4 className="font-medium text-foreground mb-3">College Type</h4>
        <div className="space-y-2">
          {collegeTypes.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={`type-${type}`}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
              />
              <Label
                htmlFor={`type-${type}`}
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Branches */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Branch</h4>
        <div className="space-y-2">
          {branches.slice(0, 6).map((branch) => (
            <div key={branch} className="flex items-center gap-2">
              <Checkbox
                id={`branch-${branch}`}
                checked={selectedBranches.includes(branch)}
                onCheckedChange={() =>
                  toggleFilter(branch, selectedBranches, setSelectedBranches)
                }
              />
              <Label
                htmlFor={`branch-${branch}`}
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {branch === "Computer Engineering" ? "CS/CE" : branch}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* NAAC Grade */}
      <div>
        <h4 className="font-medium text-foreground mb-3">NAAC Grade</h4>
        <div className="space-y-2">
          {naacGrades.slice(0, 4).map((grade) => (
            <div key={grade} className="flex items-center gap-2">
              <Checkbox
                id={`grade-${grade}`}
                checked={selectedGrades.includes(grade)}
                onCheckedChange={() => toggleFilter(grade, selectedGrades, setSelectedGrades)}
              />
              <Label
                htmlFor={`grade-${grade}`}
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {grade}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Explore Colleges
          </h1>
          <p className="mt-2 text-muted-foreground">
            Find the perfect engineering college in Maharashtra
          </p>
        </div>
      </section>

      {/* Search & Filters Bar */}
      <section className="sticky top-16 z-40 bg-background/80 backdrop-blur-lg border-b py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges, branches, cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 hidden sm:flex">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Sort by Rating</SelectItem>
                <SelectItem value="cutoff">Sort by Cutoff</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden relative">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedDistricts.map((d) => (
                <Badge key={d} variant="secondary" className="gap-1">
                  {d}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleFilter(d, selectedDistricts, setSelectedDistricts)}
                  />
                </Badge>
              ))}
              {selectedTypes.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleFilter(t, selectedTypes, setSelectedTypes)}
                  />
                </Badge>
              ))}
              {selectedBranches.map((b) => (
                <Badge key={b} variant="secondary" className="gap-1">
                  {b === "Computer Engineering" ? "CS/CE" : b}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleFilter(b, selectedBranches, setSelectedBranches)}
                  />
                </Badge>
              ))}
              {selectedGrades.map((g) => (
                <Badge key={g} variant="secondary" className="gap-1">
                  NAAC {g}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleFilter(g, selectedGrades, setSelectedGrades)}
                  />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                Clear all
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-36 bg-card border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Filters</h3>
                <FilterContent />
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredColleges.length} colleges
                </p>
              </div>

              {filteredColleges.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredColleges.map((college) => (
                    <CollegeCard key={college.id} college={college} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No colleges match your filters</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
