"use client";

import { useEffect, useState } from "react";
import { Loader2, CreditCard, Infinity } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useSubscription } from "./subscription-context";
import { CREDIT_LIMITS } from "@/lib/credits";

interface CreditIndicatorProps {
  user?: User | null;
  className?: string;
}

export function CreditIndicator({
  user,
  className = "",
}: CreditIndicatorProps) {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { tier } = useSubscription();

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setIsLoading(true);

        if (user) {
          // For logged in users, use server action
          const { getRemainingCreditsAction } = await import("@/app/actions");
          const { credits } = await getRemainingCreditsAction(user.id);
          setCredits(credits);
        } else {
          // For guests, use localStorage
          const { getGuestCreditsRemaining } = await import("@/lib/credits");
          const credits = getGuestCreditsRemaining();
          setCredits(credits);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();

    // Set up interval to refresh credits every minute
    const interval = setInterval(fetchCredits, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Get the total credits based on tier
  const getTotalCredits = () => {
    switch (tier) {
      case "premium":
        return CREDIT_LIMITS.premium;
      case "pro":
        return CREDIT_LIMITS.pro;
      default:
        return CREDIT_LIMITS.free;
    }
  };

  const totalCredits = getTotalCredits();
  const usedCredits = credits !== null ? totalCredits - credits : 0;
  const percentage = credits !== null ? (credits / totalCredits) * 100 : 0;

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-1 text-sm">
          <span className="flex items-center gap-1 text-gray-700">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Loading credits...</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 animate-pulse">
          <div className="bg-gradient-to-r from-gray-300 to-gray-400 h-2.5 rounded-full w-3/4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (tier === "pro") {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-1 text-sm">
          <span className="flex items-center gap-1 text-gray-700">
            <Infinity className="h-3 w-3" />
            <span>Unlimited Credits</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-purple-400 to-blue-500 h-2.5 rounded-full w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1 text-sm">
        <span className="flex items-center gap-1 text-gray-700">
          <CreditCard className="h-3 w-3" />
          <span>
            {credits !== null
              ? `${credits} of ${totalCredits} Credits Remaining`
              : "Credits Unavailable"}
          </span>
        </span>
        <span className="text-xs text-gray-500">
          {usedCredits} used this month
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${percentage <= 20 ? "bg-red-500" : percentage <= 50 ? "bg-yellow-500" : "bg-gradient-to-r from-blue-500 to-purple-600"} h-2.5 rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
