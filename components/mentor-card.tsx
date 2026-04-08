"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageSquare, BadgeCheck, Sparkles,MessageCircle } from "lucide-react";

interface MentorCardProps {
  mentor: {
    id: string;
    name: string;
    firstName: string;
    college: string;
    branch: string;
    year: string;
    achievement: string;
    bio: string;
    rating: number;
    sessionCount: number;
    price: number;
    available: boolean;
    verified?: boolean;
  };
  onBook?: () => void;
  onViewProfile?: () => void;
}

export function MentorCard({ mentor, onBook, onViewProfile }: MentorCardProps) {
  const isVerified = mentor.verified !== false; // Default to verified

  return (
    <Card className="group relative overflow-hidden border border-white/20 bg-white/60 dark:bg-white/5 backdrop-blur-xl transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Subtle shine effect */}
      <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
      
      <CardContent className="relative p-6">
        {/* Verified badge - top right corner */}
        {isVerified && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm">
              <BadgeCheck className="h-3.5 w-3.5 text-primary fill-primary/20" />
              <span className="text-xs font-medium text-primary">Verified</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-white/50 shadow-lg ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-semibold text-xl">
                {mentor.firstName[0]}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            {mentor.available && (
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent border-2 border-white shadow-sm">
                <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground text-lg">{mentor.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {mentor.college} • {mentor.branch}
            </p>
            <p className="text-xs text-muted-foreground/70">{mentor.year}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-primary/15 to-primary/5 text-primary border border-primary/20 font-medium shadow-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            {mentor.achievement}
          </Badge>
        </div>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {mentor.bio}
        </p>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-amber-600 dark:text-amber-400">{mentor.rating}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{mentor.sessionCount} sessions</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button
            className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
            onClick={onBook}
            disabled={!mentor.available}
          >
            Book @ ₹{mentor.price}
          </Button>
          <Button 
            variant="outline" 
            onClick={onViewProfile}
            className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
