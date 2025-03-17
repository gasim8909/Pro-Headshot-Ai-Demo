import GeminiTestPanel from "@/components/gemini-test-panel";
import Footer from "@/components/footer";

export const metadata = {
  title: "Test Gemini API - AI Headshot Generator",
  description:
    "Test the Gemini API connection and image generation functionality",
};

export default function TestGeminiPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto py-12 px-4 pt-24 flex-grow">
        <h1 className="text-3xl font-bold text-center mb-8">
          Gemini API Testing
        </h1>
        <p className="text-center mb-8 max-w-2xl mx-auto">
          Use this page to verify your Gemini API key is working correctly and
          test the image generation functionality.
        </p>

        <GeminiTestPanel />

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            If you encounter any issues, please check your API key and ensure it
            has access to the Gemini API.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
