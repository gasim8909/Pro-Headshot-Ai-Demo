import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log("Received request in process-images function:", {
      imagesCount: requestData.images?.length || 0,
      prompt: requestData.prompt,
      style: requestData.style,
      userId: requestData.userId,
    });

    // Here we would normally call the Python server with the image data
    // For now, we'll simulate processing by calling the Python server directly
    // or using a mock response if that's not possible

    // Note: Edge functions cannot access localhost, so we'll always use mock data
    // In a production environment, you would call an external API endpoint here
    let pythonServerResponse;
    try {
      // In a real deployment, you would call your deployed Python API here
      // For example: const response = await fetch("https://your-python-api.com/process", {...});

      // For now, we'll log that we're using mock data since we can't access localhost from an edge function
      console.log("Edge function cannot access localhost, using mock response");
      throw new Error("Edge function cannot access localhost");
    } catch (error) {
      console.log("Using mock response in edge function");

      // Mock response with style-specific images
      const style = requestData.style || "professional";
      pythonServerResponse = {
        images: [
          // Return different mock images based on the selected style
          style === "professional"
            ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80"
            : style === "creative"
              ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
              : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",

          style === "professional"
            ? "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80"
            : style === "creative"
              ? "https://images.unsplash.com/photo-1573497019236-61e7a0081f95?w=800&q=80"
              : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",

          style === "professional"
            ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80"
            : style === "creative"
              ? "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80"
              : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",

          style === "professional"
            ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80"
            : style === "creative"
              ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"
              : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
        ],
      };
    }

    // If the user is logged in, we could save the generated images to their account here
    if (requestData.userId && requestData.userId !== "guest") {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") || "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
        );

        // Here you could save the image URLs or data to the user's account
        console.log("Would save images for user:", requestData.userId);
      } catch (error) {
        console.error("Error saving images to user account:", error);
      }
    }

    return new Response(JSON.stringify(pythonServerResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in process-images function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
