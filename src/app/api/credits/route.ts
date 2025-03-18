import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getUserCredits } from "@/app/actions";
import { CREDIT_LIMITS } from "@/lib/credits";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            // This is a read-only operation in an API route
          },
          remove: (name: string, options: any) => {
            // This is a read-only operation in an API route
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
      console.log("API: User is logged in with ID:", userId);
      const creditInfo = await getUserCredits(userId);
      console.log(
        "API: Credit info for logged-in user:",
        creditInfo,
        "tier:",
        creditInfo.tier,
        "isGuest set to false",
      );
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
    console.log(
      "API: No user ID found, returning guest credits with isGuest=true",
    );
    return NextResponse.json(
      {
        credits: CREDIT_LIMITS.guest, // Default guest value
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
