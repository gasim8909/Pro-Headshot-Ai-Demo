"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { UserCircle, Home, Camera, Settings, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4 fixed top-0 left-0 right-0 z-50 h-16">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
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
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <Link
            href="/generate"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <Camera className="h-4 w-4" />
            Generate
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <CreditCard className="h-4 w-4" />
            Pricing
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 flex items-center justify-between">
                <span className="text-sm font-medium">Account</span>
              </div>
              <DropdownMenuItem>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 w-full"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.refresh();
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
