import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          tier: "free",
          isSubscribed: false,
          maxGenerations: 5,
          maxUploads: 3,
          hasAdvancedStyles: false,
          hasHistoryAccess: false,
          error: userError?.message || "User not authenticated",
        },
        { status: 401 },
      );
    }

    // Add cache control headers to allow browser caching
    const headers = new Headers();
    headers.append("Cache-Control", "private, max-age=300"); // 5 minutes

    // First check the user's subscription_tier field directly
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

      return NextResponse.json(
        {
          tier,
          isSubscribed: tier !== "free",
          maxGenerations: tier === "pro" ? 100 : tier === "premium" ? 25 : 5,
          maxUploads: tier === "pro" ? 10 : tier === "premium" ? 5 : 3,
          hasAdvancedStyles: tier !== "free",
          hasHistoryAccess: tier !== "free",
        },
        { headers },
      );
    }

    // Then get user's subscription details
    let subscriptions = [];
    let subError = null;

    if (!userError2 && userData && userData.subscription) {
      // Get subscription details from subscriptions table using polar_id
      const { data: subData, error: subErr } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("polar_id", userData.subscription)
        .single();

      if (!subErr && subData) {
        subscriptions = [subData];

        // Determine tier based on subscription data
        const priceId = subData.polar_price_id;
        let tier = "premium"; // Default to premium if we have a subscription

        if (priceId && priceId.toLowerCase().includes("pro")) {
          tier = "pro";
        } else if (priceId && priceId.toLowerCase().includes("premium")) {
          tier = "premium";
        }

        console.log("Determined tier from subscription:", tier);

        // Update the user's subscription_tier in the database
        try {
          await supabase
            .from("users")
            .update({ subscription_tier: tier })
            .eq("id", user.id);
          console.log("Updated user's subscription_tier to:", tier);
        } catch (updateError) {
          console.error("Error updating subscription_tier:", updateError);
        }
      } else {
        subError = subErr;
      }
    } else {
      // Fallback to checking subscriptions table directly
      const { data: subs, error: subErr } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (!subErr && subs) {
        subscriptions = subs;
      } else {
        subError = subErr;
      }
    }

    if (subError) {
      console.error("Error fetching subscription:", subError);
      return NextResponse.json(
        {
          tier: "free",
          isSubscribed: false,
          maxGenerations: 5,
          maxUploads: 3,
          hasAdvancedStyles: false,
          hasHistoryAccess: false,
          error: subError.message,
        },
        { status: 500 },
      );
    }

    // Determine subscription tier
    if (subscriptions && subscriptions.length > 0) {
      const subscription = subscriptions[0];
      const priceId = subscription.polar_price_id;

      // Determine tier based on price ID
      let tier = "free";

      // Log the price ID for debugging
      console.log("Subscription price ID:", priceId);

      // Check if user has an active subscription at all
      if (subscription.status === "active") {
        // Default to premium if they have any active subscription
        tier = "premium";

        // Then check for specific tiers if price ID is available
        if (priceId) {
          if (priceId.toLowerCase().includes("pro")) {
            tier = "pro";
          } else if (priceId.toLowerCase().includes("premium")) {
            tier = "premium";
          }
        }

        // Update the user's subscription_tier in the database
        try {
          await supabase
            .from("users")
            .update({ subscription_tier: tier })
            .eq("id", user.id);
          console.log("Updated user's subscription_tier to:", tier);
        } catch (updateError) {
          console.error("Error updating subscription_tier:", updateError);
        }
      }

      // Return subscription details
      return NextResponse.json(
        {
          tier,
          isSubscribed: subscription.status === "active",
          maxGenerations: tier === "pro" ? 100 : tier === "premium" ? 25 : 5,
          maxUploads: tier === "pro" ? 10 : tier === "premium" ? 5 : 3,
          hasAdvancedStyles: tier !== "free",
          hasHistoryAccess: tier !== "free",
          subscription: subscription,
        },
        { headers },
      );
    } else {
      // No active subscription - free tier
      return NextResponse.json(
        {
          tier: "free",
          isSubscribed: false,
          maxGenerations: 5,
          maxUploads: 3,
          hasAdvancedStyles: false,
          hasHistoryAccess: false,
        },
        { headers },
      );
    }
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      {
        tier: "free",
        isSubscribed: false,
        maxGenerations: 5,
        maxUploads: 3,
        hasAdvancedStyles: false,
        hasHistoryAccess: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
