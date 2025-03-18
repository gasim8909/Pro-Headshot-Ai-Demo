"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";

interface CreditsContextType {
  credits: number;
  isLoading: boolean;
  refreshCredits: () => Promise<void>;
  isGuest: boolean;
}

const CreditsContext = createContext<CreditsContextType>({
  credits: 0,
  isLoading: true,
  refreshCredits: async () => {},
  isGuest: true,
});

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    console.error("useCredits must be used within a CreditsProvider");
    return {
      credits: 0,
      isLoading: false,
      refreshCredits: async () => {},
      isGuest: true,
    };
  }
  return context;
};

interface CreditsProviderProps {
  children: ReactNode;
  user?: User | null;
}

export function CreditsProvider({ children, user }: CreditsProviderProps) {
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isGuest, setIsGuest] = useState<boolean>(!user);

  // Log initial state
  useEffect(() => {
    console.log(
      "CreditsProvider initialized with user:",
      !!user,
      "isGuest:",
      !user,
    );
  }, []);

  const fetchCredits = async (forceRefresh = false) => {
    try {
      if (typeof window === "undefined") return;

      // Check if we should use cached data
      const now = Date.now();
      const cacheAge = now - lastFetchTime;
      const shouldUseCache =
        !forceRefresh && lastFetchTime > 0 && cacheAge < 5 * 60 * 1000; // 5 minutes cache

      if (shouldUseCache) {
        console.log("Using cached credits data");
        return;
      }

      setIsLoading(true);

      // Update isGuest state based on current user status
      const userIsGuest = !user;
      setIsGuest(userIsGuest);
      console.log(
        "fetchCredits updating isGuest state to:",
        userIsGuest,
        "user:",
        !!user,
      );

      if (user) {
        try {
          // Check sessionStorage first
          const cachedCredits = sessionStorage.getItem(
            `user-credits-${user.id}`,
          );
          if (!forceRefresh && cachedCredits) {
            const { data, timestamp } = JSON.parse(cachedCredits);
            const cacheAge = now - timestamp;

            // Use cache if it's less than 5 minutes old
            if (cacheAge < 5 * 60 * 1000) {
              console.log("Using sessionStorage cached credits");
              setCredits(data.credits);
              setLastFetchTime(timestamp);
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error("Error accessing sessionStorage:", e);
        }

        // For logged in users, fetch from API
        console.log(
          "Fetching credits from API for logged-in user with ID:",
          user.id,
        );
        const response = await fetch("/api/credits");
        const data = await response.json();
        console.log(
          "API response for credits:",
          data,
          "isGuest from API:",
          data.isGuest,
        );
        setCredits(data.credits);

        // Ensure isGuest is set correctly based on API response
        if (data.isGuest !== undefined) {
          setIsGuest(data.isGuest);
          console.log("Updated isGuest from API response to:", data.isGuest);
        }

        // Cache in sessionStorage
        try {
          sessionStorage.setItem(
            `user-credits-${user.id}`,
            JSON.stringify({
              data,
              timestamp: now,
            }),
          );
        } catch (e) {
          console.error("Error writing to sessionStorage:", e);
        }

        setLastFetchTime(now);
      } else {
        // For guests, use localStorage
        const { getGuestCreditsRemaining, CREDIT_LIMITS } = await import(
          "@/lib/credits"
        );
        const credits = getGuestCreditsRemaining();
        console.log("Guest credits from localStorage:", credits);
        setCredits(credits);
        setLastFetchTime(now);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Force refresh when user changes (including sign out)
    console.log(
      "CreditsProvider: User changed, user present:",
      !!user,
      "user ID:",
      user?.id || "none",
    );
    fetchCredits(true);

    // Update isGuest state when user changes
    const userIsGuest = !user;
    setIsGuest(userIsGuest);
    console.log("User state changed, isGuest:", userIsGuest);

    // Set up an interval to refresh credits every 5 minutes
    // This ensures data doesn't get too stale while the app is open
    const interval = setInterval(() => fetchCredits(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]); // This dependency ensures the effect runs when user changes

  // Listen for credit_cache_bust cookie changes (set during sign out)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check for cookie changes that might indicate sign out
    const checkCookieChanges = () => {
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("credit_cache_bust="));

      if (cookieValue) {
        // Clear any cached credit data and force refresh
        try {
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("user-credits-")) {
              sessionStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.error("Error clearing sessionStorage:", e);
        }
        fetchCredits(true);
      }
    };

    // Check on mount and periodically
    checkCookieChanges();
    const cookieInterval = setInterval(checkCookieChanges, 1000); // Check every second

    return () => clearInterval(cookieInterval);
  }, []);

  return (
    <CreditsContext.Provider
      value={{
        credits,
        isLoading,
        refreshCredits: fetchCredits,
        isGuest,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}
