import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getUserCredits } from "@/app/actions";
import { CREDIT_LIMITS } from "@/lib/credits";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Add cache control headers to allow browser caching
    // This helps reduce API calls for the same data
    const headers = new Headers();
    headers.append("Cache-Control", "private, max-age=300"); // 5 minutes

    // If user is logged in, get their credits from database
    if (userId) {
      const creditInfo = await getUserCredits(userId);
      return NextResponse.json(
        {
          credits: creditInfo.creditsRemaining,
          tier: creditInfo.tier,
          used: creditInfo.creditsUsed,
          isGuest: false,
          cached: false, // Flag to indicate this is fresh data
          timestamp: Date.now(),
        },
        { headers },
      );
    }

    // For guests, return a placeholder value
    // The actual tracking will happen client-side with localStorage
    return NextResponse.json(
      {
        credits: 5, // Default free tier value
        tier: "free",
        used: 0,
        isGuest: true,
        timestamp: Date.now(),
      },
      { headers },
    );
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 },
    );
  }
}
