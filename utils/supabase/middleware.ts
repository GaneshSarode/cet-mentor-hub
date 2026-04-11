import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This helper is designed to wrap an existing response (so it works nicely with Clerk)
export const updateSession = (request: NextRequest, response: NextResponse) => {
  let supabaseResponse = response;

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          
          // Re-create the response to merge headers
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Set Clerk auth token headers alongside Supabase cookies
          response.headers.forEach((val, key) => {
            supabaseResponse.headers.set(key, val)
          })

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );
  
  // We don't await anything here because merely firing `supabase.auth.getUser()`
  // triggers the session update if necessary. Since we don't strictly require Supabase Auth,
  // we can omit the `getUser()` check to save latency, or just return the wrapped response.

  return supabaseResponse;
};
