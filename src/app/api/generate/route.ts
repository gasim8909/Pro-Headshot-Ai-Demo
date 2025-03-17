import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { GEMINI_CONFIG, MOCK_DATA, TIMEOUTS } from "@/lib/config";
import { processImages } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const supabase = await createClient();

    // Get user information if logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Extract files and prompt from form data
    const files = formData.getAll("files") as File[];
    const prompt = formData.get("prompt") as string;
    const style = formData.get("style") as string;

    // Validate inputs
    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          error: "MISSING_FILES",
          message: "No files were provided. Please upload at least one image.",
        },
        { status: 400 },
      );
    }

    // Check file sizes
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      return NextResponse.json(
        {
          error: "FILE_TOO_LARGE",
          message: `${oversizedFiles.length} file(s) exceed the 10MB size limit. Please upload smaller images.`,
        },
        { status: 413 },
      );
    }

    // Validate style
    const validStyles = ["professional", "creative", "casual"];
    if (style && !validStyles.includes(style)) {
      return NextResponse.json(
        {
          error: "INVALID_STYLE",
          message: `Invalid style: ${style}. Valid options are: ${validStyles.join(", ")}.`,
        },
        { status: 400 },
      );
    }

    // Prepare files for processing
    const imageData = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      imageData.push({
        filename: file.name,
        content: base64,
        contentType: file.type,
      });
    }

    let generatedImages;

    // Check if Gemini API is enabled and should be used
    if (GEMINI_CONFIG.ENABLED) {
      try {
        console.log(
          "Using Gemini API for image processing with key:",
          process.env.GEMINI_API_KEY
            ? `${process.env.GEMINI_API_KEY.substring(0, 4)}...`
            : "NOT SET",
        );

        // Process images with Gemini API - always generate at least 4 images
        const processedImages = await processImages(
          imageData,
          prompt,
          style,
          4,
        );

        // Verify we got valid images back
        if (!processedImages || processedImages.length === 0) {
          throw new Error("No images were returned from Gemini API");
        }

        // Validate each image is a proper base64 string
        const validProcessedImages = processedImages.filter((img) => {
          return (
            typeof img === "string" &&
            (img.startsWith("data:image") ||
              /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(
                img,
              ))
          );
        });

        if (validProcessedImages.length === 0) {
          throw new Error("The images returned from Gemini API were invalid");
        }

        console.log(
          "Processed images sample:",
          processedImages[0].substring(0, 50) + "... (truncated)",
        );

        // Format the response
        generatedImages = {
          images: processedImages,
          source: "gemini-api",
          message: "Images processed with Gemini API",
        };

        console.log(
          `Successfully processed ${processedImages.length} images with Gemini API`,
        );
      } catch (geminiError) {
        console.error("Error processing images with Gemini API:", geminiError);
        console.log("Falling back to mock data due to Gemini API error");

        // Fall back to mock data if Gemini API fails
        generatedImages = null; // Will be set to mock data below
      }
    } else {
      // If Gemini API is not enabled, use mock data
      console.log("Gemini API not enabled, using mock data");
      generatedImages = null; // Will be set to mock data below
    }

    // If we don't have generated images yet (Gemini failed or not enabled), use mock data
    if (!generatedImages) {
      // Get the appropriate style images from our config
      const styleImages =
        MOCK_DATA.STYLES[style] || MOCK_DATA.STYLES.professional;

      // Ensure we're using high-quality images with proper parameters
      const processedImages = styleImages.map((url) => {
        // If URL already has parameters, don't modify it
        if (url.includes("?")) return url;
        // Add quality and width parameters to Unsplash images
        if (url.includes("unsplash.com")) {
          return `${url}?w=800&q=90&fit=crop`;
        }
        return url;
      });

      // Always ensure we have exactly 4 images in mock data
      while (processedImages.length < 4 && processedImages.length > 0) {
        // Duplicate existing images if we have fewer than 4
        processedImages.push(
          processedImages[processedImages.length % processedImages.length],
        );
      }

      generatedImages = {
        images: processedImages,
        source: "mock-data",
        demoMode: true,
        message: "Using sample images for demonstration",
      };
    }

    // If user is logged in, save the generated images to their account
    if (user && generatedImages && generatedImages.images) {
      // Save generated images to Supabase storage
      for (let i = 0; i < generatedImages.images.length; i++) {
        const imageUrl = generatedImages.images[i];

        // Skip saving if it's just a URL (from mock data)
        if (imageUrl.startsWith("http")) continue;

        try {
          // For base64 data, convert to buffer
          const buffer = Buffer.from(imageUrl, "base64");

          const { data, error } = await supabase.storage
            .from("headshots")
            .upload(`${user.id}/${Date.now()}_${i}.jpg`, buffer, {
              contentType: "image/jpeg",
              upsert: false,
            });

          if (error) {
            console.error("Error saving image to storage:", error);
          }
        } catch (storageError) {
          console.error("Error processing image for storage:", storageError);
        }
      }
    }

    // Ensure we're not returning null or undefined and always have exactly 4 images
    const finalResponse = generatedImages || {
      images: [
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80",
      ],
      source: "fallback-data",
      message: "Using fallback images",
    };

    // Ensure we always have exactly 4 images
    if (finalResponse.images.length > 4) {
      finalResponse.images = finalResponse.images.slice(0, 4);
    } else if (
      finalResponse.images.length < 4 &&
      finalResponse.images.length > 0
    ) {
      // If we have fewer than 4 images, duplicate existing ones to reach 4
      while (finalResponse.images.length < 4) {
        finalResponse.images.push(
          finalResponse.images[
            finalResponse.images.length % finalResponse.images.length
          ],
        );
      }
    }

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error("Error processing request:", error);
    // Determine the type of error for better error messages
    let errorMessage = error.message;
    let statusCode = 500;
    let errorCode = "INTERNAL_SERVER_ERROR";

    if (error.message.includes("timeout")) {
      errorMessage =
        "The request timed out while processing your images. Please try again with fewer or smaller images.";
      statusCode = 408; // Request Timeout
      errorCode = "REQUEST_TIMEOUT";
    } else if (
      error.message.includes("too large") ||
      error.message.includes("payload")
    ) {
      errorMessage =
        "The uploaded files are too large. Please try with smaller images (max 10MB each).";
      statusCode = 413; // Payload Too Large
      errorCode = "PAYLOAD_TOO_LARGE";
    } else if (
      error.message.includes("not found") ||
      error.message.includes("404")
    ) {
      errorMessage =
        "The requested resource was not found. Please check your request and try again.";
      statusCode = 404; // Not Found
      errorCode = "NOT_FOUND";
    } else if (error.message.includes("GEMINI_API_KEY")) {
      errorMessage =
        "The Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.";
      statusCode = 500;
      errorCode = "MISSING_API_KEY";
    }

    console.error(`Error [${errorCode}]: ${errorMessage}`);

    // Return exactly 4 fallback images with detailed error information
    return NextResponse.json(
      {
        error: errorCode,
        message: errorMessage,
        source: "error-fallback",
        images: [
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
          "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80",
        ],
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: statusCode },
    );
  }
}
