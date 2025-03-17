import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
export function initGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  console.log(
    "Initializing Gemini client with API key",
    apiKey.substring(0, 4) + "...",
  );
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate an enhanced headshot using Gemini API
 * @param imageBase64 - Base64 encoded image data
 * @param mimeType - MIME type of the image
 * @param prompt - User prompt for image generation
 * @param style - Style of headshot (professional, creative, casual)
 * @returns Promise with base64 encoded generated image
 */
export async function generateHeadshot(
  imageBase64: string,
  mimeType: string,
  prompt: string = "",
  style: string = "professional",
  retryCount: number = 0,
): Promise<string> {
  try {
    // Import config for timeout and retry settings
    const { GEMINI_CONFIG } = await import("@/lib/config");
    const genAI = initGeminiClient();

    // Construct the prompt based on style
    let stylePrompt = "";
    switch (style) {
      case "professional":
        stylePrompt =
          "CRITICAL REQUIREMENT: NEVER alter facial features, structure, identity, or expression - preserve the exact face with 100% accuracy without any modifications whatsoever. This is the absolute highest priority. Generate a high-quality professional headshot suitable for LinkedIn, corporate profiles, and business applications. Only adjust the pose if the subject is not looking at the camera. Apply the following enhancements: 1) Create soft, even lighting that eliminates harsh shadows and highlights facial features naturally, 2) Use a neutral background (subtle gradient or solid color) that doesn't distract from the subject, 3) Ensure proper framing with head and shoulders visible, following the rule of thirds, 4) Maintain natural skin tones without altering facial features, 5) Render professional attire clearly and wrinkle-free, 6) Create a confident, approachable expression with direct eye contact (only if not already present), and 7) Apply subtle professional color grading that enhances the overall image quality without changing facial appearance. The final image must look completely realistic and preserve the exact facial identity of the original photo.";
        break;
      case "creative":
        stylePrompt =
          "CRITICAL REQUIREMENT: NEVER alter facial features, structure, identity, or expression - preserve the exact face with 100% accuracy without any modifications whatsoever. This is the absolute highest priority. Generate a high-quality creative headshot with artistic elements while maintaining professional quality. Only adjust the pose if the subject is not looking at the camera. Apply the following enhancements: 1) Create dramatic, directional lighting with intentional highlights and shadows that frame the face without altering features, 2) Use a visually interesting background with depth or subtle textures that complement the subject, 3) Implement creative composition that may include interesting angles or framing while keeping the face clearly visible and unmodified, 4) Apply a distinctive color palette or stylized color grading that creates mood without appearing heavily filtered or changing facial appearance, 5) Maintain professional appearance while preserving the original facial features exactly, and 6) Ensure the final image appears polished and intentionally artistic rather than randomly filtered, while keeping the face completely unaltered. The final image must look completely realistic and preserve the exact facial identity of the original photo.";
        break;
      case "casual":
        stylePrompt =
          "CRITICAL REQUIREMENT: NEVER alter facial features, structure, identity, or expression - preserve the exact face with 100% accuracy without any modifications whatsoever. This is the absolute highest priority. Generate a high-quality casual headshot that appears natural and approachable while maintaining professional quality. Only adjust the pose if the subject is not looking at the camera. Apply the following enhancements: 1) Create natural, outdoor-style lighting that mimics golden hour or soft daylight, 2) Use a lifestyle-appropriate background that suggests an everyday environment without being distracting, 3) Frame the subject to include head and upper shoulders in a relaxed, natural pose (maintaining original pose if already looking at camera), 4) Maintain authentic skin tones and textures without altering facial features in any way, 5) Render casual but neat attire clearly, 6) Preserve the genuine expression exactly as in the original photo, and 7) Apply color grading that enhances warmth and approachability without changing facial appearance. The final image must look completely realistic and preserve the exact facial identity of the original photo.";
        break;
      default:
        stylePrompt =
          "CRITICAL REQUIREMENT: NEVER alter facial features, structure, identity, or expression - preserve the exact face with 100% accuracy without any modifications whatsoever. This is the absolute highest priority. Generate a high-quality professional headshot suitable for LinkedIn, corporate profiles, and business applications. Only adjust the pose if the subject is not looking at the camera. Apply the following enhancements: 1) Create soft, even lighting that eliminates harsh shadows and highlights facial features naturally, 2) Use a neutral background (subtle gradient or solid color) that doesn't distract from the subject, 3) Ensure proper framing with head and shoulders visible, following the rule of thirds, 4) Maintain natural skin tones without altering facial features, 5) Render professional attire clearly and wrinkle-free, 6) Create a confident, approachable expression with direct eye contact (only if not already present), and 7) Apply subtle professional color grading that enhances the overall image quality without changing facial appearance. The final image must look completely realistic and preserve the exact facial identity of the original photo.";
    }

    // Combine user prompt with style prompt
    const fullPrompt = `${stylePrompt} ${prompt ? prompt : ""}`;

    // Prepare the content parts
    const contents = [
      { text: fullPrompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      },
    ];

    // Set up the model with image generation capability
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        responseModalities: ["Text", "Image"],
      },
    });

    // Generate the content
    const response = await model.generateContent(contents);

    // Extract the image from the response
    console.log("Gemini response received, extracting image data...");

    // Log the response structure for debugging
    console.log(
      "Response structure:",
      JSON.stringify({
        candidates: response.response.candidates.length,
        parts: response.response.candidates[0]?.content?.parts?.length || 0,
      }),
    );

    for (const part of response.response.candidates[0].content.parts) {
      if (part.inlineData) {
        console.log("Image data found in response");
        // Ensure the data is properly formatted
        const imageData = part.inlineData.data;

        // Validate the image data is a proper base64 string
        if (
          typeof imageData === "string" &&
          (imageData.startsWith("data:image") ||
            /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(
              imageData,
            ))
        ) {
          // If it doesn't have the data:image prefix, add it
          if (!imageData.startsWith("data:image")) {
            return `data:image/jpeg;base64,${imageData}`;
          }
          return imageData;
        } else {
          console.error("Invalid image data format received");
          throw new Error("Invalid image data format received from Gemini API");
        }
      }
    }

    throw new Error("No image was generated in the response");
  } catch (error) {
    console.error("Error generating image with Gemini:", error);

    // Import config for retry settings
    const { GEMINI_CONFIG } = await import("@/lib/config");

    // Retry logic for transient errors
    if (retryCount < GEMINI_CONFIG.MAX_RETRIES) {
      // Check if it's a rate limit error (429)
      const isRateLimitError = error.message && error.message.includes("429");
      const isQuotaError = error.message && error.message.includes("quota");

      // Longer delay for rate limit errors
      const baseDelay = isRateLimitError || isQuotaError ? 5000 : 1000;
      const delay = baseDelay * Math.pow(2, retryCount);

      console.log(
        `Retrying image generation (attempt ${retryCount + 1} of ${GEMINI_CONFIG.MAX_RETRIES}) after ${delay}ms delay. ${isRateLimitError ? "Rate limit detected - using longer delay." : ""}`,
      );

      // Wait before retrying (exponential backoff with longer delay for rate limits)
      await new Promise((resolve) => setTimeout(resolve, delay));

      return generateHeadshot(
        imageBase64,
        mimeType,
        prompt,
        style,
        retryCount + 1,
      );
    }

    throw error;
  }
}

/**
 * Process multiple images using Gemini API
 * @param images - Array of image objects with base64 content and MIME type
 * @param prompt - User prompt for image generation
 * @param style - Style of headshot
 * @param minResults - Minimum number of results to generate (default: 4)
 * @returns Promise with array of base64 encoded generated images
 */
export async function processImages(
  images: Array<{ content: string; contentType: string }>,
  prompt: string = "",
  style: string = "professional",
  minResults: number = 4,
): Promise<string[]> {
  try {
    // Limit concurrent requests to avoid overwhelming the API
    const MAX_CONCURRENT = 2;
    const results: (string | null)[] = [];

    // Process images in batches to avoid overwhelming the API
    for (let i = 0; i < images.length; i += MAX_CONCURRENT) {
      const batch = images.slice(i, i + MAX_CONCURRENT);

      // Process each image in the current batch sequentially to avoid rate limiting
      for (const image of batch) {
        try {
          console.log(
            `Processing image ${results.length + 1} of ${images.length}`,
          );
          const result = await generateHeadshot(
            image.content,
            image.contentType,
            prompt,
            style,
          );
          results.push(result);

          // Add a delay between individual image processing to avoid rate limiting
          if (results.length < images.length) {
            const delay = 2000; // 2 seconds between individual images
            console.log(
              `Waiting ${delay}ms before processing next image to avoid rate limiting`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } catch (error) {
          console.error(`Error processing image: ${error.message}`);
          results.push(null); // Return null for failed generations
        }
      }

      // Add a longer delay between batches to avoid rate limiting
      if (i + MAX_CONCURRENT < images.length) {
        const batchDelay = GEMINI_CONFIG.BATCH_DELAY || 3000;
        console.log(
          `Completed batch. Waiting ${batchDelay}ms before starting next batch to avoid rate limiting`,
        );
        await new Promise((resolve) => setTimeout(resolve, batchDelay));
      }
    }

    // Filter out any null results from failed generations
    const validResults = results.filter(
      (result) => result !== null,
    ) as string[];

    if (validResults.length === 0) {
      throw new Error(
        "All image generations failed. Please try again with different images.",
      );
    }

    // If we don't have enough results, generate more variations from the existing images
    if (validResults.length < minResults && images.length > 0) {
      console.log(
        `Generated ${validResults.length} images, but need at least ${minResults}. Generating more variations...`,
      );

      // Create slight variations in the prompt to get different results
      const promptVariations = [
        prompt + " Use slightly warmer lighting.",
        prompt + " Use slightly cooler lighting.",
        prompt + " Add subtle depth to the background.",
        prompt + " Enhance the professional appearance slightly.",
      ];

      // Use the first successful image as the base for additional variations
      const baseImage = images[0];
      const additionalResults: (string | null)[] = [];

      // Generate additional images until we reach the minimum required
      for (let i = 0; i < minResults - validResults.length; i++) {
        // Use a different prompt variation for each additional image
        const variationPrompt = promptVariations[i % promptVariations.length];

        try {
          // Add a small delay between requests to avoid rate limiting
          if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          const additionalImage = await generateHeadshot(
            baseImage.content,
            baseImage.contentType,
            variationPrompt,
            style,
          );

          additionalResults.push(additionalImage);
        } catch (error) {
          console.error(`Error generating additional image: ${error.message}`);
          // If we fail to generate an additional image, duplicate an existing one as fallback
          if (validResults.length > 0) {
            additionalResults.push(validResults[0]);
          }
        }
      }

      // Add the additional results to our valid results
      validResults.push(
        ...(additionalResults.filter((result) => result !== null) as string[]),
      );
    }

    return validResults;
  } catch (error) {
    console.error("Error processing images:", error);
    throw error;
  }
}
