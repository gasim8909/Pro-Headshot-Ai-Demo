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
}

const CreditsContext = createContext<CreditsContextType>({
  credits: 0,
  isLoading: true,
  refreshCredits: async () => {},
});

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    console.error("useCredits must be used within a CreditsProvider");
    return { credits: 0, isLoading: false, refreshCredits: async () => {} };
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
        console.log("Fetching credits from API");
        const response = await fetch("/api/credits");
        const data = await response.json();
        setCredits(data.credits);

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
        const { getGuestCreditsRemaining } = await import("@/lib/credits");
        const credits = getGuestCreditsRemaining();
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
    fetchCredits();

    // Set up an interval to refresh credits every 5 minutes
    // This ensures data doesn't get too stale while the app is open
    const interval = setInterval(() => fetchCredits(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <CreditsContext.Provider
      value={{
        credits,
        isLoading,
        refreshCredits: fetchCredits,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}
