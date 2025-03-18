import DashboardNavbar from "@/components/dashboard-navbar";
import ManageSubscription from "@/components/manage-subscription";
import { SubscriptionCheck } from "@/components/subscription-check";
import GeminiStatusIndicator from "@/components/gemini-status-indicator";
import { InfoIcon, UserCircle, CreditCard, History } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { manageSubscriptionAction } from "../actions";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserHeadshotHistory from "@/components/user-headshot-history";
import Footer from "@/components/footer";
import SubscriptionBadge from "@/components/subscription-badge";
import dynamic from "next/dynamic";

// Dynamically import the UpdateSubscriptionForm component
const UpdateSubscriptionForm = dynamic(
  () => import("@/components/update-subscription-form"),
  { ssr: false },
);

// Import the UserSessionStorage component
const UserSessionStorage = dynamic(
  () => import("@/components/user-session-storage"),
  { ssr: false },
);

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // We should not attempt to access browser APIs like sessionStorage in a server component
  // This will be handled by client components that need the user data

  const result = await manageSubscriptionAction(user?.id);

  // Allow access even if there's no subscription result
  // This ensures free users can access the dashboard

  // We'll fetch subscription details only once during initial page load
  // and store them in sessionStorage for client components to use
  let subscriptionDetails = null;

  // Fetch subscription details - first check user's subscription field
  const { data: userData } = await supabase
    .from("users")
    .select("subscription, subscription_tier")
    .eq("id", user.id)
    .single();

  console.log("User data for subscription details:", userData);

  if (userData?.subscription) {
    // Get subscription by polar_id
    const { data: subData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("polar_id", userData.subscription)
      .single();

    if (subData) {
      subscriptionDetails = subData;
      console.log("Subscription details from user.subscription:", {
        polar_id: subscriptionDetails?.polar_id,
        status: subscriptionDetails?.status,
        price_id: subscriptionDetails?.polar_price_id,
        created_at: subscriptionDetails?.created_at,
        current_period_end: subscriptionDetails?.current_period_end,
        cancel_at: subscriptionDetails?.cancel_at,
      });
    }
  }

  // If no subscription found via polar_id, check directly by user_id
  if (!subscriptionDetails) {
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
        created_at: subscriptionDetails?.created_at,
        current_period_end: subscriptionDetails?.current_period_end,
        cancel_at: subscriptionDetails?.cancel_at,
      });
    }
  }

  return (
    <SubscriptionCheck requireSubscription={false}>
      <div className="min-h-screen flex flex-col">
        {/* Client component to safely store user data in sessionStorage */}
        <UserSessionStorage userId={user.id} userEmail={user.email} />
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
                  <Suspense
                    fallback={
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[1, 2, 3, 4, 5, 6].map((_, index) => (
                            <Card
                              key={index}
                              className="overflow-hidden animate-pulse"
                            >
                              <div className="aspect-[3/4] relative bg-gray-200"></div>
                              <CardContent className="p-4">
                                <div className="h-4 w-3/4 mb-2 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    }
                  >
                    <UserHeadshotHistory userId={user.id} />
                  </Suspense>
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

                    {/* Add the update subscription form */}
                    <div className="mt-4">
                      <Suspense
                        fallback={
                          <div className="p-4 bg-muted/30 rounded-lg animate-pulse">
                            Loading update form...
                          </div>
                        }
                      >
                        <div className="dynamic-import-wrapper">
                          <UpdateSubscriptionForm />
                        </div>
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
