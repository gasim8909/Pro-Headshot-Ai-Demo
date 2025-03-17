import GeminiDebug from "@/components/gemini-debug";
import Footer from "@/components/footer";

export default function DebugPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container py-8 pt-24 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Debug Tools</h1>
        <GeminiDebug />
      </div>
      <Footer />
    </div>
  );
}
