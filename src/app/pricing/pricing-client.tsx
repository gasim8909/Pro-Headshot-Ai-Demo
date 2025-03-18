"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../supabase/client";

export default function PricingClient({ userId }: { userId?: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Get user email on component mount
  useEffect(() => {
    const getUserEmail = async () => {
      if (userId) {
        try {
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          if (data?.user?.email) {
            setUserEmail(data.user.email);
          }
        } catch (error) {
          console.error("Error getting user email:", error);
        }
      }
    };

    getUserEmail();
  }, [userId]);

  useEffect(() => {
    // Add click event listeners to all pricing buttons
    const handlePricingButtonClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const priceLink = target.closest("[data-price-id]") as HTMLAnchorElement;

      if (priceLink) {
        e.preventDefault();

        // Prevent multiple clicks
        if (isProcessing) return;
        setIsProcessing(true);

        const priceId = priceLink.getAttribute("data-price-id");

        if (!priceId) {
          setIsProcessing(false);
          return;
        }

        try {
          console.log("Creating checkout for price ID:", priceId);
          const supabase = createClient();

          // Get user session for auth token
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;

          // Prepare headers with auth token if available
          const headers: Record<string, string> = {};
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
          if (userEmail) {
            headers["x-customer-email"] = userEmail;
          }

          console.log("Invoking create-checkout with:", {
            priceId,
            userId,
            userEmail,
          });

          const { data, error } = await supabase.functions.invoke(
            "create-checkout",
            {
              body: {
                productPriceId: priceId,
                successUrl: `${window.location.origin}/dashboard`,
                metadata: {
                  user_id: userId || "guest",
                  email: userEmail || "",
                },
              },
              headers,
            },
          );

          if (error) {
            console.error("Error from function:", error);
            const errorMessage =
              typeof error === "object" && error !== null
                ? JSON.stringify(error)
                : String(error);
            throw new Error(`Edge function error: ${errorMessage}`);
          }

          if (!data) {
            console.error("No data returned from function");
            throw new Error("No data returned from checkout function");
          }

          // Redirect to Polar checkout
          if (data?.url) {
            console.log("Redirecting to checkout URL:", data.url);
            window.location.href = data.url;
          } else {
            throw new Error("No checkout URL returned");
          }
        } catch (error) {
          console.error("Error creating checkout session:", error);
          alert(
            `Failed to create checkout session: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
          );
          setIsProcessing(false);
        }
      }
    };

    document.addEventListener("click", handlePricingButtonClick);

    return () => {
      document.removeEventListener("click", handlePricingButtonClick);
    };
  }, [userId, userEmail, isProcessing]);

  return null; // This component doesn't render anything
}
