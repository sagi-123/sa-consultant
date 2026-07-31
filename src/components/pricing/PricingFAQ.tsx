import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PRICING_FAQS } from "@/config/plans";
import { HelpCircle } from "lucide-react";

export const PricingFAQ: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto my-16 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Everything you need to know before getting started
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {PRICING_FAQS.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border border-border rounded-xl px-4 bg-card shadow-sm"
          >
            <AccordionTrigger className="text-left font-semibold text-foreground py-4 hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed text-sm">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
