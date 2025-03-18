"use client";

import { useEffect } from "react";
import { createClient } from "../../../supabase/client";

export default function PricingClient({ userId }: { userId?: string }) {
  useEffect(() => {
    // Add click event listeners to all pricing buttons
    const handlePricingButtonClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const priceLink = target.closest("[data-price-id]") as HTMLAnchorElement;

      if (priceLink && userId) {
        e.preventDefault();
        const priceId = priceLink.getAttribute("data-price-id");

        if (!priceId) return;

        try {
          const supabase = createClient();
          const { data, error } = await supabase.functions.invoke(
            "supabase-functions-create-checkout",
            {
              body: {
                productPriceId: priceId,
                successUrl: `${window.location.origin}/dashboard`,
                customerEmail: "", // The server will get this from the user's session
                metadata: {
                  user_id: userId,
                },
              },
            },
          );

          if (error) {
            console.error("Error from function:", error);
            throw error;
          }

          // Redirect to Polar checkout
          if (data?.url) {
            window.location.href = data.url;
          } else {
            throw new Error("No checkout URL returned");
          }
        } catch (error) {
          console.error("Error creating checkout session:", error);
          alert("Failed to create checkout session. Please try again.");
        }
      }
    };

    document.addEventListener("click", handlePricingButtonClick);

    return () => {
      document.removeEventListener("click", handlePricingButtonClick);
    };
  }, [userId]);

  return null; // This component doesn't render anything
}
