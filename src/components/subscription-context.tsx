"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "../../supabase/client";
import { GUEST_TIER, SUBSCRIPTION_TIERS, getTierFeatures } from "@/lib/config";

type SubscriptionTier = "free" | "premium" | "pro";

type SubscriptionContextType = {
  tier: SubscriptionTier;
  isLoading: boolean;
  isSubscribed: boolean;
  isGuest: boolean;
  maxGenerations: number;
  maxUploads: number | string;
  hasAdvancedStyles: boolean;
  hasHistoryAccess: boolean;
  refreshSubscription: () => Promise<void>;
};

// Default values for guest users (not logged in)
const guestContext: SubscriptionContextType = {
  tier: "free",
  isLoading: true,
  isSubscribed: false,
  isGuest: true,
  maxGenerations: GUEST_TIER.maxVariations,
  maxUploads: GUEST_TIER.maxUploads,
  hasAdvancedStyles: GUEST_TIER.advancedPrompting,
  hasHistoryAccess: GUEST_TIER.hasHistoryAccess,
  refreshSubscription: async () => {},
};

// Default values for free tier (logged in users)
const defaultContext: SubscriptionContextType = {
  tier: "free",
  isLoading: true,
  isSubscribed: false,
  isGuest: false,
  maxGenerations: SUBSCRIPTION_TIERS.FREE.maxVariations,
  maxUploads: SUBSCRIPTION_TIERS.FREE.maxUploads,
  hasAdvancedStyles: SUBSCRIPTION_TIERS.FREE.advancedPrompting,
  hasHistoryAccess: SUBSCRIPTION_TIERS.FREE.hasHistoryAccess || false,
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

  const refreshSubscription = async (forceRefresh = false) => {
    setSubscriptionData((prev) => ({ ...prev, isLoading: true }));

    // Clear cache if force refresh is requested
    if (forceRefresh) {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user) {
        sessionStorage.removeItem(`subscription-${user.id}`);
        console.log("Cleared subscription cache for force refresh");

        // Also clear any cached data in the API route
        try {
          await fetch("/api/subscription/status?forceRefresh=true");
          console.log("Triggered API cache refresh");
        } catch (e) {
          console.error("Error triggering API cache refresh:", e);
        }
      }
    }

    try {
      // Check if user is logged in
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // If not logged in, set as guest user
      if (!user) {
        console.log("No user found - setting as guest");
        setSubscriptionData({
          ...guestContext,
          isLoading: false,
          refreshSubscription,
        });
        return;
      }

      // User is logged in - fetch subscription data from API
      console.log("Fetching subscription data for logged-in user");
      const response = await fetch("/api/subscription/status");

      if (response.ok) {
        const data = await response.json();
        console.log("Subscription data from API:", data);

        // Get tier features from centralized config
        const tierFeatures = getTierFeatures(data.tier || "free");

        // Set subscription data with appropriate values based on tier
        setSubscriptionData({
          tier: data.tier || "free",
          isLoading: false,
          isSubscribed: data.isSubscribed || false,
          isGuest: false, // User is logged in, so not a guest
          maxGenerations: tierFeatures.maxVariations,
          maxUploads: tierFeatures.maxUploads,
          hasAdvancedStyles: tierFeatures.advancedPrompting,
          hasHistoryAccess: tierFeatures.hasHistoryAccess || false,
          refreshSubscription,
        });

        // Cache the subscription data
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              `subscription-${user.id}`,
              JSON.stringify({
                data,
                timestamp: Date.now(),
              }),
            );
          } catch (e) {
            console.error("Error writing to sessionStorage:", e);
          }
        }
      } else {
        // API failed - set default free tier for logged-in user
        console.error("API request failed, using default free tier");
        setSubscriptionData({
          ...defaultContext,
          isLoading: false,
          refreshSubscription,
        });
      }
    } catch (error) {
      console.error("Error in subscription check:", error);
      // On error, set as guest if we can't determine user status
      setSubscriptionData({
        ...guestContext,
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
        // Check if user is logged in
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        const user = data?.user;

        // If not logged in, set as guest user
        if (!user) {
          console.log("No user found - setting as guest");
          if (isMounted) {
            setSubscriptionData({
              ...guestContext,
              isLoading: false,
              refreshSubscription,
            });
          }
          return;
        }

        // Check for cached subscription data
        if (typeof window !== "undefined") {
          try {
            const cachedSubscription = sessionStorage.getItem(
              `subscription-${user.id}`,
            );
            if (cachedSubscription) {
              const { data, timestamp } = JSON.parse(cachedSubscription);
              const cacheAge = Date.now() - timestamp;

              // Use cache if it's less than 5 minutes old
              if (cacheAge < 5 * 60 * 1000 && isMounted) {
                console.log("Using cached subscription data");
                setSubscriptionData({
                  ...data,
                  isGuest: false, // Ensure this is set correctly
                  isLoading: false,
                  refreshSubscription,
                });
                return;
              }
            }
          } catch (e) {
            console.error("Error accessing sessionStorage:", e);
          }
        }

        // If no valid cache, fetch from API
        console.log("Fetching subscription from API");
        const response = await fetch("/api/subscription/status");
        if (response.ok && isMounted) {
          const data = await response.json();
          console.log("Subscription data from API:", data);

          // Get tier features from centralized config
          const tierFeatures = getTierFeatures(data.tier || "free");

          setSubscriptionData({
            tier: data.tier || "free",
            isLoading: false,
            isSubscribed: data.isSubscribed || false,
            isGuest: false, // User is logged in, so not a guest
            maxGenerations: tierFeatures.maxVariations,
            maxUploads: tierFeatures.maxUploads,
            hasAdvancedStyles: tierFeatures.advancedPrompting,
            hasHistoryAccess: tierFeatures.hasHistoryAccess || false,
            refreshSubscription,
          });

          // Cache the subscription data
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(
                `subscription-${user.id}`,
                JSON.stringify({
                  data,
                  timestamp: Date.now(),
                }),
              );
            } catch (e) {
              console.error("Error writing to sessionStorage:", e);
            }
          }
        } else if (isMounted) {
          // If API fails, fall back to direct DB check
          refreshSubscription();
        }
      } catch (error) {
        console.error("Error fetching subscription from API:", error);
        if (isMounted) {
          // On error, set as guest if we can't determine user status
          setSubscriptionData({
            ...guestContext,
            isLoading: false,
            refreshSubscription,
          });
        }
      }
    };

    // Only run on client-side
    if (typeof window !== "undefined") {
      fetchFromApi();
    } else {
      // Set default values for server-side rendering
      setSubscriptionData({
        ...guestContext, // Default to guest for SSR
        isLoading: false,
        refreshSubscription,
      });
    }

    // Set up realtime subscription to listen for changes
    const setupRealtimeSubscription = async () => {
      // Only run on client-side
      if (typeof window === "undefined") return () => {};

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
                refreshSubscription(true); // Force refresh when subscription changes
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
                refreshSubscription(true); // Force refresh when subscription changes
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

    if (typeof window !== "undefined") {
      setupRealtimeSubscription().then((fn) => {
        cleanupFn = fn;
      });
    }

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
