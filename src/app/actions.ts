"use server";

import { api } from "@/lib/polar";
import { createClient } from "../../supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Polar } from "@polar-sh/sdk";
import { CREDIT_LIMITS, getCurrentMonth } from "@/lib/credits";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  console.log("After signUp", error);

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      // Use service role client to bypass RLS policies for initial user creation
      const adminClient = await createClient();

      const { error: updateError } = await adminClient.from("users").insert({
        name: fullName,
        full_name: fullName,
        email: email,
        user_id: user.id,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
        subscription: null, // Initialize subscription as null
      });

      if (updateError) {
        console.error("Error updating user profile:", updateError);
        // Continue with sign-up process even if profile update fails
        // The user can update their profile later
      }
    } catch (err) {
      console.error("Error in user profile creation:", err);
      // Continue with sign-up process even if profile creation fails
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Clear client-side caches by setting a cookie that the client can detect
  cookies().set("credit_cache_bust", Date.now().toString(), {
    maxAge: 5, // Short-lived cookie just to trigger client refresh
    path: "/",
  });

  // Force a full page reload to clear any client-side state
  // by adding a cache-busting parameter to the URL
  const timestamp = Date.now();
  return redirect(`/?reload=${timestamp}`);
};

export const checkoutSessionAction = async ({
  productPriceId,
  successUrl,
  customerEmail,
  metadata,
}: {
  productPriceId: string;
  successUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) => {
  const result = await api.checkouts.create({
    productPriceId,
    successUrl,
    customerEmail,
    metadata,
  });

  return result;
};

export const checkUserSubscription = async (userId: string) => {
  const supabase = await createClient();

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }

  return subscriptions && subscriptions.length > 0;
};

export const manageSubscriptionAction = async (userId: string) => {
  const supabase = await createClient();

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log("No active subscription found for user", userId);
    return false;
  }

  const subscription = subscriptions[0];

  const polar = new Polar({
    server: "sandbox",
    accessToken: process.env.POLAR_ACCESS_TOKEN,
  });

  try {
    const result = await polar.customerSessions.create({
      customerId: subscription.customer_id,
    });

    // Only return the URL to avoid Convex type issues
    return { url: result.customerPortalUrl };
  } catch (error) {
    console.error("Error managing subscription:", error);
    return { error: "Error managing subscription" };
  }
};

// Function to get user credits from Supabase
export const getUserCredits = async (userId: string) => {
  try {
    const supabase = await createClient();

    // Get user subscription status
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        "subscription_tier, credits_used, credits_reset_date, subscription",
      )
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      throw userError;
    }

    // If no user data or missing fields, return default values
    if (!userData) {
      console.log(
        "No user data found for ID:",
        userId,
        "returning default free tier",
      );
      return {
        creditsRemaining: CREDIT_LIMITS.free,
        creditsUsed: 0,
        tier: "free",
      };
    }

    console.log("User data from getUserCredits:", userData);

    const currentMonth = getCurrentMonth();
    const resetDate = userData.credits_reset_date || "";

    // Determine tier from subscription_tier or derive it from subscription field
    let tier = "free";
    if (userData.subscription_tier) {
      tier = userData.subscription_tier;
      console.log("Using existing subscription_tier:", tier);
    } else if (userData.subscription) {
      console.log(
        "No subscription_tier found, checking subscription field:",
        userData.subscription,
      );
      // If subscription exists but no tier, check subscription details
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("polar_id", userData.subscription)
        .single();

      if (!subError && subData && subData.status === "active") {
        // Determine tier based on price ID
        const priceId = subData.polar_price_id;
        console.log("Subscription price ID from getUserCredits:", priceId);

        if (priceId && priceId.toLowerCase().includes("pro")) {
          tier = "pro";
        } else if (priceId && priceId.toLowerCase().includes("premium")) {
          tier = "premium";
        } else {
          // Default to premium if they have any active subscription
          tier = "premium";
        }

        console.log(
          "Determined tier from subscription in getUserCredits:",
          tier,
        );
      } else {
        // Fallback to checking if subscription string contains tier info
        if (userData.subscription.includes("premium")) {
          tier = "premium";
        } else if (userData.subscription.includes("pro")) {
          tier = "pro";
        }
      }

      // Update the user record with the derived tier
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_tier: tier,
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating subscription_tier:", updateError);
      } else {
        console.log("Updated user's subscription_tier to:", tier);
      }
    }

    // If it's a new month, reset credits
    if (resetDate !== currentMonth) {
      const { error: resetError } = await supabase
        .from("users")
        .update({
          credits_used: 0,
          credits_reset_date: currentMonth,
        })
        .eq("id", userId);

      if (resetError) {
        console.error("Error resetting credits:", resetError);
      }

      return {
        creditsRemaining: CREDIT_LIMITS[tier as keyof typeof CREDIT_LIMITS],
        creditsUsed: 0,
        tier,
      };
    }

    // Calculate remaining credits
    const creditsUsed = userData.credits_used || 0;
    const totalCredits = CREDIT_LIMITS[tier as keyof typeof CREDIT_LIMITS];
    const creditsRemaining = Math.max(0, totalCredits - creditsUsed);

    return { creditsRemaining, creditsUsed, tier };
  } catch (error) {
    console.error("Error getting user credits:", error);
    return {
      creditsRemaining: CREDIT_LIMITS.free,
      creditsUsed: 0,
      tier: "free",
    };
  }
};

// Function to use a credit (decrement from user's available credits)
export const useUserCredit = async (userId: string) => {
  try {
    const supabase = await createClient();

    // Get current user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("subscription_tier, credits_used, credits_reset_date")
      .eq("id", userId)
      .single();

    if (userError) throw userError;
    if (!userData) return false;

    const currentMonth = getCurrentMonth();
    const resetDate = userData.credits_reset_date || "";
    const tier = userData.subscription_tier || "free";

    // If it's a new month, reset credits
    if (resetDate !== currentMonth) {
      await supabase
        .from("users")
        .update({
          credits_used: 1,
          credits_reset_date: currentMonth,
        })
        .eq("id", userId);

      return true;
    }

    // Check if user has credits left
    const creditsUsed = userData.credits_used || 0;
    const totalCredits = CREDIT_LIMITS[tier as keyof typeof CREDIT_LIMITS];

    if (creditsUsed >= totalCredits) return false;

    // Increment credits used
    await supabase
      .from("users")
      .update({
        credits_used: creditsUsed + 1,
      })
      .eq("id", userId);

    return true;
  } catch (error) {
    console.error("Error using user credit:", error);
    return false;
  }
};

// Server action to check and use credits
export const checkAndUseCredit = async (userId?: string) => {
  // For registered users
  if (userId) {
    return await useUserCredit(userId);
  }

  // For guests, we'll return true and let the client handle it
  return true;
};

// Server action to get remaining credits
export const getRemainingCreditsAction = async (userId?: string) => {
  // For registered users
  if (userId) {
    console.log(
      "getRemainingCreditsAction: Getting credits for user ID:",
      userId,
    );
    const { creditsRemaining, tier } = await getUserCredits(userId);
    console.log(
      "getRemainingCreditsAction: Retrieved credits:",
      creditsRemaining,
      "tier:",
      tier,
    );
    return { credits: creditsRemaining, tier, isGuest: false };
  }

  // For guests, we'll return the default guest tier value
  // The actual tracking will happen client-side
  console.log(
    "getRemainingCreditsAction: No user ID provided, returning guest credits",
  );
  return { credits: CREDIT_LIMITS.guest, tier: "free", isGuest: true };
};
