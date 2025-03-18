// src/lib/polar.ts
import { Polar } from "@polar-sh/sdk";

// Create the Polar API client with environment variables
export const api = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  clientId: process.env.POLAR_CLIENT_ID || "",
  clientSecret: process.env.POLAR_CLIENT_SECRET || "",
  server: "sandbox", // Use this option if you're using the sandbox environment - else use 'production' or omit the parameter
});

// Helper function to check if Polar is properly configured
export const isPolarConfigured = () => {
  return !!process.env.POLAR_ACCESS_TOKEN && !!process.env.POLAR_CLIENT_ID;
};
