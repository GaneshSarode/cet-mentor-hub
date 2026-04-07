import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Video, MessageSquare, Star } from "lucide-react";
import Link from "next/link";

const upcomingBookings = [
  {
    id: 1,
    mentorName: "Arjun S.",
    college: "VJTI Mumbai",
    branch: "Computer Engineering",
    date: "Apr 7, 2026",
    time: "6:00 PM",
    topic: "Physics Numericals",
    status: "confirmed",
  },
  {
    id: 2,
    mentorName: "Priya M.",
    college: "ICT Mumbai",
    branch: "Chemical Engineering",
    date: "Apr 10, 2026",
    time: "4:00 PM",
    topic: "Organic Chemistry",
    status: "confirmed",
  },
];

const pastBookings = [
  {
    id: 3,
    mentorName: "Rahul D.",
    college: "COEP Pune",
    branch: "Mechanical Engineering",
    date: "Apr 2, 2026",
    time: "7:00 PM",
    topic: "JEE Strategy",
    status: "completed",
    rating: 5,
  },
  {
    id: 4,
    mentorName: "Sneha K.",
    college: "PICT Pune",
    branch: "IT",
    date: "Mar 28, 2026",
    time: "5:00 PM",
    topic: "Study Planning",
    status: "completed",
    rating: 4,
  },
];

export default function BookingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          My Bookings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your mentor sessions
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <Card key={booking.id} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {booking.mentorName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-lg">
                          {booking.mentorName}
                        </h3>
                        <Badge className="bg-accent/10 text-accent border-0">
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {booking.college} • {booking.branch}
                      </p>
                      <Badge className="mt-2 bg-primary/10 text-primary border-0">
                        {booking.topic}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="bg-primary hover:bg-primary/90">
                          <Video className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                        <Button variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No upcoming sessions</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/mentors">Book a mentor</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.map((booking) => (
            <Card key={booking.id} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-muted">
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-lg">
                      {booking.mentorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">
                      {booking.mentorName}
                    </h3>
                    <p className="text-muted-foreground">
                      {booking.college} • {booking.branch}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {booking.topic}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: booking.rating || 0 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <Button variant="outline">Book Again</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
