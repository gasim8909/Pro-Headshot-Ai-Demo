import { NextResponse } from "next/server";
import {
  MOCK_DATA,
  PYTHON_SERVER_URL,
  USE_PYTHON_PROXY,
  ACTIVE_PYTHON_SERVER_URL,
} from "@/lib/config";

// This endpoint will directly check if the Python server is running
export async function GET() {
  try {
    // Try to connect to the Python server through our proxy if enabled
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";

    // Only attempt to connect to the Python server if we're not in demo mode
    if (!MOCK_DATA.DEMO_MODE) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        // Use the proxy endpoint if enabled, otherwise use the mock server
        const endpoint = USE_PYTHON_PROXY
          ? `${origin}/api/python-proxy?path=/status`
          : `${origin}/api/python-server/status`;
        const response = await fetch(endpoint, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            available: true,
            status: "Python Server Connected",
            message: "Connected to Python server successfully",
            serverUrl: data.serverUrl || ACTIVE_PYTHON_SERVER_URL,
            demoMode: false,
            mockDataEnabled: false,
            serverInfo: data,
          });
        }
      } catch (error) {
        console.log("Error connecting to Python server:", error.message);
        // Continue to fallback response
      }
    }

    // If we can't connect to the Python server, return demo mode status
    return NextResponse.json({
      available: false,
      status: "Demo Mode Active",
      message: "Using sample images for demonstration purposes",
      serverUrl: ACTIVE_PYTHON_SERVER_URL,
      demoMode: MOCK_DATA.DEMO_MODE,
      mockDataEnabled: MOCK_DATA.ENABLED,
    });
  } catch (error) {
    console.error("Error checking Python server status:", error);
    return NextResponse.json(
      {
        error: "Failed to check Python server status",
        available: false,
        serverUrl: ACTIVE_PYTHON_SERVER_URL,
        demoMode: MOCK_DATA.DEMO_MODE,
      },
      { status: 500 },
    );
  }
}
