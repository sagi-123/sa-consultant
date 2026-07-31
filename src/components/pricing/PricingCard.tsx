import React from "react";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanTier } from "@/config/plans";

interface PricingCardProps {
  plan: PlanTier;
  isYearly: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isYearly }) => {
  const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <div
      className={`relative flex flex-col rounded-xl bg-card p-5 md:p-6 transition-all duration-300 border ${
        plan.popular
          ? "border-primary shadow-lg ring-1 ring-primary/20"
          : "border-border shadow-sm hover:shadow-md"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground font-semibold px-2.5 py-0.5 shadow-sm flex items-center gap-1 rounded-full text-[11px]">
            <Sparkles className="w-3 h-3" /> Most Popular
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="mb-3">
        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary mt-0.5">
          {plan.tagline}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5 min-h-[36px] leading-relaxed">
          {plan.description}
        </p>
      </div>

      {/* Price */}
      <div className="my-3 flex items-baseline gap-1">
        <span className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          ${displayPrice}
        </span>
        <span className="text-muted-foreground text-xs font-medium">/month</span>
        {isYearly && plan.monthlyPrice > 0 && (
          <span className="ml-1.5 text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
            Billed annually (${displayPrice * 12}/yr)
          </span>
        )}
      </div>

      {/* CTA Button */}
      <div className="my-3">
        {plan.popular ? (
          <a
            href={plan.ctaHref}
            style={{ backgroundColor: "#7B4E2F", color: "#ffffff" }}
            className="w-full h-10 px-4 rounded-lg flex items-center justify-center gap-2 font-extrabold text-xs shadow-md hover:opacity-90 transition-all"
          >
            <span style={{ color: "#ffffff" }} className="font-extrabold text-xs">
              {plan.ctaText}
            </span>
            <ArrowRight className="w-4 h-4 text-white" style={{ color: "#ffffff" }} />
          </a>
        ) : (
          <a
            href={plan.ctaHref}
            style={{ backgroundColor: "#ffffff", color: "#7B4E2F", borderColor: "#7B4E2F" }}
            className="w-full h-10 px-4 rounded-lg flex items-center justify-center gap-2 font-extrabold text-xs border-2 shadow-sm hover:bg-amber-50 transition-all"
          >
            <span style={{ color: "#7B4E2F" }} className="font-extrabold text-xs">
              {plan.ctaText}
            </span>
            <ArrowRight className="w-4 h-4" style={{ color: "#7B4E2F" }} />
          </a>
        )}
      </div>

      <hr className="my-3 border-border" />

      {/* Features List */}
      <div className="flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
          {plan.featuresHeader || "What you get"}
        </p>
        <ul className="space-y-2">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
              <span className="flex-shrink-0 mt-0.5 w-3.5 h-3.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                <Check className="w-2.5 h-2.5" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Perfect for footer */}
      <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted-foreground italic flex items-center gap-1">
        <span>👉</span>
        <span>{plan.perfectFor}</span>
      </div>
    </div>
  );
};
