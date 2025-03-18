import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GEMINI_CONFIG, MOCK_DATA, TIMEOUTS } from "@/lib/config";
import { processImages } from "@/lib/gemini";
import { getGenerationPrompt } from "./prompt-helper";
import { StyleId } from "@/lib/ai-style-prompts";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get auth token from request headers - check both standard and custom header
    const authHeader = request.headers.get("authorization");
    const customAuthHeader = request.headers.get("x-supabase-auth");

    // Try to get token from either header
    let token = null;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
      console.log("Found token in Authorization header");
    } else if (customAuthHeader) {
      token = customAuthHeader;
      console.log("Found token in X-Supabase-Auth header");
    }

    console.log("Auth token present:", !!token);

    // Create client with auth token if available
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
        auth: {
          persistSession: false, // Don't persist the session to avoid cookie issues
          autoRefreshToken: false, // Don't auto refresh the token
        },
      },
    );

    // Create a service role client for admin operations
    const serviceClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );

    // Default number of images to generate (for free tier)
    let numImagesToGenerate = 4;

    // Get user information if logged in
    let user = null;
    let userError = null;
    let userId = null;

    if (token) {
      try {
        // First try with the standard auth method
        const { data, error } = await supabase.auth.getUser(token);
        user = data?.user;
        userError = error;

        if (user) {
          userId = user.id;
          console.log("Successfully authenticated user with ID:", userId);
        } else if (error) {
          console.error("Error authenticating with token:", error.message);

          // If standard auth fails, try to decode the JWT to at least get the user ID
          try {
            // Basic JWT parsing (get payload part and decode)
            const parts = token.split(".");
            if (parts.length === 3) {
              const payload = JSON.parse(
                Buffer.from(parts[1], "base64").toString(),
              );
              if (payload.sub) {
                userId = payload.sub;
                console.log("Extracted user ID from JWT payload:", userId);
              }
            }
          } catch (jwtError) {
            console.error("Error parsing JWT:", jwtError);
          }
        }
      } catch (error) {
        console.error("Error getting user with token:", error);
        userError = error;
      }
    }

    if (userError) {
      console.error("Error getting user:", userError);
    }

    // Log detailed authentication information
    console.log(
      `API route - User authenticated: ${!!user}, User ID: ${user?.id || "guest"}, Auth token present: ${!!request.headers.get("authorization")}`,
    );

    // If we have a token but no user, log a warning
    if (request.headers.get("authorization") && !user) {
      console.warn(
        "Auth token is present but user is not authenticated - token may be invalid or expired",
      );
    }

    // Extract files and prompt from form data
    const files = formData.getAll("files") as File[];
    const userPrompt = formData.get("prompt") as string;
    const style = formData.get("style") as StyleId;
    const formUserId = formData.get("userId") as string;
    const formTier = formData.get("tier") as string;

    // Use the authenticated userId if available, otherwise fall back to the form userId
    // This ensures we prioritize the authenticated user ID over what's in the form
    if (!userId && formUserId && formUserId !== "guest") {
      userId = formUserId;
      console.log("Using user ID from form data:", userId);
    }

    // Double-check user authentication
    console.log(
      `Form data userId: ${formUserId}, Auth user ID: ${user?.id || "not authenticated"}, Final userId: ${userId || "guest"}, Form tier: ${formTier || "not provided"}`,
    );

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
    const validStyles = [
      "professional",
      "creative",
      "casual",
      "modern",
      "executive",
      "business",
      "corporate",
      "artistic",
      "minimalist",
      "outdoor",
      "monochrome",
      "fashion",
      "vintage",
      "dynamic",
      "environmental",
      "bold",
    ];

    console.log(`Received style: ${style}`);
    if (style && !validStyles.includes(style)) {
      return NextResponse.json(
        {
          error: "INVALID_STYLE",
          message: `Invalid style: ${style}. Valid options are: ${validStyles.join(", ")}.`,
        },
        { status: 400 },
      );
    }

    // Get the full generation prompt based on style and user input
    const fullPrompt = getGenerationPrompt(style, userPrompt);

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

    let userData = null;
    console.log(
      `User authenticated: ${!!user}, User ID: ${userId || "guest"}, numImagesToGenerate: ${numImagesToGenerate}`,
    );

    // Check if we have a tier from the form data and use it directly
    if (formTier) {
      console.log(`Using tier from form data: ${formTier}`);
      if (formTier === "premium") {
        numImagesToGenerate = 6;
        console.log(
          "Premium tier from form data, setting numImagesToGenerate to 6",
        );
      } else if (formTier === "pro") {
        numImagesToGenerate = 10;
        console.log(
          "Pro tier from form data, setting numImagesToGenerate to 10",
        );
      } else {
        console.log(
          `Using default numImagesToGenerate: 4 for tier: ${formTier}`,
        );
      }
    }

    let generatedImages;

    // Check if Gemini API is enabled and should be used
    if (GEMINI_CONFIG.ENABLED) {
      // Force numImagesToGenerate to be passed correctly to processImages
      console.log(
        `Before Gemini API call - numImagesToGenerate: ${numImagesToGenerate}`,
      );
      try {
        console.log(
          "Using Gemini API for image processing with key:",
          process.env.GEMINI_API_KEY
            ? `${process.env.GEMINI_API_KEY.substring(0, 4)}...`
            : "NOT SET",
        );

        // We already declared numImagesToGenerate at the top of the function
        // Don't reset userData to null here, as we need it for subscription checks

        // Log authentication status
        console.log(
          `Before checking subscription - User authenticated: ${!!user}, User ID: ${user?.id || "guest"}`,
        );

        // Only check database if we don't have tier from form data
        if (userId && !formTier) {
          console.log(
            "User ID available, checking subscription tier for user ID:",
            userId,
          );

          // Log the auth token for debugging (first few characters only)
          const authHeader = request.headers.get("authorization");
          if (authHeader) {
            console.log(
              "Auth token present:",
              authHeader.substring(0, 15) + "...",
            );
          } else {
            console.warn(
              "No auth token in request headers despite user being authenticated",
            );
          }
          // Check user's subscription tier
          // Use service role client to bypass RLS for this query
          const { data: userDataResult, error: userDataError } =
            await serviceClient
              .from("users")
              .select("subscription_tier, subscription")
              .eq("id", userId)
              .single();

          userData = userDataResult;
          console.log(
            "User subscription data:",
            userData,
            "Error:",
            userDataError,
          );

          if (userData?.subscription_tier) {
            try {
              const tierLower = userData.subscription_tier.toLowerCase();
              console.log(
                `User tier detected from subscription_tier field: ${tierLower}`,
              );

              if (tierLower === "premium") {
                numImagesToGenerate = 6;
                console.log(
                  "Premium user detected, setting numImagesToGenerate to 6",
                );
              } else if (tierLower === "pro") {
                numImagesToGenerate = 10;
                console.log(
                  "Pro user detected, setting numImagesToGenerate to 10",
                );
              } else {
                console.log(
                  `Unknown tier "${tierLower}" detected, using default numImagesToGenerate: 4`,
                );
              }
            } catch (error) {
              console.error("Error processing subscription tier:", error);
              // Default to 4 images if there's an error
              numImagesToGenerate = 4;
            }

            // Double-check the value was set correctly
            console.log(
              `After tier detection, numImagesToGenerate is now: ${numImagesToGenerate}`,
            );
          } else if (userData?.subscription) {
            // If subscription_tier is not set but user has a subscription, check subscriptions table
            console.log(
              "User has subscription but no tier, checking subscriptions table. Subscription ID:",
              userData.subscription,
            );
            const { data: subData, error: subError } = await supabase
              .from("subscriptions")
              .select("polar_price_id, status")
              .eq("polar_id", userData.subscription)
              .eq("status", "active")
              .single();

            console.log("Subscription data:", subData, "Error:", subError);

            if (subData?.polar_price_id) {
              const priceId = subData.polar_price_id.toLowerCase();
              console.log("Price ID from subscription:", priceId);

              if (priceId.includes("pro")) {
                numImagesToGenerate = 10;
                console.log(
                  "Pro subscription detected from price ID, setting numImagesToGenerate to 10",
                );
              } else if (priceId.includes("premium")) {
                numImagesToGenerate = 6;
                console.log(
                  "Premium subscription detected from price ID, setting numImagesToGenerate to 6",
                );
              } else {
                console.log(
                  `Price ID "${priceId}" doesn't match known tiers, using default numImagesToGenerate: 4`,
                );
              }
            } else {
              console.log(
                "No valid price ID found in subscription data, using default numImagesToGenerate: 4",
              );
            }
          } else {
            console.log(
              "User has no subscription_tier or subscription field, using default numImagesToGenerate: 4",
            );
          }
        }

        try {
          console.log(
            `Generating ${numImagesToGenerate} images for user with tier: ${userId ? userData?.subscription_tier || formTier || "authenticated" : "guest"}`,
          );
        } catch (error) {
          console.error("Error logging generation info:", error);
        }

        // Process images with Gemini API
        console.log(
          `Calling processImages with numImagesToGenerate: ${numImagesToGenerate}`,
        );
        try {
          console.log(
            `User tier: ${userData?.subscription_tier || formTier || "unknown"}, Subscription ID: ${userData?.subscription || "none"}`,
          );
        } catch (error) {
          console.error("Error logging user tier info:", error);
        }
        // Ensure we're passing the correct number of images to generate based on subscription tier
        console.log(
          `Calling processImages with explicit numImagesToGenerate: ${numImagesToGenerate}`,
        );
        const processedImages = await processImages(
          imageData,
          fullPrompt, // Use the full prompt with style instructions
          style,
          numImagesToGenerate, // This should be 4 for free, 6 for premium, 10 for pro
        );

        // Verify we got valid images back
        if (!processedImages || processedImages.length === 0) {
          throw new Error("No images were returned from Gemini API");
        }

        // Verify we got the correct number of images based on subscription tier
        console.log(
          `Received ${processedImages.length} images from processImages, expected ${numImagesToGenerate}`,
        );
        if (processedImages.length !== numImagesToGenerate) {
          console.warn(
            `Number of images returned (${processedImages.length}) doesn't match expected count (${numImagesToGenerate})`,
          );
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

        // Provide more detailed logging based on error type
        if (geminiError.message && geminiError.message.includes("429")) {
          console.error(
            "Rate limit exceeded (429 error). The Gemini API quota has been exhausted.",
          );
        } else if (geminiError.message && geminiError.message.includes("500")) {
          console.error(
            "Gemini API internal server error (500). This is likely a temporary issue with the API.",
          );
        }

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
      console.log(`Using mock data for style: ${style}`);

      // Get the appropriate style images from our config
      const styleImages =
        MOCK_DATA.STYLES[style] || MOCK_DATA.STYLES.professional;

      if (!MOCK_DATA.STYLES[style]) {
        console.warn(
          `Style "${style}" not found in mock data, falling back to professional style`,
        );
      }

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

      // Ensure we have enough images based on the maximum tier (10 for Pro)
      while (processedImages.length < 10 && processedImages.length > 0) {
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
      // Check if the headshots bucket exists and create it if it doesn't
      try {
        // Create a service role client to bypass RLS for bucket operations
        const serviceRoleClient = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_KEY!,
        );

        // First, check if the bucket exists by listing buckets
        const { data: buckets, error: bucketsError } =
          await serviceRoleClient.storage.listBuckets();

        let bucketExists = false;
        if (!bucketsError && buckets) {
          bucketExists = buckets.some((bucket) => bucket.name === "headshots");
        }

        // If bucket doesn't exist, try to create it with service role client
        if (!bucketExists) {
          console.log("Headshots bucket not found, attempting to create it...");
          const { error: createError } =
            await serviceRoleClient.storage.createBucket("headshots", {
              public: false,
              fileSizeLimit: 10485760, // 10MB
            });

          if (createError) {
            console.error("Error creating headshots bucket:", createError);
            // Continue without saving images
          } else {
            console.log("Successfully created headshots bucket");
            bucketExists = true;
          }
        }

        // Only proceed with saving if the bucket exists or was created
        if (bucketExists) {
          // Save generated images to Supabase storage
          for (let i = 0; i < generatedImages.images.length; i++) {
            const imageUrl = generatedImages.images[i];

            // Skip saving if it's just a URL (from mock data)
            if (imageUrl.startsWith("http")) continue;

            try {
              // For base64 data, convert to buffer
              const buffer = Buffer.from(
                imageUrl.replace(/^data:image\/\w+;base64,/, ""),
                "base64",
              );

              const { data, error } = await supabase.storage
                .from("headshots")
                .upload(`${user.id}/${Date.now()}_${i}.jpg`, buffer, {
                  contentType: "image/jpeg",
                  upsert: true, // Changed to true to overwrite existing files
                });

              if (error) {
                console.error("Error saving image to storage:", error);
              } else {
                console.log(`Successfully saved image ${i} to storage`);
              }
            } catch (storageError) {
              console.error(
                "Error processing image for storage:",
                storageError,
              );
            }
          }
        }
      } catch (bucketError) {
        console.error("Error checking/creating storage bucket:", bucketError);
        // Continue without saving images
      }
    }

    // Ensure we're not returning null or undefined and always have at least 4 images
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

    // Log the number of images we have before any adjustments
    console.log(
      `Number of images before adjustment: ${finalResponse.images.length}, numImagesToGenerate: ${numImagesToGenerate}`,
    );

    // Ensure we have enough images for all subscription tiers (up to 10 for Pro)
    if (finalResponse.images.length > 10) {
      finalResponse.images = finalResponse.images.slice(0, 10);
      console.log(
        `Trimmed excess images, now have: ${finalResponse.images.length}`,
      );
    } else if (
      finalResponse.images.length < numImagesToGenerate &&
      finalResponse.images.length > 0
    ) {
      // If we have fewer than the required images based on subscription tier, duplicate existing ones
      console.log(
        `Not enough images (${finalResponse.images.length}), duplicating to reach ${numImagesToGenerate}`,
      );
      while (finalResponse.images.length < numImagesToGenerate) {
        finalResponse.images.push(
          finalResponse.images[
            finalResponse.images.length % finalResponse.images.length
          ],
        );
      }
      console.log(
        `After duplication, now have: ${finalResponse.images.length} images`,
      );
    } else if (finalResponse.images.length > numImagesToGenerate) {
      // If we have more images than needed for this tier, trim to the correct number
      finalResponse.images = finalResponse.images.slice(0, numImagesToGenerate);
      console.log(
        `Trimmed to match subscription tier, now have: ${finalResponse.images.length} images`,
      );
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
