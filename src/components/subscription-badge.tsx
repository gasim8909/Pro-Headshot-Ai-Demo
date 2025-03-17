"use client";

import { useSubscription } from "./subscription-context";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function SubscriptionBadge() {
  const {
    tier,
    isLoading,
    isSubscribed,
    maxGenerations,
    maxUploads,
    hasAdvancedStyles,
    refreshSubscription,
  } = useSubscription();

  const getBadgeStyle = () => {
    // Log the current tier for debugging
    console.log("Current subscription tier in badge:", tier);

    switch (tier) {
      case "premium":
        return "bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 hover:from-amber-300 hover:to-amber-500";
      case "pro":
        return "bg-gradient-to-r from-purple-400 to-blue-500 text-white hover:from-purple-500 hover:to-blue-600";
      case "free":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        // If tier is undefined or invalid, force a refresh of subscription data
        if (tier === undefined || tier === null || tier === "") {
          setTimeout(() => {
            // Use the refreshSubscription from the outer scope
            if (refreshSubscription) refreshSubscription(true);
          }, 500);
        }
        console.warn("Unknown tier value:", tier);
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${getBadgeStyle()} cursor-help font-medium`}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-3">
          <div className="space-y-2">
            <p className="font-semibold">
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier Features:
            </p>
            <ul className="text-sm space-y-1">
              <li>• {maxGenerations} headshot generations per month</li>
              <li>• Up to {maxUploads} photos per upload</li>
              <li>
                •{" "}
                {hasAdvancedStyles
                  ? "Access to all style options"
                  : "Basic style options only"}
              </li>
              <li>
                •{" "}
                {tier !== "free"
                  ? "History tracking and storage"
                  : "No history tracking"}
              </li>
              {tier === "pro" && <li>• Priority processing</li>}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
