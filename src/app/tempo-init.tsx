"use client";

// Import the dev tools and initialize them
import { TempoDevtools } from "tempo-devtools";
import { useEffect } from "react";

export function TempoInit() {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_TEMPO) {
      try {
        TempoDevtools.init();
      } catch (error) {
        console.error("Error initializing Tempo devtools:", error);
      }
    }
  }, []);

  return null;
}
