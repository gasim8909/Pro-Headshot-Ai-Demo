import { NextRequest, NextResponse } from "next/server";
import { initGeminiClient, generateHeadshot } from "@/lib/gemini";

export async function GET(request: NextRequest) {
  try {
    // Test if we can initialize the Gemini client
    const genAI = initGeminiClient();

    // Create a simple test image (1x1 pixel transparent PNG)
    const testImageBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const testMimeType = "image/png";

    // Try to generate a headshot with minimal processing
    const result = await generateHeadshot(
      testImageBase64,
      testMimeType,
      "Simple test image",
      "professional",
    );

    // If we get here, the API is working
    return NextResponse.json({
      status: "success",
      message: "Gemini API is working correctly",
      apiKey: process.env.GEMINI_API_KEY
        ? "API key is set"
        : "API key is missing",
      imageGenerated: !!result,
      imageSize: result ? `${result.length} characters` : "No image generated",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Gemini API test failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Gemini API test failed",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        apiKey: process.env.GEMINI_API_KEY
          ? "API key is set but may be invalid"
          : "API key is missing",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
