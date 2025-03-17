"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { SubscriptionProvider } from "@/components/subscription-provider";
import { CreditsProvider } from "@/components/client-credits-provider";
import { ReactNode, useEffect, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
  // Add client-side only rendering to prevent hydration issues
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration errors by only rendering providers on client
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SubscriptionProvider>
        <CreditsProvider>{children}</CreditsProvider>
      </SubscriptionProvider>
    </ThemeProvider>
  );
}
