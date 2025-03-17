import { createClient } from "../../../supabase/server";
import DashboardNavbar from "@/components/dashboard-navbar";
import UploadForm from "@/components/upload-form";
import Footer from "@/components/footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import Link from "next/link";
import GeminiStatusIndicator from "@/components/gemini-status-indicator";

export default async function GeneratePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-center sm:text-left">
            Generate AI Headshots
          </h1>
          <GeminiStatusIndicator />
        </div>

        {!user && (
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-blue-800">Guest Mode</AlertTitle>
            <AlertDescription className="text-blue-700">
              You're using the tool as a guest.{" "}
              <Link href="/sign-up" className="font-medium underline">
                Sign up
              </Link>{" "}
              or{" "}
              <Link href="/sign-in" className="font-medium underline">
                log in
              </Link>{" "}
              to save your generated images and access them anytime.
            </AlertDescription>
          </Alert>
        )}

        <div className="max-w-3xl mx-auto">
          <UploadForm user={user} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
