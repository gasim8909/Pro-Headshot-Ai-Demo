"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "./ui/button";
import { GradientButton } from "./ui/gradient-button";
import { Card, CardContent } from "./ui/card";
import { Download, Share2, Heart, Lock, Save } from "lucide-react";
import { Shimmer } from "./ui/shimmer";
import { LazyImage } from "./ui/lazy-image";
import Link from "next/link";
import SaveToHistoryButton from "./save-to-history-button";
import { User } from "@supabase/supabase-js";

type HeadshotProps = {
  images: string[];
  user?: User | null;
  style?: string;
  prompt?: string;
};

export default function HeadshotGallery({
  images = [],
  user,
  style = "professional",
  prompt = "",
}: HeadshotProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // If no images are provided, use these defaults
  const defaultImages = [
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80",
    "https://images.unsplash.com/photo-1573497019236-61e7a0081f95?w=500&q=80",
  ];

  // Filter out any invalid image URLs
  const validImages = images.filter(
    (img) =>
      typeof img === "string" &&
      (img.startsWith("http") || img.startsWith("data:image")),
  );

  // Log validation results for debugging
  console.log("HeadshotGallery received images:", images.length);
  console.log("Valid images after filtering:", validImages.length);

  const displayImages = validImages.length > 0 ? validImages : defaultImages;

  // Set selected image if not already set
  useEffect(() => {
    if (!selectedImage && displayImages.length > 0) {
      setSelectedImage(displayImages[0]);
    }
  }, [displayImages, selectedImage]);

  const currentImage =
    selectedImage || (displayImages.length > 0 ? displayImages[0] : null);

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement("a");
      link.href = currentImage;
      link.download = "ai-headshot.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (navigator.share && currentImage) {
      navigator
        .share({
          title: "My AI Headshot",
          text: "Check out my professional AI headshot!",
          url: currentImage,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      alert("Web Share API not supported in your browser");
    }
  };

  if (!currentImage) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-3/4">
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-md animate-pulse">
              <div className="aspect-[3/4] bg-gray-200"></div>
            </div>
            <div className="mt-4 flex justify-between">
              <div className="w-24 h-10 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="w-24 h-10 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
          <div className="md:w-1/4">
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
              {[1, 2, 3, 4].map((_, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-200 rounded-md animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine if the current image is locked (for guests, lock the last 2 images)
  const isCurrentImageLocked =
    !user && selectedImage && displayImages.indexOf(selectedImage) >= 2;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main image display */}
        <div className="md:w-3/4">
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow relative">
            <div className="relative group">
              <LazyImage
                src={currentImage}
                alt="AI Generated Headshot"
                className={`${isCurrentImageLocked ? "blur-sm" : ""}`}
                aspectRatio="aspect-[3/4]"
              />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90"
                >
                  <Heart className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              {/* Sign-up overlay for locked images */}
              {isCurrentImageLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm p-6 text-center">
                  <Lock className="h-12 w-12 text-white mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Unlock All Headshots
                  </h3>
                  <p className="text-white/90 mb-6">
                    Sign up for a free account to access all your generated
                    headshots
                  </p>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="bg-white/20 text-white hover:bg-white/30 border-white/40"
                      asChild
                    >
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                    <GradientButton asChild>
                      <Link href="/sign-up">Sign Up Free</Link>
                    </GradientButton>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
              disabled={isCurrentImageLocked}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <GradientButton
              onClick={handleDownload}
              className="flex items-center gap-2"
              disabled={isCurrentImageLocked}
            >
              <Download className="h-4 w-4" />
              Download
            </GradientButton>
          </div>

          {/* Save to history button (always show, but disabled for guests) */}
          <div className="mt-3">
            {user ? (
              <SaveToHistoryButton
                image={currentImage}
                style={style}
                description={prompt || `AI Headshot`}
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

        {/* Thumbnails */}
        <div className="md:w-1/4">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            {displayImages.map((image, index) => (
              <Card
                key={index}
                className={`cursor-pointer overflow-hidden transition-all relative ${image === selectedImage ? "ring-2 ring-blue-600 shadow-md" : "hover:opacity-95 hover:shadow-md"}`}
                onClick={() => setSelectedImage(image)}
              >
                <CardContent className="p-0">
                  <Shimmer
                    className={`${image === selectedImage ? "" : "hidden"}`}
                  >
                    <LazyImage
                      src={image}
                      alt={`AI Headshot ${index + 1}`}
                      className={`${!user && index >= 2 ? "blur-sm" : ""}`}
                      aspectRatio="aspect-square"
                    />
                  </Shimmer>
                  <div className={`${image === selectedImage ? "hidden" : ""}`}>
                    <LazyImage
                      src={image}
                      alt={`AI Headshot ${index + 1}`}
                      className={`${!user && index >= 2 ? "blur-sm" : ""}`}
                      aspectRatio="aspect-square"
                    />
                  </div>

                  {/* Lock icon overlay for guests on last 2 images */}
                  {!user && index >= 2 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
