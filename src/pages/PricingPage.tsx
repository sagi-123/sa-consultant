import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PRICING_PLANS } from "@/config/plans";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { ArrowRight, CheckCircle2, Search, MapPin, Briefcase, Lock, Sparkles, UserCheck, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const SAMPLE_CANDIDATES = [
  {
    id: "c1",
    name: "Nikhil G.",
    title: "Full Stack Developer",
    location: "Seattle, WA",
    experience: "5 years",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
    status: "Verified",
    maskedEmail: "n***@example.com",
    maskedPhone: "+1 (206) ***-0192",
  },
  {
    id: "c2",
    name: "Walter H.",
    title: "Senior DevOps Engineer",
    location: "Seattle, WA",
    experience: "7 years",
    skills: ["Kubernetes", "Docker", "Terraform", "CI/CD", "Python"],
    status: "Verified",
    maskedEmail: "w***@example.com",
    maskedPhone: "+1 (206) ***-0144",
  },
  {
    id: "c3",
    name: "Alice P.",
    title: "Product Manager",
    location: "Bellevue, WA",
    experience: "4 years",
    skills: ["Product Strategy", "Agile", "User Research", "SQL", "Figma"],
    status: "Verified",
    maskedEmail: "a***@example.com",
    maskedPhone: "+1 (425) ***-0188",
  },
  {
    id: "c4",
    name: "Marcus T.",
    title: "Data Engineer & Analyst",
    location: "Redmond, WA",
    experience: "6 years",
    skills: ["Python", "PySpark", "Snowflake", "SQL", "PowerBI"],
    status: "Verified",
    maskedEmail: "m***@example.com",
    maskedPhone: "+1 (425) ***-0199",
  },
];

const PricingPage: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const filteredPreviewCandidates = SAMPLE_CANDIDATES.filter((c) => {
    const matchesKeyword =
      !searchKeyword ||
      c.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchKeyword.toLowerCase()));
    const matchesLocation =
      !searchLocation || c.location.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesKeyword && matchesLocation;
  });

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

        {/* Live Candidate Search Preview Section */}
        <section className="px-4 sm:px-6 max-w-5xl mx-auto w-full mt-20">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold px-3 py-1 mb-3 rounded-full text-xs uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-500 inline" /> Live Talent Database
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Search Verified Local Candidates
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mt-2">
              Preview qualified candidates in our talent pool. Post a job or start your free trial to unlock direct contacts & PDF resumes.
            </p>
          </div>

          {/* Search Bar Inputs */}
          <Card className="glass border-primary/20 p-4 rounded-2xl shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="relative md:col-span-4">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                <Input
                  placeholder="Location (e.g. Seattle, WA)..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10 h-11 rounded-xl text-xs bg-background/80"
                />
              </div>
              <div className="relative md:col-span-6">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                <Input
                  placeholder="Job title, skill, or keywords (e.g. Developer, AWS, Sales)..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10 h-11 rounded-xl text-xs bg-background/80"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  asChild
                  className="w-full gradient-bg text-white font-bold h-11 rounded-xl text-xs shadow-md"
                >
                  <a href="/business/dashboard?tab=candidatesearch">
                    <Search className="w-4 h-4 mr-1.5" /> Search
                  </a>
                </Button>
              </div>
            </div>
          </Card>

          {/* Candidate Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPreviewCandidates.map((c) => {
              const initials = c.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              return (
                <Card
                  key={c.id}
                  className="glass border-primary/20 hover:border-primary/40 transition-all shadow-md rounded-2xl p-5 relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl gradient-bg text-white font-black flex items-center justify-center text-lg shadow-md shrink-0 relative">
                      {initials}
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-background absolute -bottom-0.5 -right-0.5"></span>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-foreground text-base">{c.name}</h3>
                        <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-[10px] font-bold bg-amber-500/5">
                          <Lock className="w-3 h-3 mr-1" /> Locked
                        </Badge>
                      </div>

                      <p className="text-xs font-semibold text-primary">{c.title}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-2 pt-0.5">
                        <span>📍 {c.location}</span> • <span>💼 {c.experience}</span>
                      </p>

                      <div className="flex flex-wrap gap-1 pt-2">
                        {c.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] font-medium bg-muted/80">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="pt-2 text-[11px] font-mono text-muted-foreground flex items-center gap-3">
                        <span className="bg-muted/50 px-2 py-0.5 rounded border border-border">✉ {c.maskedEmail}</span>
                        <span className="bg-muted/50 px-2 py-0.5 rounded border border-border">📞 {c.maskedPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Pre-Screened Candidate
                    </span>
                    <Button
                      asChild
                      size="sm"
                      className="gradient-bg text-white font-bold text-xs h-8 rounded-lg shadow-sm"
                    >
                      <a href="/business/dashboard?tab=candidatesearch" className="flex items-center gap-1">
                        <span>Unlock in Portal</span> <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Unlock Banner CTA */}
          <div className="mt-6 p-6 rounded-2xl bg-card border border-primary/20 text-center flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="text-left">
              <h4 className="font-bold text-foreground text-base">Want to search 1,000+ local candidate resumes?</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every business account includes 3 free profile unlocks. Starter plans include unlimited searches.
              </p>
            </div>
            <Button
              asChild
              className="gradient-bg text-white font-extrabold text-xs h-10 px-6 rounded-xl shadow-md shrink-0"
            >
              <a href="/business/dashboard?tab=candidatesearch" className="flex items-center gap-1.5">
                <span>Go to Candidate Search</span> <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
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
                  <a href="/auth?mode=signup&returnTo=%2Fbusiness%2Fonboarding" className="flex items-center gap-2 text-primary font-extrabold">
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

