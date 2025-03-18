import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles } from "lucide-react";
import { createClient } from "../../../supabase/server";
import PricingClient from "./pricing-client";

export default async function Pricing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  const result = plans?.items;

  // Sort plans: Free first, then Premium, then Professional
  const sortedPlans = result?.sort((a: any, b: any) => {
    const nameOrder = { Free: 1, Premium: 2, Professional: 3 };
    const aName = a.name?.trim() || "";
    const bName = b.name?.trim() || "";
    return (nameOrder[aName] || 999) - (nameOrder[bName] || 999);
  });

  // Define feature categories and their display names
  const featureCategories = [
    { id: "headshots", name: "Uploads & Variations" },
    { id: "styles", name: "Style Options & Prompting" },
    { id: "uploads", name: "Quality & Resolution" },
    { id: "storage", name: "Storage & History" },
    { id: "support", name: "Support" },
  ];

  // Define features for each plan
  const planFeatures = {
    Free: {
      headshots: [
        { text: "5 uploads per month", included: true },
        { text: "+5 uploads for registered accounts", included: true },
        { text: "2 AI-generated headshots per generation", included: true },
        { text: "+2 headshots for registered accounts", included: true },
      ],
      styles: [
        { text: "3 predefined professional styles", included: true },
        { text: "Custom styles", included: false },
        { text: "Custom prompting", included: false },
      ],
      uploads: [
        { text: "Basic quality enhancement", included: true },
        { text: "Standard resolution outputs", included: true },
      ],
      storage: [
        { text: "Basic history tracking", included: true },
        { text: "Manual download required", included: true },
        { text: "Cloud storage", included: false },
      ],
      support: [
        { text: "Community support", included: true },
        { text: "Knowledge base access", included: true },
        { text: "Priority support", included: false },
      ],
    },
    Premium: {
      headshots: [
        { text: "30 uploads per month", included: true },
        { text: "6 AI-generated headshots per generation", included: true },
        { text: "Enhanced quality processing", included: true },
      ],
      styles: [
        { text: "8 predefined professional styles", included: true },
        { text: "Open custom prompting", included: true },
        { text: "Full control over AI generation", included: true },
      ],
      uploads: [
        { text: "High resolution outputs", included: true },
        { text: "Batch processing", included: true },
      ],
      storage: [
        { text: "Advanced history tracking", included: true },
        { text: "Cloud storage for all generations", included: true },
        { text: "Download in multiple formats", included: true },
      ],
      support: [
        { text: "Priority email support", included: true },
        { text: "48-hour response time", included: true },
        { text: "Dedicated account manager", included: false },
      ],
    },
    Professional: {
      headshots: [
        { text: "100 uploads per month", included: true },
        { text: "10 AI-generated headshots per generation", included: true },
        { text: "Premium quality processing", included: true },
      ],
      styles: [
        { text: "10+ predefined and custom styles", included: true },
        { text: "Fully customizable prompting", included: true },
        { text: "Advanced AI parameters", included: true },
      ],
      uploads: [
        { text: "Maximum resolution outputs", included: true },
        { text: "Priority batch processing", included: true },
      ],
      storage: [
        { text: "Unlimited history tracking", included: true },
        { text: "Cloud storage for all generations", included: true },
        {
          text: "Download in all formats (JPEG, PNG, TIFF, RAW)",
          included: true,
        },
      ],
      support: [
        { text: "Personal account manager", included: true },
        { text: "Priority chat/email support", included: true },
        { text: "24-hour response time", included: true },
      ],
    },
  };

  return (
    <>
      <Navbar />
      {user && <PricingClient userId={user.id} />}
      <div className="container mx-auto px-4 py-16 mb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Choose the perfect plan for your professional headshots. No hidden
            fees or surprises.
          </p>
          <div className="max-w-3xl mx-auto bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">
              Why upgrade to Premium or Professional?
            </h2>
            <p className="text-gray-700 mb-4">
              Our paid plans offer significant advantages that help you create
              the perfect professional image:
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex flex-col items-start">
                <div className="bg-blue-100 p-2 rounded-full mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  More Generations
                </h3>
                <p className="text-sm text-gray-600">
                  Get 5x to unlimited AI headshots compared to the free plan,
                  perfect for professionals who need variety.
                </p>
              </div>
              <div className="flex flex-col items-start">
                <div className="bg-purple-100 p-2 rounded-full mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Advanced Styles
                </h3>
                <p className="text-sm text-gray-600">
                  Access all 10+ professional styles including executive,
                  modern, artistic, and minimalist options.
                </p>
              </div>
              <div className="flex flex-col items-start">
                <div className="bg-indigo-100 p-2 rounded-full mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-indigo-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Premium Quality
                </h3>
                <p className="text-sm text-gray-600">
                  Enjoy higher resolution outputs and enhanced processing for
                  more professional-looking results.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Table for Desktop */}
        <div className="hidden lg:block max-w-6xl mx-auto">
          <div className="relative z-10 flex justify-center mb-12">
            {/* Plan cards */}
            {sortedPlans?.map((plan: any, planIndex: number) => {
              const isPremium = plan.name?.toLowerCase().includes("premium");
              const isPro = plan.name?.toLowerCase().includes("professional");
              const isFree = plan.name?.toLowerCase().includes("free");

              return (
                <div
                  key={plan.id}
                  className={`w-[320px] rounded-3xl ${
                    isPremium
                      ? "bg-gradient-to-b from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-xl z-20 scale-110 my-8"
                      : isPro
                        ? "bg-gradient-to-b from-purple-50 to-indigo-50 border-2 border-purple-400 shadow-lg z-10"
                        : "bg-white border border-gray-200 shadow-md"
                  }`}
                >
                  <div className="p-8 text-center">
                    {isPremium && (
                      <div className="absolute -top-5 left-0 right-0 mx-auto w-fit px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-md flex items-center justify-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Most Popular
                      </div>
                    )}
                    {isPro && (
                      <div className="absolute -top-5 left-0 right-0 mx-auto w-fit px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-md flex items-center justify-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Best Value
                      </div>
                    )}

                    <h3
                      className={`text-2xl font-bold mb-2 ${isPremium ? "text-blue-700" : isPro ? "text-purple-700" : "text-gray-800"}`}
                    >
                      {plan.name}
                    </h3>

                    <div className="mt-4 mb-6">
                      <span
                        className={`text-5xl font-extrabold ${isPremium ? "text-blue-700" : isPro ? "text-purple-700" : "text-gray-800"}`}
                      >
                        {plan.prices?.[0]?.priceAmount
                          ? `${plan.prices[0].priceAmount / 100}`
                          : "$0"}
                      </span>
                      <span className="text-gray-600 ml-1">/month</span>

                      {!isFree && (
                        <p className="text-sm text-gray-500 mt-1">
                          Billed monthly
                        </p>
                      )}
                    </div>

                    <div className="mb-6 text-left">
                      {isPremium && (
                        <p className="text-blue-700 text-sm font-medium mb-3 border-l-2 border-blue-400 pl-3">
                          Perfect for professionals who need variety and quality
                          in their headshots.
                        </p>
                      )}
                      {isPro && (
                        <p className="text-purple-700 text-sm font-medium mb-3 border-l-2 border-purple-400 pl-3">
                          Ideal for businesses, recruiters, and executives
                          requiring maximum flexibility.
                        </p>
                      )}
                      {isFree && (
                        <p className="text-gray-600 text-sm mb-3 border-l-2 border-gray-300 pl-3">
                          Great for trying out our AI headshot technology.
                        </p>
                      )}
                    </div>

                    <div className="space-y-4 mb-8 text-left">
                      {featureCategories.map((category) => {
                        // Get the first feature from each category to display as highlight
                        const highlightFeature =
                          planFeatures[plan.name]?.[category.id]?.[0];
                        if (!highlightFeature) return null;

                        return highlightFeature.included ? (
                          <div
                            key={`highlight-${plan.id}-${category.id}`}
                            className="flex items-start gap-2"
                          >
                            <Check
                              className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isPremium ? "text-blue-500" : isPro ? "text-purple-600" : "text-green-500"}`}
                            />
                            <span className="text-gray-700">
                              {highlightFeature.text}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>

                    <Button
                      className={`w-full py-6 text-base font-semibold rounded-xl transition-all duration-300 ${
                        isPremium
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                          : isPro
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900 hover:shadow-md"
                      }`}
                      asChild
                    >
                      <a
                        href={user ? "#" : "/sign-in?redirect=pricing"}
                        data-price-id={plan.prices?.[0]?.id}
                      >
                        {plan.name === "Free" ? "Get Started" : "Subscribe Now"}
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature comparison section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mt-12">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                Compare All Features
              </h3>
              <p className="text-gray-600 mt-2">
                See how our Premium and Professional plans offer significantly
                more value compared to the Free tier.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Features
                    </th>
                    {sortedPlans?.map((plan: any) => {
                      const isPremium = plan.name
                        ?.toLowerCase()
                        .includes("premium");
                      const isPro = plan.name
                        ?.toLowerCase()
                        .includes("professional");
                      return (
                        <th
                          key={`header-${plan.id}`}
                          className={`p-4 text-center font-semibold ${isPremium ? "text-blue-700" : isPro ? "text-purple-700" : "text-gray-700"}`}
                        >
                          {plan.name}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {featureCategories.map((category) => (
                    <React.Fragment key={category.id}>
                      <tr className="bg-gray-50 sticky top-0 z-10">
                        <th
                          colSpan={sortedPlans?.length + 1}
                          className="p-4 text-left font-semibold text-gray-700 border-t border-b border-gray-200"
                        >
                          {category.name}
                        </th>
                      </tr>
                      {planFeatures[sortedPlans?.[0]?.name]?.[category.id]?.map(
                        (feature: any, index: number) => (
                          <tr
                            key={`${category.id}-feature-${index}`}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-4 text-gray-700 font-medium border-r border-gray-100">
                              {feature.text}
                            </td>

                            {sortedPlans?.map((plan: any) => {
                              const isPremium = plan.name
                                ?.toLowerCase()
                                .includes("premium");
                              const isPro = plan.name
                                ?.toLowerCase()
                                .includes("professional");
                              const isIncluded =
                                planFeatures[plan.name]?.[category.id]?.[index]
                                  ?.included;

                              return (
                                <td
                                  key={`${plan.id}-${category.id}-${index}`}
                                  className="p-4 text-center"
                                >
                                  {isIncluded ? (
                                    <div className="flex justify-center items-center">
                                      <div
                                        className={`rounded-full p-1 ${isPremium ? "bg-blue-100" : isPro ? "bg-purple-100" : "bg-green-100"}`}
                                      >
                                        <Check
                                          className={`h-5 w-5 ${isPremium ? "text-blue-600" : isPro ? "text-purple-600" : "text-green-600"}`}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex justify-center items-center">
                                      <div className="rounded-full p-1 bg-gray-100">
                                        <X className="h-5 w-5 text-gray-400" />
                                      </div>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ),
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile Pricing Cards */}
        <div className="lg:hidden space-y-10 px-4">
          {sortedPlans?.map((plan: any) => {
            const isPremium = plan.name?.toLowerCase().includes("premium");
            const isPro = plan.name?.toLowerCase().includes("professional");
            const isFree = plan.name?.toLowerCase().includes("free");

            return (
              <div
                key={`mobile-${plan.id}`}
                className={`rounded-2xl overflow-hidden ${
                  isPremium
                    ? "border-2 border-blue-400 shadow-xl bg-gradient-to-b from-blue-50 to-indigo-50"
                    : isPro
                      ? "border-2 border-purple-400 shadow-xl bg-gradient-to-b from-purple-50 to-indigo-50"
                      : "border border-gray-200 shadow-lg bg-white"
                }`}
              >
                <div className="relative p-6 text-center">
                  {(isPremium || isPro) && (
                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-md flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {isPremium ? "Most Popular" : "Best Value"}
                    </div>
                  )}
                  <h3
                    className={`text-2xl font-bold mt-2 ${isPremium ? "text-blue-700" : isPro ? "text-purple-700" : "text-gray-800"}`}
                  >
                    {plan.name}
                  </h3>
                  <div className="mt-3 mb-4">
                    <span
                      className={`text-4xl font-extrabold ${isPremium ? "text-blue-700" : isPro ? "text-purple-700" : "text-gray-800"}`}
                    >
                      {plan.prices?.[0]?.priceAmount
                        ? `${plan.prices[0].priceAmount / 100}`
                        : "$0"}
                    </span>
                    <span className="text-gray-600 ml-1">/month</span>
                    {!isFree && (
                      <p className="text-sm text-gray-500 mt-1">
                        Billed monthly
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-white">
                  <div className="mb-4">
                    {isPremium && (
                      <p className="text-blue-700 text-sm font-medium mb-3 border-l-2 border-blue-400 pl-3">
                        Perfect for professionals who need variety and quality
                        in their headshots.
                      </p>
                    )}
                    {isPro && (
                      <p className="text-purple-700 text-sm font-medium mb-3 border-l-2 border-purple-400 pl-3">
                        Ideal for businesses, recruiters, and executives
                        requiring maximum flexibility.
                      </p>
                    )}
                    {isFree && (
                      <p className="text-gray-600 text-sm mb-3 border-l-2 border-gray-300 pl-3">
                        Great for trying out our AI headshot technology.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    {featureCategories.map((category) => {
                      // Get the first feature from each category to display as highlight
                      const highlightFeature =
                        planFeatures[plan.name]?.[category.id]?.[0];
                      if (!highlightFeature) return null;

                      return highlightFeature.included ? (
                        <div
                          key={`highlight-${plan.id}-${category.id}`}
                          className="flex items-start gap-2"
                        >
                          <div
                            className={`rounded-full p-0.5 mt-0.5 ${isPremium ? "bg-blue-100" : isPro ? "bg-purple-100" : "bg-green-100"}`}
                          >
                            <Check
                              className={`h-4 w-4 ${isPremium ? "text-blue-600" : isPro ? "text-purple-600" : "text-green-600"}`}
                            />
                          </div>
                          <span className="text-gray-700 text-sm">
                            {highlightFeature.text}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>

                  <details className="group mb-4">
                    <summary className="list-none flex justify-between items-center cursor-pointer">
                      <span className="text-sm font-medium text-blue-600">
                        View all features
                      </span>
                      <svg
                        className="h-5 w-5 text-blue-600 group-open:rotate-180 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="mt-4 space-y-6 text-sm">
                      {featureCategories.map((category) => (
                        <div
                          key={`mobile-${plan.id}-${category.id}`}
                          className="mb-4"
                        >
                          <h4 className="font-semibold text-gray-800 pb-2 mb-2 border-b border-gray-100">
                            {category.name}
                          </h4>
                          <ul className="space-y-2.5">
                            {planFeatures[plan.name]?.[category.id]?.map(
                              (feature: any, index: number) => (
                                <li
                                  key={`mobile-${plan.id}-${category.id}-${index}`}
                                  className="flex items-start gap-2"
                                >
                                  {feature.included ? (
                                    <div
                                      className={`rounded-full p-0.5 mt-0.5 ${isPremium ? "bg-blue-100" : isPro ? "bg-purple-100" : "bg-green-100"}`}
                                    >
                                      <Check
                                        className={`h-4 w-4 ${isPremium ? "text-blue-600" : isPro ? "text-purple-600" : "text-green-600"}`}
                                      />
                                    </div>
                                  ) : (
                                    <div className="rounded-full p-0.5 mt-0.5 bg-gray-100">
                                      <X className="h-4 w-4 text-gray-400" />
                                    </div>
                                  )}
                                  <span
                                    className={
                                      feature.included
                                        ? "text-gray-700"
                                        : "text-gray-400"
                                    }
                                  >
                                    {feature.text}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>

                <div className="p-6 border-t border-gray-100">
                  <Button
                    className={`w-full py-5 rounded-xl text-base font-semibold transition-all duration-300 ${
                      isPremium
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                        : isPro
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900 hover:shadow-md"
                    }`}
                    asChild
                  >
                    <a
                      href={user ? "#" : "/sign-in?redirect=pricing"}
                      data-price-id={plan.prices?.[0]?.id}
                    >
                      {plan.name === "Free" ? "Get Started" : "Subscribe Now"}
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plan Comparison Section */}
        <div className="mt-32 max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">
            Why Choose Premium or Professional?
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Our paid plans offer significant advantages for serious
            professionals
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-24">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-blue-800">
                  Premium Plan
                </h3>
              </div>

              <p className="text-gray-700 mb-6">
                Our Premium plan is perfect for professionals who need
                high-quality headshots with more variety and options.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">
                      30 uploads per month
                    </span>
                    <p className="text-sm text-gray-600">
                      6x more than the free plan, perfect for trying different
                      styles and poses
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">
                      Open custom prompting
                    </span>
                    <p className="text-sm text-gray-600">
                      Access to 8 professional styles with full control over AI
                      generation parameters
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">
                      History tracking
                    </span>
                    <p className="text-sm text-gray-600">
                      Save and organize all your generated headshots in the
                      cloud
                    </p>
                  </div>
                </li>
              </ul>

              <p className="text-blue-800 font-medium mb-6">
                Ideal for: Job seekers, freelancers, and professionals who need
                quality headshots for their profiles
              </p>

              <Button
                className="w-full py-5 rounded-xl text-base font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                asChild
              >
                <a
                  href={user ? "#" : "/sign-in?redirect=pricing"}
                  data-price-id={
                    sortedPlans?.find((p) =>
                      p.name?.toLowerCase().includes("premium"),
                    )?.prices?.[0]?.id
                  }
                >
                  Upgrade to Premium
                </a>
              </Button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-purple-800">
                  Professional Plan
                </h3>
              </div>

              <p className="text-gray-700 mb-6">
                Our Professional plan offers unlimited generations and the
                highest quality for businesses and serious professionals.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="bg-purple-100 p-1 rounded-full mt-0.5">
                    <Check className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">
                      100 uploads per month
                    </span>
                    <p className="text-sm text-gray-600">
                      Create up to 1000 AI headshots with 10 variations per
                      upload
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-purple-100 p-1 rounded-full mt-0.5">
                    <Check className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">
                      Advanced AI parameters
                    </span>
                    <p className="text-sm text-gray-600">
                      Fully customizable prompting with 10+ predefined and
                      custom styles
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-purple-100 p-1 rounded-full mt-0.5">
                    <Check className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">
                      Personal account manager
                    </span>
                    <p className="text-sm text-gray-600">
                      Priority chat/email support with 24-hour response time
                    </p>
                  </div>
                </li>
              </ul>

              <p className="text-purple-800 font-medium mb-6">
                Ideal for: Businesses, recruiters, executives, and teams needing
                consistent professional imagery
              </p>

              <Button
                className="w-full py-5 rounded-xl text-base font-semibold transition-all duration-300 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                asChild
              >
                <a
                  href={user ? "#" : "/sign-in?redirect=pricing"}
                  data-price-id={
                    sortedPlans?.find((p) =>
                      p.name?.toLowerCase().includes("professional"),
                    )?.prices?.[0]?.id
                  }
                >
                  Upgrade to Professional
                </a>
              </Button>
            </div>
          </div>

          {/* FAQ Section */}
          <h2 className="text-3xl font-bold text-center mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Everything you need to know about our plans and pricing
          </p>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden divide-y divide-gray-200">
            <div className="p-6 hover:bg-gray-50 transition-colors">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                What happens when I reach my monthly limit?
              </h3>
              <p className="text-gray-600">
                When you reach your monthly generation limit, you can upgrade to
                a higher tier plan to continue generating headshots. Your limit
                resets automatically on the first day of each billing cycle.
              </p>
            </div>

            <div className="p-6 hover:bg-gray-50 transition-colors">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time from your
                dashboard. You'll continue to have access to your plan until the
                end of your current billing period with no additional charges.
              </p>
            </div>

            <div className="p-6 hover:bg-gray-50 transition-colors">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards including Visa, Mastercard,
                American Express, and Discover. All payments are securely
                processed through our payment provider with bank-level
                encryption.
              </p>
            </div>

            <div className="p-6 hover:bg-gray-50 transition-colors">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 7-day money-back guarantee for all paid plans. If
                you're not satisfied with our service, contact our support team
                within 7 days of your purchase for a full refund, no questions
                asked.
              </p>
            </div>

            <div className="p-6 hover:bg-gray-50 transition-colors">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                What's the difference between the style options?
              </h3>
              <p className="text-gray-600">
                Each style option provides different aesthetics for your
                headshots. Professional styles are ideal for LinkedIn and
                corporate profiles, casual styles work well for social media,
                and creative styles offer artistic flair for creative
                professionals. Premium and Pro plans include access to all
                advanced styles.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Our team is ready to help you choose the right plan for your
              specific needs and answer any questions you might have about our
              AI headshot technology.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 rounded-xl text-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              <a href="mailto:support@aiheadshots.com">Contact Support</a>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
