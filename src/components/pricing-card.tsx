"use client";

import { createClient } from "../../supabase/client";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { User } from "@supabase/supabase-js";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

export default function PricingCard({
  item,
  user,
}: {
  item: any;
  user: User | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is the premium plan
  const isPremium = item?.name?.toLowerCase().includes("premium");

  // Set popular flag for premium plan
  const isPopular = isPremium || item?.popular;

  // Handle checkout process
  const handleCheckout = async (priceId: string) => {
    setIsLoading(true);
    setError(null);
    console.log("priceId", priceId);

    if (!user) {
      // Redirect to login if user is not authenticated
      window.location.href = "/sign-in?redirect=pricing";
      return;
    }

    try {
      const supabase = createClient();
      console.log("Invoking create-checkout function...");
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            productPriceId: priceId,
            successUrl: `${window.location.origin}/dashboard`,
            customerEmail: user.email || "",
            metadata: {
              user_id: user.id,
            },
          },
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

      if (error) {
        console.error("Error from function:", error);
        throw error;
      }

      console.log("Checkout response:", data);

      // Redirect to Polar checkout
      if (data?.url) {
        console.log("Redirecting to checkout URL:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setError(error.message || "Failed to create checkout session");
      setIsLoading(false);
    }
  };

  // Generate fake original price for discount display - using a fixed multiplier instead of random
  const originalPrice = item?.prices?.[0]?.priceAmount
    ? Math.round(
        (item.prices[0].priceAmount / 100) * 1.5, // Fixed multiplier to avoid hydration errors
      )
    : null;

  // Calculate discount percentage
  const discountPercentage = originalPrice
    ? Math.round(
        ((originalPrice - item.prices[0].priceAmount / 100) / originalPrice) *
          100,
      )
    : null;

  return (
    <Card
      className={`w-full h-full relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isPopular ? "border-2 border-blue-500 shadow-xl scale-105 z-10" : "border border-gray-200 hover:border-blue-300"}`}
    >
      {isPopular && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-30" />
      )}
      <CardHeader className="relative">
        {isPopular && (
          <div className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-fit mb-4 flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Most Popular
          </div>
        )}
        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
          {item.name}
        </CardTitle>
        <CardDescription className="flex items-baseline gap-2 mt-2">
          {originalPrice && item?.prices?.[0]?.priceAmount ? (
            <span className="flex flex-col">
              <span className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  ${item.prices[0].priceAmount / 100}
                </span>
                <span className="text-gray-600">/month</span>
              </span>
              <span className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice}
                </span>
                <span className="text-sm font-medium text-green-600">
                  {discountPercentage}% off
                </span>
              </span>
            </span>
          ) : (
            <span className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {item?.prices?.[0]?.priceAmount
                  ? `${item.prices[0].priceAmount / 100}`
                  : "Free"}
              </span>
              <span className="text-gray-600">/month</span>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      {item.description && (
        <CardContent className="relative flex-grow">
          <ul className="space-y-4">
            {item.description.split("\n").map((desc: string, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <Check
                  className={`w-5 h-5 ${isPopular ? "text-blue-500" : "text-green-500"} flex-shrink-0 mt-1`}
                />
                <span className="text-gray-600">{desc.trim()}</span>
              </li>
            ))}
          </ul>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      )}
      <CardFooter className="relative mt-auto pt-6">
        <Button
          onClick={async () => {
            await handleCheckout(item?.prices?.[0]?.id);
          }}
          disabled={isLoading}
          className={`w-full py-6 text-lg font-medium ${
            isPopular
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-900"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Get Started"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
