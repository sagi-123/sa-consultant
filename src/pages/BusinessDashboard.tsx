import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CreateJobModal } from "@/components/dashboard/CreateJobModal";
import { CreateCandidateModal } from "@/components/dashboard/CreateCandidateModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Share2,
  Search,
  Users,
  Briefcase,
  Calendar as CalendarIcon,
  PlusCircle,
  MapPin,
  Clock,
  ChevronRight,
  Copy,
  QrCode,
  Filter,
  Mail,
  UserCheck,
  Building2,
  UserPlus,
  FileText,
  FileCheck,
  Phone,
  CheckCircle2,
  Lock,
  Unlock,
  Bookmark,
  Sparkles,
  GraduationCap,
  Eye,
  Download,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "jobshare" | "candidatesearch" | "candidatehub" | "recruiting" | "calendar"
  >("dashboard");

  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [createCandidateOpen, setCreateCandidateOpen] = useState(false);
  const [profile, setProfile] = useState<{
    businessName: string;
    location: string;
    logo?: string;
  }>({
    businessName: "",
    location: "",
  });

  // State Management
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  // WorkOnward Candidate Search State
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [unlockedCandidateIds, setUnlockedCandidateIds] = useState<string[]>([]);
  const [bookmarkedCandidateIds, setBookmarkedCandidateIds] = useState<string[]>([]);
  const [credits, setCredits] = useState<number>(3);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [filterUnlockedOnly, setFilterUnlockedOnly] = useState(false);

  const [searchCandidatesList, setSearchCandidatesList] = useState<any[]>([]);

  const handleUnlockProfile = (candidateId: string, candidateName: string) => {
    if (unlockedCandidateIds.includes(candidateId)) {
      toast.info(`${candidateName}'s profile is already unlocked!`);
      return;
    }
    if (credits <= 0) {
      toast.error("No profile unlock credits remaining. Upgrade plan to unlock more!");
      return;
    }
    setUnlockedCandidateIds((prev) => [...prev, candidateId]);
    setCredits((prev) => prev - 1);
    toast.success(`Unlocked ${candidateName}'s contact & resume! 1 credit deducted.`);
  };

  const toggleBookmark = (candidateId: string) => {
    setBookmarkedCandidateIds((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    );
    toast.success("Candidate bookmark updated!");
  };

  const filteredCandidates = searchCandidatesList.filter((c) => {
    const matchesKeyword =
      !searchKeyword ||
      c.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchKeyword.toLowerCase()));
    const matchesLocation = !searchLocation || c.location.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesUnlocked = !filterUnlockedOnly || unlockedCandidateIds.includes(c.id);
    return matchesKeyword && matchesLocation && matchesUnlocked;
  });

  const handleCandidateCreated = (newCandidate: any) => {
    setCandidates((prev) => [newCandidate, ...prev]);
  };

  // Load admin-assigned candidates from Supabase
  const loadAdminAssignedCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('business_candidate_assignments')
        .select(`
          candidate_id,
          note,
          assigned_at,
          candidates (
            id, name, email, phone, job_title,
            experience_years, location, skills,
            resume_url, status
          )
        `)
        .eq('business_user_id', 'all')
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      const normalized = (data || []).map((row: any) => {
        let c = row.candidates;

        // Fallback: parse snapshot stored in note field if join returned null (e.g. RLS)
        if (!c && row.note) {
          try {
            c = JSON.parse(row.note);
          } catch {
            c = null;
          }
        }

        if (!c) return null;

        const skills: string[] = Array.isArray(c.skills)
          ? c.skills
          : typeof c.skills === 'string'
          ? c.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [];

        return {
          id: c.id || row.candidate_id,
          name: c.name || 'Candidate',
          title: c.title || c.job_title || 'Professional',
          location: c.location || 'Location not specified',
          experience: c.experience || (c.experience_years ? `${c.experience_years} years` : 'Experience not listed'),
          skills: skills.length > 0 ? skills : ['Professional'],
          status: c.status || 'New',
          email: c.email || '',
          phone: c.phone || '',
          resume_url: c.resume_url || null,
          avatar: null,
          assignedByAdmin: true,
          assignedAt: row.assigned_at,
        };
      }).filter(Boolean);

      if (normalized.length > 0) {
        setSearchCandidatesList(normalized);
      } else {
        // Default candidates to show when no candidates are assigned yet
        setSearchCandidatesList([
          {
            id: "c1",
            name: "Nikhil G.",
            title: "Full Stack Developer",
            location: "Seattle, WA",
            experience: "5 years",
            skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
            status: "Verified",
            email: "nikhil.g@example.com",
            phone: "+1 (206) 555-0192",
            summary: "Experienced Full Stack Developer with 5+ years building scalable web apps with React & Node.",
            education: "B.S. Computer Science - University of Washington",
          },
          {
            id: "c2",
            name: "Walter H.",
            title: "Senior DevOps Engineer",
            location: "Seattle, WA",
            experience: "7 years",
            skills: ["Kubernetes", "Docker", "Terraform", "CI/CD", "Python"],
            status: "Verified",
            email: "walter.h@example.com",
            phone: "+1 (206) 555-0144",
            summary: "Senior DevOps Engineer specializing in cloud infrastructure, Kubernetes & CI/CD automation.",
            education: "M.S. Software Engineering - Washington State University",
          },
          {
            id: "c3",
            name: "Alice P.",
            title: "Product Manager",
            location: "Bellevue, WA",
            experience: "4 years",
            skills: ["Product Strategy", "Agile", "User Research", "SQL", "Figma"],
            status: "Verified",
            email: "alice.p@example.com",
            phone: "+1 (425) 555-0188",
            summary: "Customer-obsessed Product Manager with a track record of shipping top-rated SaaS features.",
            education: "B.A. Business Administration - Seattle University",
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load assigned candidates:', err);
    }
  };

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("business_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (data) {
            setProfile({
              businessName: data.business_name || "",
              location: data.location || "",
              logo: data.logo_url || undefined,
            });
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching business profile from Supabase:", err);
      }

      // Fallback to localStorage
      const saved = localStorage.getItem("sa_business_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.businessName) setProfile(parsed);
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchBusinessProfile();
    // Load admin-assigned candidates from Supabase
    loadAdminAssignedCandidates();
  }, []);


  const handleJobCreated = (newJob: any) => {
    setJobs((prev) => [newJob, ...prev]);
  };

  const copyJobLink = (jobTitle: string) => {
    navigator.clipboard.writeText(`https://saconsultantandstaffing.com/jobs/share?title=${encodeURIComponent(jobTitle)}`);
    toast.success(`Share link for "${jobTitle}" copied to clipboard!`);
  };

  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicantsCount || 0), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      {/* Website Top Navbar */}
      <Navbar />

      {/* Main Container - Full Width */}
      <div className="flex-1 pt-24 pb-12 w-full px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <Card className="glass border-primary/20 shadow-lg rounded-2xl p-4 sticky top-28">
              {/* Profile Header */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
                <div className="w-11 h-11 rounded-xl gradient-bg text-white flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0 shadow-md">
                  {profile.logo ? (
                    <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : profile.businessName ? (
                    profile.businessName.charAt(0).toUpperCase()
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-foreground text-sm truncate">
                    {profile.businessName || "Business Account"}
                  </h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                    <MapPin className="w-3 h-3 text-primary flex-shrink-0" />{" "}
                    {profile.location || "Location not set"}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === "dashboard"
                      ? "gradient-bg text-white font-bold shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab("jobshare")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === "jobshare"
                      ? "gradient-bg text-white font-bold shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Job Share</span>
                </button>

                <button
                  onClick={() => setActiveTab("candidatesearch")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === "candidatesearch"
                      ? "gradient-bg text-white font-bold shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Candidate Search</span>
                </button>

                <button
                  onClick={() => setActiveTab("candidatehub")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === "candidatehub"
                      ? "gradient-bg text-white font-bold shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Candidate Hub</span>
                </button>

                <button
                  onClick={() => setActiveTab("recruiting")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === "recruiting"
                      ? "gradient-bg text-white font-bold shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Recruiting</span>
                </button>

                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === "calendar"
                      ? "gradient-bg text-white font-bold shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Calendar</span>
                </button>
              </nav>

              <hr className="my-4 border-border" />

              {/* Quick Action Button */}
              <Button
                onClick={() => setCreateJobOpen(true)}
                className="w-full gradient-bg font-bold h-11 text-xs rounded-xl flex items-center justify-center gap-2 shadow-md text-white"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Job</span>
              </Button>
            </Card>
          </aside>

          {/* Right Main Content Area */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {/* TAB 1: DASHBOARD OVERVIEW */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 w-full">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold gradient-text">
                      Welcome back{profile.businessName ? `, ${profile.businessName}` : ""}! 👋
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1">
                      Here is your hiring overview and active job metrics.
                    </p>
                  </div>
                  <Button
                    onClick={() => setCreateJobOpen(true)}
                    className="gradient-bg font-bold rounded-xl h-11 px-5 shadow-md flex items-center gap-2 text-white"
                  >
                    <PlusCircle className="w-4 h-4" /> Post a Job
                  </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  <Card className="glass border-primary/20 p-5 rounded-2xl shadow-sm">
                    <p className="text-xs text-muted-foreground font-semibold">Active Job Posts</p>
                    <h3 className="text-3xl font-black text-foreground mt-1">{jobs.length}</h3>
                    <p className="text-[11px] text-emerald-500 font-semibold mt-1">✓ Unlimited Free Posts</p>
                  </Card>

                  <Card className="glass border-primary/20 p-5 rounded-2xl shadow-sm">
                    <p className="text-xs text-muted-foreground font-semibold">Total Applicants</p>
                    <h3 className="text-3xl font-black text-foreground mt-1">{totalApplicants}</h3>
                    <p className="text-[11px] text-muted-foreground font-semibold mt-1">Real-time applications</p>
                  </Card>

                  <Card className="glass border-primary/20 p-5 rounded-2xl shadow-sm">
                    <p className="text-xs text-muted-foreground font-semibold">Interviews Scheduled</p>
                    <h3 className="text-3xl font-black text-foreground mt-1">{events.length}</h3>
                    <p className="text-[11px] text-muted-foreground font-semibold mt-1">Calendar events</p>
                  </Card>

                  <Card className="glass border-primary/20 p-5 rounded-2xl shadow-sm">
                    <p className="text-xs text-muted-foreground font-semibold">Profile Views</p>
                    <h3 className="text-3xl font-black text-foreground mt-1">0</h3>
                    <p className="text-[11px] text-emerald-500 font-semibold mt-1">Local job seekers</p>
                  </Card>
                </div>

                {/* Active Jobs Card */}
                <Card className="glass border-primary/20 shadow-md rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-lg font-bold">Active Job Posts</CardTitle>
                      <CardDescription className="text-xs">Manage your current active vacancies</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("recruiting")}
                      className="text-xs font-bold text-primary"
                    >
                      View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {jobs.length === 0 ? (
                      <div className="py-12 px-4 text-center flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl w-full">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-bold text-foreground">No active job posts yet</h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-md">
                          Create your first job vacancy to start receiving applications from local candidates across SA Elevate.
                        </p>
                        <Button
                          onClick={() => setCreateJobOpen(true)}
                          className="mt-4 text-xs font-bold rounded-xl h-10 px-5 gradient-bg text-white shadow-md"
                        >
                          <PlusCircle className="w-4 h-4 mr-1.5" /> Create Your First Job
                        </Button>
                      </div>
                    ) : (
                      jobs.map((j) => (
                        <div
                          key={j.id}
                          className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div>
                            <h4 className="font-bold text-foreground text-base">{j.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-primary" /> {j.location}
                              </span>
                              <span className="font-semibold">{j.type}</span>
                              <span>Posted {j.postedDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-primary/10 text-primary font-bold text-xs px-3 py-1">
                              {j.applicantsCount} Applicants
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyJobLink(j.title)}
                              className="h-9 text-xs rounded-xl"
                            >
                              <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 2: JOB SHARE */}
            {activeTab === "jobshare" && (
              <div className="space-y-6 w-full">
                <div>
                  <h1 className="text-2xl font-display font-bold gradient-text">Job Share & Syndication</h1>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Share your active job listings across social media, messaging, and Google Jobs.
                  </p>
                </div>

                {jobs.length === 0 ? (
                  <Card className="glass border-primary/20 border-2 border-dashed shadow-md rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">No Jobs Available to Share</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md">
                      Post a job vacancy first to get shareable links, QR codes, and social syndication features.
                    </p>
                    <Button
                      onClick={() => setCreateJobOpen(true)}
                      className="mt-4 text-xs font-bold rounded-xl h-10 px-5 gradient-bg text-white shadow-md"
                    >
                      <PlusCircle className="w-4 h-4 mr-1.5" /> Create Job Now
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4 w-full">
                    {jobs.map((j) => (
                      <Card key={j.id} className="glass border-primary/20 shadow-md rounded-2xl p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <Badge className="bg-emerald-500/10 text-emerald-500 font-bold text-xs mb-2">
                              Active Listing
                            </Badge>
                            <h3 className="text-lg font-bold text-foreground">{j.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                              <span>📍 {j.location}</span> • <span>{j.salary}</span>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => copyJobLink(j.title)}
                              className="gradient-bg text-white font-semibold text-xs rounded-xl h-9 px-4"
                            >
                              <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Share Link
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs rounded-xl h-9 px-4">
                              <QrCode className="w-3.5 h-3.5 mr-1.5" /> Download QR
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CANDIDATE SEARCH (WorkOnward Style) */}
            {activeTab === "candidatesearch" && (
              <div className="space-y-6 w-full">
                {/* Header Title & Credits Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-display font-bold gradient-text flex items-center gap-2">
                      <Search className="w-6 h-6 text-primary" /> Candidate Search
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                      Find, preview, and unlock verified local candidates and resumes in your area.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <div className="text-xs">
                      <span className="font-bold text-foreground">Credits: </span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400">{credits} Free Unlocks Left</span>
                    </div>
                    <Button size="sm" onClick={() => navigate("/pricing")} className="gradient-bg text-white font-bold text-[11px] h-7 px-3 rounded-xl ml-2 shadow-sm">
                      Get More
                    </Button>
                  </div>
                </div>

                {/* WorkOnward Dual Input Search Bar */}
                <Card className="glass border-primary/20 p-4 rounded-2xl shadow-md space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="relative md:col-span-4">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                      <Input
                        placeholder="Search by location (e.g. Seattle, WA)..."
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
                    <div className="md:col-span-2 flex gap-2">
                      <Button className="w-full gradient-bg text-white font-bold h-11 rounded-xl text-xs shadow-md">
                        <Search className="w-4 h-4 mr-1.5" /> Search
                      </Button>
                    </div>
                  </div>

                  {/* Filter Chips Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="px-3 py-1 font-semibold flex items-center gap-1">
                        <Filter className="w-3 h-3 text-primary" /> Filters
                      </Badge>
                      <Badge
                        onClick={() => setFilterUnlockedOnly(!filterUnlockedOnly)}
                        className={`cursor-pointer px-3 py-1 font-semibold transition-all ${
                          filterUnlockedOnly
                            ? "bg-primary text-white border-primary"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {filterUnlockedOnly ? "✓ Unlocked Only" : "Unlocked Only"}
                      </Badge>
                      <Badge variant="secondary" className="px-3 py-1 font-semibold cursor-pointer">
                        With Resume
                      </Badge>
                      <Badge variant="secondary" className="px-3 py-1 font-semibold cursor-pointer">
                        Full-Time
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">
                      Showing {filteredCandidates.length} candidate profiles
                    </p>
                  </div>
                </Card>

                {/* Candidate List Cards Grid */}
                {filteredCandidates.length === 0 ? (
                  <Card className="glass border-primary/20 border-2 border-dashed shadow-md rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">No Candidates Matched Yet</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md">
                      Search for candidates by location or keywords above, or post a job vacancy to receive candidate submissions from SA Elevate recruiters.
                    </p>
                    <Button
                      onClick={() => setCreateJobOpen(true)}
                      className="mt-4 text-xs font-bold rounded-xl h-10 px-5 gradient-bg text-white shadow-md flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" /> Post a Job Requisition
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4 w-full">
                    {filteredCandidates.map((c) => {
                    const isUnlocked = unlockedCandidateIds.includes(c.id);
                    const isBookmarked = bookmarkedCandidateIds.includes(c.id);

                    return (
                      <Card
                        key={c.id}
                        className="glass border-primary/20 hover:border-primary/40 transition-all shadow-md rounded-2xl p-5 relative overflow-hidden group"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                          {/* Left Avatar & Candidate Meta */}
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 rounded-2xl gradient-bg text-white font-black flex items-center justify-center text-xl shadow-md shrink-0 relative">
                              {c.name.split(" ").map((n: string) => n[0]).join("")}
                              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background absolute -bottom-1 -right-1"></span>
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3
                                  onClick={() => setSelectedCandidate(c)}
                                  className="font-bold text-foreground text-lg hover:text-primary transition-colors cursor-pointer"
                                >
                                  {c.name}
                                </h3>
                                {isUnlocked ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px] font-bold">
                                    ✓ Unlocked
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-[11px] font-bold bg-amber-500/5">
                                    🔒 Locked (3 Free Left)
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm font-semibold text-primary">{c.title}</p>

                              <p className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap pt-0.5">
                                <span className="flex items-center gap-1 font-medium">
                                  <MapPin className="w-3.5 h-3.5 text-primary" /> {c.location}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-medium">
                                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> {c.experience} experience
                                </span>
                              </p>

                              {/* Skills Tags */}
                              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                                <span className="text-xs font-bold text-foreground mr-1">Skills:</span>
                                {c.skills.slice(0, 3).map((skill: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-[11px] font-medium bg-muted/80">
                                    {skill}
                                  </Badge>
                                ))}
                                {c.skills.length > 3 && (
                                  <Badge variant="outline" className="text-[11px] font-bold text-primary border-primary/30">
                                    +{c.additionalSkillsCount} more
                                  </Badge>
                                )}
                              </div>

                              {/* Masked vs Unlocked Contact Bar */}
                              <div className="pt-2 text-xs font-mono text-muted-foreground flex items-center gap-4 flex-wrap">
                                <span className="bg-muted/50 px-2.5 py-1 rounded-lg border border-border">
                                  ✉ {isUnlocked ? c.email : c.maskedEmail}
                                </span>
                                <span className="bg-muted/50 px-2.5 py-1 rounded-lg border border-border">
                                  📞 {isUnlocked ? c.phone : c.maskedPhone}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Action Buttons */}
                          <div className="flex flex-row md:flex-col items-center md:items-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                            <Button
                              onClick={() => toggleBookmark(c.id)}
                              variant="outline"
                              size="icon"
                              className={`h-9 w-9 rounded-xl transition-colors ${
                                isBookmarked ? "text-amber-500 border-amber-500/40 bg-amber-500/10" : "text-muted-foreground"
                              }`}
                            >
                              <Bookmark className="w-4 h-4 fill-current" />
                            </Button>

                            {!isUnlocked ? (
                              <Button
                                onClick={() => handleUnlockProfile(c.id, c.name)}
                                className="gradient-bg text-white font-bold text-xs rounded-xl h-10 px-5 shadow-md flex items-center gap-2"
                              >
                                <Lock className="w-3.5 h-3.5" /> Unlock Profile
                              </Button>
                            ) : (
                              <Button
                                onClick={() => {
                                  toast.info(`Contacting ${c.name}...`);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-10 px-5 shadow-md flex items-center gap-2"
                              >
                                <Mail className="w-3.5 h-3.5" /> Message Candidate
                              </Button>
                            )}

                            <Button
                              onClick={() => setSelectedCandidate(c)}
                              variant="outline"
                              className="text-xs font-semibold rounded-xl h-9 px-4 flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                )}
              </div>
            )}

            {/* TAB 4: CANDIDATE HUB */}
            {activeTab === "candidatehub" && (
              <div className="space-y-6 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-display font-bold gradient-text flex items-center gap-2">
                      <Users className="w-6 h-6 text-primary" /> Candidate Hub
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                      Create candidate profiles, upload resumes, assign jobs, and manage candidate workflows.
                    </p>
                  </div>
                  <Button
                    onClick={() => setCreateCandidateOpen(true)}
                    className="gradient-bg font-bold rounded-xl h-11 text-xs px-5 text-white shadow-md flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Add Candidate
                  </Button>
                </div>

                {/* Candidate Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="glass border-primary/20 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Total Candidates</p>
                    <p className="text-2xl font-extrabold text-foreground mt-1">{candidates.length}</p>
                  </Card>
                  <Card className="glass border-primary/20 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase">New Applicants</p>
                    <p className="text-2xl font-extrabold text-primary mt-1">
                      {candidates.filter((c) => !c.status || c.status === "New Applicant").length}
                    </p>
                  </Card>
                  <Card className="glass border-primary/20 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Shortlisted</p>
                    <p className="text-2xl font-extrabold text-amber-500 mt-1">
                      {candidates.filter((c) => c.status === "Shortlisted").length}
                    </p>
                  </Card>
                  <Card className="glass border-primary/20 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Interview / Placed</p>
                    <p className="text-2xl font-extrabold text-emerald-500 mt-1">
                      {candidates.filter((c) => c.status === "Interview" || c.status === "Placed").length}
                    </p>
                  </Card>
                </div>

                {/* Pipeline Columns */}
                {candidates.length === 0 ? (
                  <Card className="glass border-primary/20 border-2 border-dashed shadow-md rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">No Candidate Profiles Yet</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md">
                      Start building your candidate hub by uploading resumes, adding candidate details, and assigning job requisitions.
                    </p>
                    <Button
                      onClick={() => setCreateCandidateOpen(true)}
                      className="mt-4 text-xs font-bold rounded-xl h-10 px-5 gradient-bg text-white shadow-md flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> Create First Candidate
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column 1: New Applicants */}
                    <div className="bg-muted/40 rounded-2xl p-4 border border-border space-y-3 min-h-[350px] flex flex-col">
                      <div className="flex items-center justify-between pb-2 border-b border-border">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> New Applicants
                        </h3>
                        <Badge variant="outline">
                          {candidates.filter((c) => !c.status || c.status === "New Applicant").length}
                        </Badge>
                      </div>
                      <div className="space-y-3 flex-1">
                        {candidates
                          .filter((c) => !c.status || c.status === "New Applicant")
                          .map((c) => (
                            <Card key={c.id} className="p-4 rounded-xl border-primary/20 shadow-sm glass">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-bold text-sm text-foreground">{c.name}</h4>
                                  <p className="text-xs text-primary font-semibold">{c.jobTitle || "Candidate"}</p>
                                </div>
                                {c.resumeName && (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] flex items-center gap-1">
                                    <FileCheck className="w-3 h-3" /> Resume
                                  </Badge>
                                )}
                              </div>

                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3" /> {c.location}
                              </p>
                              {c.email && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                                  <Mail className="w-3 h-3" /> {c.email}
                                </p>
                              )}
                              {c.phone && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                                  <Phone className="w-3 h-3" /> {c.phone}
                                </p>
                              )}

                              {c.notes && (
                                <p className="text-xs bg-muted/60 p-2 rounded-lg mt-2.5 text-muted-foreground italic line-clamp-2">
                                  "{c.notes}"
                                </p>
                              )}

                              <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setCandidates((prev) =>
                                      prev.map((item) => (item.id === c.id ? { ...item, status: "Shortlisted" } : item))
                                    );
                                    toast.success(`Moved ${c.name} to Shortlisted`);
                                  }}
                                  className="text-[11px] h-7 px-2.5 rounded-lg"
                                >
                                  Shortlist
                                </Button>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </div>

                    {/* Column 2: Shortlisted */}
                    <div className="bg-muted/40 rounded-2xl p-4 border border-border space-y-3 min-h-[350px] flex flex-col">
                      <div className="flex items-center justify-between pb-2 border-b border-border">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Shortlisted
                        </h3>
                        <Badge variant="outline">{candidates.filter((c) => c.status === "Shortlisted").length}</Badge>
                      </div>
                      <div className="space-y-3 flex-1">
                        {candidates
                          .filter((c) => c.status === "Shortlisted")
                          .map((c) => (
                            <Card key={c.id} className="p-4 rounded-xl border-amber-500/20 shadow-sm glass">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-bold text-sm text-foreground">{c.name}</h4>
                                  <p className="text-xs text-primary font-semibold">{c.jobTitle || "Candidate"}</p>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3" /> {c.location}
                              </p>
                              <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setCandidates((prev) =>
                                      prev.map((item) => (item.id === c.id ? { ...item, status: "Interview" } : item))
                                    );
                                    toast.success(`Scheduled interview for ${c.name}`);
                                  }}
                                  className="text-[11px] h-7 px-2.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                                >
                                  Schedule Interview
                                </Button>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </div>

                    {/* Column 3: Interview / Placed */}
                    <div className="bg-muted/40 rounded-2xl p-4 border border-border space-y-3 min-h-[350px] flex flex-col">
                      <div className="flex items-center justify-between pb-2 border-b border-border">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Interview / Placed
                        </h3>
                        <Badge variant="outline">
                          {candidates.filter((c) => c.status === "Interview" || c.status === "Placed").length}
                        </Badge>
                      </div>
                      <div className="space-y-3 flex-1">
                        {candidates
                          .filter((c) => c.status === "Interview" || c.status === "Placed")
                          .map((c) => (
                            <Card key={c.id} className="p-4 rounded-xl border-emerald-500/20 shadow-sm glass">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-bold text-sm text-foreground">{c.name}</h4>
                                  <p className="text-xs text-primary font-semibold">{c.jobTitle || "Candidate"}</p>
                                </div>
                                <Badge className="bg-emerald-500 text-white text-[10px]">
                                  {c.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3" /> {c.location}
                              </p>
                            </Card>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: RECRUITING */}
            {activeTab === "recruiting" && (
              <div className="space-y-6 w-full">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-display font-bold gradient-text">Recruiting Manager</h1>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                      View, manage, and create job postings for your company.
                    </p>
                  </div>
                  <Button
                    onClick={() => setCreateJobOpen(true)}
                    className="gradient-bg font-bold rounded-xl h-10 text-xs px-4 text-white shadow-md"
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" /> Create Job
                  </Button>
                </div>

                {jobs.length === 0 ? (
                  <Card className="glass border-primary/20 border-2 border-dashed shadow-md rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">No Jobs Created Yet</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md">
                      Create a job posting to start managing applications and hiring candidates.
                    </p>
                    <Button
                      onClick={() => setCreateJobOpen(true)}
                      className="mt-4 text-xs font-bold rounded-xl h-10 px-5 gradient-bg text-white shadow-md"
                    >
                      <PlusCircle className="w-4 h-4 mr-1.5" /> Post Your First Job
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((j) => (
                      <Card key={j.id} className="glass border-primary/20 shadow-md rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-foreground text-base">{j.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">📍 {j.location} • 💼 {j.type} • 💰 {j.salary}</p>
                        </div>
                        <Button size="sm" className="gradient-bg text-white font-semibold text-xs rounded-xl h-9 px-4">
                          View Applicants
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: CALENDAR */}
            {activeTab === "calendar" && (
              <div className="space-y-6 w-full">
                <div>
                  <h1 className="text-2xl font-display font-bold gradient-text">Interview Calendar</h1>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Schedule and manage candidate interviews and meetings.
                  </p>
                </div>

                {events.length === 0 ? (
                  <Card className="glass border-primary/20 border-2 border-dashed shadow-md rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">No Upcoming Interviews</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md">
                      When candidates are invited for interviews, your schedule and meeting links will appear here.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((ev) => (
                      <Card key={ev.id} className="glass border-primary/20 shadow-md rounded-2xl p-4">
                        <h3 className="font-bold text-foreground text-base">{ev.candidate}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{ev.role} • {ev.time}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Job Modal */}
      <CreateJobModal
        open={createJobOpen}
        onOpenChange={setCreateJobOpen}
        onJobCreated={handleJobCreated}
      />

      {/* Create Candidate Modal */}
      <CreateCandidateModal
        open={createCandidateOpen}
        onOpenChange={setCreateCandidateOpen}
        onCandidateCreated={handleCandidateCreated}
        availableJobs={jobs}
      />

      {/* WorkOnward Style Candidate Details Side Drawer / Overlay */}
      <Sheet open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 overflow-y-auto bg-background">
          {selectedCandidate && (
            <div className="space-y-6 pb-12">
              {/* Cover Header Banner */}
              <div className="gradient-bg p-6 md:p-8 text-white relative">
                <div className="flex items-start gap-4 pt-4">
                  <div className="w-20 h-20 rounded-2xl bg-white text-primary font-black text-3xl flex items-center justify-center shadow-xl border-4 border-white/20">
                    {selectedCandidate.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-display">{selectedCandidate.name}</h2>
                    <p className="text-sm font-semibold opacity-90">{selectedCandidate.title}</p>
                    <p className="text-xs opacity-80 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {selectedCandidate.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content Body */}
              <div className="px-6 space-y-6">
                {/* Contact Unlock Card */}
                <Card className="glass border-primary/30 p-5 rounded-2xl shadow-sm space-y-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> Contact Details
                  </h3>
                  {unlockedCandidateIds.includes(selectedCandidate.id) ? (
                    <div className="space-y-2 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        ✓ Profile & Contact Information Unlocked
                      </p>
                      <div className="text-xs font-mono space-y-1 pt-1 text-foreground">
                        <p><strong>Email:</strong> {selectedCandidate.email}</p>
                        <p><strong>Phone:</strong> {selectedCandidate.phone}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-8 px-4">
                          <Mail className="w-3.5 h-3.5 mr-1" /> Send Email
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs rounded-xl h-8 px-4">
                          <Phone className="w-3.5 h-3.5 mr-1" /> Call
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl">
                      <div className="text-xs font-mono text-muted-foreground space-y-1">
                        <p><strong>Email:</strong> {selectedCandidate.maskedEmail}</p>
                        <p><strong>Phone:</strong> {selectedCandidate.maskedPhone}</p>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        Contact details and full resume are protected. Click below to unlock with 1 free credit.
                      </p>
                      <Button
                        onClick={() => handleUnlockProfile(selectedCandidate.id, selectedCandidate.name)}
                        className="w-full gradient-bg text-white font-bold text-xs rounded-xl h-10 shadow-md flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" /> Unlock Profile & Resume
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Resume Preview Box */}
                <Card className="glass border-primary/20 p-5 rounded-2xl shadow-sm space-y-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Candidate Resume
                  </h3>
                  {unlockedCandidateIds.includes(selectedCandidate.id) ? (
                    <div className="border border-border p-4 rounded-xl bg-card space-y-3">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-emerald-500" />
                          <span className="text-xs font-bold">{selectedCandidate.name.replace(" ", "_")}_Resume.pdf</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 rounded-lg">
                          <Download className="w-3 h-3 mr-1" /> Download
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        "{selectedCandidate.summary}"
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-primary/20 p-8 rounded-xl text-center space-y-2 bg-muted/30">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-xs text-foreground">Resume Preview Locked</h4>
                      <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                        Unlock candidate profile to view full PDF resume, work history, and direct references.
                      </p>
                    </div>
                  )}
                </Card>

                {/* Experience Section */}
                <Card className="glass border-primary/20 p-5 rounded-2xl shadow-sm space-y-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" /> Work Experience
                  </h3>
                  <div className="space-y-3 border-l-2 border-primary/30 pl-4 ml-1">
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{selectedCandidate.companyRole}</h4>
                      <p className="text-[11px] text-primary font-semibold">{selectedCandidate.company}</p>
                      <p className="text-[11px] text-muted-foreground">{selectedCandidate.dates}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {selectedCandidate.summary}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Education Section */}
                <Card className="glass border-primary/20 p-5 rounded-2xl shadow-sm space-y-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" /> Education & Qualifications
                  </h3>
                  <p className="text-xs text-foreground font-semibold bg-muted/50 p-3 rounded-xl border border-border">
                    🎓 {selectedCandidate.education}
                  </p>
                </Card>

                {/* Skills Cloud */}
                <Card className="glass border-primary/20 p-5 rounded-2xl shadow-sm space-y-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> Top Skills & Competencies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((s: string, idx: number) => (
                      <Badge key={idx} className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-semibold">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
