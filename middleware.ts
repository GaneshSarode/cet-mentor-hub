import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export default clerkMiddleware(async (auth, req) => {
  // Generate the standard Next response and pass it through the Supabase session updater
  const res = NextResponse.next();
  return updateSession(req, res);
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
