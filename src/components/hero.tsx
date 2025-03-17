import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              Professional{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                AI Headshots
              </span>{" "}
              in Minutes
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Transform your ordinary photos into stunning professional
              headshots with our AI-powered platform. Perfect for LinkedIn,
              resumes, and professional profiles.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg h-auto"
              >
                <Link href="/dashboard">
                  Try For Free
                  <ArrowUpRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg h-auto"
              >
                <Link href="#gallery">View Examples</Link>
              </Button>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>5 free headshots</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Instant results</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
