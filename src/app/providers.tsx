"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { SubscriptionProvider } from "@/components/subscription-provider";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SubscriptionProvider>{children}</SubscriptionProvider>
    </ThemeProvider>
  );
}
