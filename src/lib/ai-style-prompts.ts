// AI Style Prompts for Headshot Generation
// This file contains all the prompts used for generating AI headshots
// These prompts are used by both the frontend and backend

export interface StylePrompt {
  name: string;
  description: string;
  prompt: string;
  mockImages?: string[];
}

export type StyleId =
  | "professional"
  | "creative"
  | "casual"
  | "modern"
  | "executive"
  | "vintage"
  | "dynamic"
  | "monochrome"
  | "fashion"
  | "outdoor"
  | "minimalist"
  | "environmental"
  | "bold";

// Style prompts for AI headshot generation
export const AI_STYLE_PROMPTS: Record<StyleId, StylePrompt> = {
  professional: {
    name: "Professional",
    description: "Corporate, LinkedIn-ready",
    prompt: `Generate a high-quality professional headshot suitable for LinkedIn, corporate profiles, and business applications. Follow these directions strictly:

Create soft, even lighting that eliminates harsh shadows and naturally highlights facial features.
Use a neutral background (subtle gradient or solid color) that does not distract from the subject.
Ensure proper framing with head and shoulders visible, following the rule of thirds.
Maintain natural skin tones while subtly improving complexion.
Render professional attire clearly and wrinkle-free.
Create a confident, approachable expression with direct eye contact.
Apply subtle professional color grading to enhance overall image quality.`,
    mockImages: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=90&fit=crop",
    ],
  },
  creative: {
    name: "Creative Artistic",
    description: "Artistic, expressive",
    prompt: `Generate a high-quality creative headshot with artistic elements while maintaining professional quality. Follow these directions strictly:

Create dramatic, directional lighting with intentional highlights and shadows that sculpt the face.
Use a visually interesting background with depth or subtle textures that complement the subject.
Implement creative composition that may include interesting angles or framing while keeping the face clearly visible.
Apply a distinctive color palette or stylized color grading that creates mood without appearing heavily filtered.
Maintain a professional appearance while allowing for more expressive styling and poses.
Ensure the final image is polished and intentionally artistic rather than randomly filtered.`,
    mockImages: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1573497019236-61e7a0081f95?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=90&fit=crop",
    ],
  },
  casual: {
    name: "Casual",
    description: "Relaxed, approachable",
    prompt: `Generate a high-quality casual headshot that appears natural and approachable while maintaining professional quality. Follow these directions strictly:

Create natural, outdoor-style lighting that mimics golden hour or soft daylight.
Use a lifestyle-appropriate background that suggests an everyday environment without distraction.
Frame the subject to include head and upper shoulders in a relaxed, natural pose.
Maintain authentic skin tones and textures while subtly enhancing overall appearance.
Render casual but neat attire clearly.
Create a genuine, relaxed expression that appears unposed and friendly.
Apply color grading that enhances warmth and approachability.`,
    mockImages: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=90&fit=crop",
    ],
  },
  modern: {
    name: "Modern Executive",
    description: "Contemporary, trendy",
    prompt: `Generate a high-quality modern executive headshot ideal for technology and contemporary corporate profiles. Follow these directions strictly:

Use crisp, balanced lighting with a subtle backlight to create depth.
Choose a sleek, modern background such as a minimalist office setting or abstract geometric design.
Frame the head and shoulders with dynamic yet refined composition.
Enhance skin clarity and modern professional attire with subtle digital sharpening.
Incorporate a slight vignette effect to emphasize the subject.
Evoke a confident, innovative expression suitable for leadership roles.`,
    mockImages: [
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1629425733761-caae3b5f2e50?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=800&q=90&fit=crop",
    ],
  },
  executive: {
    name: "Executive",
    description: "Powerful, authoritative",
    prompt: `Generate a high-quality modern executive headshot ideal for technology and contemporary corporate profiles. Follow these directions strictly:

Use crisp, balanced lighting with a subtle backlight to create depth.
Choose a sleek, modern background such as a minimalist office setting or abstract geometric design.
Frame the head and shoulders with dynamic yet refined composition.
Enhance skin clarity and modern professional attire with subtle digital sharpening.
Incorporate a slight vignette effect to emphasize the subject.
Evoke a confident, innovative expression suitable for leadership roles.`,
    mockImages: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=90&fit=crop",
    ],
  },
  vintage: {
    name: "Vintage-Inspired",
    description: "Timeless, classic",
    prompt: `Generate a high-quality vintage-inspired headshot with a timeless, classic feel. Follow these directions strictly:

Employ soft, warm lighting that mimics natural window light with gentle shadows.
Use a background with vintage textures or subtle sepia gradients.
Frame the subject with classic proportions, emphasizing head and shoulders.
Apply film grain and a slight vignette for an authentic vintage effect.
Render traditional, timeless attire with meticulous detail.
Create a poised, elegant expression that reflects classic sophistication.`,
    mockImages: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&q=90&fit=crop",
    ],
  },
  dynamic: {
    name: "Dynamic Business",
    description: "Energetic, movement",
    prompt: `Generate a high-quality dynamic business headshot that captures energy and movement while remaining professional. Follow these directions strictly:

Utilize angular, high-contrast lighting to sculpt facial features dynamically.
Choose a background with subtle gradients or abstract elements that imply motion.
Experiment with slightly off-center framing or a dynamic angle to convey energy.
Enhance clarity and contrast while preserving natural skin tones.
Render modern business attire with crisp details.
Evoke an energetic, engaged expression that suggests momentum and confidence.`,
    mockImages: [
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=90&fit=crop",
    ],
  },
  monochrome: {
    name: "Monochrome",
    description: "Black & white, contrast",
    prompt: `Generate a high-quality monochrome headshot that emphasizes form, contrast, and texture. Follow these directions strictly:

Use high-contrast black and white lighting to accentuate facial features.
Choose a simple, monochrome background to ensure focus remains solely on the subject.
Frame the head and shoulders with strong, balanced composition.
Enhance textures and details (e.g., hair, fabric, skin) without color distractions.
Render professional attire with clear, refined lines.
Create a compelling, introspective expression that is timeless and striking.`,
    mockImages: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=90&fit=crop",
    ],
  },
  fashion: {
    name: "High-Fashion Editorial",
    description: "Glamour, professional",
    prompt: `Generate a high-quality high-fashion editorial headshot that blends glamour with professionalism. Follow these directions strictly:

Employ dramatic, stylized lighting with artistic shadows and highlights.
Use an edgy, modern background with subtle textures or abstract designs.
Frame the subject with bold, unconventional composition while keeping the face prominent.
Apply avant-garde color grading or a distinctive color palette that adds a fashionable flair.
Render sophisticated, trend-forward attire with meticulous detail.
Create a striking, confident expression that exudes both professionalism and high fashion.`,
    mockImages: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=90&fit=crop",
    ],
  },
  outdoor: {
    name: "Outdoor Professional",
    description: "Natural, fresh",
    prompt: `Generate a high-quality outdoor professional headshot that combines the freshness of nature with business-ready polish. Follow these directions strictly:

Use natural lighting reminiscent of early morning or late afternoon for soft, flattering illumination.
Choose an outdoor background with blurred natural elements (trees, urban greenery) that supports the subject without distraction.
Frame the head and shoulders with balanced, natural composition.
Enhance skin tones and textures to retain an authentic yet refined appearance.
Render professional attire suitable for both outdoor and corporate settings.
Create a relaxed yet determined expression that conveys approachability and professionalism.`,
    mockImages: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=90&fit=crop",
    ],
  },
  minimalist: {
    name: "Minimalist Studio",
    description: "Simple, clean",
    prompt: `Generate a high-quality minimalist studio headshot that emphasizes simplicity and clarity. Follow these directions strictly:

Employ controlled, even lighting in a studio setting to eliminate distractions.
Use a plain, unobtrusive background (solid color or very subtle gradient).
Frame the subject with precise, centered composition focusing on head and shoulders.
Enhance natural skin tones and textures with gentle post-processing for clarity.
Render contemporary, minimal professional attire with clear lines.
Create a neutral, confident expression that highlights natural beauty and professionalism.`,
    mockImages: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&q=90&fit=crop",
    ],
  },
  environmental: {
    name: "Environmental Portrait",
    description: "Contextual, authentic",
    prompt: `Generate a high-quality environmental portrait headshot that subtly incorporates elements of the subject's work or personal space. Follow these directions strictly:

Use ambient lighting that harmonizes with indoor or work-related settings.
Choose a background featuring soft, contextually relevant elements (e.g., office features, creative studio hints).
Frame the head and shoulders with balanced composition that integrates environmental cues.
Enhance natural skin tones and textures while preserving the authenticity of the setting.
Render attire that aligns with the subject's professional or creative field.
Create an expression that is thoughtful and engaging, reflecting both personality and professionalism.`,
    mockImages: [
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=90&fit=crop",
    ],
  },
  bold: {
    name: "Bold Color Impact",
    description: "Vibrant, energetic",
    prompt: `Generate a high-quality bold color impact headshot that uses vibrant hues to create an energetic and memorable image. Follow these directions strictly:

Use dynamic, high-saturation lighting that emphasizes facial features with creative contrast.
Choose a bold, colorful background that complements the subject without overwhelming the image.
Frame the head and shoulders with a modern, slightly asymmetrical composition.
Enhance skin tones and attire with vivid yet balanced color grading.
Render fashion-forward, contemporary attire with sharp, clean details.
Create an expressive, confident look that conveys both innovation and professionalism.`,
    mockImages: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=90&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=90&fit=crop",
    ],
  },
};

// Helper function to get a prompt by style ID
export function getPromptByStyle(styleId: StyleId): string {
  return (
    AI_STYLE_PROMPTS[styleId]?.prompt || AI_STYLE_PROMPTS.professional.prompt
  );
}

// Helper function to get mock images by style ID
export function getMockImagesByStyle(styleId: StyleId): string[] {
  return (
    AI_STYLE_PROMPTS[styleId]?.mockImages ||
    AI_STYLE_PROMPTS.professional.mockImages
  );
}

// Helper function to get all available style IDs
export function getAllStyleIds(): StyleId[] {
  return Object.keys(AI_STYLE_PROMPTS) as StyleId[];
}

// Helper function to get all available styles with their details
export function getAllStyles(): Record<StyleId, StylePrompt> {
  return AI_STYLE_PROMPTS;
}

// Export a list of style IDs for each subscription tier
export const TIER_STYLES = {
  GUEST: ["professional"] as StyleId[],
  FREE: ["professional", "casual", "creative"] as StyleId[],
  PREMIUM: [
    "professional",
    "casual",
    "creative",
    "modern",
    "executive",
    "dynamic",
    "monochrome",
    "fashion",
  ] as StyleId[],
  PRO: [
    "professional",
    "casual",
    "creative",
    "modern",
    "executive",
    "dynamic",
    "monochrome",
    "fashion",
    "outdoor",
    "minimalist",
    "environmental",
    "bold",
    "vintage",
  ] as StyleId[],
};
