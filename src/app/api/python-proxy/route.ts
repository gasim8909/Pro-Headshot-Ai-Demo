import { NextRequest, NextResponse } from "next/server";

// Get the Python server URL from environment variables
// This should be the actual URL where your Python server is running
const ACTUAL_PYTHON_SERVER_URL =
  process.env.PYTHON_SERVER_ACTUAL_URL || "http://host.docker.internal:5000";

/**
 * This proxy endpoint allows the frontend to communicate with the Python server
 * without having to know its actual URL. It also handles CORS and other issues.
 */
export async function GET(request: NextRequest) {
  try {
    // Get the path from the request URL
    const url = new URL(request.url);
    const path = url.searchParams.get("path") || "/status";

    // Forward the request to the Python server
    console.log(
      `Proxying GET request to Python server: ${ACTUAL_PYTHON_SERVER_URL}${path}`,
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(`${ACTUAL_PYTHON_SERVER_URL}${path}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          ...data,
          serverUrl: ACTUAL_PYTHON_SERVER_URL,
          proxied: true,
        });
      }

      throw new Error(
        `Python server responded with status: ${response.status}`,
      );
    } catch (error) {
      console.error(
        `Error connecting to Python server at ${ACTUAL_PYTHON_SERVER_URL}:`,
        error,
      );

      // Return a response indicating the Python server is not available
      return NextResponse.json(
        {
          status: "Python server not available",
          message: "The Python server is not running or not reachable",
          serverUrl: ACTUAL_PYTHON_SERVER_URL,
          error: error.message,
          proxied: true,
        },
        { status: 502 },
      ); // 502 Bad Gateway
    }
  } catch (error) {
    console.error("Error in Python proxy endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to proxy request to Python server",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();

    // Forward the request to the Python server
    console.log(
      `Proxying POST request to Python server: ${ACTUAL_PYTHON_SERVER_URL}/process`,
    );
    console.log("Request payload:", {
      imagesCount: body.images?.length || 0,
      prompt: body.prompt,
      style: body.style,
    });

    const controller = new AbortController();
    // Allow more time for processing - 60 seconds
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${ACTUAL_PYTHON_SERVER_URL}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log("Successfully received response from Python server");
        return NextResponse.json({
          ...data,
          source: "python-server",
          serverUrl: ACTUAL_PYTHON_SERVER_URL,
          proxied: true,
        });
      }

      throw new Error(
        `Python server responded with status: ${response.status}`,
      );
    } catch (error) {
      console.error(
        `Error calling Python server at ${ACTUAL_PYTHON_SERVER_URL}:`,
        error,
      );

      // Return a response indicating the Python server is not available
      return NextResponse.json(
        {
          status: "Python server not available",
          message:
            "The Python server is not running or not reachable. Using mock data instead.",
          serverUrl: ACTUAL_PYTHON_SERVER_URL,
          error: error.message,
          proxied: true,
          source: "proxy-error",
        },
        { status: 502 },
      ); // 502 Bad Gateway
    }
  } catch (error) {
    console.error("Error in Python proxy endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to proxy request to Python server",
        message: error.message,
        source: "proxy-error",
      },
      { status: 500 },
    );
  }
}
