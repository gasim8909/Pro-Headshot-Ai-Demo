"use client";

import { useState } from "react";
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
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { ErrorMessage } from "./error-message";
import { Shimmer } from "./ui/shimmer";

export default function UploadForm({ user }: { user?: User | null }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [style, setStyle] = useState("professional");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState<{
    title: string;
    message: string;
    severity: "error" | "warning" | "info";
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 5); // Limit to 5 files
      setFiles(selectedFiles);

      // Create previews
      const newPreviews = selectedFiles.map((file) =>
        URL.createObjectURL(file),
      );
      setPreviews(newPreviews);

      // Show warning if more than 5 files were selected
      if (e.target.files.length > 5) {
        setError({
          title: "Too many files",
          message:
            "Maximum 5 photos allowed. Only the first 5 have been selected.",
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

      // Send to our Next.js API endpoint
      console.log("Sending request to API endpoint");
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

      // Use the Supabase edge function directly for more reliable processing
      const response = await fetch(`${origin}/api/generate`, {
        method: "POST",
        body: formData,
      });
      console.log("Received response from API endpoint:", response.status);

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

      // Set the generated images from the API response
      setGeneratedImages(validImages);
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
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPreviews([]);
    setPrompt("");
    setGeneratedImages([]);
    setIsGenerated(false);
    setStyle("professional");
  };

  if (isLoading) {
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
                        {style.charAt(0).toUpperCase() + style.slice(1)} Style
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

  if (isGenerated) {
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
            Your AI Headshots Are Ready!
          </CardTitle>
          <CardDescription>
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedImages.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group bg-white border border-gray-100"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={image}
                    alt={`AI Headshot ${index + 1}`}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 object-center"
                    style={{ objectPosition: "center" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                    <span className="text-white font-medium text-sm">
                      {style.charAt(0).toUpperCase() + style.slice(1)} Style
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-white flex justify-between items-center">
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
                  >
                    <a href={image} download={`ai-headshot-${index + 1}.jpg`}>
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </a>
                  </Button>
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
          >
            <Camera className="h-4 w-4" />
            Generate More
          </Button>

          {!user && (
            <GradientButton
              asChild
              className="shadow-md hover:shadow-lg transition-shadow"
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

  return (
    <Card className="w-full max-w-3xl mx-auto mt-16">
      <CardHeader>
        <CardTitle>Upload Your Photos</CardTitle>
        <CardDescription>
          Upload 3-5 photos of yourself for best results. Choose clear photos
          with good lighting.
        </CardDescription>
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
            <Label htmlFor="photos">Upload Photos</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors bg-gradient-to-b from-white to-gray-50 group">
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
                  For best results, upload 3-5 clear photos with good lighting.
                  PNG, JPG, WEBP up to 10MB each. Gemini Flash processes images
                  instantly.
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
            <Label htmlFor="style">Headshot Style</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: "professional",
                  name: "Professional",
                  description: "Corporate, LinkedIn-ready",
                  icon: <Sparkles className="h-5 w-5" />,
                },
                {
                  id: "creative",
                  name: "Creative",
                  description: "Artistic, expressive",
                  icon: <Camera className="h-5 w-5" />,
                },
                {
                  id: "casual",
                  name: "Casual",
                  description: "Relaxed, approachable",
                  icon: <ImageIcon className="h-5 w-5" />,
                },
              ].map((styleOption) => (
                <div
                  key={styleOption.id}
                  className={`border rounded-lg p-5 cursor-pointer transition-all ${style === styleOption.id ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}
                  onClick={() => setStyle(styleOption.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`text-${style === styleOption.id ? "blue" : "gray"}-500`}
                    >
                      {styleOption.icon}
                    </div>
                    <div className="font-medium">{styleOption.name}</div>
                  </div>
                  <div className="text-sm text-gray-500 ml-7">
                    {styleOption.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="prompt">
                Custom Enhancement Instructions (Optional)
              </Label>
              <span className="text-xs text-muted-foreground">
                For best results, be specific and clear
              </span>
            </div>
            <Textarea
              id="prompt"
              placeholder="Examples: 'Professional headshot with a subtle blue gradient background and soft side lighting' or 'Casual style with natural outdoor lighting and a slight smile' or 'Creative portrait with dramatic side lighting and urban background'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="text-xs text-muted-foreground mt-1">
              <p>Tips for effective prompts:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>
                  Specify desired background (color, texture, environment)
                </li>
                <li>
                  Describe preferred lighting style (soft, dramatic, natural)
                </li>
                <li>Mention facial expression or pose if important</li>
                <li>Include any specific color tones or mood you want</li>
                <li>Keep instructions clear and concise for best results</li>
              </ul>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled={isLoading}>
          Cancel
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
              Generate Headshots
            </>
          )}
        </GradientButton>
      </CardFooter>
    </Card>
  );
}
