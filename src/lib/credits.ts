import { GUEST_TIER, SUBSCRIPTION_TIERS } from "./config";

// Constants for credit limits - derived from central subscription tiers config
export const CREDIT_LIMITS = {
  guest: GUEST_TIER.monthlyCredits, // Credits for guest users
  free: SUBSCRIPTION_TIERS.FREE.monthlyCredits, // Credits for free tier (registered users)
  premium: SUBSCRIPTION_TIERS.PREMIUM.monthlyCredits, // Credits for premium tier
  pro: SUBSCRIPTION_TIERS.PRO.monthlyCredits, // Credits for pro tier
};

// Constants for local storage keys
const GUEST_CREDITS_KEY = "gemini_flash_guest_credits";
const GUEST_CREDITS_RESET_KEY = "gemini_flash_guest_credits_reset_date";

// Function to get the current month as a string (e.g., '2023-05')
export const getCurrentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

// Initialize guest credits in local storage if not present
export const initGuestCredits = () => {
  if (typeof window === "undefined") return null;

  const currentMonth = getCurrentMonth();
  const storedResetDate = localStorage.getItem(GUEST_CREDITS_RESET_KEY);

  // If it's a new month or no credits exist yet, reset credits
  if (!storedResetDate || storedResetDate !== currentMonth) {
    localStorage.setItem(GUEST_CREDITS_KEY, String(CREDIT_LIMITS.guest));
    localStorage.setItem(GUEST_CREDITS_RESET_KEY, currentMonth);
    return CREDIT_LIMITS.guest;
  }

  // Return existing credits
  const credits = localStorage.getItem(GUEST_CREDITS_KEY);
  return credits ? parseInt(credits, 10) : CREDIT_LIMITS.guest;
};

// Decrement guest credits when used
export const useGuestCredit = () => {
  if (typeof window === "undefined") return false;

  const credits = initGuestCredits();
  if (credits <= 0) return false;

  localStorage.setItem(GUEST_CREDITS_KEY, String(credits - 1));
  return true;
};

// Get remaining guest credits
export const getGuestCreditsRemaining = () => {
  if (typeof window === "undefined") return 0;

  const credits = initGuestCredits();
  return credits;
};
