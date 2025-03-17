"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "../../supabase/client";

type SubscriptionTier = "free" | "premium" | "pro";

type SubscriptionContextType = {
  tier: SubscriptionTier;
  isLoading: boolean;
  isSubscribed: boolean;
  maxGenerations: number;
  maxUploads: number;
  hasAdvancedStyles: boolean;
  hasHistoryAccess: boolean;
  refreshSubscription: () => Promise<void>;
};

const defaultContext: SubscriptionContextType = {
  tier: "free",
  isLoading: true,
  isSubscribed: false,
  maxGenerations: 5,
  maxUploads: 3,
  hasAdvancedStyles: false,
  hasHistoryAccess: false,
  refreshSubscription: async () => {},
};

const SubscriptionContext =
  createContext<SubscriptionContextType>(defaultContext);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    console.error("useSubscription must be used within a SubscriptionProvider");
    return defaultContext;
  }
  return context;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionContextType>(defaultContext);

  const refreshSubscription = async () => {
    setSubscriptionData((prev) => ({ ...prev, isLoading: true }));

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSubscriptionData({
          ...defaultContext,
          isLoading: false,
          refreshSubscription,
        });
        return;
      }

      // First check the user's subscription field directly
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("subscription")
        .eq("user_id", user.id)
        .single();

      // If user has a subscription field set, they have an active subscription
      if (!userError && userData && userData.subscription) {
        // Get subscription details from subscriptions table
        const { data: subData, error: subError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("polar_id", userData.subscription)
          .single();

        if (!subError && subData && subData.status === "active") {
          // Determine tier based on price ID or other subscription data
          let tier: SubscriptionTier = "premium"; // Default to premium if we have a subscription

          // Example logic - adjust based on your actual price IDs
          const priceId = subData.polar_price_id;
          if (priceId && priceId.toLowerCase().includes("pro")) {
            tier = "pro";
          } else if (priceId && priceId.toLowerCase().includes("premium")) {
            tier = "premium";
          }

          setSubscriptionData({
            tier,
            isLoading: false,
            isSubscribed: true,
            maxGenerations: tier === "pro" ? 100 : 25,
            maxUploads: tier === "pro" ? 10 : 5,
            hasAdvancedStyles: true,
            hasHistoryAccess: true,
            refreshSubscription,
          });
          return;
        }
      }

      // Fallback to checking subscriptions table directly
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching subscription:", error);
        setSubscriptionData({
          ...defaultContext,
          isLoading: false,
          refreshSubscription,
        });
        return;
      }

      // Determine subscription tier based on subscription data
      if (subscriptions && subscriptions.length > 0) {
        const subscription = subscriptions[0];

        // Only consider active subscriptions
        if (subscription.status !== "active") {
          setSubscriptionData({
            ...defaultContext,
            isLoading: false,
            refreshSubscription,
          });
          return;
        }

        // Get the price ID to determine the tier
        const priceId = subscription.polar_price_id;

        // Determine tier based on price ID or other subscription data
        let tier: SubscriptionTier = "premium"; // Default to premium for any active subscription

        // Log the price ID for debugging
        console.log("Context subscription price ID:", priceId);

        // Example logic - adjust based on your actual price IDs
        if (priceId && priceId.toLowerCase().includes("pro")) {
          tier = "pro";
        } else if (priceId && priceId.toLowerCase().includes("premium")) {
          tier = "premium";
        }

        // Set subscription features based on tier
        setSubscriptionData({
          tier,
          isLoading: false,
          isSubscribed: true,
          maxGenerations: tier === "pro" ? 100 : 25,
          maxUploads: tier === "pro" ? 10 : 5,
          hasAdvancedStyles: true,
          hasHistoryAccess: true,
          refreshSubscription,
        });
      } else {
        // No active subscription - set to free tier
        setSubscriptionData({
          ...defaultContext,
          isLoading: false,
          refreshSubscription,
        });
      }
    } catch (error) {
      console.error("Error in subscription check:", error);
      setSubscriptionData({
        ...defaultContext,
        isLoading: false,
        refreshSubscription,
      });
    }
  };

  // Initial fetch of subscription data
  useEffect(() => {
    let isMounted = true;

    const fetchFromApi = async () => {
      try {
        const response = await fetch("/api/subscription/status");
        if (response.ok && isMounted) {
          const data = await response.json();
          setSubscriptionData({
            ...data,
            isLoading: false,
            refreshSubscription,
          });
        } else if (isMounted) {
          // If API fails, fall back to direct DB check
          refreshSubscription();
        }
      } catch (error) {
        console.error("Error fetching subscription from API:", error);
        if (isMounted) {
          refreshSubscription();
        }
      }
    };

    fetchFromApi();

    // Set up realtime subscription to listen for changes
    const setupRealtimeSubscription = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user) {
        // Listen for changes to the user's subscription field
        const userSubscription = supabase
          .channel("user-subscription-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "users",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log("User subscription changed:", payload);
              if (isMounted) {
                refreshSubscription();
              }
            },
          )
          .subscribe();

        // Also listen for changes to the subscriptions table
        const subscriptionChanges = supabase
          .channel("subscription-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "subscriptions",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log("Subscription changed:", payload);
              if (isMounted) {
                refreshSubscription();
              }
            },
          )
          .subscribe();

        return () => {
          supabase.removeChannel(userSubscription);
          supabase.removeChannel(subscriptionChanges);
        };
      }

      // Return a no-op cleanup function if no user is found
      return () => {};
    };

    let cleanupFn: (() => void) | undefined;

    setupRealtimeSubscription().then((fn) => {
      cleanupFn = fn;
    });

    return () => {
      isMounted = false;
      if (cleanupFn) cleanupFn();
    };
  }, []);

  return (
    <SubscriptionContext.Provider value={subscriptionData}>
      {children}
    </SubscriptionContext.Provider>
  );
}
