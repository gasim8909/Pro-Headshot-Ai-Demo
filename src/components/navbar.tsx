import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import { Camera, UserCircle } from "lucide-react";
import dynamic from "next/dynamic";
import ServerAvatar from "./server-avatar";

// Dynamically import the UserProfile component with no SSR
// This ensures it only runs on the client where the context is available
const UserProfile = dynamic(() => import("./user-profile"), { ssr: false });

export default async function Navbar() {
  let user = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("Error fetching user:", error);
    // Continue with user as null
  }

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4 fixed top-0 left-0 right-0 z-50 h-16">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link
          href="/"
          prefetch
          className="text-xl font-bold flex items-center gap-2"
        >
          <Camera className="h-6 w-6 text-blue-600" />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
            AI Headshots
          </span>
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link
            href="#gallery"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/generate"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Try It Now
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              {/* Use client-side only UserProfile component */}
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors hidden md:block"
              >
                Sign In
              </Link>
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
