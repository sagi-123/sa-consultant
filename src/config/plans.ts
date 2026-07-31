export interface PlanTier {
  id: string;
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  ctaText: string;
  ctaHref: string;
  perfectFor: string;
  featuresHeader?: string;
  features: string[];
}

export interface PricingFAQItem {
  question: string;
  answer: string;
}

export const PRICING_PLANS: PlanTier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Start Hiring for Free",
    description: "Best for trying out hiring with zero risk and testing local candidate demand.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    ctaText: "Get Started Free",
    ctaHref: "/business/onboarding",
    perfectFor: "Perfect for testing demand before committing",
    featuresHeader: "What you get",
    features: [
      "Post unlimited job listings",
      "Basic ATS to manage applicants",
      "3 free resume unlocks",
      "Candidate matching notifications",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Hire Faster",
    description: "For small & medium businesses actively hiring local talent.",
    monthlyPrice: 39,
    yearlyPrice: 31,
    popular: true,
    ctaText: "Start 14-Day Free Trial",
    ctaHref: "/business/onboarding?plan=starter",
    perfectFor: "Start hiring seriously with real candidate access",
    featuresHeader: "Everything in Free, plus",
    features: [
      "AI Resume Auto-parsing (autofills candidate details)",
      "Full Candidate Hub pipeline management",
      "Add direct apply link & email for direct resumes",
      "Message candidates anytime via portal",
      "Resume database access at 50% off ($2/resume)",
      "Automated SMS candidate notifications",
      "Priority email & chat support",
    ],
  },
];

export const PRICING_FAQS: PricingFAQItem[] = [
  {
    question: "What is included in the Candidate Hub?",
    answer: "Candidate Hub allows you to create candidate profiles, upload resumes (PDF, DOCX, TXT, JPG, PNG up to 2MB), automatically extract candidate information, assign candidates to job requisitions, and track applicants across pipeline stages.",
  },
  {
    question: "Can I switch or cancel my plan anytime?",
    answer: "Yes, absolutely! You can upgrade, downgrade, or cancel your subscription at any time directly from your account settings.",
  },
  {
    question: "Do I need a credit card to start for free?",
    answer: "No credit card is required to sign up for the Free plan or to start your 14-day free trial on the Starter plan.",
  },
  {
    question: "How does the 14-day free trial work?",
    answer: "You get full access to all features included in the Starter plan for 14 days. You won't be charged until the trial ends, and you can cancel anytime.",
  },
  {
    question: "How does candidate profile unlocking work?",
    answer: "Free accounts include 3 profile unlocks. On the Starter plan, you get discounted database access ($2 per resume unlocked).",
  },
];
