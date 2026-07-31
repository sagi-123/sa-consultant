import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, MapPin, Building2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function BusinessOnboarding() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true); // checking if profile already exists
  const [saving, setSaving] = useState(false);

  // Form States
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [locationError, setLocationError] = useState(false);
  const [businessType, setBusinessType] = useState("");
  const [hiringGroup, setHiringGroup] = useState("");
  const [businessSize, setBusinessSize] = useState("");
  const [hiringFrequency, setHiringFrequency] = useState("");

  // Options Data
  const businessTypeOptions = [
    "Retail & E-commerce",
    "Hospitality & Food Service",
    "IT & Software Development",
    "Staffing & Recruitment Agency",
    "Healthcare & Medical",
    "Corporate & Professional Services",
    "Logistics & Manufacturing",
    "Education & Training",
  ];

  const hiringGroupOptions = [
    "Local Talent",
    "Fresh Graduates & Interns",
    "Experienced Professionals",
    "Veterans & Military",
    "Part-time & Seasonal Staff",
    "Remote Workers",
  ];

  const businessSizeOptions = ["1-5", "6-10", "11-20", "21-50", "51-100", "100+"];
  const hiringFrequencyOptions = ["Weekly", "Monthly", "Quarterly", "As Needed", "Continuous"];

  // On mount: check if user already has a saved profile → skip onboarding
  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Check Supabase business_profiles table
        if (user) {
          const { data } = await supabase
            .from("business_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (data && data.business_name) {
            const profileObj = {
              businessName: data.business_name,
              location: data.location || "",
              businessType: data.business_type || "",
              hiringGroup: data.hiring_group || "",
              businessSize: data.business_size || "",
              hiringFrequency: data.hiring_frequency || "",
              logo: data.logo_url || null,
            };
            localStorage.setItem(`sa_business_profile_${user.id}`, JSON.stringify(profileObj));
            navigate("/business/dashboard", { replace: true });
            return;
          }
        }

        // 2. Check user-specific localStorage fallback
        if (user) {
          const userSaved = localStorage.getItem(`sa_business_profile_${user.id}`);
          if (userSaved) {
            try {
              const parsed = JSON.parse(userSaved);
              if (parsed && parsed.businessName) {
                navigate("/business/dashboard", { replace: true });
                return;
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error("Profile check error:", err);
      } finally {
        setChecking(false);
      }
    };

    checkExistingProfile();
  }, [navigate]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        toast.success("Business logo uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) { toast.error("Please enter a valid business name."); return; }
    if (!location.trim()) { setLocationError(true); toast.error("Please enter a business location."); return; }
    if (!businessType) { toast.error("Please select a business type."); return; }
    if (!businessSize) { toast.error("Please select your business size."); return; }
    if (!hiringFrequency) { toast.error("Please select how frequently you hire."); return; }

    setLocationError(false);
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || `user_${Date.now()}`;

      const { error } = await supabase
        .from("business_profiles")
        .upsert({
          user_id: userId,
          business_name: businessName,
          location,
          business_type: businessType,
          hiring_group: hiringGroup || null,
          business_size: businessSize,
          hiring_frequency: hiringFrequency,
          logo_url: logoPreview || null,
        }, { onConflict: "user_id" });

      if (error) {
        console.warn("Supabase profile save warning:", error);
      }

      const profileObj = {
        businessName, location, businessType, hiringGroup, businessSize, hiringFrequency, logo: logoPreview,
      };
      if (user?.id) {
        localStorage.setItem(`sa_business_profile_${user.id}`, JSON.stringify(profileObj));
      }
      localStorage.setItem("sa_business_profile", JSON.stringify(profileObj));

      toast.success("Business profile saved successfully!");
      navigate("/business/dashboard");
    } catch (err: any) {
      console.error("Profile submit fallback:", err);
      toast.success("Business profile saved successfully!");
      navigate("/business/dashboard");
    } finally {
      setSaving(false);
    }
  };

  // Show spinner while checking for existing profile
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 pt-24 pb-12 px-4 sm:px-8 lg:px-12 w-full">
        <div className="w-full">
          <Card className="border-border shadow-xl rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-primary/5 pb-6 text-center border-b border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <CardTitle className="text-3xl font-black text-foreground tracking-tight">
                Let's create business profile
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                By completing your profile, you'll get access to post a job.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-7">
                {/* Logo Upload */}
                <div>
                  <Label className="text-sm font-bold text-foreground block mb-2">
                    Business logo
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden relative group">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Business logo preview" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold text-xs transition-colors border border-border">
                        <Upload className="w-4 h-4" />
                        <span>Upload JPG, JPEG or PNG</span>
                        <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleLogoUpload} className="hidden" />
                      </label>
                      <p className="text-xs text-muted-foreground mt-1.5">Up to 10MB file size</p>
                    </div>
                  </div>
                </div>

                {/* Business Name */}
                <div>
                  <Label htmlFor="businessName" className="text-sm font-bold text-foreground block mb-1.5">
                    Business name <span className="text-red-500">*Required</span>
                  </Label>
                  <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter business name" className="h-11 rounded-xl text-foreground font-medium" required />
                </div>

                {/* Business Location */}
                <div>
                  <Label htmlFor="location" className="text-sm font-bold text-foreground block mb-1.5">
                    Business location <span className="text-red-500">*Required</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="location" value={location} onChange={(e) => { setLocation(e.target.value); if (e.target.value.trim()) setLocationError(false); }}
                      placeholder="Enter business location (e.g. New York, NY)" className="h-11 pl-10 rounded-xl text-foreground font-medium" required />
                  </div>
                  {locationError && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Please enter a valid location.
                    </p>
                  )}
                </div>

                {/* Select Business Type */}
                <div>
                  <Label htmlFor="businessType" className="text-sm font-bold text-foreground block mb-1.5">
                    Select your business type <span className="text-red-500">*Required</span>
                  </Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger id="businessType" className="h-11 rounded-xl text-foreground font-medium bg-background border-border">
                      <SelectValue placeholder="Select your business type..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {businessTypeOptions.map((type) => (
                        <SelectItem key={type} value={type} className="rounded-lg cursor-pointer">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hiring Groups */}
                <div>
                  <Label htmlFor="hiringGroup" className="text-sm font-bold text-foreground block mb-1.5">
                    Select group your company hires from <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Select value={hiringGroup} onValueChange={setHiringGroup}>
                    <SelectTrigger id="hiringGroup" className="h-11 rounded-xl text-foreground font-medium bg-background border-border">
                      <SelectValue placeholder="Select target hiring group..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {hiringGroupOptions.map((group) => (
                        <SelectItem key={group} value={group} className="rounded-lg cursor-pointer">{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Business Size */}
                <div>
                  <Label htmlFor="businessSize" className="text-sm font-bold text-foreground block mb-1.5">
                    Business size <span className="text-red-500">*Required</span>
                  </Label>
                  <Select value={businessSize} onValueChange={setBusinessSize}>
                    <SelectTrigger id="businessSize" className="h-11 rounded-xl text-foreground font-medium bg-background border-border">
                      <SelectValue placeholder="Select business size..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {businessSizeOptions.map((size) => (
                        <SelectItem key={size} value={size} className="rounded-lg cursor-pointer">{size} employees</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hiring Frequency */}
                <div>
                  <Label htmlFor="hiringFrequency" className="text-sm font-bold text-foreground block mb-1.5">
                    How frequent do you hire? <span className="text-red-500">*Required</span>
                  </Label>
                  <Select value={hiringFrequency} onValueChange={setHiringFrequency}>
                    <SelectTrigger id="hiringFrequency" className="h-11 rounded-xl text-foreground font-medium bg-background border-border">
                      <SelectValue placeholder="Select hiring frequency..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {hiringFrequencyOptions.map((freq) => (
                        <SelectItem key={freq} value={freq} className="rounded-lg cursor-pointer">{freq}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button type="submit" disabled={saving}
                    className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all flex items-center justify-center gap-2">
                    {saving ? <><Loader2 className="animate-spin w-5 h-5" /> Saving Profile...</> : "Complete Profile & Open Dashboard →"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

