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
          "Create a professional headshot suitable for LinkedIn or a corporate profile. Ensure proper lighting, a neutral background, and a professional appearance.";
        break;
      case "creative":
        stylePrompt =
          "Create an artistic, creative headshot with unique lighting and composition. Make it stand out while still looking professional.";
        break;
      case "casual":
        stylePrompt =
          "Create a casual, approachable headshot with natural lighting and a relaxed feel. Keep it friendly and authentic.";
        break;
      default:
        stylePrompt =
          "Create a professional headshot suitable for LinkedIn or a corporate profile.";
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
      console.log(
        `Retrying image generation (attempt ${retryCount + 1} of ${GEMINI_CONFIG.MAX_RETRIES})`,
      );
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount)),
      );
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
 * @returns Promise with array of base64 encoded generated images
 */
export async function processImages(
  images: Array<{ content: string; contentType: string }>,
  prompt: string = "",
  style: string = "professional",
): Promise<string[]> {
  try {
    // Limit concurrent requests to avoid overwhelming the API
    const MAX_CONCURRENT = 2;
    const results: (string | null)[] = [];

    // Process images in batches to avoid overwhelming the API
    for (let i = 0; i < images.length; i += MAX_CONCURRENT) {
      const batch = images.slice(i, i + MAX_CONCURRENT);

      // Process each image in the current batch in parallel
      const batchPromises = batch.map((image) =>
        generateHeadshot(image.content, image.contentType, prompt, style).catch(
          (error) => {
            console.error(`Error processing image: ${error.message}`);
            return null; // Return null for failed generations
          },
        ),
      );

      // Wait for the current batch to complete
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add a small delay between batches to avoid rate limiting
      if (i + MAX_CONCURRENT < images.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
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

    return validResults;
  } catch (error) {
    console.error("Error processing images:", error);
    throw error;
  }
}
