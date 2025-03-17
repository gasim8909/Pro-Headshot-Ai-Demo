"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Download, Share2 } from "lucide-react";

type HeadshotProps = {
  images: string[];
};

export default function HeadshotGallery({ images = [] }: HeadshotProps) {
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
    return <div>No images available</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main image display */}
        <div className="md:w-3/4">
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-md">
            <img
              src={currentImage}
              alt="AI Generated Headshot"
              className="w-full h-auto object-cover aspect-[3/4]"
            />
          </div>
          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="md:w-1/4">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            {displayImages.map((image, index) => (
              <Card
                key={index}
                className={`cursor-pointer overflow-hidden transition-all ${image === selectedImage ? "ring-2 ring-blue-600" : "hover:opacity-90"}`}
                onClick={() => setSelectedImage(image)}
              >
                <CardContent className="p-0">
                  <img
                    src={image}
                    alt={`AI Headshot ${index + 1}`}
                    className="w-full h-auto aspect-square object-cover"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
