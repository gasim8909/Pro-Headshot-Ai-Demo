// Configuration values for the application

// Python server URL for image processing
// In containerized environments, we need to use a publicly accessible URL
// Default to a relative URL that will be resolved against the current origin
export const PYTHON_SERVER_URL =
  process.env.NEXT_PUBLIC_PYTHON_SERVER_URL || "/api/python-server";

// Only use the proxy if explicitly enabled
export const USE_PYTHON_PROXY =
  process.env.NEXT_PUBLIC_USE_PYTHON_PROXY === "true";

// If proxy is enabled, use it instead of the direct server endpoint
export const ACTIVE_PYTHON_SERVER_URL = USE_PYTHON_PROXY
  ? "/api/python-proxy"
  : PYTHON_SERVER_URL;

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
  STYLES: {
    professional: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=90&fit=crop",
    ],
    creative: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1573497019236-61e7a0081f95?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=90&fit=crop",
    ],
    casual: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=90&fit=crop",
    ],
    modern: [
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1629425733761-caae3b5f2e50?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=800&q=90&fit=crop",
    ],
    executive: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=90&fit=crop",
    ],
    business: [
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=90&fit=crop",
    ],
    corporate: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=90&fit=crop",
    ],
    artistic: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=90&fit=crop",
    ],
    minimalist: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&q=90&fit=crop",
    ],
    outdoor: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=90&fit=crop",
    ],
  },
};

// Subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: "Free",
    maxUploads: 5,
    maxVariations: 4,
    styles: ["professional", "casual", "creative"],
    advancedPrompting: false,
    customPrompting: false,
    monthlyCredits: 5,
    downloadFormats: ["JPEG"],
    support: "Community & knowledge base access",
    description: "Great for occasional users and trial experiences",
  },
  PREMIUM: {
    name: "Premium",
    maxUploads: 20,
    maxVariations: 10,
    styles: [
      "professional",
      "casual",
      "creative",
      "modern",
      "executive",
      "business",
      "corporate",
      "artistic",
      "minimalist",
      "outdoor",
    ],
    advancedPrompting: false,
    customPrompting: true,
    monthlyCredits: 20,
    downloadFormats: ["JPEG", "PNG", "TIFF"],
    support: "Priority email support within 48 hours",
    description: "Perfect for professionals needing enhanced flexibility",
  },
  PRO: {
    name: "Pro",
    maxUploads: "Unlimited",
    maxVariations: "Unlimited",
    styles: [
      "professional",
      "casual",
      "creative",
      "modern",
      "executive",
      "business",
      "corporate",
      "artistic",
      "minimalist",
      "outdoor",
    ],
    advancedPrompting: true,
    customPrompting: true,
    monthlyCredits: 999999,
    downloadFormats: ["JPEG", "PNG", "TIFF", "RAW"],
    teamAccess: true,
    support:
      "Personal account manager with priority chat/email support within 24 hours",
    description:
      "Ideal for businesses, recruiters, executives, and frequent users requiring maximum flexibility",
  },
};
