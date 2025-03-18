"use client";

import { useState, useEffect } from "react";
import { useSubscription } from "./subscription-context";
import { Button } from "./ui/button";
import { GradientButton } from "./ui/gradient-button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  Save,
  Camera,
  Sparkles,
  Download,
  Lock,
  CheckCircle,
  Info,
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import SaveToHistoryButton from "./save-to-history-button";
import { ErrorMessage } from "./error-message";
import { Shimmer } from "./ui/shimmer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Badge } from "./ui/badge";
import { CreditIndicator } from "./credit-indicator";
import { SUBSCRIPTION_TIERS } from "@/lib/config";
import { useCredits } from "./client-credits-provider";
import { CreditDisplay } from "./credit-display";
import { AI_STYLE_PROMPTS, StyleId, TIER_STYLES } from "@/lib/ai-style-prompts";

export default function UploadForm({ user }: { user?: User | null }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [style, setStyle] = useState<StyleId>("professional");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<{
    title: string;
    message: string;
    severity: "error" | "warning" | "info";
  } | null>(null);

  // Define subscription features based on tier
  const subscriptionFeatures = {
    free: SUBSCRIPTION_TIERS.FREE,
    premium: SUBSCRIPTION_TIERS.PREMIUM,
    pro: SUBSCRIPTION_TIERS.PRO,
  };

  // Get subscription data
  const {
    isSubscribed,
    tier: subscriptionTier,
    maxUploads,
    maxGenerations,
    hasAdvancedStyles,
    isGuest, // Get isGuest directly from subscription context
    refreshSubscription,
  } = useSubscription();

  // Also get the guest status from credits provider for backward compatibility
  const { isGuest: creditsIsGuest, refreshCredits } = useCredits();

  // Force refresh credits and subscription when component mounts or user changes
  useEffect(() => {
    console.log(
      "UploadForm: User changed, refreshing credits and subscription. User present:",
      !!user,
    );
    refreshCredits();

    // Force refresh subscription data to ensure we have the latest tier
    if (refreshSubscription) {
      refreshSubscription(true);
    }
  }, [user, refreshCredits, refreshSubscription]);

  // Use the isGuest value from subscription context
  // This simplifies the logic - if not logged in, user is a guest with limited features
  const actualMaxUploads = isGuest ? 5 : maxUploads;

  // Ensure we're using the correct number of variations based on subscription tier
  // Force premium users to get 6 images and pro users to get 10
  let actualMaxVariations = 4; // Default for free tier
  if (!isGuest) {
    if (subscriptionTier === "premium") actualMaxVariations = 6;
    else if (subscriptionTier === "pro") actualMaxVariations = 10;
    else actualMaxVariations = maxGenerations; // Fallback to context value
  } else {
    actualMaxVariations = 2; // Guest users get 2 variations
  }

  // Log the subscription information for debugging
  console.log(
    `UploadForm determined actualMaxVariations: ${actualMaxVariations} based on tier: ${subscriptionTier}, isGuest: ${isGuest}`,
  );

  // Force refresh subscription data when component mounts to ensure we have the latest tier
  useEffect(() => {
    console.log("UploadForm: Initial subscription refresh");
    if (refreshSubscription) {
      refreshSubscription(true);
    }
  }, [refreshSubscription]);

  // Log subscription information for debugging
  console.log(
    `UploadForm: User subscription info - tier: ${subscriptionTier}, isGuest: ${isGuest}, maxGenerations: ${maxGenerations}, actualMaxVariations: ${actualMaxVariations}`,
  );

  // Additional debug logging
  useEffect(() => {
    console.log(
      `UploadForm: Subscription tier changed to ${subscriptionTier}, maxGenerations=${maxGenerations}`,
    );
  }, [subscriptionTier, maxGenerations]);

  // Use the correct tier based on guest status
  const tier = isGuest ? "free" : subscriptionTier;

  // State for tracking credits
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Limit files based on subscription tier and user status
      const selectedFiles = Array.from(e.target.files).slice(
        0,
        actualMaxUploads,
      );
      setFiles(selectedFiles);

      // Create previews
      const newPreviews = selectedFiles.map((file) =>
        URL.createObjectURL(file),
      );
      setPreviews(newPreviews);

      // Show warning if more files were selected than allowed by subscription
      if (e.target.files.length > actualMaxUploads) {
        setError({
          title: "Too many files",
          message: `You can only upload ${actualMaxUploads} files with your current plan.`,
          severity: "warning",
        });
      } else {
        setError(null);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    // Create new arrays without the removed file
    const newFiles = [...files];
    const newPreviews = [...previews];

    // Remove the file and its preview
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    // Update state
    setFiles(newFiles);
    setPreviews(newPreviews);

    // Clear any error messages if we're now under the limit
    if (newFiles.length <= 5 && error?.title === "Too many files") {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsGenerating(true);
    setGenerationProgress(5); // Start with a small percentage to show immediate feedback
    setGeneratedImages([]);
    setError(null);

    try {
      // Validate files
      if (files.length === 0) {
        setError({
          title: "No files selected",
          message: "Please select at least one photo to generate headshots.",
          severity: "error",
        });
        setIsLoading(false);
        return;
      }

      // Check file sizes
      const oversizedFiles = files.filter(
        (file) => file.size > 10 * 1024 * 1024,
      );
      if (oversizedFiles.length > 0) {
        setError({
          title: "Files too large",
          message: `${oversizedFiles.length} file(s) exceed the 10MB limit. Please select smaller files.`,
          severity: "error",
        });
        setIsLoading(false);
        return;
      }

      // Check if user has credits available
      let hasCredits = false;

      if (user?.id) {
        // For logged in users, use server action
        const { checkAndUseCredit } = await import("@/app/actions");
        hasCredits = await checkAndUseCredit(user?.id);
      } else {
        // For guests, use client-side function
        const { useGuestCredit } = await import("@/lib/credits");
        hasCredits = useGuestCredit();
      }

      if (!hasCredits) {
        setError({
          title: "Credit Limit Reached",
          message:
            tier === "free"
              ? "You've reached your monthly limit of 5 uploads. Upgrade to Premium for more."
              : "You've reached your monthly upload limit. Please wait until next month or contact support.",
          severity: "error",
        });
        setIsLoading(false);
        return;
      }

      // Create form data to send to API
      const formData = new FormData();

      // Add all files to form data
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Add prompt and style to form data
      formData.append("prompt", prompt);
      formData.append("style", style);
      formData.append("userId", user?.id || "guest");
      formData.append("tier", tier); // Add tier information to form data

      // Add authorization header if user is logged in
      const headers: HeadersInit = {};
      if (user?.id) {
        try {
          // Use the createClient directly from Supabase
          const { createClientComponentClient } = await import(
            "@supabase/supabase-js"
          );
          const supabase = createClientComponentClient();
          const { data } = await supabase.auth.getSession();
          const session = data.session;

          if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
            // Also add it as a custom header to ensure it's not lost
            headers["X-Supabase-Auth"] = session.access_token;
            console.log(
              "Added authorization headers with token:",
              session.access_token.substring(0, 10) + "...",
            );
          } else {
            console.log(
              "No access token found in session - user may not be properly authenticated",
            );
          }
        } catch (error) {
          console.error("Error getting auth session:", error);
        }
      }

      // Send to our Next.js API endpoint
      console.log("Sending request to API endpoint");
      console.log(
        "User authenticated:",
        !!user,
        "User ID:",
        user?.id || "guest",
        "Tier:",
        tier,
      );
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

      // Show a more detailed loading message
      setError({
        title: "Processing Images",
        message:
          "Uploading and processing your images. This may take a moment...",
        severity: "info",
      });

      // Update progress to show we're about to make the API call
      setGenerationProgress(15);

      // Make sure to include credentials to send cookies
      const response = await fetch(`${origin}/api/generate`, {
        method: "POST",
        body: formData,
        headers,
        credentials: "include", // This ensures cookies are sent with the request
      });

      console.log(
        "API response status:",
        response.status,
        "headers sent:",
        Object.keys(headers),
      );

      console.log("API response status:", response.status);

      // Update progress to show we've received a response
      setGenerationProgress(30);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API responded with status: ${response.status}`,
        );
      }

      // Clear the info message
      setError(null);

      const data = await response.json();
      console.log("Processing result:", {
        source: data?.source || "unknown",
        serverUrl: data?.serverUrl || "unknown",
        imageCount: data?.images?.length || 0,
      });

      // Check if we have images
      if (!data.images || data.images.length === 0) {
        throw new Error("No images were generated. Please try again.");
      }

      // Validate image URLs before setting them
      const validImages = data.images.filter((img) => {
        // Check if it's a valid URL or base64 string
        return (
          typeof img === "string" &&
          (img.startsWith("http") || img.startsWith("data:image"))
        );
      });

      console.log("Valid images count:", validImages.length);
      console.log(
        "First image format check:",
        validImages[0]?.substring(0, 30) + "...",
      );

      if (validImages.length === 0) {
        throw new Error("The generated images were invalid. Please try again.");
      }

      // Set initial progress to show something is happening
      setGenerationProgress(20);

      // Update progress to show API processing is happening
      setTimeout(() => setGenerationProgress(40), 800);
      setTimeout(() => setGenerationProgress(60), 1600);

      // Simulate progressive loading of images
      // In a real implementation, this would be replaced with streaming from the server
      const maxImagesToShow = actualMaxVariations;
      const imagesToShow = validImages.slice(0, maxImagesToShow);

      // Show images progressively
      for (let i = 0; i < imagesToShow.length; i++) {
        // Add a small delay between each image to simulate progressive loading
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update the images array with each new image
        setGeneratedImages((prev) => [...prev, imagesToShow[i]]);
        // Calculate progress based on initial API work (60%) plus image loading (40%)
        const imageLoadingProgress = Math.round(
          ((i + 1) / maxImagesToShow) * 40,
        );
        setGenerationProgress(60 + imageLoadingProgress);
      }

      setIsGenerated(true);

      // If we're using mock data, show an informative message (not an error)
      if (data?.source === "mock-data" || data?.demoMode) {
        console.log("Using sample images in demo mode");
        // In demo mode, we don't show an alert as this is expected behavior
        if (data?.error && !data?.demoMode) {
          setError({
            title: "Demo Mode Active",
            message:
              "Using sample images for demonstration. In a production environment, your photos would be processed by AI.",
            severity: "info",
          });
        }
      }
    } catch (err) {
      console.error("Error generating images:", err);

      // Determine the type of error and set appropriate message
      if (
        err.message.includes("NetworkError") ||
        err.message.includes("Failed to fetch")
      ) {
        setError({
          title: "Network Error",
          message:
            "Unable to connect to the server. Please check your internet connection and try again.",
          severity: "error",
        });
      } else if (err.message.includes("timeout")) {
        setError({
          title: "Request Timeout",
          message:
            "The server took too long to respond. Please try again later.",
          severity: "error",
        });
      } else if (
        err.message.includes("413") ||
        err.message.includes("Payload Too Large")
      ) {
        setError({
          title: "Files Too Large",
          message:
            "The total size of your uploaded files is too large. Please try with fewer or smaller images.",
          severity: "error",
        });
      } else {
        setError({
          title: "Generation Failed",
          message: `Unable to generate headshots: ${err.message}. Please try again or contact support if the issue persists.`,
          severity: "error",
        });
      }
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPreviews([]);
    setPrompt("");
    setGeneratedImages([]);
    setIsGenerated(false);
    setStyle("professional");
    // Refresh credits after reset
    fetchCreditsRemaining();
  };

  // Fetch remaining credits
  const fetchCreditsRemaining = async () => {
    try {
      if (user?.id) {
        // For logged in users, fetch from server action
        const { getRemainingCreditsAction } = await import("@/app/actions");
        const {
          credits,
          tier,
          isGuest: userIsGuest,
        } = await getRemainingCreditsAction(user?.id);
        console.log(
          "fetchCreditsRemaining: Got credits for logged-in user:",
          credits,
          "tier:",
          tier,
          "isGuest:",
          userIsGuest,
        );
        setCreditsRemaining(credits);
      } else {
        // For guests, use localStorage
        const { getGuestCreditsRemaining } = await import("@/lib/credits");
        const credits = getGuestCreditsRemaining();
        console.log(
          "fetchCreditsRemaining: Got credits for guest user:",
          credits,
        );
        setCreditsRemaining(credits);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  // Fetch credits on component mount or when user changes
  useEffect(() => {
    console.log(
      "UploadForm: Fetching credits remaining. User ID:",
      user?.id || "guest",
    );
    fetchCreditsRemaining();
  }, [user?.id]);

  if (isLoading && !isGenerating) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Generating Your AI Headshots</CardTitle>
          <CardDescription>
            Please wait while we process your photos and create professional
            headshots.
            {!user && (
              <span className="block mt-2 font-medium text-blue-600">
                <Link href="/sign-up" className="underline">
                  Sign up
                </Link>{" "}
                or{" "}
                <Link href="/sign-in" className="underline">
                  log in
                </Link>{" "}
                to save these images to your account.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group bg-white border border-gray-100"
                >
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <Shimmer className="w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                      <span className="text-white font-medium text-sm">
                        {AI_STYLE_PROMPTS[style].name} Style
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-white flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        <Shimmer className="h-4 w-24" />
                      </span>
                    </div>
                    <Shimmer className="h-8 w-20 rounded-md" />
                  </div>
                </div>
              ))}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mt-6 mb-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full w-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full"></div>
            </div>
          </div>
          <p className="text-sm text-center text-gray-500">
            Processing your images...{" "}
            <span className="inline-block animate-pulse">•••</span>
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            disabled={true}
            variant="outline"
            className="flex items-center gap-2 opacity-50"
          >
            <Camera className="h-4 w-4" />
            Generate More
          </Button>

          {!user && (
            <GradientButton disabled={true} className="opacity-50" asChild>
              <Link href="/sign-up">
                <Save className="mr-2 h-4 w-4" />
                Sign Up to Save Images
              </Link>
            </GradientButton>
          )}
        </CardFooter>
      </Card>
    );
  }

  if (isGenerating || isGenerated) {
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
            {isGenerating
              ? "Generating Your AI Headshots..."
              : "Your AI Headshots Are Ready!"}
          </CardTitle>
          <CardDescription>
            {isGenerating ? (
              <>
                Please wait while we generate your professional headshots.
                <div className="mt-2 w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full relative transition-all duration-300 ease-in-out"
                    style={{ width: `${generationProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full"></div>
                  </div>
                </div>
                <p className="text-sm mt-1">{generationProgress}% complete</p>
              </>
            ) : (
              <>
                Here are your professionally generated AI headshots.
                {!user && (
                  <span className="block mt-2 font-medium text-blue-600">
                    <Link href="/sign-up" className="underline">
                      Sign up
                    </Link>{" "}
                    or{" "}
                    <Link href="/sign-in" className="underline">
                      log in
                    </Link>{" "}
                    to save these images to your account.
                  </span>
                )}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Show loading placeholders for images not yet generated */}
            {isGenerating &&
              generatedImages.length < actualMaxVariations &&
              Array(actualMaxVariations - generatedImages.length)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={`loading-${index}`}
                    className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group bg-white border border-gray-100"
                  >
                    <div className="aspect-[4/5] relative overflow-hidden">
                      <Shimmer className="w-full h-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                        <span className="text-white font-medium text-sm">
                          {AI_STYLE_PROMPTS[style].name} Style
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-white flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          <Shimmer className="h-4 w-24" />
                        </span>
                      </div>
                      <Shimmer className="h-8 w-20 rounded-md" />
                    </div>
                  </div>
                ))}

            {/* Show generated images */}
            {generatedImages.map((image, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group bg-white border border-gray-100 relative"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={image}
                    alt={`AI Headshot ${index + 1}`}
                    className={`object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 object-center ${!user && index >= 2 ? "blur-sm" : ""}`}
                    style={{ objectPosition: "center" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                    <span className="text-white font-medium text-sm">
                      {AI_STYLE_PROMPTS[style].name} Style
                    </span>
                  </div>

                  {/* Sign-up overlay for locked images (for guests, show only 2 and lock the rest) */}
                  {!user && index >= 2 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-center">
                      <Lock className="h-8 w-8 text-white mb-2" />
                      <h3 className="text-sm font-bold text-white mb-1">
                        Sign Up to Unlock
                      </h3>
                      <p className="text-white/90 text-xs mb-3">
                        Create a free account to access all headshots
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs bg-white/20 text-white hover:bg-white/30 border-white/40"
                          asChild
                        >
                          <Link href="/sign-in">Sign In</Link>
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                          asChild
                        >
                          <Link href="/sign-up">Sign Up</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-white flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Headshot {index + 1}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white group-hover:border-transparent transition-all"
                      asChild
                      disabled={!user && index >= 2}
                    >
                      <a href={image} download={`ai-headshot-${index + 1}.jpg`}>
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </a>
                    </Button>
                  </div>
                  {user ? (
                    <SaveToHistoryButton
                      image={image}
                      style={style}
                      description={prompt || `AI Headshot ${index + 1}`}
                    />
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs flex items-center gap-1 bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      disabled
                      asChild
                    >
                      <Link
                        href="/sign-up"
                        className="flex items-center justify-center gap-1"
                      >
                        <Save className="h-3 w-3" /> Sign up to save to history
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex items-center gap-2 bg-white hover:bg-blue-50 transition-colors"
            disabled={isGenerating}
          >
            <Camera className="h-4 w-4" />
            Generate More
          </Button>

          {!user && (
            <GradientButton
              asChild
              className="shadow-md hover:shadow-lg transition-shadow"
              disabled={isGenerating}
            >
              <Link href="/sign-up">
                <Save className="mr-2 h-4 w-4" />
                Sign Up to Save Images
              </Link>
            </GradientButton>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Get available styles based on user tier
  const getAvailableStyles = () => {
    if (isGuest) return TIER_STYLES.GUEST;
    if (subscriptionTier === "free") return TIER_STYLES.FREE;
    if (subscriptionTier === "premium") return TIER_STYLES.PREMIUM;
    if (subscriptionTier === "pro") return TIER_STYLES.PRO;
    return TIER_STYLES.FREE; // Default fallback
  };

  const availableStyles = getAvailableStyles();

  return (
    <Card className="w-full max-w-3xl mx-auto mt-16">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Create Your AI Headshots</CardTitle>
            <CardDescription>
              Upload a few clear photos with good lighting for best results.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge
              variant="outline"
              className={`${isGuest ? "bg-gray-100 text-gray-600" : subscriptionTier === "free" ? "bg-gray-100 text-gray-800" : subscriptionTier === "premium" ? "bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900" : "bg-gradient-to-r from-purple-400 to-blue-500 text-white"}`}
            >
              {isGuest
                ? "Guest"
                : subscriptionTier.charAt(0).toUpperCase() +
                  subscriptionTier.slice(1)}{" "}
              Plan
            </Badge>
            <CreditIndicator user={user} className="w-full mt-2" />
          </div>
        </div>

        {/* Simplified plan features */}
        {isGuest && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-blue-700">
                Create a free account for more features
              </h3>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span>10 uploads/month</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span>4 headshots per upload</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span>Save to history</span>
              </div>
            </div>
            <div className="mt-2">
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/sign-up">Create Free Account</Link>
              </Button>
            </div>
          </div>
        )}

        {!isGuest && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 px-3 rounded-lg">
            <Info className="h-4 w-4 text-blue-500" />
            <span>
              Your {subscriptionTier} plan includes{" "}
              {
                subscriptionFeatures[
                  subscriptionTier as keyof typeof subscriptionFeatures
                ].maxVariations
              }{" "}
              headshots per upload,
              {subscriptionFeatures[
                subscriptionTier as keyof typeof subscriptionFeatures
              ].maxUploads === "Unlimited"
                ? " unlimited"
                : ` ${subscriptionFeatures[subscriptionTier as keyof typeof subscriptionFeatures].maxUploads}`}{" "}
              uploads/month
              {subscriptionTier !== "pro" && (
                <Link
                  href="/pricing"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Upgrade for more
                </Link>
              )}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <ErrorMessage
            title={error.title}
            message={error.message}
            severity={error.severity}
            className="mb-6"
          />
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="photos">Upload Photos</Label>
              <span className="text-xs text-muted-foreground">
                {previews.length} of{" "}
                {maxUploads === "Unlimited" ? "∞" : maxUploads} photos
              </span>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors bg-gradient-to-b from-white to-gray-50 group">
              <Input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                max="5"
              />
              <Label
                htmlFor="photos"
                className="cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Camera className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  Click to upload or drag and drop your photos
                </span>
                <span className="text-xs text-gray-500 max-w-xs">
                  Upload 3-5 clear photos with good lighting for best results.
                  Supports PNG, JPG, WEBP (max 10MB each).
                </span>
              </Label>
            </div>
          </div>

          {previews.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Photos</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-md overflow-hidden border border-gray-200 group"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="bg-white/90 text-gray-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-white transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="style">Choose a Style</Label>
              <span className="text-xs text-muted-foreground">
                {isGuest
                  ? "1 style available"
                  : subscriptionTier === "free"
                    ? "3 styles available"
                    : subscriptionTier === "premium"
                      ? "8 styles available"
                      : "All styles available"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(AI_STYLE_PROMPTS)
                .filter(([styleId]) => {
                  // Only show styles available for the user's tier
                  return availableStyles.includes(styleId as StyleId);
                })
                .map(([styleId, styleData]) => {
                  const styleOption = {
                    id: styleId as StyleId,
                    name: styleData.name,
                    description: styleData.description,
                    icon:
                      styleId === "professional" ? (
                        <Sparkles className="h-5 w-5" />
                      ) : styleId === "creative" ? (
                        <Camera className="h-5 w-5" />
                      ) : styleId === "casual" ? (
                        <ImageIcon className="h-5 w-5" />
                      ) : (
                        <CheckCircle className="h-5 w-5" />
                      ),
                    premium: !availableStyles.includes(styleId as StyleId),
                    proOnly:
                      isGuest ||
                      (subscriptionTier === "free" &&
                        !TIER_STYLES.FREE.includes(styleId as StyleId)) ||
                      (subscriptionTier === "premium" &&
                        !TIER_STYLES.PREMIUM.includes(styleId as StyleId)),
                  };

                  return (
                    <TooltipProvider key={styleOption.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`border relative rounded-lg p-3 transition-all ${styleOption.premium ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${style === styleOption.id ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}
                            onClick={() =>
                              !styleOption.premium && setStyle(styleOption.id)
                            }
                          >
                            {styleOption.premium && (
                              <div
                                className={`absolute top-1 right-1 ${styleOption.proOnly ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"} text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1`}
                              >
                                <Lock className="h-2.5 w-2.5" />
                                <span className="text-[10px]">
                                  {styleOption.proOnly ? "Pro" : "Premium"}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <div
                                className={`text-${style === styleOption.id ? "blue" : "gray"}-500`}
                              >
                                {styleOption.icon}
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  {styleOption.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {styleOption.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        {styleOption.premium && (
                          <TooltipContent side="top" className="p-3 max-w-xs">
                            <p className="font-medium">
                              {styleOption.proOnly
                                ? "Pro Plan Feature"
                                : "Premium Plan Feature"}
                            </p>
                            <p className="text-sm mt-1">
                              Upgrade your plan to access {styleOption.name}{" "}
                              style.
                            </p>
                            <div className="mt-2">
                              <Link
                                href="/pricing"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View pricing plans →
                              </Link>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
            </div>
          </div>

          {!isGuest &&
            subscriptionFeatures[
              subscriptionTier as keyof typeof subscriptionFeatures
            ].customPrompting && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="prompt">Custom Instructions</Label>
                    {!isGuest &&
                      subscriptionFeatures[
                        subscriptionTier as keyof typeof subscriptionFeatures
                      ].advancedPrompting && (
                        <Badge
                          variant="outline"
                          className="bg-purple-100 text-purple-700 text-xs"
                        >
                          Pro Feature
                        </Badge>
                      )}
                  </div>
                </div>
                <Textarea
                  id="prompt"
                  placeholder="Example: Professional headshot with a blue background and soft lighting, slight smile"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="text-xs text-gray-500">
                  Describe the style, background, lighting, or expression you
                  want for your headshots.
                </div>
              </div>
            )}

          {(isGuest ||
            !subscriptionFeatures[
              subscriptionTier as keyof typeof subscriptionFeatures
            ].customPrompting) && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label className="text-gray-500">Custom Instructions</Label>
                  <Badge
                    variant="outline"
                    className="bg-gray-100 text-gray-700 flex items-center gap-1 text-xs"
                  >
                    <Lock className="h-3 w-3" /> Premium Feature
                  </Badge>
                </div>
              </div>
              <div className="border border-gray-200 rounded-md p-3 bg-gray-50 flex items-center justify-center gap-3">
                <Lock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">
                    Custom instructions available on Premium and Pro plans
                  </p>
                  <Link
                    href="/pricing"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Upgrade to customize your headshots →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex justify-between w-full">
          <Button variant="outline" disabled={isLoading} onClick={handleReset}>
            Reset
          </Button>
          <GradientButton
            onClick={handleSubmit}
            disabled={files.length === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate {actualMaxVariations} Headshots
              </>
            )}
          </GradientButton>
        </div>

        {previews.length > 0 && (
          <div className="w-full p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <div className="text-blue-700">
              Ready to generate {actualMaxVariations} professional headshots
              with your {previews.length} photo
              {previews.length !== 1 ? "s" : ""}.
            </div>
          </div>
        )}

        {previews.length === 0 && (isGuest || subscriptionTier === "free") && (
          <div className="w-full p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <div className="text-blue-700">
              {isGuest ? (
                <>
                  Upload photos to generate {actualMaxVariations} headshots.{" "}
                  <Link href="/sign-up" className="font-medium hover:underline">
                    Create a free account
                  </Link>{" "}
                  for more features.
                </>
              ) : (
                <>
                  You can generate {actualMaxVariations} headshots per upload,
                  with {actualMaxUploads} uploads per month.{" "}
                  <Link href="/pricing" className="font-medium hover:underline">
                    Upgrade
                  </Link>{" "}
                  for more.
                </>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
