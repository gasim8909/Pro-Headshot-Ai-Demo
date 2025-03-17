import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import { api } from "@/lib/polar";
import { createClient } from "../../../supabase/server";

export default async function Pricing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  const result = plans?.items;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {result
            ?.sort((a: any, b: any) => {
              // Custom sort order: Free first, then Premium, then Professional
              const nameOrder = { Free: 1, Premium: 2, Professional: 3 };
              // Ensure case-insensitive comparison and handle undefined names
              const aName = a.name?.trim() || "";
              const bName = b.name?.trim() || "";
              return (nameOrder[aName] || 999) - (nameOrder[bName] || 999);
            })
            .map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
        </div>
      </div>
    </>
  );
}
