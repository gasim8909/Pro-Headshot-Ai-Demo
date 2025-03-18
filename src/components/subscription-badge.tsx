"use client";

import { useSubscription } from "./subscription-context";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useEffect, useState } from "react";

export default function SubscriptionBadge() {
  // Use local state to prevent SSR issues
  const [subscriptionData, setSubscriptionData] = useState({
    tier: "free", // Default to free tier
    isLoading: true,
    maxGenerations: 4,
    maxUploads: 10,
    hasAdvancedStyles: false,
  });

  // Get subscription data on client-side only
  useEffect(() => {
    try {
      const subscription = useSubscription();
      console.log("Subscription data in badge:", subscription);

      // Always ensure we have a tier value
      const updatedSubscription = {
        ...subscription,
        tier: subscription.tier || "free",
      };

      setSubscriptionData(updatedSubscription);
    } catch (error) {
      console.error("Error getting subscription data:", error);
      // On error, ensure we still have a valid tier
      setSubscriptionData((prev) => ({
        ...prev,
        tier: "free",
        isLoading: false,
      }));
    }
  }, []);

  const { tier, isLoading, maxGenerations, maxUploads, hasAdvancedStyles } =
    subscriptionData;

  const getBadgeStyle = () => {
    // Use a safe tier value that defaults to "free"
    const safeTier = tier || "free";
    console.log("Current subscription tier in badge:", safeTier);

    switch (safeTier) {
      case "premium":
        return "bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 hover:from-amber-300 hover:to-amber-500";
      case "pro":
        return "bg-gradient-to-r from-purple-400 to-blue-500 text-white hover:from-purple-500 hover:to-blue-600";
      case "free":
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Badge
        variant="outline"
        className="animate-pulse bg-gray-200 text-transparent"
      >
        Loading subscription data...
      </Badge>
    );
  }

  // Ensure we have a valid tier for display
  const displayTier = tier || "free";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${getBadgeStyle()} cursor-help font-medium`}>
            {displayTier.charAt(0).toUpperCase() + displayTier.slice(1)} Plan
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-3">
          <div className="space-y-2">
            <p className="font-semibold">
              {displayTier.charAt(0).toUpperCase() + displayTier.slice(1)} Tier
              Features:
            </p>
            <ul className="text-sm space-y-1">
              <li>• {maxGenerations} headshot variations per upload</li>
              <li>
                •{" "}
                {displayTier === "guest"
                  ? "5 lifetime uploads"
                  : displayTier === "pro"
                    ? "100 uploads/month"
                    : displayTier === "premium"
                      ? "30 uploads/month"
                      : "10 uploads/month"}
              </li>
              <li>
                •{" "}
                {displayTier === "guest"
                  ? "Professional style only"
                  : displayTier === "free"
                    ? "3 professional styles"
                    : displayTier === "premium"
                      ? "8 professional styles"
                      : "10+ professional styles"}
              </li>
              {displayTier !== "guest" && displayTier !== "free" && (
                <li>
                  •{" "}
                  {displayTier === "premium"
                    ? "Open custom prompting"
                    : displayTier === "pro"
                      ? "Advanced AI parameters"
                      : "Basic prompting"}
                </li>
              )}
              <li>
                •{" "}
                {displayTier === "pro"
                  ? "Personal account manager"
                  : displayTier === "premium"
                    ? "Priority email support"
                    : "Community support"}
              </li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
