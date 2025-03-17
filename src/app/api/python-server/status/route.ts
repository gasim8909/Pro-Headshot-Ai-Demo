import { NextResponse } from "next/server";
import { MOCK_DATA } from "@/lib/config";

// Get the Python server URL from environment variables
const PYTHON_SERVER_URL =
  process.env.NEXT_PUBLIC_PYTHON_SERVER_URL || "http://localhost:5000";

// This endpoint will check if the Python server is running
export async function GET() {
  try {
    console.log("Returning mock Python server status");

    // Return a mock status response
    return NextResponse.json({
      available: true,
      status: "Mock Python Server Active",
      message: "Using sample images for demonstration purposes",
      serverUrl: PYTHON_SERVER_URL,
      demoMode: MOCK_DATA.DEMO_MODE,
      mockDataEnabled: MOCK_DATA.ENABLED,
      version: "1.0.0",
    });
  } catch (error) {
    console.error("Error checking Python server status:", error);
    return NextResponse.json(
      {
        error: "Failed to check Python server status",
        available: false,
        serverUrl: PYTHON_SERVER_URL,
      },
      { status: 500 },
    );
  }
}
