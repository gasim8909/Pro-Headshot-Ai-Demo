"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

export default function GeminiTestPanel() {
  const [verifyStatus, setVerifyStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const [testStatus, setTestStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [testResult, setTestResult] = useState<any>(null);

  const verifyApiKey = async () => {
    try {
      setVerifyStatus("loading");
      const response = await fetch("/api/gemini/verify-key");
      const data = await response.json();

      setVerifyResult(data);
      setVerifyStatus(data.status === "success" ? "success" : "error");
    } catch (error) {
      console.error("Error verifying API key:", error);
      setVerifyResult({ error: error.message });
      setVerifyStatus("error");
    }
  };

  const testImageGeneration = async () => {
    try {
      setTestStatus("loading");
      const response = await fetch("/api/gemini/test");
      const data = await response.json();

      setTestResult(data);
      setTestStatus(data.status === "success" ? "success" : "error");
    } catch (error) {
      console.error("Error testing image generation:", error);
      setTestResult({ error: error.message });
      setTestStatus("error");
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto my-8 bg-white dark:bg-gray-950 shadow-md">
      <CardHeader>
        <CardTitle>Gemini API Test Panel</CardTitle>
        <CardDescription>
          Verify your Gemini API key and test image generation functionality
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">API Key Verification</h3>
            <Button
              onClick={verifyApiKey}
              disabled={verifyStatus === "loading"}
              variant="outline"
            >
              {verifyStatus === "loading" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify API Key
            </Button>
          </div>

          {verifyStatus !== "idle" && (
            <Alert
              variant={verifyStatus === "success" ? "default" : "destructive"}
            >
              {verifyStatus === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : verifyStatus === "error" ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {verifyStatus === "success"
                  ? "API Key Valid"
                  : verifyStatus === "error"
                    ? "API Key Invalid"
                    : "Checking..."}
              </AlertTitle>
              <AlertDescription>
                {verifyResult?.message || ""}
                {verifyResult?.error && (
                  <div className="mt-2 text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {verifyResult.error}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Image Generation Test</h3>
            <Button
              onClick={testImageGeneration}
              disabled={testStatus === "loading"}
              variant="outline"
            >
              {testStatus === "loading" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Test Generation
            </Button>
          </div>

          {testStatus !== "idle" && (
            <Alert
              variant={testStatus === "success" ? "default" : "destructive"}
            >
              {testStatus === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : testStatus === "error" ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {testStatus === "success"
                  ? "Image Generation Working"
                  : testStatus === "error"
                    ? "Image Generation Failed"
                    : "Testing..."}
              </AlertTitle>
              <AlertDescription>
                {testResult?.message || ""}
                {testResult?.imageSize && (
                  <div className="mt-1">Image size: {testResult.imageSize}</div>
                )}
                {testResult?.error && (
                  <div className="mt-2 text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
                    {testResult.error}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-gray-500">
          Last tested:{" "}
          {testResult?.timestamp
            ? new Date(testResult.timestamp).toLocaleString()
            : "Never"}
        </div>
        <Button variant="link" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </CardFooter>
    </Card>
  );
}
