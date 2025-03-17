import { NextRequest, NextResponse } from "next/server";
import { MOCK_DATA, TIMEOUTS } from "@/lib/config";

// Get the Python server URL from environment variables
const PYTHON_SERVER_URL =
  process.env.NEXT_PUBLIC_PYTHON_SERVER_URL || "http://localhost:5000";

// This endpoint will return a status message about the Python server
export async function GET() {
  try {
    console.log("Returning mock Python server status");

    // Return a mock status response
    return NextResponse.json({
      status: "ok",
      message: "Mock Python server is running",
      version: "1.0.0",
      mockServer: true,
    });
  } catch (error) {
    console.error("Error in Python server status endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to check Python server status",
        serverUrl: PYTHON_SERVER_URL,
      },
      { status: 500 },
    );
  }
}

// This endpoint will process images using the Python server
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Log the received data for debugging
    console.log("Received data in Python server endpoint:", {
      imagesCount: data.images?.length || 0,
      prompt: data.prompt,
      style: data.style,
      userId: data.userId,
    });

    console.log("Using mock data for image processing");

    // Get the style from the request
    const style = data.style || "professional";
    const mockImages = MOCK_DATA.STYLES[style] || MOCK_DATA.STYLES.professional;

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock headshot images based on style
    return NextResponse.json({
      images: mockImages,
      source: "mock-data",
      serverUrl: PYTHON_SERVER_URL,
      message: "Images processed successfully (mock data)",
    });
  } catch (error) {
    console.error("Error in mock Python server endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error.message,
        source: "mock-error",
      },
      { status: 500 },
    );
  }
}
