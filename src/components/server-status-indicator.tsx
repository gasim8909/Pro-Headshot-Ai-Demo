"use client";

import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type ServerStatus = {
  available: boolean;
  status: string;
  serverUrl: string;
  message?: string;
  demoMode?: boolean;
};

export default function ServerStatusIndicator() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        setLoading(true);
        // Use window.location.origin to ensure we have a valid absolute URL
        const origin =
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000";

        console.log("Checking Python server status...");
        const response = await fetch(
          `${origin}/api/python-server/status/check`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Server status response:", data);
          setStatus(data);
        } else {
          console.warn(
            "Server status check failed with status:",
            response.status,
          );
          const errorData = await response.json().catch(() => ({}));
          console.warn("Error details:", errorData);

          setStatus({
            available: false,
            status: "Demo Mode Active",
            serverUrl: "unknown",
            message:
              errorData.message || "Using sample images for demonstration",
            demoMode: true,
          });
        }
      } catch (error) {
        console.error("Error checking server status:", error);
        setStatus({
          available: false,
          status: "Demo Mode Active",
          serverUrl: "unknown",
          message: "Using sample images for demonstration",
          demoMode: true,
        });
      } finally {
        setLoading(false);
      }
    };

    checkServerStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Checking server...
      </Badge>
    );
  }

  // If in demo mode, show a different badge style
  if (status?.demoMode) {
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
              This demo uses sample images instead of real AI processing. In a
              production environment, this would connect to a real AI server.
            </p>
            <p className="text-xs mt-1">
              <strong>Note:</strong> All features work as expected, but
              generated images are pre-selected samples rather than AI-processed
              versions of your uploads.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={status?.available ? "default" : "destructive"}
            className={`${status?.available ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"} cursor-help`}
          >
            {status?.available ? "AI Server Online" : "AI Server Offline"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>
            <strong>Status:</strong> {status?.status}
          </p>
          <p>
            <strong>Server:</strong> {status?.serverUrl}
          </p>
          {status?.message && (
            <p>
              <strong>Info:</strong> {status.message}
            </p>
          )}
          {!status?.available && (
            <>
              <p className="text-xs mt-1">
                Using sample images instead of real AI processing.
              </p>
              <p className="text-xs mt-1">
                <strong>Troubleshooting:</strong> If you're expecting the AI
                server to be online, check that:
                <ul className="list-disc pl-4 mt-1">
                  <li>The Python server is running at the configured URL</li>
                  <li>
                    Network connectivity between the app and server is working
                  </li>
                  <li>The server is responding to status checks correctly</li>
                </ul>
              </p>
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
