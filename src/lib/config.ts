// Configuration values for the application

// Python server URL for image processing
// In containerized environments, we need to use a publicly accessible URL
// Default to a relative URL that will be resolved against the current origin
// Python server configuration removed as it's no longer needed

// Default timeout values (in milliseconds)
export const TIMEOUTS = {
  STATUS_CHECK: 2000, // 2 seconds for status checks
  PROCESSING: 60000, // 60 seconds for image processing
  GEMINI_PROCESSING: 120000, // 120 seconds for Gemini API processing
};

// Gemini API configuration
export const GEMINI_CONFIG = {
  // Whether to use Gemini API for image processing
  ENABLED: process.env.GEMINI_API_KEY ? true : false,
  // Default model for image generation
  MODEL: "gemini-2.0-flash-exp-image-generation",
  // Maximum number of concurrent requests to Gemini API
  MAX_CONCURRENT_REQUESTS: 1, // Reduced from 2 to avoid rate limiting
  // Timeout for Gemini API requests (in milliseconds)
  REQUEST_TIMEOUT: 90000, // 90 seconds (increased from 60)
  // Maximum retries for failed requests
  MAX_RETRIES: 3, // Increased from 2
  // Delay between batches (in milliseconds) to avoid rate limiting
  BATCH_DELAY: 3000,
};

// Import AI style prompts from dedicated file
import { getMockImagesByStyle } from "./ai-style-prompts";

// Mock data configuration
export const MOCK_DATA = {
  // Only use mock data if explicitly enabled or if in development mode and Gemini is not enabled
  ENABLED:
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" ||
    (process.env.NODE_ENV === "development" && !GEMINI_CONFIG.ENABLED),
  // Whether this is a demo mode (changes UI messaging)
  DEMO_MODE:
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    (process.env.NODE_ENV === "development" && !GEMINI_CONFIG.ENABLED),
  // Get mock images from the centralized style prompts file
  get STYLES() {
    return {
      professional: getMockImagesByStyle("professional"),
      creative: getMockImagesByStyle("creative"),
      casual: getMockImagesByStyle("casual"),
      modern: getMockImagesByStyle("modern"),
      executive: getMockImagesByStyle("executive"),
      vintage: getMockImagesByStyle("vintage"),
      dynamic: getMockImagesByStyle("dynamic"),
      monochrome: getMockImagesByStyle("monochrome"),
      fashion: getMockImagesByStyle("fashion"),
      outdoor: getMockImagesByStyle("outdoor"),
      minimalist: getMockImagesByStyle("minimalist"),
      environmental: getMockImagesByStyle("environmental"),
      bold: getMockImagesByStyle("bold"),
    };
  },
};

// Import style tiers from dedicated file
import { TIER_STYLES, StyleId } from "./ai-style-prompts";

// Subscription tiers configuration
// This is the central file that controls all subscription features
// Changes made here will automatically reflect throughout the application

// Guest tier - for users who are not logged in
export const GUEST_TIER = {
  name: "Guest",
  maxUploads: 5,
  maxVariations: 2,
  styles: TIER_STYLES.GUEST,
  advancedPrompting: false,
  customPrompting: false,
  monthlyCredits: 5,
  downloadFormats: ["JPEG"],
  hasHistoryAccess: false,
  support: "Community access only",
  description: "Limited access for non-registered users",
  lifetimeUploads: true, // Indicates this is a lifetime limit, not monthly
};

// Main subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: "Free",
    maxUploads: 10,
    maxVariations: 4,
    styles: TIER_STYLES.FREE,
    advancedPrompting: false,
    customPrompting: false,
    monthlyCredits: 10,
    downloadFormats: ["JPEG"],
    hasHistoryAccess: false,
    support: "Community & knowledge base access",
    description: "Great for occasional users and trial experiences",
  },
  PREMIUM: {
    name: "Premium",
    maxUploads: 30,
    maxVariations: 6,
    styles: TIER_STYLES.PREMIUM,
    advancedPrompting: false,
    customPrompting: true,
    monthlyCredits: 30,
    downloadFormats: ["JPEG", "PNG", "TIFF"],
    hasHistoryAccess: true,
    support: "Priority email support within 48 hours",
    description: "Perfect for professionals needing enhanced flexibility",
  },
  PRO: {
    name: "Pro",
    maxUploads: 100,
    maxVariations: 10,
    styles: TIER_STYLES.PRO,
    advancedPrompting: true,
    customPrompting: true,
    monthlyCredits: 100,
    downloadFormats: ["JPEG", "PNG", "TIFF", "RAW"],
    hasHistoryAccess: true,
    teamAccess: true,
    support:
      "Personal account manager with priority chat/email support within 24 hours",
    description:
      "Ideal for businesses, recruiters, executives, and frequent users requiring maximum flexibility",
  },
};

// Helper functions to get tier features
export const getTierFeatures = (tier: string, isGuest: boolean = false) => {
  if (isGuest) return GUEST_TIER;

  const tierKey = tier.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS;
  return SUBSCRIPTION_TIERS[tierKey] || SUBSCRIPTION_TIERS.FREE;
};

// API response values based on tier
export const getTierAPIValues = (tier: string, isGuest: boolean = false) => {
  if (isGuest) {
    return {
      tier: "free",
      isSubscribed: false,
      isGuest: true,
      maxGenerations: GUEST_TIER.maxVariations,
      maxUploads: GUEST_TIER.maxUploads,
      hasAdvancedStyles: GUEST_TIER.advancedPrompting,
      hasHistoryAccess: GUEST_TIER.hasHistoryAccess,
    };
  }

  const tierKey = tier.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS;
  const tierData = SUBSCRIPTION_TIERS[tierKey] || SUBSCRIPTION_TIERS.FREE;

  return {
    tier: tier.toLowerCase(),
    isSubscribed: tier.toLowerCase() !== "free",
    isGuest: false,
    maxGenerations: tierData.maxVariations,
    maxUploads: tierData.maxUploads,
    hasAdvancedStyles: tierData.advancedPrompting,
    hasHistoryAccess: tierData.hasHistoryAccess || false,
  };
};
