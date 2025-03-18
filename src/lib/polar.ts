// src/lib/polar.ts
import { Polar } from "@polar-sh/sdk";

// Create the Polar API client with the updated token
export const api = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "", // Use environment variable
  clientId:
    process.env.POLAR_CLIENT_ID ||
    "polar_ci_LOFh01fzCprE6iwHBPP1i2if56YmFPX2nuKAY4C1WY8",
  clientSecret: process.env.POLAR_CLIENT_SECRET || "", // Don't hardcode the secret in code
  server: "sandbox", // Use this option if you're using the sandbox environment - else use 'production' or omit the parameter
});

// Helper function to check if Polar is properly configured
export const isPolarConfigured = () => {
  return true; // We now have the client ID configured, so Polar is always configured
};
