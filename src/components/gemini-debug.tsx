"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2 } from "lucide-react";

export default function GeminiDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkGeminiDebug = async () => {
    try {
      setLoading(true);
      setError(null);

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";
      const response = await fetch(`${origin}/api/gemini/debug`, {
        method: "GET",
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        setDebugInfo(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Error: ${response.status}`);
      }
    } catch (err) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Gemini API Debug</CardTitle>
        <CardDescription>
          Check if Gemini API is properly configured and enabled for image
          processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {debugInfo && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="font-medium mb-2">Gemini Configuration</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Gemini Enabled:</div>
              <div>{debugInfo.geminiEnabled ? "✅ Yes" : "❌ No"}</div>

              <div className="font-medium">API Key Exists:</div>
              <div>{debugInfo.apiKeyExists ? "✅ Yes" : "❌ No"}</div>

              {debugInfo.apiKeyFirstChars && (
                <>
                  <div className="font-medium">API Key Starts With:</div>
                  <div>{debugInfo.apiKeyFirstChars}</div>
                </>
              )}

              <div className="font-medium">Model:</div>
              <div>{debugInfo.model}</div>

              <div className="font-medium">Mock Data Enabled:</div>
              <div>{debugInfo.mockDataEnabled ? "Yes" : "No"}</div>

              <div className="font-medium">Demo Mode:</div>
              <div>{debugInfo.demoMode ? "Yes" : "No"}</div>

              <div className="font-medium">Node Environment:</div>
              <div>{debugInfo.nodeEnv}</div>

              <div className="font-medium">User Authenticated:</div>
              <div>{debugInfo.userAuthenticated ? "Yes" : "No"}</div>

              <div className="font-medium">Timestamp:</div>
              <div>{new Date(debugInfo.timestamp).toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h3 className="font-medium mb-2">Troubleshooting Steps</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Check if Gemini API is enabled in the configuration</li>
            <li>
              Verify that a valid GEMINI_API_KEY environment variable is set
            </li>
            <li>
              Ensure the model specified in config is available for your API key
            </li>
            <li>
              If in development mode, check if demo mode is overriding real
              processing
            </li>
          </ol>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={checkGeminiDebug}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Check Gemini Configuration"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
