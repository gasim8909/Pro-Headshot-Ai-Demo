"use client";

import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type GeminiStatus = {
  available: boolean;
  status: string;
  message?: string;
  model?: string;
  demoMode?: boolean;
};

interface GeminiStatusIndicatorProps {
  showForUsers?: boolean;
}

export default function GeminiStatusIndicator({
  showForUsers = false,
}: GeminiStatusIndicatorProps) {
  const [status, setStatus] = useState<GeminiStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkGeminiStatus = async () => {
      try {
        setLoading(true);
        // Use window.location.origin to ensure we have a valid absolute URL
        const origin =
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000";

        console.log("Checking Gemini API status...");
        const response = await fetch(`${origin}/api/gemini/status`, {
          method: "GET",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Gemini API status response:", data);
          setStatus(data);
        } else {
          console.warn(
            "Gemini API status check failed with status:",
            response.status,
          );
          const errorData = await response.json().catch(() => ({}));
          console.warn("Error details:", errorData);

          setStatus({
            available: false,
            status: "Demo Mode Active",
            message:
              errorData.message || "Using sample images for demonstration",
            demoMode: true,
          });
        }
      } catch (error) {
        console.error("Error checking Gemini API status:", error);
        setStatus({
          available: false,
          status: "Demo Mode Active",
          message: "Using sample images for demonstration",
          demoMode: true,
        });
      } finally {
        setLoading(false);
      }
    };

    checkGeminiStatus();
    // Check status every 60 seconds
    const interval = setInterval(checkGeminiStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Don't render anything for regular users if not in demo mode
  if (!showForUsers && status?.available && !status?.demoMode) {
    return null;
  }

  if (loading) {
    // Only show loading state on admin/debug pages
    if (!showForUsers) return null;

    return (
      <Badge variant="outline" className="animate-pulse">
        Checking Gemini API...
      </Badge>
    );
  }

  // If in demo mode, show a different badge style
  if (status?.demoMode || !status?.available) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-help"
            >
              Demo Mode
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>
              <strong>Status:</strong> {status?.status}
            </p>
            {status?.message && (
              <p>
                <strong>Info:</strong> {status.message}
              </p>
            )}
            <p className="text-xs mt-1">
              This demo uses sample images instead of real AI processing. To
              enable Gemini API integration, set the GEMINI_API_KEY environment
              variable.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Only show "Gemini API Active" on admin/debug pages
  if (!showForUsers) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-200 cursor-help"
          >
            Gemini API Active
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>
            <strong>Status:</strong> {status?.status}
          </p>
          {status?.model && (
            <p>
              <strong>Model:</strong> {status.model}
            </p>
          )}
          {status?.message && (
            <p>
              <strong>Info:</strong> {status.message}
            </p>
          )}
          <p className="text-xs mt-1">
            Gemini API is configured and ready to process your images.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
