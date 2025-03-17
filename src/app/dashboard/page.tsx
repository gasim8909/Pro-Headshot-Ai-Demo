import DashboardNavbar from "@/components/dashboard-navbar";
import ManageSubscription from "@/components/manage-subscription";
import { SubscriptionCheck } from "@/components/subscription-check";
import GeminiStatusIndicator from "@/components/gemini-status-indicator";
import { InfoIcon, UserCircle, CreditCard, History } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { manageSubscriptionAction } from "../actions";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserHeadshotHistory from "@/components/user-headshot-history";
import Footer from "@/components/footer";
import SubscriptionBadge from "@/components/subscription-badge";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const result = await manageSubscriptionAction(user?.id);

  if (!result) {
    return redirect("/pricing");
  }

  // Fetch subscription details
  const { data: userData } = await supabase
    .from("users")
    .select("subscription")
    .eq("user_id", user.id)
    .single();

  let subscriptionDetails = null;
  if (userData?.subscription) {
    const { data: subData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("polar_id", userData.subscription)
      .single();

    subscriptionDetails = subData;
    console.log("Subscription details from user.subscription:", {
      polar_id: subscriptionDetails?.polar_id,
      status: subscriptionDetails?.status,
      price_id: subscriptionDetails?.polar_price_id,
    });
  } else {
    // Fallback to checking subscriptions table directly
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (subs && subs.length > 0) {
      subscriptionDetails = subs[0];
      console.log("Subscription details from direct query:", {
        polar_id: subscriptionDetails?.polar_id,
        status: subscriptionDetails?.status,
        price_id: subscriptionDetails?.polar_price_id,
      });
    }
  }

  return (
    <SubscriptionCheck>
      <div className="min-h-screen flex flex-col">
        <DashboardNavbar />
        <main className="w-full pt-24 flex-grow">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">AI Headshot Dashboard</h1>
                <GeminiStatusIndicator />
              </div>
              <Suspense fallback={<div>Loading...</div>}>
                {result?.url && (
                  <ManageSubscription redirectUrl={result?.url!} />
                )}
              </Suspense>
            </div>

            <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
              <InfoIcon size="14" />
              <span>
                Welcome to your AI Headshot dashboard. Upload photos to generate
                professional headshots.
              </span>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2"
                >
                  <UserCircle className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="subscription"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Subscription
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <div className="bg-card rounded-xl p-6 border shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <UserCircle size={48} className="text-primary" />
                    <div>
                      <h2 className="font-semibold text-xl">User Profile</h2>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">
                          Account Information
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Full Name
                            </span>
                            <span className="text-sm">
                              {user.user_metadata?.full_name || "Not provided"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Email</span>
                            <span className="text-sm">{user.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Email Verified
                            </span>
                            <span className="text-sm">
                              {user.email_confirmed_at ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">
                          Account Activity
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Created</span>
                            <span className="text-sm">
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Last Sign In
                            </span>
                            <span className="text-sm">
                              {new Date(
                                user.last_sign_in_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <div className="bg-card rounded-xl p-6 border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">
                    Generation History
                  </h2>
                  <UserHeadshotHistory userId={user.id} />
                </div>
              </TabsContent>

              <TabsContent value="subscription" className="mt-6">
                <div className="bg-card rounded-xl p-6 border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">
                    Subscription Details
                  </h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Current Plan</p>
                        <div className="mt-1">
                          <SubscriptionBadge />
                        </div>
                      </div>
                      <Suspense fallback={<div>Loading...</div>}>
                        {result?.url && (
                          <ManageSubscription redirectUrl={result?.url!} />
                        )}
                      </Suspense>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium mb-2">Subscription Period</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p>
                            {subscriptionDetails?.created_at
                              ? new Date(
                                  subscriptionDetails.created_at,
                                ).toLocaleDateString()
                              : "Not available"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p>
                            {subscriptionDetails?.current_period_end
                              ? new Date(
                                  subscriptionDetails.current_period_end,
                                ).toLocaleDateString()
                              : subscriptionDetails?.cancel_at
                                ? new Date(
                                    subscriptionDetails.cancel_at,
                                  ).toLocaleDateString()
                                : "Not available"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {subscriptionDetails && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="font-medium mb-2">Subscription Status</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Status</p>
                            <p className="capitalize">
                              {subscriptionDetails.status || "Unknown"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Auto Renewal
                            </p>
                            <p>
                              {subscriptionDetails.cancel_at_period_end ===
                              false
                                ? "Enabled"
                                : "Disabled"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </SubscriptionCheck>
  );
}
