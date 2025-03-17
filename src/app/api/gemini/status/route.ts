import { NextResponse } from "next/server";
import { GEMINI_CONFIG } from "@/lib/config";

/**
 * API endpoint to check if Gemini API is configured and available
 */
export async function GET() {
  try {
    // Check if Gemini API key is set
    const isGeminiEnabled = GEMINI_CONFIG.ENABLED;

    if (isGeminiEnabled) {
      return NextResponse.json({
        available: true,
        status: "Gemini API Enabled",
        message: "Gemini API is configured and ready to use",
        model: GEMINI_CONFIG.MODEL,
      });
    } else {
      return NextResponse.json({
        available: false,
        status: "Gemini API Not Configured",
        message: "GEMINI_API_KEY environment variable is not set",
        demoMode: true,
      });
    }
  } catch (error) {
    console.error("Error checking Gemini API status:", error);
    return NextResponse.json(
      {
        error: "Failed to check Gemini API status",
        available: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
