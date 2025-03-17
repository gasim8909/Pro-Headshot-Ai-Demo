/**
 * Helper function to create absolute URLs from relative paths
 * Works in both client and server environments
 */
export function getAbsoluteUrl(relativePath: string): string {
  // Remove leading slash if present to avoid double slashes
  const path = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;

  // In browser environment
  if (typeof window !== "undefined") {
    return `${window.location.origin}/${path}`;
  }

  // In server environment
  const origin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return `${origin}/${path}`;
}
