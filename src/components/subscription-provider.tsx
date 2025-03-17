"use client";

import { ReactNode } from "react";
import { SubscriptionProvider as Provider } from "./subscription-context";

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
