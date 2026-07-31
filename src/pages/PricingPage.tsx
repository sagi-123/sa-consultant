import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PRICING_PLANS } from "@/config/plans";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingPage: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        {/* Header Hero Section */}
        <section className="px-4 text-center max-w-4xl mx-auto mb-10">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-none font-semibold px-3 py-1 mb-4 rounded-full text-xs uppercase tracking-wide">
            Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
            Hire local. <span className="text-primary">Start free.</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Try SA Elevate free for 14 days — connect with real local candidates from day one. Upgrade only when you're ready.
          </p>

          {/* Billing Switch */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span
              onClick={() => setIsYearly(false)}
              className={`text-sm font-semibold cursor-pointer transition-colors ${
                !isYearly ? "text-foreground font-bold" : "text-muted-foreground"
              }`}
            >
              Monthly
            </span>

            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              aria-label="Toggle annual billing"
            />

            <span
              onClick={() => setIsYearly(true)}
              className={`text-sm font-semibold cursor-pointer flex items-center gap-1.5 transition-colors ${
                isYearly ? "text-foreground font-bold" : "text-muted-foreground"
              }`}
            >
              Yearly
              <span className="bg-emerald-500 text-white rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                Save 20%
              </span>
            </span>
          </div>
        </section>

        {/* Pricing Cards Grid - Free & Starter */}
        <section className="px-4 sm:px-6 max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {PRICING_PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} isYearly={isYearly} />
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <PricingFAQ />

        {/* Bottom CTA Banner */}
        <section className="px-4 sm:px-8 max-w-6xl mx-auto w-full mt-12">
          <div className="rounded-3xl gradient-bg text-white p-8 md:p-12 text-center relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Ready to find your next great hire?
              </h2>
              <p className="text-white/90 text-sm md:text-base mt-2 max-w-lg mx-auto font-medium">
                Post your first job in under 2 minutes. No credit card required.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-extrabold px-8 h-12 rounded-xl shadow-md border-0"
                >
                  <a href="/auth?mode=signup&plan=free" className="flex items-center gap-2 text-primary font-extrabold">
                    <span>Post a Free Job</span> <ArrowRight className="w-4 h-4 text-primary" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/80 bg-transparent text-white hover:bg-white/10 font-bold px-6 h-12 rounded-xl"
                >
                  <a href="/contact" className="text-white font-bold">Book a Demo</a>
                </Button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/90 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Free 14-day trial
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PricingPage;
