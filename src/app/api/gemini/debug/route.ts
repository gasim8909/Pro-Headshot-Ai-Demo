import { NextRequest, NextResponse } from "next/server";
import { GEMINI_CONFIG } from "@/lib/config";
import { createClient } from "../../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Check if Gemini API is enabled
    const isGeminiEnabled = GEMINI_CONFIG.ENABLED;
    const apiKey = process.env.GEMINI_API_KEY;
    const supabase = await createClient();

    // Get user information if logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return NextResponse.json({
      geminiEnabled: isGeminiEnabled,
      apiKeyExists: !!apiKey,
      apiKeyFirstChars: apiKey ? apiKey.substring(0, 4) + "..." : null,
      model: GEMINI_CONFIG.MODEL,
      mockDataEnabled: process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true",
      demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
      nodeEnv: process.env.NODE_ENV,
      userAuthenticated: !!user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking Gemini debug info:", error);
    return NextResponse.json(
      {
        error: "Failed to get debug information",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
