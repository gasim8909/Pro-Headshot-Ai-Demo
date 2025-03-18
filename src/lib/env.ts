/**
 * Centralized environment variable access
 * This file provides a single source of truth for all environment variables
 */

// Supabase Configuration
export const SUPABASE_CONFIG = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  PROJECT_ID: process.env.SUPABASE_PROJECT_ID,
};

// Polar Configuration
export const POLAR_CONFIG = {
  ORGANIZATION_ID: process.env.POLAR_ORGANIZATION_ID,
  ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
  WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
  CLIENT_ID: process.env.POLAR_CLIENT_ID,
  CLIENT_SECRET: process.env.POLAR_CLIENT_SECRET,
};

// Gemini Configuration
export const GEMINI_CONFIG = {
  API_KEY: process.env.GEMINI_API_KEY,
  IS_ENABLED: !!process.env.GEMINI_API_KEY,
};

// Helper functions to check if services are properly configured
export const isSupabaseConfigured = () => {
  return !!SUPABASE_CONFIG.URL && !!SUPABASE_CONFIG.ANON_KEY;
};

export const isPolarConfigured = () => {
  return !!POLAR_CONFIG.ACCESS_TOKEN && !!POLAR_CONFIG.CLIENT_ID;
};

export const isGeminiConfigured = () => {
  return !!GEMINI_CONFIG.API_KEY;
};
