import { getPromptByStyle } from "@/lib/ai-style-prompts";
import type { StyleId } from "@/lib/ai-style-prompts";

/**
 * Helper function to get the appropriate prompt for image generation
 * based on the selected style and any custom user prompt
 */
export function getGenerationPrompt(
  style: string,
  userPrompt?: string,
): string {
  // Get the base prompt for the selected style
  const basePrompt = getPromptByStyle(style as StyleId);

  // If there's no user prompt, just return the base prompt
  if (!userPrompt) {
    return basePrompt;
  }

  // If there is a user prompt, append it to the base prompt
  return `${basePrompt}\n\nAdditional instructions: ${userPrompt}`;
}
