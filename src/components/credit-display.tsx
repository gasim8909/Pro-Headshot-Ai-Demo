"use client";

import { useCredits } from "./client-credits-provider";
import { CREDIT_LIMITS } from "@/lib/credits";

export function CreditDisplay() {
  const { credits, isLoading, isGuest } = useCredits();

  // Determine the total credits based on user type
  const totalCredits = isGuest ? CREDIT_LIMITS.guest : CREDIT_LIMITS.free;
  const planType = isGuest ? "Guest" : "Free";

  // Calculate used credits
  const usedCredits = totalCredits - credits;

  if (isLoading) {
    return <div>Loading credit information...</div>;
  }

  console.log(
    "CreditDisplay rendering with isGuest:",
    isGuest,
    "planType:",
    planType,
    "credits:",
    credits,
    "totalCredits:",
    totalCredits,
  );

  return (
    <div className="space-y-2">
      <div className="font-medium">{planType} Plan</div>
      <div>
        {credits} of {totalCredits} Credits Remaining
      </div>
      <div>{usedCredits} used this month</div>
    </div>
  );
}
