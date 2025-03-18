// Use a more recent version of the Deno standard library for better compatibility
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Polar } from "npm:@polar-sh/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-customer-email",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the access token from environment variables
    const accessToken = Deno.env.get("POLAR_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("POLAR_ACCESS_TOKEN is not set");
      return new Response(
        JSON.stringify({ error: "POLAR_ACCESS_TOKEN is not set" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { productPriceId, successUrl, metadata } = body;

    // Get customer email from request or metadata
    let customerEmail = req.headers.get("x-customer-email");
    if (!customerEmail && metadata && metadata.email) {
      customerEmail = metadata.email;
    }

    // Validate required parameters
    if (!productPriceId || !successUrl) {
      console.error("Missing required parameters", {
        productPriceId,
        successUrl,
      });
      return new Response(
        JSON.stringify({
          error:
            "Missing required parameters: productPriceId and successUrl are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Initialize Polar client with the access token and client credentials
    const polar = new Polar({
      accessToken,
      clientId: Deno.env.get("POLAR_CLIENT_ID") || "",
      clientSecret: Deno.env.get("POLAR_CLIENT_SECRET") || "",
      server: "sandbox",
    });

    // If no customer email is provided, we can still create a checkout session
    // Polar will ask for the email during checkout
    console.log("Creating checkout with:", {
      productPriceId,
      successUrl,
      customerEmail: customerEmail || "(will be collected during checkout)",
      metadata,
    });

    // Create checkout session
    try {
      const result = await polar.checkouts.create({
        productPriceId,
        successUrl,
        customerEmail,
        metadata,
      });

      console.log("Checkout session created:", {
        id: result.id,
        url: result.url,
      });

      return new Response(
        JSON.stringify({ sessionId: result.id, url: result.url }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } catch (polarError) {
      console.error("Polar API error:", polarError);
      return new Response(
        JSON.stringify({
          error: `Polar API error: ${polarError.message}`,
          details: polarError,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Unhandled error in create-checkout:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
