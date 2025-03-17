"use client";

import { useState } from "react";
import { Button } from "./ui/button";
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
import { Upload, Image as ImageIcon, Loader2, Save } from "lucide-react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function UploadForm({ user }: { user?: User | null }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [style, setStyle] = useState("professional");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);

      // Create previews
      const newPreviews = selectedFiles.map((file) =>
        URL.createObjectURL(file),
      );
      setPreviews(newPreviews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate processing time
    setTimeout(() => {
      // Mock generated images
      const mockGeneratedImages = [
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80",
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&q=80",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80",
        "https://images.unsplash.com/photo-1573497019236-61e7a0081f95?w=500&q=80",
      ];

      setGeneratedImages(mockGeneratedImages);
      setIsGenerated(true);
      setIsLoading(false);
    }, 3000);
  };

  const handleReset = () => {
    setFiles([]);
    setPreviews([]);
    setPrompt("");
    setGeneratedImages([]);
    setIsGenerated(false);
    setStyle("professional");
  };

  if (isGenerated) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Your AI Headshots Are Ready!</CardTitle>
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
            {generatedImages.map((image, index) => (
              <div
                key={index}
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src={image}
                    alt={`AI Headshot ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4 bg-white flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Headshot {index + 1}
                  </span>
                  <Button size="sm" variant="outline" asChild>
                    <a href={image} download={`ai-headshot-${index + 1}.jpg`}>
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleReset} variant="outline">
            Generate More
          </Button>

          {!user && (
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Link href="/sign-up">
                <Save className="mr-2 h-4 w-4" />
                Sign Up to Save Images
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Your Photos</CardTitle>
        <CardDescription>
          Upload 3-5 photos of yourself for best results. Choose clear photos
          with good lighting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="photos">Upload Photos</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <Input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label
                htmlFor="photos"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <Upload className="h-10 w-10 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, WEBP up to 10MB each
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
                    className="relative aspect-square rounded-md overflow-hidden border border-gray-200"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
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
                },
                {
                  id: "creative",
                  name: "Creative",
                  description: "Artistic, expressive",
                },
                {
                  id: "casual",
                  name: "Casual",
                  description: "Relaxed, approachable",
                },
              ].map((styleOption) => (
                <div
                  key={styleOption.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${style === styleOption.id ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                  onClick={() => setStyle(styleOption.id)}
                >
                  <div className="font-medium">{styleOption.name}</div>
                  <div className="text-sm text-gray-500">
                    {styleOption.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Additional Instructions (Optional)</Label>
            <Textarea
              id="prompt"
              placeholder="E.g., 'Professional headshot with a blue background' or 'Casual style with natural lighting'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={files.length === 0 || isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Generate Headshots</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
