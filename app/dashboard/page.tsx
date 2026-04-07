import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  FileText,
  Bookmark,
  TrendingUp,
  Video,
  Clock,
  ArrowRight,
  Star,
} from "lucide-react";

// Sample user data (would come from auth/database in real app)
const userData = {
  name: "Rahul",
  upcomingSessions: 1,
  testsTaken: 12,
  collegesSaved: 5,
  percentileRank: 87,
};

const upcomingBooking = {
  mentorName: "Arjun S.",
  college: "VJTI Mumbai",
  date: "Tomorrow",
  time: "6:00 PM",
  topic: "Physics Numericals",
};

const recentTests = [
  { name: "Physics - Mechanics", score: 78, date: "2 days ago", total: 30 },
  { name: "Maths - Calculus", score: 65, date: "5 days ago", total: 30 },
  { name: "Chemistry - Organic", score: 82, date: "1 week ago", total: 25 },
];

const savedColleges = [
  { name: "VJTI Mumbai", branch: "CS", probability: 72 },
  { name: "COEP Pune", branch: "IT", probability: 85 },
  { name: "PICT Pune", branch: "CS", probability: 91 },
];

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Welcome back, {userData.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {userData.upcomingSessions}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tests Taken</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {userData.testsTaken}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Colleges Saved</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {userData.collegesSaved}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Bookmark className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Percentile</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {userData.percentileRank}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Session */}
        <Card className="border-border/50">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Upcoming Session</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/bookings">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingBooking ? (
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {upcomingBooking.mentorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {upcomingBooking.mentorName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {upcomingBooking.college}
                    </p>
                    <Badge className="mt-2 bg-primary/10 text-primary border-0">
                      {upcomingBooking.topic}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{upcomingBooking.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{upcomingBooking.time}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button className="flex-1 bg-primary hover:bg-primary/90">
                    <Video className="h-4 w-4 mr-2" />
                    Join Session
                  </Button>
                  <Button variant="outline">Reschedule</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming sessions</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/mentors">Book a mentor</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tests */}
        <Card className="border-border/50">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Recent Test Results</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/tests">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTests.map((test, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">{test.name}</p>
                  <p className="text-xs text-muted-foreground">{test.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {Math.round((test.score / test.total) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {test.score}/{test.total}
                  </p>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link href="/mock-tests">Take Another Test</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Saved Colleges */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Saved Colleges</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/saved">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              {savedColleges.map((college, index) => (
                <div
                  key={index}
                  className="p-4 bg-muted/50 rounded-xl space-y-3"
                >
                  <div>
                    <h3 className="font-semibold text-foreground">{college.name}</h3>
                    <p className="text-sm text-muted-foreground">{college.branch}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Your chances</span>
                      <span className="font-medium text-foreground">
                        {college.probability}%
                      </span>
                    </div>
                    <Progress value={college.probability} className="h-2" />
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Link href={`/mentors?college=${college.name.toLowerCase().replace(" ", "-")}`}>
                      Find Mentor
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
