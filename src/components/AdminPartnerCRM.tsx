import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Users, Briefcase, Calendar, TrendingUp, Sparkles, MessageSquare, 
  CheckCircle2, Plus, Eye, Send, Loader2, DollarSign, Check, X
} from 'lucide-react';

export function AdminPartnerCRM() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('requisitions');
  const [loading, setLoading] = useState(false);

  // Data state
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [revenueShares, setRevenueShares] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  // Modals state
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedCandidateForMatch, setSelectedCandidateForMatch] = useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedMatchForUpdate, setSelectedMatchForUpdate] = useState<any>(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [selectedMatchForCommission, setSelectedMatchForCommission] = useState<any>(null);

  // Forms state
  const [jobForm, setJobForm] = useState({
    title: '', department: 'Engineering', location: 'Remote',
    employment_type: 'Full-time C2C', salary_range: '$130,000 - $150,000 / $65-$75/hr', description: ''
  });

  const [matchForm, setMatchForm] = useState({
    job_id: '', match_percentage: '95', salary_fit: 'Optimal Fit ($70/hr C2C)', location_fit: '100% Remote Fit'
  });

  const [updateForm, setUpdateForm] = useState({
    status: 'Interview', interview_schedule: '', interview_feedback: '', offered_salary: '', joining_date: ''
  });

  const [commissionForm, setCommissionForm] = useState({
    placement_fee: '20000', partner_share: '16000'
  });

  const [newMessage, setNewMessage] = useState('');
  const [selectedVendorForChat, setSelectedVendorForChat] = useState<string | null>(null);

  // Fetch CRM Data
  useEffect(() => {
    const fetchCRMData = async () => {
      setLoading(true);
      try {
        // Fetch jobs
        const { data: jData } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
        if (jData) setJobs(jData);

        // Fetch vendor candidates
        const { data: cData } = await supabase.from('vendor_candidates').select('*').order('created_at', { ascending: false });
        if (cData) setCandidates(cData);

        // Fetch matches
        const { data: mData } = await supabase.from('job_matches').select('*, vendor_candidates(name, email, phone, skills, resume_url)').order('created_at', { ascending: false });
        if (mData) setMatches(mData);

        // Fetch revenue shares
        const { data: rData } = await supabase.from('revenue_shares').select('*').order('created_at', { ascending: false });
        if (rData) setRevenueShares(rData);

        // Fetch messages
        const { data: msgData } = await supabase.from('partner_messages').select('*').order('created_at', { ascending: true });
        if (msgData) {
          setMessages(msgData);
          // Extract unique vendors
          const uniqueVendors = Array.from(new Set(msgData.map(m => m.vendor_id))).map(vId => {
            const firstMsg = msgData.find(m => m.vendor_id === vId);
            return { id: vId, name: firstMsg?.sender_role === 'vendor' ? firstMsg.sender_name : 'Talent Partner' };
          });
          setVendors(uniqueVendors);
          if (uniqueVendors.length > 0 && !selectedVendorForChat) {
            setSelectedVendorForChat(uniqueVendors[0].id);
          }
        }

      } catch (err) {
        console.error('Error fetching Partner CRM data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCRMData();
  }, [selectedVendorForChat]);

  // Create Job Requisition
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('jobs').insert(jobForm as any).select().single();
      if (error) throw error;

      setJobs(prev => [data, ...prev]);
      toast({ title: "Requisition Created", description: `Job "${jobForm.title}" is now visible to Talent Partners.` });
      setJobForm({ title: '', department: 'Engineering', location: 'Remote', employment_type: 'Full-time C2C', salary_range: '$130,000 - $150,000 / $65-$75/hr', description: '' });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error creating job", description: err.message });
    }
  };

  // Open Match Modal
  const openMatchModal = (candidate: any) => {
    setSelectedCandidateForMatch(candidate);
    if (jobs.length > 0) {
      setMatchForm(prev => ({ ...prev, job_id: jobs[0].id }));
    }
    setIsMatchModalOpen(true);
  };

  // Submit Match to Partner (Magic Screen)
  const handleMatchCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateForMatch || !matchForm.job_id) return;

    try {
      const job = jobs.find(j => j.id === matchForm.job_id);
      if (!job) return;

      const matchEntry = {
        candidate_id: selectedCandidateForMatch.id,
        job_id: job.id,
        vendor_id: selectedCandidateForMatch.vendor_id,
        company_name: 'SA Consultant & Staffing (Client Requisition)',
        job_role: job.title,
        match_percentage: Number(matchForm.match_percentage),
        salary_fit: matchForm.salary_fit,
        location_fit: matchForm.location_fit,
        partner_approved: false,
        status: 'Pending Partner Approval'
      };

      const { data, error } = await supabase.from('job_matches').insert(matchEntry as any).select('*, vendor_candidates(name, email, phone, skills, resume_url)').single();
      if (error) throw error;

      setMatches(prev => [data, ...prev]);
      // Update candidate status
      await supabase.from('vendor_candidates').update({ status: 'Submitted to Jobs' } as any).eq('id', selectedCandidateForMatch.id);
      setCandidates(prev => prev.map(c => c.id === selectedCandidateForMatch.id ? { ...c, status: 'Submitted to Jobs' } : c));

      toast({ title: "Match Sent to Partner!", description: `Candidate matched to ${job.title}. Awaiting partner approval.` });
      setIsMatchModalOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Matching Failed", description: err.message });
    }
  };

  // Open Update Modal
  const openUpdateModal = (match: any) => {
    setSelectedMatchForUpdate(match);
    setUpdateForm({
      status: match.status !== 'Pending Partner Approval' ? match.status : 'Interview',
      interview_schedule: match.interview_schedule || '',
      interview_feedback: match.interview_feedback || '',
      offered_salary: match.offered_salary || '',
      joining_date: match.joining_date || ''
    });
    setIsUpdateModalOpen(true);
  };

  // Update Match Stage
  const handleUpdateMatchStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForUpdate) return;

    try {
      const { error } = await supabase.from('job_matches').update(updateForm as any).eq('id', selectedMatchForUpdate.id);
      if (error) throw error;

      setMatches(prev => prev.map(m => m.id === selectedMatchForUpdate.id ? { ...m, ...updateForm } : m));
      
      // If placed, update candidate status as well
      if (updateForm.status === 'Placed') {
        await supabase.from('vendor_candidates').update({ status: 'Placed' } as any).eq('id', selectedMatchForUpdate.candidate_id);
        setCandidates(prev => prev.map(c => c.id === selectedMatchForUpdate.candidate_id ? { ...c, status: 'Placed' } : c));
      }

      toast({ title: "Stage Updated", description: `Match moved to ${updateForm.status}.` });
      setIsUpdateModalOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    }
  };

  // Open Commission Modal
  const openCommissionModal = (match: any) => {
    setSelectedMatchForCommission(match);
    setIsCommissionModalOpen(true);
  };

  // Create Revenue Share
  const handleCreateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForCommission) return;

    try {
      const revEntry = {
        match_id: selectedMatchForCommission.id,
        vendor_id: selectedMatchForCommission.vendor_id,
        candidate_name: selectedMatchForCommission.vendor_candidates?.name || 'Candidate',
        company_name: selectedMatchForCommission.company_name,
        placement_fee: Number(commissionForm.placement_fee),
        partner_share: Number(commissionForm.partner_share),
        payment_status: 'Pending'
      };

      const { data, error } = await supabase.from('revenue_shares').insert(revEntry as any).select().single();
      if (error) throw error;

      setRevenueShares(prev => [data, ...prev]);
      toast({ title: "Commission Logged", description: `Revenue share created for ${revEntry.candidate_name}.` });
      setIsCommissionModalOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error logging commission", description: err.message });
    }
  };

  // Mark Commission Paid
  const handleMarkPaid = async (revId: string) => {
    try {
      const { error } = await supabase.from('revenue_shares').update({
        payment_status: 'Paid',
        paid_at: new Date().toISOString()
      } as any).eq('id', revId);

      if (error) throw error;

      setRevenueShares(prev => prev.map(r => r.id === revId ? { ...r, payment_status: 'Paid', paid_at: new Date().toISOString() } : r));
      toast({ title: "Commission Paid!", description: "Partner share has been marked as Paid." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error updating status", description: err.message });
    }
  };

  // Send Admin Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedVendorForChat) return;

    try {
      const msg = {
        vendor_id: selectedVendorForChat,
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        sender_name: 'SA Recruitment Manager',
        sender_role: 'admin',
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

  return (
    <div className="space-y-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-secondary/20 p-6 rounded-2xl border border-primary/10">
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text">Talent Partners CRM</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage C2C staffing suppliers, match bench candidates to requisitions, and track revenue shares.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-none text-xs font-bold py-1 px-3">
            {candidates.length} Bench Candidates
          </Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none text-xs font-bold py-1 px-3">
            {matches.filter(m => m.status === 'Placed').length} Placements
          </Badge>
        </div>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="glass-strong flex flex-wrap justify-start gap-2 p-1 h-auto w-full border border-primary/10 shadow-sm">
          <TabsTrigger value="requisitions" className="gap-2 px-4 py-2 text-sm font-semibold data-[state=active]:gradient-bg data-[state=active]:text-background rounded-xl transition-all">
            <Briefcase size={16} /> Job Requisitions ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="candidates" className="gap-2 px-4 py-2 text-sm font-semibold data-[state=active]:gradient-bg data-[state=active]:text-background rounded-xl transition-all">
            <Users size={16} /> Partner Candidates ({candidates.length})
          </TabsTrigger>
          <TabsTrigger value="matches" className="gap-2 px-4 py-2 text-sm font-semibold data-[state=active]:gradient-bg data-[state=active]:text-background rounded-xl transition-all relative">
            <Sparkles size={16} /> Submission Tracker ({matches.length})
          </TabsTrigger>
          <TabsTrigger value="commission" className="gap-2 px-4 py-2 text-sm font-semibold data-[state=active]:gradient-bg data-[state=active]:text-background rounded-xl transition-all">
            <TrendingUp size={16} /> Commission & Revenue
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2 px-4 py-2 text-sm font-semibold data-[state=active]:gradient-bg data-[state=active]:text-background rounded-xl transition-all">
            <MessageSquare size={16} /> Partner Chat
          </TabsTrigger>
        </TabsList>

        {/* TAB: JOB REQUISITIONS */}
        <TabsContent value="requisitions" className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Create Job Form */}
            <Card className="glass border-primary/20 shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
                  <Plus className="text-primary" size={20} /> Post Job Requisition
                </CardTitle>
                <CardDescription>Create open positions visible to Talent Partners.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="j-title">Job Title *</Label>
                    <Input id="j-title" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} placeholder="Senior React Developer" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="j-dept">Department</Label>
                    <Input id="j-dept" value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} placeholder="Engineering" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="j-loc">Location</Label>
                    <Input id="j-loc" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="Remote / New York, NY" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="j-type">Employment Type</Label>
                    <Input id="j-type" value={jobForm.employment_type} onChange={e => setJobForm({...jobForm, employment_type: e.target.value})} placeholder="Full-time C2C" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="j-sal">Salary / Rate Range</Label>
                    <Input id="j-sal" value={jobForm.salary_range} onChange={e => setJobForm({...jobForm, salary_range: e.target.value})} placeholder="$130k-$150k / $65-$75/hr" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="j-desc">Description</Label>
                    <Textarea id="j-desc" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} placeholder="Job requirements and responsibilities..." className="bg-background/50 min-h-[100px]" />
                  </div>
                  <Button type="submit" className="gradient-bg w-full font-bold shadow-md">
                    Publish Requisition
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Active Jobs List */}
            <Card className="glass border-primary/20 md:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                  <Briefcase className="text-primary" size={24} /> Active Requisitions ({jobs.length})
                </CardTitle>
                <CardDescription>Open job positions currently broadcasted to staffing partners.</CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                    <Briefcase size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="font-bold text-foreground text-lg">No active job requisitions.</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">Use the form on the left to post your first open job position.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map(job => (
                      <div key={job.id} className="p-5 rounded-2xl glass border border-primary/15 hover:border-primary/30 transition-all shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground text-base">{job.title}</h4>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-none text-xs font-semibold">
                              {job.employment_type}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                            <span>🏢 {job.department}</span>
                            <span>📍 {job.location}</span>
                            <span>💰 {job.salary_range}</span>
                          </div>
                          {job.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{job.description}</p>}
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none font-bold text-xs shrink-0">
                          {job.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* TAB: PARTNER CANDIDATES */}
        <TabsContent value="candidates" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="glass border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                <Users className="text-primary" size={24} /> Talent Partner Candidates ({candidates.length})
              </CardTitle>
              <CardDescription>Bench consultants supplied by C2C vendor agencies. Match them to open requisitions.</CardDescription>
            </CardHeader>
            <CardContent>
              {candidates.length === 0 ? (
                <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                  <Users size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="font-bold text-foreground text-lg">No partner candidates uploaded yet.</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">When Talent Partners upload their bench consultants, they will appear here for matching.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-4 px-4">Candidate Name</th>
                        <th className="py-4 px-4">Vendor Partner</th>
                        <th className="py-4 px-4">Experience</th>
                        <th className="py-4 px-4">Top Skills</th>
                        <th className="py-4 px-4">Rate Exp.</th>
                        <th className="py-4 px-4">Live Status</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10 text-sm">
                      {candidates.map(candidate => (
                        <tr key={candidate.id} className="hover:bg-primary/5 transition-colors">
                          <td className="py-4 px-4 font-bold text-foreground flex items-center gap-2">
                            {candidate.name}
                          </td>
                          <td className="py-4 px-4 font-semibold text-primary">{candidate.vendor_company_name}</td>
                          <td className="py-4 px-4 text-muted-foreground font-medium">{candidate.experience_years}</td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {candidate.skills?.slice(0, 3).map((skill: string) => (
                                <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-semibold">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-foreground">{candidate.salary_expectation}</td>
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
                          <td className="py-4 px-4 text-right space-x-2">
                            {candidate.resume_url && (
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" title="View Resume">
                                <a href={candidate.resume_url} target="_blank" rel="noreferrer"><Eye size={16} /></a>
                              </Button>
                            )}
                            <Button onClick={() => openMatchModal(candidate)} size="sm" className="gradient-bg font-bold shadow-md h-8">
                              <Sparkles size={14} className="mr-1" /> Match to Job
                            </Button>
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

        {/* TAB: SUBMISSION TRACKER */}
        <TabsContent value="matches" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="glass border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                <Sparkles className="text-primary" size={24} /> Partner Submission Tracker ({matches.length})
              </CardTitle>
              <CardDescription>Review candidate job matches, update interview feedback, and log placements.</CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                  <Sparkles size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="font-bold text-foreground text-lg">No job matches created yet.</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">Use the Match to Job button in the Partner Candidates tab to propose submissions to partners.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-4 px-4">Candidate</th>
                        <th className="py-4 px-4">Job Role</th>
                        <th className="py-4 px-4">Partner Consent</th>
                        <th className="py-4 px-4">Live Stage</th>
                        <th className="py-4 px-4">Interview Info</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10 text-sm">
                      {matches.map(match => (
                        <tr key={match.id} className="hover:bg-primary/5 transition-colors">
                          <td className="py-4 px-4 font-bold text-foreground">
                            {match.vendor_candidates?.name}
                            <div className="text-xs text-muted-foreground font-normal">{match.vendor_candidates?.email}</div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-foreground">
                            {match.job_role}
                            <div className="text-xs text-primary font-bold">{match.match_percentage}% Match</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className={`border-none font-bold text-xs shadow-sm ${
                              match.partner_approved ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                            }`}>
                              {match.partner_approved ? 'Approved' : 'Pending Approval'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className={`border-none font-bold text-xs shadow-sm ${
                              match.status === 'Pending Partner Approval' ? 'bg-yellow-500/10 text-yellow-600' :
                              match.status === 'Approved / Submitted' ? 'bg-blue-500/10 text-blue-500' :
                              match.status === 'Interview' ? 'bg-purple-500/10 text-purple-500' :
                              match.status === 'Offered' ? 'bg-green-500/10 text-green-600' :
                              match.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                              'bg-green-500 text-white'
                            }`}>
                              {match.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-xs text-muted-foreground max-w-xs">
                            <div><span className="font-semibold text-foreground">Schedule:</span> {match.interview_schedule || 'N/A'}</div>
                            <div className="truncate"><span className="font-semibold text-foreground">Feedback:</span> {match.interview_feedback || 'N/A'}</div>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            {match.partner_approved && match.status !== 'Placed' && match.status !== 'Rejected' && (
                              <Button onClick={() => openUpdateModal(match)} variant="outline" size="sm" className="h-8 font-semibold border-primary/20">
                                Update Stage
                              </Button>
                            )}
                            {match.status === 'Placed' && (
                              <Button onClick={() => openCommissionModal(match)} size="sm" className="h-8 gradient-bg font-bold shadow-md gap-1">
                                <DollarSign size={14} /> Log Commission
                              </Button>
                            )}
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

        {/* TAB: COMMISSION */}
        <TabsContent value="commission" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="glass border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                <TrendingUp className="text-primary" size={24} /> Commission & Revenue Share Management
              </CardTitle>
              <CardDescription>Track placement fees and manage payout settlements with Talent Partners.</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueShares.length === 0 ? (
                <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                  <DollarSign size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="font-bold text-foreground text-lg">No commission records found.</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">Once a candidate is marked as Placed, use the Log Commission button in the Submission Tracker to generate a revenue share record.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-4 px-4">Candidate</th>
                        <th className="py-4 px-4">Client Company</th>
                        <th className="py-4 px-4">Total Fee</th>
                        <th className="py-4 px-4 font-bold text-primary">Partner Share</th>
                        <th className="py-4 px-4">Payment Status</th>
                        <th className="py-4 px-4 text-right">Actions</th>
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
                          <td className="py-4 px-4 text-right">
                            {rev.payment_status === 'Pending' ? (
                              <Button onClick={() => handleMarkPaid(rev.id)} size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md gap-1">
                                <CheckCircle2 size={14} /> Mark Paid
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground font-semibold">Paid on {new Date(rev.paid_at).toLocaleDateString()}</span>
                            )}
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

        {/* TAB: PARTNER CHAT */}
        <TabsContent value="chat" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="glass border-primary/20 shadow-sm flex flex-col h-[600px] overflow-hidden">
            <CardHeader className="border-b border-primary/10 pb-4 bg-secondary/20 shrink-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                  <MessageSquare className="text-primary" size={24} /> Partner Communication Center
                </CardTitle>
                <CardDescription>Direct messaging with Talent Partners for interview coordination.</CardDescription>
              </div>
              <Select value={selectedVendorForChat || ''} onValueChange={setSelectedVendorForChat}>
                <SelectTrigger className="w-[220px] bg-background font-semibold">
                  <SelectValue placeholder="Select Partner" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {!selectedVendorForChat ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageSquare size={48} className="mb-3 opacity-30" />
                  <p className="font-bold text-foreground">No partner selected.</p>
                  <p className="text-xs mt-1 max-w-sm">Select a Talent Partner from the dropdown above to view and send messages.</p>
                </div>
              ) : messages.filter(m => m.vendor_id === selectedVendorForChat).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageSquare size={48} className="mb-3 opacity-30" />
                  <p className="font-bold text-foreground">No messages yet.</p>
                  <p className="text-xs mt-1 max-w-sm">Start the conversation to coordinate interviews or ask clarifications about bench candidates.</p>
                </div>
              ) : (
                messages.filter(m => m.vendor_id === selectedVendorForChat).map(msg => (
                  <div key={msg.id} className={`flex flex-col max-w-lg ${msg.sender_role === 'admin' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-foreground">{msg.sender_name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{msg.sender_role}</span>
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                      msg.sender_role === 'admin' ? 'gradient-bg text-background rounded-br-none' : 'glass border border-primary/20 text-foreground rounded-bl-none'
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
            {selectedVendorForChat && (
              <div className="p-4 border-t border-primary/10 bg-background/50 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <Input 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    placeholder="Type a message to the Talent Partner..." 
                    className="flex-1 bg-background/80 h-12 rounded-xl border-primary/20"
                  />
                  <Button type="submit" className="gradient-bg h-12 px-6 rounded-xl font-bold shadow-md gap-2">
                    <Send size={16} /> Send
                  </Button>
                </form>
              </div>
            )}
          </Card>
        </TabsContent>

      </Tabs>

      {/* MODAL 1: MATCH CANDIDATE TO JOB */}
      <Dialog open={isMatchModalOpen} onOpenChange={setIsMatchModalOpen}>
        <DialogContent className="glass border-primary/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-bold flex items-center gap-2">
              <Sparkles className="text-primary" size={20} /> Propose Job Match
            </DialogTitle>
            <DialogDescription>Match {selectedCandidateForMatch?.name} to an open job requisition.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMatchCandidate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="m-job">Select Job Requisition *</Label>
              <Select value={matchForm.job_id} onValueChange={val => setMatchForm({...matchForm, job_id: val})}>
                <SelectTrigger className="bg-background/50 font-semibold"><SelectValue placeholder="Select Job" /></SelectTrigger>
                <SelectContent>
                  {jobs.map(j => (
                    <SelectItem key={j.id} value={j.id}>{j.title} ({j.employment_type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-perc">Match Percentage (%) *</Label>
              <Input id="m-perc" type="number" min="1" max="100" value={matchForm.match_percentage} onChange={e => setMatchForm({...matchForm, match_percentage: e.target.value})} required className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-sal">Salary / Rate Fit Evaluation</Label>
              <Input id="m-sal" value={matchForm.salary_fit} onChange={e => setMatchForm({...matchForm, salary_fit: e.target.value})} placeholder="Optimal Fit ($70/hr C2C)" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-loc">Location Fit Evaluation</Label>
              <Input id="m-loc" value={matchForm.location_fit} onChange={e => setMatchForm({...matchForm, location_fit: e.target.value})} placeholder="100% Remote Fit" className="bg-background/50" />
            </div>
            <Button type="submit" className="gradient-bg w-full font-bold shadow-md">
              Send to Partner Magic Screen for Approval
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: UPDATE MATCH STAGE */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="glass border-primary/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-bold flex items-center gap-2">
              <Briefcase className="text-primary" size={20} /> Update Submission Stage
            </DialogTitle>
            <DialogDescription>Update interview and placement status for {selectedMatchForUpdate?.vendor_candidates?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateMatchStage} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="u-status">Hiring Stage *</Label>
              <Select value={updateForm.status} onValueChange={val => setUpdateForm({...updateForm, status: val})}>
                <SelectTrigger className="bg-background/50 font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved / Submitted">Approved / Submitted</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Offered">Offered</SelectItem>
                  <SelectItem value="Placed">Placed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-sched">Interview Schedule / Info</Label>
              <Input id="u-sched" value={updateForm.interview_schedule} onChange={e => setUpdateForm({...updateForm, interview_schedule: e.target.value})} placeholder="Oct 20, 2024 at 2:00 PM EST (Zoom)" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-feed">Client Feedback</Label>
              <Textarea id="u-feed" value={updateForm.interview_feedback} onChange={e => setUpdateForm({...updateForm, interview_feedback: e.target.value})} placeholder="Strong technical skills, moving to final round..." className="bg-background/50 min-h-[80px]" />
            </div>
            {updateForm.status === 'Offered' && (
              <div className="space-y-2 animate-in fade-in-50">
                <Label htmlFor="u-sal">Offered Salary / Rate</Label>
                <Input id="u-sal" value={updateForm.offered_salary} onChange={e => setUpdateForm({...updateForm, offered_salary: e.target.value})} placeholder="$140,000 / $70/hr" className="bg-background/50" />
              </div>
            )}
            {updateForm.status === 'Placed' && (
              <div className="space-y-2 animate-in fade-in-50">
                <Label htmlFor="u-join">Confirmed Joining Date</Label>
                <Input id="u-join" value={updateForm.joining_date} onChange={e => setUpdateForm({...updateForm, joining_date: e.target.value})} placeholder="Nov 01, 2024" className="bg-background/50" />
              </div>
            )}
            <Button type="submit" className="gradient-bg w-full font-bold shadow-md">
              Save Stage Updates
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: LOG COMMISSION */}
      <Dialog open={isCommissionModalOpen} onOpenChange={setIsCommissionModalOpen}>
        <DialogContent className="glass border-primary/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-bold flex items-center gap-2">
              <DollarSign className="text-primary" size={20} /> Log Placement Commission
            </DialogTitle>
            <DialogDescription>Generate revenue share settlement for {selectedMatchForCommission?.vendor_candidates?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCommission} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="c-fee">Total Placement Fee ($) *</Label>
              <Input id="c-fee" type="number" value={commissionForm.placement_fee} onChange={e => setCommissionForm({...commissionForm, placement_fee: e.target.value})} required className="bg-background/50 font-bold text-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-share">Partner Commission Share ($) *</Label>
              <Input id="c-share" type="number" value={commissionForm.partner_share} onChange={e => setCommissionForm({...commissionForm, partner_share: e.target.value})} required className="bg-background/50 font-bold text-lg text-primary" />
              <p className="text-[10px] text-muted-foreground mt-1">Standard C2C partner revenue share is typically 80% of billing margin.</p>
            </div>
            <Button type="submit" className="gradient-bg w-full font-bold shadow-md">
              Generate Revenue Share Record
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
