"use client";

import { useToast } from "./ui/use-toast";

export default function UpdateSubscriptionForm() {
  const { toast } = useToast();

  const handleUpdateSubscription = async () => {
    toast({
      title: "Feature disabled",
      description:
        "Subscription updates have been disabled. Please contact support to change your subscription.",
      variant: "destructive",
    });
  };

  return <div className="space-y-4 p-4 bg-muted/30 rounded-lg"></div>;
}
