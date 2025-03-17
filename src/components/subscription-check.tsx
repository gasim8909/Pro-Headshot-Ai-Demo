import { redirect } from "next/navigation";
import { checkUserSubscription } from "@/app/actions";
import { createClient } from "../../supabase/server";

interface SubscriptionCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export async function SubscriptionCheck({
  children,
  redirectTo = "/pricing",
}: SubscriptionCheckProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  try {
    const isSubscribed = await checkUserSubscription(user?.id!);

    if (!isSubscribed) {
      redirect(redirectTo);
    }
  } catch (error) {
    console.error("Error in subscription check:", error);
    redirect(redirectTo);
  }

  return <>{children}</>;
}
