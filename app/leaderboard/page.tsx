"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  Medal,
  Crown,
  Target,
  Flame,
  TrendingUp,
  Users,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  totalScore: number;
  totalMaxMarks: number;
  testsTaken: number;
  bestScore: number;
  bestMaxMarks: number;
  accuracy: number;
  papersAttempted: number;
}

export default function LeaderboardPage() {
  const { user, isSignedIn } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/pyq/leaderboard");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      } catch {
        // silently handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-amber-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-slate-300" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-500/30";
      case 2:
        return "bg-gradient-to-br from-slate-400/20 to-slate-300/10 border-slate-400/30";
      case 3:
        return "bg-gradient-to-br from-amber-700/20 to-orange-600/10 border-amber-700/30";
      default:
        return "bg-card/50 border-border/50";
    }
  };

  const getDisplayName = (entry: LeaderboardEntry) => {
    // Show the user's first name initial + masked name
    const id = entry.user_id;
    return `Student #${id.slice(-4).toUpperCase()}`;
  };

  const getInitials = (entry: LeaderboardEntry) => {
    return entry.user_id.slice(-2).toUpperCase();
  };

  const currentUserRank = isSignedIn
    ? leaderboard.find((e) => e.user_id === user?.id)
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#0f172a] pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-amber-500/20 text-amber-400 border-0 mb-6 py-1.5 px-4">
              <Trophy className="h-3.5 w-3.5 mr-1.5" />
              Compete & Improve
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight text-balance">
              PYQ Test{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                Leaderboard
              </span>
            </h1>

            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              See how you stack up against other MHTCET aspirants. Your best
              score per paper counts towards your total ranking.
            </p>

            {/* Quick Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-full">
                <Users className="h-4 w-4" />
                <span>{leaderboard.length} Students Ranked</span>
              </div>
              <div className="flex items-center gap-2 bg-violet-500/10 text-violet-400 px-4 py-2 rounded-full">
                <Flame className="h-4 w-4" />
                <span>Best Score Per Paper</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full text-background"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

      {/* Current User Rank Banner */}
      {currentUserRank && (
        <section className="py-4 border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  #{currentUserRank.rank}
                </div>
                <div>
                  <p className="font-semibold text-foreground">Your Ranking</p>
                  <p className="text-sm text-muted-foreground">
                    {currentUserRank.papersAttempted} papers •{" "}
                    {currentUserRank.accuracy}% accuracy
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {currentUserRank.totalScore}
                </p>
                <p className="text-xs text-muted-foreground">
                  / {currentUserRank.totalMaxMarks} total
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Podium — Top 3 */}
      {!isLoading && leaderboard.length >= 3 && (
        <section className="py-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-center gap-4 sm:gap-6">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 max-w-[200px]"
              >
                <div className="text-center mb-3">
                  <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {getInitials(leaderboard[1])}
                  </div>
                  <p className="mt-2 font-semibold text-foreground text-sm truncate">
                    {getDisplayName(leaderboard[1])}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {leaderboard[1].accuracy}% accuracy
                  </p>
                </div>
                <div className="bg-gradient-to-t from-slate-300/30 to-slate-200/10 border border-slate-300/30 rounded-t-xl h-28 flex items-center justify-center">
                  <div className="text-center">
                    <Medal className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-foreground">
                      {leaderboard[1].totalScore}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {leaderboard[1].papersAttempted} papers
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 max-w-[220px]"
              >
                <div className="text-center mb-3">
                  <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-500/30 ring-4 ring-amber-400/20">
                    {getInitials(leaderboard[0])}
                  </div>
                  <p className="mt-2 font-bold text-foreground truncate">
                    {getDisplayName(leaderboard[0])}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {leaderboard[0].accuracy}% accuracy
                  </p>
                </div>
                <div className="bg-gradient-to-t from-amber-400/30 to-yellow-300/10 border border-amber-400/30 rounded-t-xl h-36 flex items-center justify-center">
                  <div className="text-center">
                    <Crown className="h-8 w-8 text-amber-400 mx-auto mb-1" />
                    <p className="text-3xl font-bold text-foreground">
                      {leaderboard[0].totalScore}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {leaderboard[0].papersAttempted} papers
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 max-w-[200px]"
              >
                <div className="text-center mb-3">
                  <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {getInitials(leaderboard[2])}
                  </div>
                  <p className="mt-2 font-semibold text-foreground text-sm truncate">
                    {getDisplayName(leaderboard[2])}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {leaderboard[2].accuracy}% accuracy
                  </p>
                </div>
                <div className="bg-gradient-to-t from-amber-700/30 to-orange-600/10 border border-amber-700/30 rounded-t-xl h-20 flex items-center justify-center">
                  <div className="text-center">
                    <Medal className="h-6 w-6 text-amber-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-foreground">
                      {leaderboard[2].totalScore}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {leaderboard[2].papersAttempted} papers
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Full Rankings Table */}
      <section className="py-8 flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Full Rankings
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                No rankings yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to take a PYQ test and claim the #1 spot!
              </p>
              <Link
                href="/papers"
                className="inline-flex items-center gap-2 mt-4 text-primary text-sm font-medium hover:underline"
              >
                <Sparkles className="h-4 w-4" />
                Start a Test
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, idx) => {
                const isCurrentUser =
                  isSignedIn && entry.user_id === user?.id;

                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <div
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${getRankBg(entry.rank)} ${isCurrentUser ? "ring-2 ring-primary/50 shadow-lg shadow-primary/10" : "hover:border-primary/20"}`}
                    >
                      {/* Rank */}
                      <div className="w-10 text-center shrink-0">
                        {getRankIcon(entry.rank) || (
                          <span className="text-lg font-bold text-muted-foreground">
                            {entry.rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar + Name */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          {isCurrentUser
                            ? (user?.firstName?.[0] || "Y").toUpperCase()
                            : getInitials(entry)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {isCurrentUser
                              ? `${user?.firstName || "You"} (You)`
                              : getDisplayName(entry)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.papersAttempted} paper
                            {entry.papersAttempted !== 1 ? "s" : ""} •{" "}
                            {entry.testsTaken} attempt
                            {entry.testsTaken !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">
                            Accuracy
                          </p>
                          <p className="font-semibold text-foreground">
                            {entry.accuracy}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Best</p>
                          <p className="font-semibold text-foreground">
                            {entry.bestScore}/{entry.bestMaxMarks}
                          </p>
                        </div>
                      </div>

                      {/* Total Score */}
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-foreground">
                          {entry.totalScore}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          / {entry.totalMaxMarks}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
