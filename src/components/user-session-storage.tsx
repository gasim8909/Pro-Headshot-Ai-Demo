"use client";

import { useEffect } from "react";

interface UserSessionStorageProps {
  userId: string;
  userEmail: string | undefined;
}

// This client component safely stores user data in sessionStorage
export default function UserSessionStorage({
  userId,
  userEmail,
}: UserSessionStorageProps) {
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "current-user",
        JSON.stringify({
          id: userId,
          email: userEmail,
          timestamp: Date.now(),
        }),
      );
    } catch (e) {
      console.error("Failed to store user in sessionStorage", e);
    }
  }, [userId, userEmail]);

  // This component doesn't render anything
  return null;
}
