import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import { getTierAPIValues } from "@/lib/config";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if we should force a refresh
    const forceRefresh =
      request.nextUrl.searchParams.get("forceRefresh") === "true";

    // Add cache control headers to allow browser caching
    const headers = new Headers();
    if (!forceRefresh) {
      headers.append("Cache-Control", "private, max-age=300"); // 5 minutes
    } else {
      headers.append("Cache-Control", "no-cache, no-store, must-revalidate");
      headers.append("Pragma", "no-cache");
      headers.append("Expires", "0");
    }

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // GUEST USER: Not logged in - return guest tier with limited features
    if (userError || !user) {
      console.log("Guest user detected (not logged in)");
      return NextResponse.json(getTierAPIValues("free", true), { headers });
    }

    // LOGGED IN USER: Check subscription tier
    console.log("Logged in user detected, checking subscription tier");

    // First check the user's subscription_tier field directly (most reliable source)
    const { data: userData, error: userError2 } = await supabase
      .from("users")
      .select("subscription, subscription_tier, id")
      .eq("id", user.id)
      .single();

    console.log("User data from API:", userData);

    // If user has a subscription_tier field set, use that directly
    if (!userError2 && userData && userData.subscription_tier) {
      const tier = userData.subscription_tier;
      console.log("Using subscription_tier from user data:", tier);

      // Return appropriate features based on tier using centralized config
      return NextResponse.json(getTierAPIValues(tier), { headers });
    }

    // If no tier is set, check subscription status and determine tier
    let tier = "free"; // Default to free tier for logged-in users
    let isActive = false;

    // Check if user has an active subscription
    if (userData?.subscription) {
      // Get subscription details from subscriptions table using polar_id
      const { data: subData, error: subErr } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("polar_id", userData.subscription)
        .single();

      if (!subErr && subData && subData.status === "active") {
        isActive = true;
        // Determine tier based on price ID
        const priceId = subData.polar_price_id;

        if (priceId && priceId.toLowerCase().includes("pro")) {
          tier = "pro";
        } else if (priceId && priceId.toLowerCase().includes("premium")) {
          tier = "premium";
        } else {
          tier = "premium"; // Default to premium if active but unknown tier
        }

        console.log("Determined tier from subscription:", tier);
      }
    } else {
      // Fallback to checking subscriptions table directly
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (subs && subs.length > 0) {
        isActive = true;
        const priceId = subs[0].polar_price_id;

        if (priceId && priceId.toLowerCase().includes("pro")) {
          tier = "pro";
        } else if (priceId && priceId.toLowerCase().includes("premium")) {
          tier = "premium";
        } else {
          tier = "premium"; // Default to premium if active but unknown tier
        }
      }
    }

    // Update the user's subscription_tier in the database for future reference
    if (userData) {
      try {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            subscription_tier: tier,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating subscription_tier:", updateError);
        } else {
          console.log("Updated user's subscription_tier to:", tier);
        }
      } catch (updateError) {
        console.error("Exception updating subscription_tier:", updateError);
      }
    }

    // Return appropriate features based on tier using centralized config
    const tierValues = getTierAPIValues(tier);
    return NextResponse.json(
      {
        ...tierValues,
        isSubscribed: isActive, // Override with actual subscription status
      },
      { headers },
    );
  } catch (error) {
    console.error("Error checking subscription status:", error);
    // Use centralized config for error fallback
    return NextResponse.json(
      {
        ...getTierAPIValues("free", true),
        error: error.message,
      },
      { status: 500 },
    );
  }
}
