import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
  Loader2,
  Globe,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { extractTextFromPDF } from "@/lib/pdfExtractor";
import { parseResumeWithAI } from "@/lib/resumeParser";

interface CreateCandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCandidateCreated?: (candidate: any) => void;
  availableJobs?: { id: string; title: string }[];
}

const COUNTRY_CODES = [
  { code: "US", label: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "CA", label: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "GB", label: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "IN", label: "India", dial: "+91", flag: "🇮🇳" },
  { code: "AU", label: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "MX", label: "Mexico", dial: "+52", flag: "🇲🇽" },
  { code: "DE", label: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "FR", label: "France", dial: "+33", flag: "🇫🇷" },
];

export const CreateCandidateModal: React.FC<CreateCandidateModalProps> = ({
  open,
  onOpenChange,
  onCandidateCreated,
  availableJobs = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [assignedJobId, setAssignedJobId] = useState("");
  const [notes, setNotes] = useState("");

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;

    // Check size limit: 2MB
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("File size exceeds limit of 2MBs. Please choose a smaller file.");
      return;
    }

    setResumeFile(file);
    toast.success(`Selected "${file.name}" for upload.`);

    // Auto-parse if PDF or TXT
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") || file.type === "text/plain") {
      setIsParsing(true);
      toast.info("Extracting candidate information from resume...");

      try {
        let extractedText = "";
        if (file.type === "text/plain") {
          extractedText = await file.text();
        } else {
          extractedText = await extractTextFromPDF(file);
        }

        const parsed = await parseResumeWithAI(extractedText);

        if (parsed) {
          // Attempt to split name into first and last
          if (parsed.name && (!firstName || !lastName)) {
            const nameParts = parsed.name.trim().split(" ");
            if (nameParts.length > 1) {
              setFirstName(nameParts[0]);
              setLastName(nameParts.slice(1).join(" "));
            } else {
              setFirstName(parsed.name);
            }
          }
          if (parsed.email && !email) setEmail(parsed.email);
          if (parsed.phone && !phone) setPhone(parsed.phone);
          if (parsed.location && !location) setLocation(parsed.location);
          if (parsed.title && !jobTitle) setJobTitle(parsed.title);

          toast.success("AI parsed resume successfully! Fields autofilled.");
        }
      } catch (err: any) {
        console.warn("Auto-parse warning:", err);
        // Non-blocking fallback toast
        toast.info("Resume attached! You can complete any missing fields below.");
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !location.trim()) {
      toast.error("Please fill in all required fields (First name, Last name, Email, Location).");
      return;
    }

    const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);
    const formattedPhone = phone ? `${selectedCountry?.dial || "+1"} ${phone}` : "";

    const newCandidate = {
      id: `cand_${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      phone: formattedPhone,
      country: selectedCountry?.label || "United States",
      location: location.trim(),
      jobTitle: jobTitle.trim() || "Candidate",
      assignedJobId: assignedJobId || null,
      notes: notes.trim(),
      resumeName: resumeFile ? resumeFile.name : null,
      resumeUrl: resumeFile ? URL.createObjectURL(resumeFile) : null,
      status: "New Applicant",
      createdAt: new Date().toISOString(),
    };

    if (onCandidateCreated) {
      onCandidateCreated(newCandidate);
    }

    toast.success(`Candidate profile for "${newCandidate.name}" created successfully!`);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setResumeFile(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setCountryCode("US");
    setPhone("");
    setLocation("");
    setJobTitle("");
    setAssignedJobId("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 shadow-2xl border-primary/20 bg-background text-foreground">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <User className="w-6 h-6 text-primary" /> Create a new candidate
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Create candidate profiles to add details, upload resumes, assign jobs, and more.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Resume Upload Dropzone */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
              Resume <span className="text-destructive">*</span>
            </Label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-1.5 border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                isDragOver
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : resumeFile
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.jpg,.png"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                className="hidden"
              />

              {isParsing ? (
                <div className="flex flex-col items-center py-2">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  <p className="text-sm font-semibold text-foreground">AI parsing resume content...</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Extracting contact info & work history</p>
                </div>
              ) : resumeFile ? (
                <div className="flex items-center justify-between w-full px-2">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground truncate max-w-xs">{resumeFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(resumeFile.size / 1024).toFixed(1)} KB • Attached
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResumeFile(null);
                    }}
                    className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Upload Resume</h4>
                  <p className="text-xs text-primary font-semibold mt-1">
                    Click to browse or drag and drop your file
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                    PDF, TXT, DOCX, DOC, JPG, PNG (Up to 2Mbs)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-foreground">
                First name <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-1">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="pl-9 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Last name <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-1">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="pl-9 h-11 rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Email address <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="pl-9 h-11 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Phone Number with Country Code Dropdown */}
          <div>
            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Phone number <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <div className="flex gap-2 mt-1">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="h-11 px-3 rounded-xl border border-input bg-background text-foreground text-xs font-semibold focus:ring-2 focus:ring-primary min-w-[130px]"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.label} ({c.dial})
                  </option>
                ))}
              </select>

              <div className="relative flex-1">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="pl-9 h-11 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Location & Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="candidateLocation" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Location <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-1">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="candidateLocation"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State, and Zip"
                  className="pl-9 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="jobTitle" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Job title <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <div className="relative mt-1">
                <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="job title"
                  className="pl-9 h-11 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Assign Job (Optional) */}
          {availableJobs.length > 0 && (
            <div>
              <Label htmlFor="assignJob" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Assign to Job Requisition <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <select
                id="assignJob"
                value={assignedJobId}
                onChange={(e) => setAssignedJobId(e.target.value)}
                className="w-full h-11 mt-1 px-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary"
              >
                <option value="">Unassigned (General Talent Pool)</option>
                {availableJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <Label htmlFor="additionalNotes" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Additional notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="additionalNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add background notes, interview summary, salary requirements, or key highlights..."
              rows={3}
              className="mt-1 rounded-xl"
            />
          </div>

          {/* Footer actions */}
          <DialogFooter className="pt-3 border-t border-border flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="rounded-xl h-11 w-full sm:w-auto font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground font-bold rounded-xl h-11 px-8 shadow-md w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Create Candidate Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
