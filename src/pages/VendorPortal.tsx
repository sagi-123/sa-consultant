import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Users, UserPlus, FileText, Upload, CheckCircle2, DollarSign, 
  MessageSquare, Briefcase, Calendar, TrendingUp, Sparkles, X, Check, 
  Eye, AlertCircle, Loader2, Send, LayoutDashboard, LogOut, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { extractTextFromPDF } from '@/lib/pdfExtractor';
import { parseResumeWithAI } from '@/lib/resumeParser';
import { useSEO } from '@/hooks/useSEO';

export default function VendorPortal() {
  useSEO({
    title: "Talent Partner Portal | SA Consultant & Staffing",
    description: "Submit bench candidates, review matches, track placements, and manage commissions on our exclusive partner portal.",
    canonical: "https://www.saconsultantandstaffing.com/vendor-portal"
  });
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Data state
  const [vendorCompany, setVendorCompany] = useState('Talent Partner');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [revenueShares, setRevenueShares] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Form state for manual candidate upload
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    experience_years: '',
    location: '',
    salary_expectation: '',
    availability: 'Immediate',
    work_authorization: 'US Citizen',
    resume_url: ''
  });

  // Fetch all vendor data
  useEffect(() => {
    if (!profile?.id) return;

    const fetchVendorData = async () => {
      setLoading(true);
      try {
        // Fetch candidates
        const { data: cData } = await supabase
          .from('vendor_candidates')
          .select('*')
          .eq('vendor_id', profile.id)
          .order('created_at', { ascending: false });
        if (cData) {
          setCandidates(cData);
          if (cData.length > 0 && cData[0].vendor_company_name) {
            setVendorCompany(cData[0].vendor_company_name);
          }
        }

        // Fetch job matches
        const { data: mData } = await supabase
          .from('job_matches')
          .select('*, vendor_candidates(name, email, skills)')
          .eq('vendor_id', profile.id)
          .order('created_at', { ascending: false });
        if (mData) setMatches(mData);

        // Fetch revenue shares
        const { data: rData } = await supabase
          .from('revenue_shares')
          .select('*')
          .eq('vendor_id', profile.id)
          .order('created_at', { ascending: false });
        if (rData) setRevenueShares(rData);

        // Fetch messages
        const { data: msgData } = await supabase
          .from('partner_messages')
          .select('*')
          .eq('vendor_id', profile.id)
          .order('created_at', { ascending: true });
        if (msgData) setMessages(msgData);

      } catch (err) {
        console.error('Error fetching vendor data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();

    // Subscribe to realtime messages
    const channel = supabase.channel(`vendor_portal_${profile.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_matches', filter: `vendor_id=eq.${profile.id}` }, () => {
        // Refetch matches
        supabase.from('job_matches').select('*, vendor_candidates(name, email, skills)').eq('vendor_id', profile.id).order('created_at', { ascending: false })
          .then(({ data }) => data && setMatches(data));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'partner_messages', filter: `vendor_id=eq.${profile.id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Handle PDF Resume Upload & AI Parsing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    setIsUploading(true);
    try {
      const fileName = `${Math.random().toString(36).substring(2)}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(`vendors/${profile.id}/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(`vendors/${profile.id}/${fileName}`);
      
      const resumeUrl = publicUrlData.publicUrl;
      setIsUploading(false);
      setIsParsing(true);

      // AI Parsing
      const text = await extractTextFromPDF(file);
      const parsed = await parseResumeWithAI(text);

      // Populate form
      setCandidateForm({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        skills: parsed.skills?.map((s: any) => s.items.join(', ')).join(', ') || '',
        experience_years: parsed.experience || '3+ Years',
        location: parsed.location || '',
        salary_expectation: '$120,000 / $60/hr',
        availability: 'Immediate',
        work_authorization: parsed.workAuth || 'US Citizen',
        resume_url: resumeUrl
      });

      toast({
        title: "Resume Parsed Successfully!",
        description: "Review the extracted details below and click Submit Candidate.",
      });

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: err.message,
      });
    } finally {
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  // Submit Candidate Form
  const handleSubmitCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setLoading(true);
    try {
      const skillsArray = candidateForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      const { data, error } = await supabase.from('vendor_candidates').insert({
        vendor_id: profile.id,
        vendor_company_name: vendorCompany,
        name: candidateForm.name,
        email: candidateForm.email,
        phone: candidateForm.phone,
        skills: skillsArray as any,
        experience_years: candidateForm.experience_years,
        location: candidateForm.location,
        salary_expectation: candidateForm.salary_expectation,
        availability: candidateForm.availability,
        work_authorization: candidateForm.work_authorization,
        resume_url: candidateForm.resume_url,
        status: 'Available'
      } as any).select().single();

      if (error) throw error;

      setCandidates(prev => [data, ...prev]);
      toast({
        title: "Candidate Added!",
        description: `${candidateForm.name} has been added to your Talent Inventory.`,
      });

      // Reset form
      setCandidateForm({
        name: '', email: '', phone: '', skills: '', experience_years: '', location: '',
        salary_expectation: '', availability: 'Immediate', work_authorization: 'US Citizen', resume_url: ''
      });
      setActiveTab('inventory');

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Bulk CSV Upload Simulation
  const handleBulkCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split('\n').slice(1); // skip header
      let count = 0;
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 3 && profile?.id) {
          const [name, email, phone, skills, exp, loc, rate] = parts;
          await supabase.from('vendor_candidates').insert({
            vendor_id: profile.id,
            vendor_company_name: vendorCompany,
            name: name?.trim(),
            email: email?.trim(),
            phone: phone?.trim(),
            skills: skills ? skills.split(';').map(s => s.trim()) : [],
            experience_years: exp?.trim() || '3 Years',
            location: loc?.trim() || 'Remote',
            salary_expectation: rate?.trim() || '$100k',
            availability: 'Immediate',
            work_authorization: 'US Citizen',
            status: 'Available'
          } as any);
          count++;
        }
      }
      toast({ title: "Bulk Upload Complete", description: `Successfully imported ${count} candidates.` });
      // Refetch
      const { data } = await supabase.from('vendor_candidates').select('*').eq('vendor_id', profile.id).order('created_at', { ascending: false });
      if (data) setCandidates(data);
    };
    reader.readAsText(file);
  };

  // Approve / Reject Job Match (Magic Screen Action)
  const handleMatchAction = async (matchId: string, approved: boolean) => {
    try {
      const newStatus = approved ? 'Approved / Submitted' : 'Rejected';
      const { error } = await supabase.from('job_matches').update({
        partner_approved: approved,
        status: newStatus
      } as any).eq('id', matchId);

      if (error) throw error;

      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, partner_approved: approved, status: newStatus } : m));
      toast({
        title: approved ? "Submission Approved" : "Submission Rejected",
        description: approved ? "Candidate will now be submitted to the client." : "Match rejected.",
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action Failed", description: err.message });
    }
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile?.id) return;

    try {
      const msg = {
        vendor_id: profile.id,
        sender_id: profile.id,
        sender_name: vendorCompany || profile.name || 'Vendor',
        sender_role: 'vendor',
        message: newMessage.trim()
      };

      const { data, error } = await supabase.from('partner_messages').insert(msg as any).select().single();
      if (error) throw error;

      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error sending message", description: err.message });
    }
  };

  // Calculate KPIs
  const totalShared = candidates.length;
  const inInterview = matches.filter(m => m.status === 'Interview').length;
  const totalPlaced = matches.filter(m => m.status === 'Placed').length;
  const activeSubmissions = matches.filter(m => ['Approved / Submitted', 'Interview', 'Offered'].includes(m.status)).length;
  const totalCommission = revenueShares.filter(r => r.payment_status === 'Paid').reduce((sum, r) => sum + Number(r.partner_share || 0), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      
      {/* Top Navbar */}
      <nav className="border-b border-primary/10 glass sticky top-0 z-50 py-4 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-background font-bold text-xl shadow-md">
              TP
            </div>
            <div>
              <h1 className="text-xl font-display font-bold gradient-text leading-none">Talent Partner Portal</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Supplier CRM & Revenue Tracking • <span className="font-semibold text-primary">{vendorCompany}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 text-muted-foreground hover:text-foreground font-semibold">
              <LayoutDashboard size={16} /> Main Website
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 glass border-primary/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all font-semibold">
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl flex-1 space-y-8">
        
        {/* SECTION 1: DASHBOARD KPI RIBBON */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="glass border-primary/10 hover:border-primary/30 transition-all shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                Total Shared <Users size={14} className="text-primary" />
              </CardDescription>
              <CardTitle className="text-2xl font-display font-bold text-foreground">{totalShared}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="glass border-primary/10 hover:border-primary/30 transition-all shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                In Interview <Calendar size={14} className="text-yellow-500" />
              </CardDescription>
              <CardTitle className="text-2xl font-display font-bold text-yellow-600 dark:text-yellow-400">{inInterview}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="glass border-primary/10 hover:border-primary/30 transition-all shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                Active Submissions <Briefcase size={14} className="text-blue-500" />
              </CardDescription>
              <CardTitle className="text-2xl font-display font-bold text-blue-600 dark:text-blue-400">{activeSubmissions}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="glass border-primary/10 hover:border-primary/30 transition-all shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                Placed <CheckCircle2 size={14} className="text-green-500" />
              </CardDescription>
              <CardTitle className="text-2xl font-display font-bold text-green-600 dark:text-green-400">{totalPlaced}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="glass border-primary/10 hover:border-primary/30 transition-all shadow-sm col-span-2 md:col-span-1 gradient-bg text-background">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-background/80 flex items-center justify-between">
                Revenue <DollarSign size={14} />
              </CardDescription>
              <CardTitle className="text-2xl font-display font-bold">${totalCommission.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* MAIN NAVIGATION TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="glass-strong flex flex-wrap justify-start gap-2 p-1 h-auto w-full border border-primary/10 shadow-sm">
            <TabsTrigger value="dashboard" className="gap-2 px-4 py-2 text-sm font-semibold data-[state=active]:gradient-bg data-[state=active]:text-background rounded-xl transition-all">
              <LayoutDashboard size={16} /> Overview
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2 px-4 py-2 text-sm font-semibold data-[state=active]:gradient-bg data-[state=active]:text-background rounded-xl transition-all">
              <UserPlus size={16} /> Add Candidates
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2 px-4 py-2 text-sm font-semibold data-[state=active]:gradient-bg data-[state=active]:text-background rounded-xl transition-all">
              <Users size={16} /> My Candidates ({candidates.length})
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-2 px-4 py-2 text-sm font-semibold data-[state=active]:gradient-bg data-[state=active]:text-background rounded-xl transition-all relative">
              <Sparkles size={16} /> Job Matches
              {matches.filter(m => m.status === 'Pending Partner Approval').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
                  {matches.filter(m => m.status === 'Pending Partner Approval').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="tracker" className="gap-2 px-4 py-2 text-sm font-semibold data-[state=active]:gradient-bg data-[state=active]:text-background rounded-xl transition-all">
              <Briefcase size={16} /> Submission Tracker
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2 px-4 py-2 text-sm font-semibold data-[state=active]:gradient-bg data-[state=active]:text-background rounded-xl transition-all">
              <TrendingUp size={16} /> Revenue & Offers
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2 px-4 py-2 text-sm font-semibold data-[state=active]:gradient-bg data-[state=active]:text-background rounded-xl transition-all">
              <MessageSquare size={16} /> Communication
            </TabsTrigger>
          </TabsList>

          {/* TAB: OVERVIEW */}
          <TabsContent value="dashboard" className="space-y-8 animate-in fade-in-50 duration-500">
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Magic Screen Alert Box */}
              <Card className="glass border-primary/20 md:col-span-2 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-display font-bold">
                    <Sparkles className="text-primary animate-spin" size={20} /> Action Required: AI Job Matches
                  </CardTitle>
                  <CardDescription>Review open positions matched to your bench consultants.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {matches.filter(m => m.status === 'Pending Partner Approval').length === 0 ? (
                    <div className="p-8 text-center glass rounded-xl border border-primary/10">
                      <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
                      <p className="font-bold text-foreground">All caught up!</p>
                      <p className="text-xs text-muted-foreground mt-1">No pending job match approvals at the moment.</p>
                    </div>
                  ) : (
                    matches.filter(m => m.status === 'Pending Partner Approval').slice(0, 3).map(match => (
                      <div key={match.id} className="p-4 rounded-xl glass border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/40 transition-all">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground text-base">{match.vendor_candidates?.name}</h4>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-none text-xs font-bold">
                              {match.match_percentage}% Match
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Matched to <span className="font-semibold text-foreground">{match.job_role}</span> at {match.company_name}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                            <span>💰 {match.salary_fit || 'Competitive'}</span>
                            <span>📍 {match.location_fit || 'Remote'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleMatchAction(match.id, false)} className="border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold">
                            <X size={14} className="mr-1" /> Reject
                          </Button>
                          <Button size="sm" onClick={() => handleMatchAction(match.id, true)} className="gradient-bg font-bold shadow-md">
                            <Check size={14} className="mr-1" /> Approve Submission
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  {matches.filter(m => m.status === 'Pending Partner Approval').length > 3 && (
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('matches')} className="w-full text-primary font-bold">
                      View All Pending Matches <ArrowUpRight size={16} className="ml-1" />
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions & Vendor Info */}
              <Card className="glass border-primary/20 shadow-sm flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-lg font-display font-bold">Quick Actions</CardTitle>
                  <CardDescription>Manage your talent supply pipeline.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setActiveTab('upload')} className="w-full gradient-bg h-12 rounded-xl font-bold shadow-md justify-between px-6">
                    <span className="flex items-center gap-2"><UserPlus size={18} /> Upload New Candidate</span>
                    <ArrowUpRight size={18} />
                  </Button>
                  <div className="p-4 rounded-xl glass border border-primary/10 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Partner Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Company:</span> <span className="font-bold">{vendorCompany}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Tier:</span> <span className="font-bold text-primary">Premium Supplier</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* TAB: ADD CANDIDATES */}
          <TabsContent value="upload" className="space-y-8 animate-in fade-in-50 duration-500">
            <Card className="glass border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                  <UserPlus className="text-primary" size={24} /> Add Candidate to Talent Inventory
                </CardTitle>
                <CardDescription>Upload a resume for instant AI extraction, or enter details manually.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Upload Options Grid */}
                <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-primary/10">
                  {/* AI Resume Upload */}
                  <div className="p-6 rounded-2xl glass border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-center relative group hover:border-primary transition-all">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      {isUploading || isParsing ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                    </div>
                    <h3 className="font-bold text-foreground mb-1">AI Resume Ingestion</h3>
                    <p className="text-xs text-muted-foreground mb-6 max-w-xs">Upload a PDF resume. Our AI will instantly extract skills, experience, and contact details.</p>
                    <Input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileUpload} 
                      disabled={isUploading || isParsing}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <Button variant="outline" className="glass border-primary/20 font-bold pointer-events-none">
                      {isUploading ? "Uploading PDF..." : isParsing ? "AI Extracting Data..." : "Select PDF Resume"}
                    </Button>
                  </div>

                  {/* Bulk CSV Upload */}
                  <div className="p-6 rounded-2xl glass border border-primary/20 flex flex-col items-center justify-center text-center relative group hover:border-primary/40 transition-all">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4 group-hover:scale-110 transition-transform">
                      <FileText size={32} />
                    </div>
                    <h3 className="font-bold text-foreground mb-1">Bulk CSV Import</h3>
                    <p className="text-xs text-muted-foreground mb-6 max-w-xs">Upload a CSV file containing multiple bench candidates to populate your inventory instantly.</p>
                    <Input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleBulkCSV} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <Button variant="outline" className="glass border-primary/20 font-bold pointer-events-none">
                      Upload CSV File
                    </Button>
                  </div>
                </div>

                {/* Manual / AI Populated Form */}
                <form onSubmit={handleSubmitCandidate} className="space-y-6 pt-2">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <FileText size={18} className="text-primary" /> Candidate Details Form
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="c-name">Full Name *</Label>
                      <Input id="c-name" value={candidateForm.name} onChange={e => setCandidateForm({...candidateForm, name: e.target.value})} placeholder="John Doe" required className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-email">Email Address *</Label>
                      <Input id="c-email" type="email" value={candidateForm.email} onChange={e => setCandidateForm({...candidateForm, email: e.target.value})} placeholder="john@example.com" required className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-phone">Phone Number</Label>
                      <Input id="c-phone" value={candidateForm.phone} onChange={e => setCandidateForm({...candidateForm, phone: e.target.value})} placeholder="+1 (555) 000-0000" className="bg-background/50" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="c-skills">Skills (Comma separated) *</Label>
                      <Input id="c-skills" value={candidateForm.skills} onChange={e => setCandidateForm({...candidateForm, skills: e.target.value})} placeholder="React, TypeScript, Node.js, AWS" required className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-exp">Total Experience</Label>
                      <Input id="c-exp" value={candidateForm.experience_years} onChange={e => setCandidateForm({...candidateForm, experience_years: e.target.value})} placeholder="5+ Years" className="bg-background/50" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="c-loc">Current Location</Label>
                      <Input id="c-loc" value={candidateForm.location} onChange={e => setCandidateForm({...candidateForm, location: e.target.value})} placeholder="New York, NY / Remote" className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-sal">Salary / Rate Expectation *</Label>
                      <Input id="c-sal" value={candidateForm.salary_expectation} onChange={e => setCandidateForm({...candidateForm, salary_expectation: e.target.value})} placeholder="$120k / $65/hr C2C" required className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-avail">Availability</Label>
                      <Select value={candidateForm.availability} onValueChange={val => setCandidateForm({...candidateForm, availability: val})}>
                        <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Immediate">Immediate</SelectItem>
                          <SelectItem value="2 Weeks">2 Weeks</SelectItem>
                          <SelectItem value="1 Month">1 Month</SelectItem>
                          <SelectItem value="Passive">Passive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-auth">Work Authorization</Label>
                      <Select value={candidateForm.work_authorization} onValueChange={val => setCandidateForm({...candidateForm, work_authorization: val})}>
                        <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US Citizen">US Citizen</SelectItem>
                          <SelectItem value="Green Card">Green Card</SelectItem>
                          <SelectItem value="H1B">H1B (C2C)</SelectItem>
                          <SelectItem value="OPT / CPT">OPT / CPT</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {candidateForm.resume_url && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                      <span className="text-sm font-semibold flex items-center gap-2 text-primary">
                        <CheckCircle2 size={18} /> PDF Resume Successfully Attached
                      </span>
                      <a href={candidateForm.resume_url} target="_blank" rel="noreferrer" className="text-xs font-bold underline hover:text-primary">
                        View Uploaded PDF
                      </a>
                    </div>
                  )}

                  <Button type="submit" className="gradient-bg w-full h-12 rounded-xl font-bold shadow-lg" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                    {loading ? "Adding Candidate..." : "Submit Candidate to Talent Inventory"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: MY CANDIDATES (INVENTORY) */}
          <TabsContent value="inventory" className="space-y-8 animate-in fade-in-50 duration-500">
            <Card className="glass border-primary/20 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                    <Users className="text-primary" size={24} /> Talent Inventory ({candidates.length})
                  </CardTitle>
                  <CardDescription>Manage bench consultants and track their availability status.</CardDescription>
                </div>
                <Button onClick={() => setActiveTab('upload')} size="sm" className="gradient-bg font-bold shadow-md gap-2">
                  <UserPlus size={16} /> Add Candidate
                </Button>
              </CardHeader>
              <CardContent>
                {candidates.length === 0 ? (
                  <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                    <Users size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="font-bold text-foreground text-lg">No candidates in your inventory yet.</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-6 max-w-md mx-auto">Upload bench consultants to start receiving automated AI job matches from SA Consultant.</p>
                    <Button onClick={() => setActiveTab('upload')} className="gradient-bg font-bold shadow-md">
                      Upload First Candidate
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="py-4 px-4">Candidate Name</th>
                          <th className="py-4 px-4">Experience</th>
                          <th className="py-4 px-4">Top Skills</th>
                          <th className="py-4 px-4">Rate / Salary</th>
                          <th className="py-4 px-4">Work Auth</th>
                          <th className="py-4 px-4">Live Status</th>
                          <th className="py-4 px-4 text-right">Resume</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10 text-sm">
                        {candidates.map(candidate => (
                          <tr key={candidate.id} className="hover:bg-primary/5 transition-colors">
                            <td className="py-4 px-4 font-bold text-foreground flex items-center gap-2">
                              {candidate.name}
                            </td>
                            <td className="py-4 px-4 text-muted-foreground font-medium">{candidate.experience_years}</td>
                            <td className="py-4 px-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {candidate.skills?.slice(0, 3).map((skill: string) => (
                                  <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-semibold">
                                    {skill}
                                  </Badge>
                                ))}
                                {candidate.skills?.length > 3 && <span className="text-xs text-muted-foreground">+{candidate.skills.length - 3}</span>}
                              </div>
                            </td>
                            <td className="py-4 px-4 font-semibold text-foreground">{candidate.salary_expectation}</td>
                            <td className="py-4 px-4 text-muted-foreground">{candidate.work_authorization}</td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className={`border-none font-bold text-xs shadow-sm ${
                                candidate.status === 'Available' ? 'bg-blue-500/10 text-blue-500' :
                                candidate.status === 'Submitted to Jobs' ? 'bg-yellow-500/10 text-yellow-600' :
                                candidate.status === 'Interviewing' ? 'bg-purple-500/10 text-purple-500' :
                                candidate.status === 'Offered' ? 'bg-green-500/10 text-green-600' :
                                'bg-green-500 text-white'
                              }`}>
                                {candidate.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {candidate.resume_url ? (
                                <Button asChild variant="ghost" size="sm" className="hover:text-primary">
                                  <a href={candidate.resume_url} target="_blank" rel="noreferrer"><Eye size={16} /></a>
                                </Button>
                              ) : <span className="text-xs text-muted-foreground italic">N/A</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: JOB MATCHES (MAGIC SCREEN) */}
          <TabsContent value="matches" className="space-y-8 animate-in fade-in-50 duration-500">
            <Card className="glass border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                  <Sparkles className="text-primary" size={24} /> AI Job Matches & Approvals
                </CardTitle>
                <CardDescription>Approve or reject job submissions proposed by SA Consultant recruiters.</CardDescription>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                    <Sparkles size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="font-bold text-foreground text-lg">No job matches found yet.</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">Our recruitment team is currently analyzing your talent inventory against active client requisitions.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {matches.map(match => (
                      <Card key={match.id} className="glass border border-primary/15 hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between overflow-hidden">
                        <CardHeader className="pb-4 border-b border-primary/10 bg-secondary/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-none text-xs font-bold mb-2 shadow-sm">
                                {match.match_percentage}% AI Match
                              </Badge>
                              <CardTitle className="text-lg font-bold text-foreground">{match.job_role}</CardTitle>
                              <CardDescription className="text-sm font-semibold text-foreground/80">{match.company_name}</CardDescription>
                            </div>
                            <Badge variant="outline" className={`border-none font-bold text-xs shadow-sm ${
                              match.status === 'Pending Partner Approval' ? 'bg-yellow-500/10 text-yellow-600 animate-pulse' :
                              match.status === 'Approved / Submitted' ? 'bg-blue-500/10 text-blue-500' :
                              match.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                              'bg-green-500/10 text-green-600'
                            }`}>
                              {match.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="py-4 space-y-4 flex-1">
                          <div className="p-3 rounded-xl glass border border-primary/10 space-y-2 text-xs">
                            <div className="flex justify-between"><span className="text-muted-foreground font-medium">Candidate:</span> <span className="font-bold text-foreground text-sm">{match.vendor_candidates?.name}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground font-medium">Salary Fit:</span> <span className="font-semibold text-green-600 dark:text-green-400">{match.salary_fit || 'Optimal Match'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground font-medium">Location Fit:</span> <span className="font-semibold text-foreground">{match.location_fit || 'Remote / Hybrid'}</span></div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-semibold text-foreground">Candidate Skills:</span> {match.vendor_candidates?.skills?.join(', ') || 'N/A'}
                          </p>
                        </CardContent>
                        {match.status === 'Pending Partner Approval' && (
                          <div className="p-4 border-t border-primary/10 bg-background/50 flex items-center justify-end gap-3">
                            <Button variant="outline" size="sm" onClick={() => handleMatchAction(match.id, false)} className="border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold">
                              <X size={14} className="mr-1" /> Reject Match
                            </Button>
                            <Button size="sm" onClick={() => handleMatchAction(match.id, true)} className="gradient-bg font-bold shadow-md">
                              <Check size={14} className="mr-1" /> Approve Submission
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: SUBMISSION TRACKER */}
          <TabsContent value="tracker" className="space-y-8 animate-in fade-in-50 duration-500">
            <Card className="glass border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                  <Briefcase className="text-primary" size={24} /> Client Submission Tracker
                </CardTitle>
                <CardDescription>Live pipeline tracking for approved candidate submissions.</CardDescription>
              </CardHeader>
              <CardContent>
                {matches.filter(m => m.status !== 'Pending Partner Approval' && m.status !== 'Rejected').length === 0 ? (
                  <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                    <Briefcase size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="font-bold text-foreground text-lg">No active client submissions yet.</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">Approve job matches from the Job Matches tab to initiate client submissions.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="py-4 px-4">Candidate</th>
                          <th className="py-4 px-4">Client Company</th>
                          <th className="py-4 px-4">Job Role</th>
                          <th className="py-4 px-4">Live Stage</th>
                          <th className="py-4 px-4">Interview Schedule</th>
                          <th className="py-4 px-4">Client Feedback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10 text-sm">
                        {matches.filter(m => m.status !== 'Pending Partner Approval' && m.status !== 'Rejected').map(match => (
                          <tr key={match.id} className="hover:bg-primary/5 transition-colors">
                            <td className="py-4 px-4 font-bold text-foreground">{match.vendor_candidates?.name}</td>
                            <td className="py-4 px-4 font-semibold text-foreground">{match.company_name}</td>
                            <td className="py-4 px-4 text-muted-foreground">{match.job_role}</td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className={`border-none font-bold text-xs shadow-sm ${
                                match.status === 'Approved / Submitted' ? 'bg-blue-500/10 text-blue-500' :
                                match.status === 'Interview' ? 'bg-purple-500/10 text-purple-500' :
                                match.status === 'Offered' ? 'bg-green-500/10 text-green-600' :
                                'bg-green-500 text-white'
                              }`}>
                                {match.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-xs font-medium text-muted-foreground">
                              {match.interview_schedule || <span className="italic opacity-50">Pending Scheduling</span>}
                            </td>
                            <td className="py-4 px-4 text-xs text-muted-foreground max-w-xs truncate">
                              {match.interview_feedback || <span className="italic opacity-50">Awaiting Feedback</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: REVENUE & OFFERS */}
          <TabsContent value="revenue" className="space-y-8 animate-in fade-in-50 duration-500">
            <Card className="glass border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                  <TrendingUp className="text-primary" size={24} /> Revenue & Placement Tracking
                </CardTitle>
                <CardDescription>Track placement fees, partner commission shares, and payout statuses.</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueShares.length === 0 ? (
                  <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                    <DollarSign size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="font-bold text-foreground text-lg">No placement revenue recorded yet.</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">Commissions will appear here automatically once your submitted candidates are successfully placed.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="py-4 px-4">Candidate</th>
                          <th className="py-4 px-4">Client Company</th>
                          <th className="py-4 px-4">Total Placement Fee</th>
                          <th className="py-4 px-4 font-bold text-primary">Your Share (Commission)</th>
                          <th className="py-4 px-4">Payment Status</th>
                          <th className="py-4 px-4 text-right">Paid Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10 text-sm">
                        {revenueShares.map(rev => (
                          <tr key={rev.id} className="hover:bg-primary/5 transition-colors">
                            <td className="py-4 px-4 font-bold text-foreground">{rev.candidate_name}</td>
                            <td className="py-4 px-4 font-semibold text-muted-foreground">{rev.company_name}</td>
                            <td className="py-4 px-4 font-medium text-foreground">${Number(rev.placement_fee).toLocaleString()}</td>
                            <td className="py-4 px-4 font-bold text-primary text-base">${Number(rev.partner_share).toLocaleString()}</td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className={`border-none font-bold text-xs shadow-sm ${
                                rev.payment_status === 'Paid' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                              }`}>
                                {rev.payment_status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right text-xs text-muted-foreground">
                              {rev.paid_at ? new Date(rev.paid_at).toLocaleDateString() : <span className="italic opacity-50">Pending Payout</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: COMMUNICATION */}
          <TabsContent value="messages" className="space-y-8 animate-in fade-in-50 duration-500">
            <Card className="glass border-primary/20 shadow-sm flex flex-col h-[600px] overflow-hidden">
              <CardHeader className="border-b border-primary/10 pb-4 bg-secondary/20 shrink-0">
                <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                  <MessageSquare className="text-primary" size={24} /> Partner Communication Center
                </CardTitle>
                <CardDescription>Direct messaging with SA Consultant recruitment managers for interview coordination.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <MessageSquare size={48} className="mb-3 opacity-30" />
                    <p className="font-bold text-foreground">No messages yet.</p>
                    <p className="text-xs mt-1 max-w-sm">Start the conversation to coordinate interviews or ask clarifications about job requisitions.</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col max-w-lg ${msg.sender_role === 'vendor' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-bold text-foreground">{msg.sender_name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{msg.sender_role}</span>
                      </div>
                      <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                        msg.sender_role === 'vendor' ? 'gradient-bg text-background rounded-br-none' : 'glass border border-primary/20 text-foreground rounded-bl-none'
                      }`}>
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
              <div className="p-4 border-t border-primary/10 bg-background/50 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <Input 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    placeholder="Type a message to SA Consultant recruiters..." 
                    className="flex-1 bg-background/80 h-12 rounded-xl border-primary/20"
                  />
                  <Button type="submit" className="gradient-bg h-12 px-6 rounded-xl font-bold shadow-md gap-2">
                    <Send size={16} /> Send
                  </Button>
                </form>
              </div>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
