"use client";

import { useState, useEffect } from "react";
import { Shimmer } from "./shimmer";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export function LazyImage({
  src,
  alt,
  className = "",
  aspectRatio = "aspect-square",
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    setIsLoading(true);

    // Reset when src changes
    if (src !== imageSrc) {
      setImageSrc("");
    }

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse">
          <Shimmer className="w-full h-full" />
        </div>
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        />
      )}
    </div>
  );
}
