"use client";

import { Crown, Shirt, UserCircle } from "lucide-react";
import { useSubscription } from "./subscription-context";
import { createClient } from "../../supabase/client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface UserAvatarProps {
  className?: string;
}

export default function UserAvatar({ className = "" }: UserAvatarProps) {
  // Use try-catch to handle potential context errors
  let tier = "free";
  try {
    const subscription = useSubscription();
    tier = subscription?.tier || "free";
  } catch (error) {
    console.error("Error accessing subscription context:", error);
    // Fall back to free tier if context is not available
  }

  const [initial, setInitial] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        const user = data?.user;

        if (user && isMounted) {
          // Get user profile data to extract first name
          const { data: userData } = await supabase
            .from("users")
            .select("full_name, email")
            .eq("id", user.id)
            .single();

          if (userData?.full_name && isMounted) {
            // Get first letter of first name and make it uppercase
            setInitial(userData.full_name.charAt(0).toUpperCase());
          } else if (user.email && isMounted) {
            // Fallback to first letter of email
            setInitial(user.email.charAt(0).toUpperCase());
          } else if (isMounted) {
            // Default fallback
            setInitial("U");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (isMounted) setInitial("U");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Determine background color based on subscription tier
  const bgColor =
    tier === "premium"
      ? "bg-amber-100"
      : tier === "pro"
        ? "bg-blue-100"
        : "bg-gray-100";

  // Show loading state or fallback if no initial is set yet
  if (isLoading || !initial) {
    return (
      <Avatar className={`relative ${className}`}>
        <AvatarFallback className="bg-gray-100">
          <UserCircle className="h-5 w-5 text-gray-500" />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className={`relative ${className}`}>
      <AvatarFallback className={`${bgColor} font-semibold`}>
        {initial}
        {tier === "premium" && (
          <span className="absolute -top-1 -right-1 text-amber-500">
            <Crown className="h-3 w-3" />
          </span>
        )}
        {tier === "pro" && (
          <span className="absolute -top-1 -right-1 text-blue-600">
            <Shirt className="h-3 w-3" />
          </span>
        )}
      </AvatarFallback>
    </Avatar>
  );
}
