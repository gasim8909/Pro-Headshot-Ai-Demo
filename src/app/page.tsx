import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PricingCard from "@/components/pricing-card";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  CheckCircle2,
  Camera,
  Sparkles,
  Clock,
  Image,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  const result = plans?.items;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section with Before/After */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Professional{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  AI Headshots
                </span>{" "}
                in Minutes
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Transform your ordinary photos into stunning professional
                headshots with our AI-powered platform. Perfect for LinkedIn,
                resumes, and professional profiles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg h-auto"
                >
                  <Link href="/generate">Try For Free</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg h-auto"
                >
                  <Link href="#gallery">View Examples</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>5 free headshots</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Instant results</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-4">
                    <div className="rounded-lg overflow-hidden shadow-lg">
                      <AspectRatio ratio={3 / 4}>
                        <img
                          src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80"
                          alt="Before - Original photo"
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                      <div className="bg-white p-2 text-center text-sm font-medium">
                        Before
                      </div>
                    </div>
                    <div className="rounded-lg overflow-hidden shadow-lg">
                      <AspectRatio ratio={3 / 4}>
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80"
                          alt="Before - Original photo"
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                      <div className="bg-white p-2 text-center text-sm font-medium">
                        Before
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 mt-8">
                    <div className="rounded-lg overflow-hidden shadow-lg">
                      <AspectRatio ratio={3 / 4}>
                        <img
                          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&q=80"
                          alt="After - AI enhanced headshot"
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 text-center text-sm font-medium text-white">
                        After
                      </div>
                    </div>
                    <div className="rounded-lg overflow-hidden shadow-lg">
                      <AspectRatio ratio={3 / 4}>
                        <img
                          src="https://images.unsplash.com/photo-1573497019236-61e7a0081f95?w=500&q=80"
                          alt="After - AI enhanced headshot"
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 text-center text-sm font-medium text-white">
                        After
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose Our AI Headshots
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our advanced AI technology creates stunning professional headshots
              that make you look your best.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "Professional Quality",
                description:
                  "Studio-quality headshots without the expensive photoshoot",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Fast Results",
                description: "Get your AI headshots in minutes, not days",
              },
              {
                icon: <Camera className="w-6 h-6" />,
                title: "Multiple Styles",
                description:
                  "Choose from professional, creative, or casual styles",
              },
              {
                icon: <Image className="w-6 h-6" />,
                title: "High Resolution",
                description:
                  "Download high-resolution images ready for any use",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Gallery of AI Headshots</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our collection of AI-generated headshots in different
              styles and settings.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80",
              "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&q=80",
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80",
              "https://images.unsplash.com/photo-1573497019236-61e7a0081f95?w=300&q=80",
              "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&q=80",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
            ].map((image, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <AspectRatio ratio={1}>
                  <img
                    src={image}
                    alt={`AI Headshot example ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg h-auto"
            >
              <Link href="/generate">Create Your Headshots</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Creating professional AI headshots is simple with our easy 3-step
              process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                number: "1",
                title: "Upload Your Photos",
                description:
                  "Upload a few casual photos of yourself from your phone or computer.",
              },
              {
                number: "2",
                title: "Choose Your Style",
                description:
                  "Select from professional, creative, or casual styles for your headshots.",
              },
              {
                number: "3",
                title: "Get Your Results",
                description:
                  "Receive your AI-enhanced professional headshots in minutes.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your needs. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {result?.map((item: any) => (
              <div key={item.id} className="w-full">
                {item && <PricingCard item={item} user={user} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Photos?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have upgraded their online
            presence with our AI headshots.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg h-auto"
          >
            <Link href="/generate">
              Get Started Now
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
