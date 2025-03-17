import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "GEMINI_API_KEY environment variable is not set",
          isValid: false,
        },
        { status: 400 },
      );
    }

    // Try to initialize the Gemini client with the provided key
    const genAI = new GoogleGenerativeAI(apiKey);

    // Make a simple text-only request to verify the API key works
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      status: "success",
      message: "Gemini API key is valid",
      isValid: true,
      response: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Gemini API key verification failed:", error);

    let errorMessage = error.message;
    let statusCode = 500;

    // Check for specific API key errors
    if (
      error.message.includes("API key") ||
      error.message.includes("authentication")
    ) {
      errorMessage = "Invalid API key or authentication error";
      statusCode = 401;
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Gemini API key verification failed",
        error: errorMessage,
        isValid: false,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    );
  }
}
