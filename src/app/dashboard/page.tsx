import DashboardNavbar from "@/components/dashboard-navbar";
import ManageSubscription from "@/components/manage-subscription";
import { SubscriptionCheck } from "@/components/subscription-check";
import {
  InfoIcon,
  UserCircle,
  Upload,
  Image as ImageIcon,
  History,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { manageSubscriptionAction } from "../actions";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadForm from "@/components/upload-form";
import HeadshotGallery from "@/components/headshot-gallery";

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

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <main className="w-full pt-16">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">AI Headshot Dashboard</h1>
            <Suspense fallback={<div>Loading...</div>}>
              {result?.url && <ManageSubscription redirectUrl={result?.url!} />}
            </Suspense>
          </div>

          <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
            <InfoIcon size="14" />
            <span>
              Welcome to your AI Headshot dashboard. Upload photos to generate
              professional headshots.
            </span>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              <UploadForm />
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              <HeadshotGallery images={[]} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">
                  Generation History
                </h2>
                <p className="text-muted-foreground">
                  You haven't generated any headshots yet. Upload photos to get
                  started!
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* User Profile Section */}
          <section className="bg-card rounded-xl p-6 border shadow-sm mt-8">
            <div className="flex items-center gap-4 mb-6">
              <UserCircle size={48} className="text-primary" />
              <div>
                <h2 className="font-semibold text-xl">User Profile</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
              <pre className="text-xs font-mono max-h-48 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
