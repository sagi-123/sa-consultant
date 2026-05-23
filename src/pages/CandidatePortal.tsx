// Updated imports
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  User, Mail, Phone, MapPin, Briefcase, Download, Upload,
  Linkedin, Globe, Calendar, FileText, CheckCircle2,
  Clock, LayoutDashboard, LogOut, FileCode2, GraduationCap,
  Loader2, Paperclip, UserCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { extractTextFromPDF } from '@/lib/pdfExtractor';
import { parseResumeWithAI, ParsedResume } from '@/lib/resumeParser';

// Mock data for the candidate
const mockCandidate = {
  name: "",
  title: "Upload your resume to get started",
  company: "",
  experience: "",
  location: "",
  workAuth: "",
  email: "",
  phone: "",
  tags: [],
  currentStage: "Not Started",
  appliedJobs: [] as string[],
  skills: [] as { category: string; items: string[] }[],
  experienceTimeline: [] as { role: string; company: string; duration: string; description: string }[],
  projects: [] as { name: string; description: string; technologies: string[]; link: string }[],
  education: [] as { degree: string; institution: string; year: string }[],
  links: {
    linkedin: "",
    portfolio: "",
    github: ""
  },
  resumeVersions: [] as { id: string, name: string, date: string }[],
};

const CandidatePortal = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resumeList, setResumeList] = useState<{ id: string, name: string, date: string }[]>([]);
  const [activeResume, setActiveResume] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [candidateData, setCandidateData] = useState(mockCandidate);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  // Vendor form state
  const [vendorForm, setVendorForm] = useState({
    companyName: '',
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    jobTitle: '',
  });
  const [vendorFile, setVendorFile] = useState<File | null>(null);
  const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);

  // Fetch candidate profile and subscribe to realtime updates
  useEffect(() => {
    if (!profile?.id) return;

    const fetchCandidateProfile = async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setApplicationStatus(data.status);
        if (data.parsed_data) {
          setCandidateData(prev => ({
            ...prev,
            ...(data.parsed_data as any),
            name: data.name
          }));
        }
        if (data.resume_url) {
          // Extract filename from URL (e.g. ".../resumes/userId/1234_MyResume.pdf" -> "MyResume.pdf")
          const urlParts = data.resume_url.split('/');
          const fullFileName = urlParts[urlParts.length - 1] || 'Uploaded_Resume.pdf';
          const cleanName = fullFileName.split('_').slice(1).join('_') || fullFileName;

          const fetchedResume = {
            id: data.id,
            name: cleanName,
            date: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          };
          setResumeList([fetchedResume]);
          setActiveResume(fetchedResume.id);
        }
      }
    };

    fetchCandidateProfile();

    // Subscribe to realtime changes on this user's application
    const channel = supabase.channel(`candidate_updates_${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'candidates',
          filter: `user_id=eq.${profile.id}`
        },
        (payload: any) => {
          const newStatus = payload.new.status;
          if (newStatus && newStatus !== applicationStatus) {
            setApplicationStatus(newStatus);
            toast({
              title: "Application Updated!",
              description: `Your application has been moved to: ${newStatus}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, toast, applicationStatus]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Prefer parsed data from resume; fall back to Supabase auth profile
  const candidateName = candidateData.name || profile?.name || 'Your Name';
  const candidateEmail = candidateData.email || profile?.email || '';

  const getInitials = (name: string) => {
    if (!name || name === 'Your Name') return null;
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const fileName = `${Math.random().toString(36).substring(2)}_${file.name}`;

        // Uploading to a folder named after the user's ID (best practice for security policies)
        const userId = profile?.id || 'anonymous';
        const { error } = await supabase.storage
          .from('resumes')
          .upload(`${userId}/${fileName}`, file);

        if (error) throw error;

        // Update the dropdown list immediately with the new file
        const newResume = {
          id: fileName,
          name: file.name,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        };

        setResumeList(prev => [newResume, ...prev]);
        setActiveResume(newResume.id);

        toast({
          title: "Upload Successful",
          description: `Successfully uploaded ${file.name}! Now parsing with AI...`,
        });

        // Start AI Parsing
        setIsParsing(true);
        try {
          const text = await extractTextFromPDF(file);
          console.log('=== PDF TEXT EXTRACTED ===');
          console.log('Length:', text.length, 'chars');
          console.log('First 500 chars:', text.substring(0, 500));

          const parsedData = await parseResumeWithAI(text);
          console.log('=== GROQ PARSED DATA ===');
          console.log(JSON.stringify(parsedData, null, 2));

          setCandidateData(prev => ({
            ...prev,
            name: parsedData.name ?? '',
            title: parsedData.title ?? '',
            company: parsedData.experienceTimeline?.[0]?.company ? `Current: ${parsedData.experienceTimeline[0].company}` : '',
            experience: parsedData.experience ?? '',
            email: parsedData.email ?? '',
            phone: parsedData.phone ?? '',
            location: parsedData.location ?? '',
            tags: parsedData.skills?.flatMap(s => s.items).slice(0, 5) || [],
            skills: parsedData.skills || [],
            experienceTimeline: parsedData.experienceTimeline || [],
            projects: parsedData.projects || [],
            education: parsedData.education || [],
            links: {
              linkedin: parsedData.links?.linkedin ?? '',
              github: parsedData.links?.github ?? '',
              portfolio: parsedData.links?.portfolio ?? '',
            }
          }));

          // Save to database for ATS tracking
          const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(`${userId}/${fileName}`);

          const { error: dbError } = await supabase.from('candidates').insert({
            user_id: profile?.id || null,
            name: parsedData.name || profile?.name || 'Unknown Candidate',
            email: parsedData.email || profile?.email || null,
            phone: parsedData.phone || null,
            job_title: parsedData.title || null,
            experience_years: parsedData.experience || null,
            location: parsedData.location || null,
            skills: parsedData.skills as any,
            parsed_data: parsedData as any,
            resume_url: publicUrl,
            status: 'New'
          });

          if (dbError) {
            console.error('Error saving candidate to database:', dbError);
            // We don't throw here to ensure the user still sees their parsed UI
          } else {
            setApplicationStatus('New');
          }

          toast({
            title: "Parsing Complete",
            description: "Your profile has been automatically updated with the extracted details.",
          });
        } catch (parseError: any) {
          toast({
            variant: "destructive",
            title: "Parsing failed",
            description: parseError.message || "Failed to parse resume.",
          });
        } finally {
          setIsParsing(false);
        }

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: error.message || "Failed to upload to Supabase storage.",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handle vendor/partner submission
  const handleVendorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vendorFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please attach a resume before submitting.",
      });
      return;
    }
    setIsSubmittingVendor(true);
    try {
        // Upload resume to resumes bucket inside a vendor subfolder
        const userId = profile?.id || 'vendor_anonymous';
        const fileName = `${Math.random().toString(36).substring(2)}_${vendorFile.name}`;
        const storagePath = `${userId}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(storagePath, vendorFile);
      if (uploadError) throw uploadError;
      // Get public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(storagePath);

      // Build a structured message string with all vendor & candidate details
      const messageBody = [
        `[PARTNER/VENDOR SUBMISSION]`,
        `Vendor Company: ${vendorForm.companyName}`,
        `Vendor Name: ${vendorForm.vendorName}`,
        `Vendor Email: ${vendorForm.vendorEmail}`,
        `Vendor Phone: ${vendorForm.vendorPhone}`,
        `Candidate Name: ${vendorForm.candidateName}`,
        `Candidate Email: ${vendorForm.candidateEmail}`,
        `Candidate Phone: ${vendorForm.candidatePhone}`,
        `Job Title: ${vendorForm.jobTitle}`,
        `Resume URL: ${publicUrl}`,
      ].join('\n');

      // Insert inquiry record using only existing columns
      const { data: insertedData, error: dbError } = await supabase.from('inquiries').insert({
        name: vendorForm.vendorName,
        email: vendorForm.vendorEmail,
        phone: vendorForm.vendorPhone || 'N/A',
        message: messageBody,
        vendor_name: vendorForm.vendorName,
        vendor_email: vendorForm.vendorEmail,
        vendor_phone: vendorForm.vendorPhone,
      } as any);
      console.log('Supabase insert result:', { insertedData, dbError });
      if (dbError) throw dbError;

      toast({
        title: "Submission Sent",
        description: "Vendor submission has been recorded.",
      });
      // Reset form
      setVendorForm({ companyName: '', vendorName: '', vendorEmail: '', vendorPhone: '', candidateName: '', candidateEmail: '', candidatePhone: '', jobTitle: '' });
      setVendorFile(null);
    } catch (err: any) {
      console.error('Vendor submission error:', err);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: err.message || "Failed to submit vendor information.",
      });
    } finally {
      setIsSubmittingVendor(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-display font-bold gradient-text flex items-center gap-2">
            Candidate Portal
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="hidden sm:flex gap-2">
              <LayoutDashboard size={18} /> Home
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut size={18} /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">

        {/* Realtime Status Banner */}
        {applicationStatus && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 animate-in slide-in-from-top-4 ${applicationStatus === 'New' ? 'bg-blue-500/10 border-blue-500/20 text-blue-700' :
            applicationStatus === 'Screened' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700' :
              applicationStatus === 'Interview' ? 'bg-purple-500/10 border-purple-500/20 text-purple-700' :
                applicationStatus === 'Offer' ? 'bg-green-500/10 border-green-500/20 text-green-700' :
                  'bg-red-500/10 border-red-500/20 text-red-700'
            }`}>
            <div>
              <h3 className="font-bold flex items-center gap-2">
                <CheckCircle2 size={18} /> Application Status: {applicationStatus}
              </h3>
              <p className="text-sm opacity-80 mt-1">
                {applicationStatus === 'New' && "Your application has been received and is awaiting review."}
                {applicationStatus === 'Screened' && "Your application is currently being reviewed by our team."}
                {applicationStatus === 'Interview' && "Congratulations! You've been selected for an interview."}
                {applicationStatus === 'Offer' && "An offer has been extended to you! Please check your email."}
                {applicationStatus === 'Rejected' && "Unfortunately, we are moving forward with other candidates at this time."}
              </p>
            </div>
          </div>
        )}

        {/* SECTION 1: HEADER SUMMARY */}
        <Card className="glass overflow-hidden border-primary/20 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

              {/* Photo & Name */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="w-28 h-28 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center shadow-xl overflow-hidden relative text-4xl font-display font-bold text-primary">
                  {getInitials(candidateName) ? (
                    getInitials(candidateName)
                  ) : (
                    <User size={48} className="text-primary/50" />
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-display font-bold text-foreground">{candidateName}</h2>
                  <div className="flex items-center justify-center gap-1 mt-1 text-sm text-primary font-medium">
                    <CheckCircle2 size={14} className="text-green-500" /> Active Profile
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Briefcase size={16} className="text-muted-foreground" />
                      {candidateData.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">{candidateData.company}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-foreground/80">
                      <Clock size={14} className="text-accent" />
                      <strong>Experience:</strong> {candidateData.experience}
                    </p>
                    <p className="flex items-center gap-2 text-foreground/80">
                      <MapPin size={14} className="text-accent" />
                      <strong>Location:</strong> {candidateData.location || 'N/A'} {candidateData.workAuth ? `(${candidateData.workAuth})` : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <a href={`mailto:${candidateEmail}`} className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
                      <Mail size={14} className="text-accent" /> {candidateEmail}
                    </a>
                    <a href={`tel:${candidateData.phone}`} className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
                      <Phone size={14} className="text-accent" /> {candidateData.phone}
                    </a>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {candidateData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary border-none">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-strong p-4 rounded-xl flex items-center justify-between border-l-4 border-l-primary">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Stage</p>
                  <p className="font-bold text-lg">{candidateData.currentStage}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="text-primary" size={20} />
                </div>
              </div>
              <div className="glass-strong p-4 rounded-xl border-l-4 border-l-accent">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Applied Jobs</p>
                {candidateData.appliedJobs.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {candidateData.appliedJobs.map((job, i) => (
                      <span key={i} className="text-sm font-medium flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {job}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No jobs applied yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: RESUME & PARSED PROFILE */}
        <Card className="glass border-primary/20">
          <CardHeader className="border-b border-border/50 pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-display flex items-center gap-2">
                  <FileText className="text-primary" /> Resume & Profile
                </CardTitle>
                <CardDescription>Your professional background, skills, and original resume documents.</CardDescription>
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <select
                  className="bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={activeResume}
                  onChange={(e) => setActiveResume(e.target.value)}
                >
                  {resumeList.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.date})</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2 flex-1 sm:flex-none relative overflow-hidden" disabled={isUploading || isParsing}>
                    {isUploading || isParsing ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {isUploading ? 'Uploading...' : isParsing ? 'Parsing AI...' : 'Upload'}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={isUploading || isParsing}
                    />
                  </Button>
                  <Button className="gradient-bg gap-2 flex-1 sm:flex-none">
                    <Download size={16} /> Download
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="experience" className="w-full">
              <TabsList className="glass-strong w-full flex overflow-x-auto justify-start mb-6 p-1 h-auto touch-pan-x">
                <TabsTrigger value="experience" className="gap-2 px-6 py-2.5 data-[state=active]:gradient-bg">
                  <Briefcase size={16} /> Experience
                </TabsTrigger>
                <TabsTrigger value="projects" className="gap-2 px-6 py-2.5 data-[state=active]:gradient-bg">
                  <LayoutDashboard size={16} /> Projects
                </TabsTrigger>
                <TabsTrigger value="skills" className="gap-2 px-6 py-2.5 data-[state=active]:gradient-bg">
                  <FileCode2 size={16} /> Skills
                </TabsTrigger>
                <TabsTrigger value="education" className="gap-2 px-6 py-2.5 data-[state=active]:gradient-bg">
                  <GraduationCap size={16} /> Education & Links
                </TabsTrigger>
              </TabsList>

              <TabsContent value="experience" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {candidateData.experienceTimeline.map((exp, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/20 text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
                        <Briefcase size={16} />
                      </div>

                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl glass border border-primary/10 hover:border-primary/30 transition-colors shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                          <h4 className="font-bold text-foreground text-lg">{exp.role}</h4>
                          <span className="text-xs font-semibold bg-secondary/80 px-2 py-1 rounded text-primary whitespace-nowrap">
                            {exp.duration}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-accent mb-3">{exp.company}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="projects" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid md:grid-cols-2 gap-6">
                  {candidateData.projects.length > 0 ? candidateData.projects.map((proj, idx) => (
                    <div key={idx} className="glass p-5 rounded-xl border border-primary/10 flex flex-col h-full hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-foreground text-lg">{proj.name}</h4>
                        {proj.link && (
                          <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <Globe size={18} />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">{proj.description}</p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {proj.technologies.map(tech => (
                          <Badge key={tech} variant="secondary" className="bg-primary/10 text-primary border-none text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground italic col-span-full">No projects found in the resume.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="skills" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid md:grid-cols-3 gap-6">
                  {candidateData.skills.map((skillGroup, idx) => (
                    <div key={idx} className="glass p-5 rounded-xl border border-primary/10">
                      <h4 className="font-bold text-foreground mb-4 pb-2 border-b border-border/50 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        {skillGroup.category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skillGroup.items.map(skill => (
                          <Badge key={skill} variant="outline" className="bg-background/50 border-primary/20 hover:border-primary text-foreground">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="education" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                      <GraduationCap className="text-primary" /> Education
                    </h3>
                    {candidateData.education.map((edu, idx) => (
                      <div key={idx} className="glass p-4 rounded-xl border-l-4 border-l-accent flex flex-col gap-1">
                        <h4 className="font-bold text-foreground">{edu.degree}</h4>
                        <p className="text-sm font-medium text-muted-foreground">{edu.institution}</p>
                        <p className="text-xs text-primary font-semibold">{edu.year}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                      <Globe className="text-primary" /> Web Links
                    </h3>
                    <div className="glass p-4 rounded-xl space-y-4">
                      {candidateData.links.linkedin && (
                        <a href={candidateData.links.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group">
                          <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                            <Linkedin size={18} />
                          </div>
                          <span className="text-sm font-medium break-all">{candidateData.links.linkedin}</span>
                        </a>
                      )}
                      {candidateData.links.github && (
                        <a href={candidateData.links.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
                          <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                            <FileCode2 size={18} />
                          </div>
                          <span className="text-sm font-medium break-all">{candidateData.links.github}</span>
                        </a>
                      )}
                      {candidateData.links.portfolio && (
                        <a href={candidateData.links.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors group">
                          <div className="p-2 rounded-lg bg-secondary group-hover:bg-accent/10 transition-colors">
                            <Globe size={18} />
                          </div>
                          <span className="text-sm font-medium break-all">{candidateData.links.portfolio}</span>
                        </a>
                      )}
                      {!candidateData.links.linkedin && !candidateData.links.github && !candidateData.links.portfolio && (
                        <p className="text-sm text-muted-foreground italic">No links found in resume.</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

        {/* Partner & Vendor Submissions */}
        <div className="mt-12">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl font-display flex items-center gap-2">
                <UserCircle2 size={20} className="text-primary" /> Partner & Vendor Submissions
              </CardTitle>
              <CardDescription>Submit a candidate resume directly to the admin team.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4">
                <h3 className="text-xl font-bold">Vendor Details</h3>
              </div>
              <form onSubmit={handleVendorSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder="Company Name" name="companyName" value={vendorForm.companyName} onChange={e => setVendorForm({ ...vendorForm, companyName: e.target.value })} required />
                  <Input placeholder="Vendor Name" name="vendorName" value={vendorForm.vendorName} onChange={e => setVendorForm({ ...vendorForm, vendorName: e.target.value })} required />
                  <Input type="email" placeholder="Vendor Email" name="vendorEmail" value={vendorForm.vendorEmail} onChange={e => setVendorForm({ ...vendorForm, vendorEmail: e.target.value })} required />
                  <Input placeholder="Vendor Phone" name="vendorPhone" value={vendorForm.vendorPhone} onChange={e => setVendorForm({ ...vendorForm, vendorPhone: e.target.value })} required />
                  <Input placeholder="Candidate Name" name="candidateName" value={vendorForm.candidateName} onChange={e => setVendorForm({ ...vendorForm, candidateName: e.target.value })} required />
                  <Input type="email" placeholder="Candidate Email" name="candidateEmail" value={vendorForm.candidateEmail} onChange={e => setVendorForm({ ...vendorForm, candidateEmail: e.target.value })} required />
                  <Input placeholder="Phone Number" name="candidatePhone" value={vendorForm.candidatePhone} onChange={e => setVendorForm({ ...vendorForm, candidatePhone: e.target.value })} required />
                  <Input placeholder="Job Title" name="jobTitle" value={vendorForm.jobTitle} onChange={e => setVendorForm({ ...vendorForm, jobTitle: e.target.value })} required />
                </div>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer border border-dashed border-primary/30 rounded-lg px-4 py-2 hover:bg-primary/5 transition-colors">
                    <Paperclip size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">{vendorFile ? vendorFile.name : 'Attach Resume'}</span>
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => setVendorFile(e.target.files?.[0] ?? null)} />
                  </label>
                  {vendorFile && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 size={14} /> File selected
                    </span>
                  )}
                  <Button type="submit" disabled={isSubmittingVendor} className="gradient-bg">
                    {isSubmittingVendor ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</> : 'Submit Candidate'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
};

export default CandidatePortal;
