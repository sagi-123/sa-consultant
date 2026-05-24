import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/types/database.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Star, 
  LayoutDashboard, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  ShieldCheck, 
  LogOut,
  Settings,
  Mail,
  Phone,
  MapPin,
  Save,
  RefreshCw,
  Search,
  Briefcase,
  Plus,
  ExternalLink,
  Smartphone,
  Edit,
  Globe,
  Instagram,
  Linkedin,
  Upload,
  CalendarDays,
  Clock,
  X,
  Building2,
  DollarSign,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CandidateProfileDialog } from '@/components/CandidateProfileDialog';
import { AdminPartnerCRM } from '@/components/AdminPartnerCRM';
import { AdminMasterBrain } from '@/components/AdminMasterBrain';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Inquiry = Database['public']['Tables']['inquiries']['Row'];
type Candidate = Database['public']['Tables']['candidates']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type JobOpening = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  job_type: string | null;
  salary_range: string | null;
  description: string | null;
  requirements: string | null;
  status: string | null;
  created_at: string;
};

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    whatsapp_number: '',
    linkedin_url: '',
    instagram_url: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Portfolio State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditingProject, setIsEditingProject] = useState<string | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    category: '',
    description: '',
    type: 'web' as 'web' | 'mobile' | 'other',
    live_url: '',
    apk_url: '',
    image_url: '',
    color: 'from-[hsl(220,90%,56%)] to-[hsl(270,70%,60%)]'
  });

  // Careers State
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [isEditingJob, setIsEditingJob] = useState<string | null>(null); // null = closed, 'new' = new form, id = editing
  const [savingJob, setSavingJob] = useState(false);
  const blankJobForm = { title: '', department: '', location: '', job_type: 'Full-time', salary_range: '', description: '', requirements: '', status: 'Active' };
  const [jobForm, setJobForm] = useState(blankJobForm);

  const fetchAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [usersResponse, reviewsResponse, projectsResponse, inquiriesResponse, candidatesResponse, appointmentsResponse, jobsResponse] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('candidates').select('*').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*').order('created_at', { ascending: false }),
        supabase.from('job_openings').select('*').order('created_at', { ascending: false }),
      ]);

      if (usersResponse.error) throw usersResponse.error;
      if (reviewsResponse.error) throw reviewsResponse.error;
      if (projectsResponse.error) throw projectsResponse.error;
      if (inquiriesResponse.error) throw inquiriesResponse.error;
      if (candidatesResponse.error && candidatesResponse.error.code !== '42P01') throw candidatesResponse.error;
      if (appointmentsResponse.error && appointmentsResponse.error.code !== '42P01') throw appointmentsResponse.error;

      setUsers(usersResponse.data || []);
      setReviews(reviewsResponse.data || []);
      setProjects(projectsResponse.data || []);
      setInquiries(inquiriesResponse.data || []);
      setCandidates(candidatesResponse.data || []);
      setAppointments(appointmentsResponse.data || []);
      setJobs((jobsResponse.data as JobOpening[]) || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: error.message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      
      const settingsMap = data.reduce((acc: any, item: any) => {
        acc[item.id] = item.value;
        return acc;
      }, {});
      
      setSettings({
        contact_email: settingsMap.contact_email || '',
        contact_phone: settingsMap.contact_phone || '',
        contact_address: settingsMap.contact_address || '',
        whatsapp_number: settingsMap.whatsapp_number || '',
        linkedin_url: settingsMap.linkedin_url || '',
        instagram_url: settingsMap.instagram_url || ''
      });
    } catch (error: any) {
      console.error('Error fetching settings:', error);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    fetchSettings();
  }, [fetchAllData, fetchSettings]);

  // Auto-mark all 'new' inquiries as 'read' when Messages tab is opened
  const markInquiriesAsRead = useCallback(async () => {
    const unread = inquiries.filter(i => i.status === 'new');
    if (unread.length === 0) return;
    const ids = unread.map(i => i.id);
    await supabase.from('inquiries').update({ status: 'read' } as any).in('id', ids);
    setInquiries(prev => prev.map(i => i.status === 'new' ? { ...i, status: 'read' } : i));
  }, [inquiries]);

  const markCandidatesAsScreened = useCallback(async () => {
    const newOnes = candidates.filter(c => c.status === 'New');
    if (newOnes.length === 0) return;
    const ids = newOnes.map(c => c.id);
    await supabase.from('candidates').update({ status: 'Screened' } as any).in('id', ids);
    setCandidates(prev => prev.map(c => c.status === 'New' ? { ...c, status: 'Screened' as any } : c));
  }, [candidates]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'inquiries') {
      markInquiriesAsRead();
    }
    if (tab === 'candidates') {
      markCandidatesAsScreened();
    }
  };

  const handleUpdateReviewStatus = async (id: string, status: 'approved' | 'pending') => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status } as any)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: `Review ${status === 'approved' ? 'Approved' : 'Moved back to Pending'}`,
        description: "The changes have been saved to the database.",
      });
      fetchAllData(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating review",
        description: error.message,
      });
    }
  };

  const handleUpdateCandidateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status } as any)
        .eq('id', id);

      if (error) throw error;

      // Update local state immediately
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: status as any } : c));
      if (selectedCandidate && selectedCandidate.id === id) {
        setSelectedCandidate({ ...selectedCandidate, status: status as any });
      }

      toast({
        title: "Status Updated",
        description: `Candidate moved to ${status}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message,
      });
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: "Review Deleted",
        description: "The item was removed from the database.",
      });
      fetchAllData(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting review",
        description: error.message,
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This will remove their profile and all their reviews.')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: "User Deleted",
        description: "The user profile has been removed.",
      });
      fetchAllData(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting user",
        description: error.message,
      });
    }
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole } as any)
        .eq('id', id);
      if (error) throw error;
      toast({
        title: "Role Updated",
        description: `User is now a ${newRole}.`,
      });
      fetchAllData(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating role",
        description: error.message,
      });
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const updates = Object.entries(settings).map(([id, value]) => ({
        id,
        value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .update(update as any)
          .eq('id', update.id);
        if (error) throw error;
      }

      toast({
        title: "Settings Saved",
        description: "Website contact information has been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: error.message,
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('projects')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      setProjectForm({ ...projectForm, image_url: publicUrl });
      toast({
        title: "Image Uploaded",
        description: "The image has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message + " (Make sure a public bucket named 'projects' exists in Supabase)",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      if (isEditingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectForm as any)
          .eq('id', isEditingProject);
        if (error) throw error;
        toast({ title: "Project Updated", description: "The project has been modified successfully." });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectForm] as any);
        if (error) throw error;
        toast({ title: "Project Added", description: "The new project is now live in your portfolio." });
      }
      setProjectForm({
        title: '',
        category: '',
        description: '',
        type: 'web',
        live_url: '',
        apk_url: '',
        image_url: '',
        color: 'from-[hsl(220,90%,56%)] to-[hsl(270,70%,60%)]'
      });
      setIsEditingProject(null);
      fetchAllData(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error saving project", description: error.message });
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Project Deleted", description: "The project has been removed." });
      fetchAllData(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error deleting project", description: error.message });
    }
  };

  const handleEditProject = (project: Project) => {
    setProjectForm({
      title: project.title,
      category: project.category,
      description: project.description || '',
      type: project.type,
      live_url: project.live_url || '',
      apk_url: project.apk_url || '',
      image_url: project.image_url || '',
      color: project.color || 'from-[hsl(220,90%,56%)] to-[hsl(270,70%,60%)]'
    });
    setIsEditingProject(project.id);
    document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const { error } = await supabase.from('inquiries').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Message Deleted", description: "The inquiry has been removed." });
      fetchAllData(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error deleting message", description: error.message });
    }
  };

  // ── Careers / Job Openings CRUD ──────────────────────────────────────
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJob(true);
    try {
      if (isEditingJob && isEditingJob !== 'new') {
        const { error } = await supabase.from('job_openings').update(jobForm as any).eq('id', isEditingJob);
        if (error) throw error;
        toast({ title: "Job Updated", description: "The job posting has been updated." });
      } else {
        const { error } = await supabase.from('job_openings').insert([jobForm as any]);
        if (error) throw error;
        toast({ title: "Job Posted!", description: `"${jobForm.title}" is now live.` });
      }
      setIsEditingJob(null);
      setJobForm(blankJobForm);
      fetchAllData(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error saving job", description: error.message });
    } finally {
      setSavingJob(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Delete this job posting?')) return;
    try {
      const { error } = await supabase.from('job_openings').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Job Deleted" });
      fetchAllData(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleEditJob = (job: JobOpening) => {
    setJobForm({
      title: job.title,
      department: job.department || '',
      location: job.location || '',
      job_type: job.job_type || 'Full-time',
      salary_range: job.salary_range || '',
      description: job.description || '',
      requirements: job.requirements || '',
      status: job.status || 'Active',
    });
    setIsEditingJob(job.id);
  };

  const handleToggleJobStatus = async (job: JobOpening) => {
    const newStatus = job.status === 'Active' ? 'Closed' : 'Active';
    try {
      const { error } = await supabase.from('job_openings').update({ status: newStatus } as any).eq('id', job.id);
      if (error) throw error;
      toast({ title: `Job ${newStatus === 'Active' ? 'Activated' : 'Closed'}` });
      fetchAllData(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const getEmailMailtoUrl = (app: Appointment) => {
    if (!app.client_email) return '#';
    const subject = encodeURIComponent(`Appointment Confirmed - SA Consultant & Staffing`);
    const body = encodeURIComponent(
`Hi ${app.client_name},

We are happy to confirm your appointment with SA Consultant & Staffing.

📅 Confirmed Slot:
${app.selected_slot}

Our consultant will connect with you at the scheduled time. Please ensure you are available and have a stable internet connection.

If you have any questions or need to reschedule, please reply directly to this email.

Warm regards,
SA Consultant & Staffing Team`
    );
    return `mailto:${app.client_email}?subject=${subject}&body=${body}`;
  };

  const handleConfirmAppointmentSlot = async (id: string, slotText: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed', selected_slot: slotText } as any)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Appointment Confirmed",
        description: `Successfully confirmed slot: ${slotText}`
      });
      fetchAllData(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error confirming appointment",
        description: error.message
      });
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled', selected_slot: null } as any)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Appointment Cancelled",
        description: "The meeting slot request has been set to cancelled."
      });
      fetchAllData(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error cancelling appointment",
        description: error.message
      });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment booking permanently?')) return;
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Appointment Deleted",
        description: "The appointment has been removed from the database."
      });
      fetchAllData(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting appointment",
        description: error.message
      });
    }
  };

  const handleMarkAllAsRead = useCallback(async () => {
    const newInquiries = inquiries.filter(i => i.status === 'new');
    if (newInquiries.length === 0) return;

    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: 'read' } as any)
        .eq('status', 'new');

      if (error) throw error;

      // Update local state to reflect changes immediately
      setInquiries(prev => prev.map(inq => 
        inq.status === 'new' ? { ...inq, status: 'read' as any } : inq
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [inquiries]);

  useEffect(() => {
    if (activeTab === 'inquiries') {
      handleMarkAllAsRead();
    }
  }, [activeTab, handleMarkAllAsRead]);

  const exportInquiriesToCSV = () => {
    if (inquiries.length === 0) return;
    
    const headers = ['Date', 'Name', 'Email', 'Phone', 'Message'];
    const rows = inquiries.map(inq => [
      new Date(inq.created_at).toLocaleString(),
      inq.name,
      inq.email,
      inq.phone,
      `"${inq.message.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `sa_elevate_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = [
    { label: 'Total Applicants', value: candidates.length, icon: Users, color: 'text-purple-500' },
    { label: 'New Apps', value: candidates.filter(c => c.status === 'New').length, icon: Briefcase, color: 'text-blue-500' },
    { label: 'Total Bookings', value: appointments.length, icon: CalendarDays, color: 'text-orange-500' },
    { label: 'New Messages', value: inquiries.filter(i => i.status === 'new').length, icon: Mail, color: 'text-green-500' },
  ];

  const filteredReviews = reviews.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = reviews.filter((r: any) => r.status === 'pending').length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-display font-bold gradient-text flex items-center gap-2">
            <LayoutDashboard size={20} /> Admin Panel
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
             <Button variant="ghost" onClick={() => fetchAllData(true)} disabled={refreshing} size="icon" className="h-9 w-9">
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} className="hidden sm:flex gap-2">
              <LayoutDashboard size={18} /> Home
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2 h-9">
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="glass-strong flex overflow-x-auto w-full h-auto p-1.5 sticky top-20 z-40 backdrop-blur-xl border border-primary/20 touch-pan-x gap-1 sm:gap-2 justify-start items-center no-scrollbar">
            <TabsTrigger value="overview" className="data-[state=active]:gradient-bg h-10 px-4 min-w-[120px] flex-shrink-0">Overview</TabsTrigger>
            <TabsTrigger value="candidates" className="data-[state=active]:gradient-bg h-10 px-4 min-w-[120px] flex-shrink-0 flex gap-2 items-center justify-center relative">
              <Users size={16} /> Candidates
              {candidates.filter(c => c.status === 'New').length > 0 && (
                <span className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-background">
                  {candidates.filter(c => c.status === 'New').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="data-[state=active]:gradient-bg h-10 px-4 min-w-[120px] flex-shrink-0 flex gap-2 items-center justify-center relative">
              <Mail size={16} /> Messages
              {inquiries.filter(i => i.status === 'new').length > 0 && (
                <span className="absolute top-1 right-1 bg-green-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-background">
                  {inquiries.filter(i => i.status === 'new').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:gradient-bg h-10 px-4 min-w-[120px] flex-shrink-0 flex gap-2 items-center justify-center">
              <Briefcase size={16} /> Portfolio
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:gradient-bg h-10 px-4 min-w-[120px] flex-shrink-0 relative">
              Reviews
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-background">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="partners" className="data-[state=active]:gradient-bg h-10 px-4 min-w-[120px] flex-shrink-0 flex gap-2 items-center justify-center font-bold text-primary">
              🧠 Master CRM (The Brain)
            </TabsTrigger>
            <TabsTrigger value="careers" className="data-[state=active]:gradient-bg h-10 px-4 min-w-[120px] flex-shrink-0 flex gap-2 items-center justify-center font-bold text-accent">
              💼 Careers / Jobs
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:gradient-bg h-10 px-4 min-w-[120px] flex-shrink-0 flex gap-2 items-center justify-center relative font-bold text-orange-500">
              📅 Appointment Booking
              {appointments.filter(a => a.status === 'pending').length > 0 && (
                <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-background">
                  {appointments.filter(a => a.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:gradient-bg h-10 px-4 min-w-[120px] flex-shrink-0">Site Settings</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:gradient-bg h-10 px-4 min-w-[120px] flex-shrink-0">User Control</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
             {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <Card key={i} className="glass">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <stat.icon className={stat.color} size={18} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-display font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="glass mt-8 border-primary/20">
              <CardHeader>
                <CardTitle className="gradient-text font-bold">Welcome back, Admin</CardTitle>
                <CardDescription>Everything is running smoothly. There are {candidates.filter(c => c.status === 'New').length} new candidate applications, {appointments.filter(a => a.status === 'pending').length} pending appointment bookings, and {inquiries.filter(i => i.status === 'new').length} new messages.</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4 flex-wrap">
                <Button onClick={() => setActiveTab('candidates')} className="gradient-bg border-none">
                   Review Candidates
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('appointments')} className="gap-2">
                   <CalendarDays size={16} /> Manage Appointment Booking
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('inquiries')}>
                   Update Contact Info
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates">
            <Card className="glass">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="font-display font-bold text-2xl flex items-center gap-2">
                     <Users size={24} className="text-primary" /> Candidate ATS
                  </CardTitle>
                  <CardDescription>Manage incoming applications and track candidates through your hiring pipeline.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                   <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                   <Input 
                      placeholder="Search candidates or skills..." 
                      className="pl-10 h-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {searchTerm ? "No matching candidates found." : "No candidates applied yet."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        candidates.filter(c => 
                          (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.job_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          JSON.stringify(c.skills || []).toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((candidate) => (
                          <TableRow key={candidate.id} className="hover:bg-primary/5 transition-colors cursor-pointer">
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{candidate.name}</span>
                                <span className="text-xs text-muted-foreground">{candidate.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>{candidate.job_title || 'N/A'}</TableCell>
                            <TableCell>{candidate.experience_years || 'N/A'}</TableCell>
                            <TableCell>{candidate.location || 'N/A'}</TableCell>
                            <TableCell>
                              <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold ${
                                candidate.status === 'New' ? 'bg-blue-500/10 text-blue-500' : 
                                candidate.status === 'Screened' ? 'bg-yellow-500/10 text-yellow-500' :
                                candidate.status === 'Interview' ? 'bg-purple-500/10 text-purple-500' :
                                candidate.status === 'Offer' ? 'bg-green-500/10 text-green-500' :
                                'bg-red-500/10 text-red-500'
                              }`}>
                                {candidate.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="outline" size="sm" className="h-8" onClick={() => {
                                setSelectedCandidate(candidate);
                                if (candidate.status === 'New') {
                                  handleUpdateCandidateStatus(candidate.id, 'Screened');
                                }
                              }}>
                                View Profile
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card className="glass">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="font-display font-bold text-2xl flex items-center gap-2">
                     <Mail size={24} className="text-primary" /> Client Inquiries
                  </CardTitle>
                  <CardDescription>Messages from the "Let's Connect" form.</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                   <Button variant="outline" onClick={exportInquiriesToCSV} className="gap-2 shrink-0">
                     <ExternalLink size={16} /> Export for Excel
                   </Button>
                   <div className="relative w-full sm:w-64">
                      <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                      <Input 
                         placeholder="Search messages..." 
                         className="pl-10 h-9"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No inquiries yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        inquiries.filter(i => 
                          i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.email.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((inquiry) => (
                          <TableRow key={inquiry.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(inquiry.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">
                              {inquiry.message?.startsWith('[PARTNER/VENDOR SUBMISSION]') ? (
                                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">Vendor</span>
                              ) : inquiry.message?.startsWith('[JOB APPLICATION]') ? (
                                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">Job App</span>
                              ) : null}
                              <div>{inquiry.name}</div>
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1"><Mail size={12} className="text-primary" /> {inquiry.email}</span>
                                <span className="flex items-center gap-1"><Phone size={12} className="text-accent" /> {inquiry.phone}</span>
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[260px] text-sm">
                              {inquiry.message?.startsWith('[PARTNER/VENDOR SUBMISSION]') ? (() => {
                                const lines = inquiry.message.split('\n').filter(Boolean);
                                const get = (key: string) => lines.find(l => l.startsWith(key))?.replace(key, '').trim() ?? '';
                                const resumeUrl = get('Resume URL:') || get('Resume Link:');
                                return (
                                  <div className="space-y-1.5">
                                    <div className="text-xs text-muted-foreground"><span className="font-bold text-foreground">Company:</span> {get('Vendor Company:')}</div>
                                    <div className="text-xs text-muted-foreground"><span className="font-bold text-foreground">Candidate:</span> {get('Candidate Name:')}</div>
                                    <div className="text-xs text-muted-foreground"><span className="font-bold text-foreground">Email:</span> {get('Candidate Email:')}</div>
                                    <div className="text-xs text-muted-foreground"><span className="font-bold text-foreground">Phone:</span> {get('Candidate Phone:')}</div>
                                    {resumeUrl && (
                                      <a href={resumeUrl} target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-accent hover:bg-accent/80 px-3 py-1.5 rounded-lg transition-colors mt-1">
                                        📄 View / Download Resume
                                      </a>
                                    )}
                                  </div>
                                );
                              })() : inquiry.message?.startsWith('[JOB APPLICATION]') ? (() => {
                                const lines = inquiry.message.split('\n').filter(Boolean);
                                const get = (key: string) => lines.find(l => l.startsWith(key))?.replace(key, '').trim() ?? '';
                                const resumeUrl = get('Resume Link:');
                                
                                // Extract Cover Letter safely
                                const clHeader = 'Cover Letter:';
                                const coverLineIndex = lines.findIndex(l => l.startsWith(clHeader));
                                let coverLetterText = '';
                                if (coverLineIndex !== -1) {
                                  const rawText = lines[coverLineIndex].replace(clHeader, '').trim();
                                  // If there are lines below that aren't "Resume Link:", they could be part of the cover letter
                                  const textAfter = [];
                                  if (rawText) textAfter.push(rawText);
                                  for (let i = coverLineIndex + 1; i < lines.length; i++) {
                                    if (lines[i].startsWith('Resume Link:')) break;
                                    textAfter.push(lines[i]);
                                  }
                                  coverLetterText = textAfter.join('\n');
                                }

                                return (
                                  <div className="space-y-1.5">
                                    <div className="text-xs text-muted-foreground"><span className="font-bold text-foreground">Position:</span> {get('Applied Position:')} ({get('Department:')})</div>
                                    <div className="text-xs text-muted-foreground"><span className="font-bold text-foreground">Candidate:</span> {get('Candidate Name:')}</div>
                                    <div className="text-xs text-muted-foreground"><span className="font-bold text-foreground">Email:</span> {get('Candidate Email:')}</div>
                                    <div className="text-xs text-muted-foreground"><span className="font-bold text-foreground">Phone:</span> {get('Candidate Phone:')}</div>
                                    {coverLetterText && (
                                      <div className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded-lg mt-1 italic whitespace-pre-line border border-border/20">
                                        "{coverLetterText}"
                                      </div>
                                    )}
                                    {resumeUrl && resumeUrl !== 'No resume uploaded yet.' && (
                                      <a href={resumeUrl} target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors mt-1">
                                        📄 View / Download Resume
                                      </a>
                                    )}
                                  </div>
                                );
                              })() : (
                                <span className="italic text-muted-foreground">"{inquiry.message}"</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                                onClick={() => handleDeleteInquiry(inquiry.id)}
                                title="Delete Message"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {inquiries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No inquiries yet.</div>
                  ) : (
                    inquiries.filter(i => 
                      i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      i.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      i.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((inquiry) => (
                      <div key={inquiry.id} className={`glass rounded-xl p-5 border space-y-4 ${
                        inquiry.message?.startsWith('[PARTNER/VENDOR SUBMISSION]') 
                          ? 'border-accent/30 bg-accent/5' 
                          : inquiry.message?.startsWith('[JOB APPLICATION]')
                            ? 'border-blue-500/30 bg-blue-500/5'
                            : 'border-primary/10'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            {inquiry.message?.startsWith('[PARTNER/VENDOR SUBMISSION]') ? (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 mb-2 inline-block">Partner/Vendor Submission</span>
                            ) : inquiry.message?.startsWith('[JOB APPLICATION]') ? (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30 mb-2 inline-block">Job Application</span>
                            ) : null}
                            <h4 className="font-bold text-lg text-foreground">{inquiry.name}</h4>
                            <p className="text-xs text-muted-foreground">{new Date(inquiry.created_at).toLocaleString()}</p>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-9 w-9 text-red-500 bg-red-500/10"
                            onClick={() => handleDeleteInquiry(inquiry.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail size={14} className="text-primary" /> {inquiry.email}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone size={14} className="text-accent" /> {inquiry.phone}
                          </div>
                        </div>

                        {inquiry.message?.startsWith('[PARTNER/VENDOR SUBMISSION]') ? (() => {
                          const lines = inquiry.message.split('\n').filter(Boolean);
                          const get = (key: string) => lines.find(l => l.startsWith(key))?.replace(key, '').trim() ?? '';
                          const resumeUrl = get('Resume Link:');
                          return (
                            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 space-y-2">
                              <p className="text-xs font-black text-accent uppercase tracking-wider mb-3">Candidate Details</p>
                              <div className="text-sm"><span className="font-bold">Company:</span> {get('Vendor Company:')}</div>
                              <div className="text-sm"><span className="font-bold">Candidate:</span> {get('Candidate Name:')}</div>
                              <div className="text-sm"><span className="font-bold">Email:</span> {get('Candidate Email:')}</div>
                              <div className="text-sm"><span className="font-bold">Phone:</span> {get('Candidate Phone:')}</div>
                              {resumeUrl && (
                                <a href={resumeUrl} target="_blank" rel="noreferrer"
                                  className="mt-3 flex items-center gap-2 text-sm font-bold text-white bg-accent hover:bg-accent/80 px-4 py-2 rounded-lg transition-colors w-fit">
                                  📄 View / Download Resume
                                </a>
                              )}
                            </div>
                          );
                        })() : inquiry.message?.startsWith('[JOB APPLICATION]') ? (() => {
                          const lines = inquiry.message.split('\n').filter(Boolean);
                          const get = (key: string) => lines.find(l => l.startsWith(key))?.replace(key, '').trim() ?? '';
                          const resumeUrl = get('Resume Link:');
                          
                          // Extract Cover Letter safely
                          const clHeader = 'Cover Letter:';
                          const coverLineIndex = lines.findIndex(l => l.startsWith(clHeader));
                          let coverLetterText = '';
                          if (coverLineIndex !== -1) {
                            const rawText = lines[coverLineIndex].replace(clHeader, '').trim();
                            const textAfter = [];
                            if (rawText) textAfter.push(rawText);
                            for (let i = coverLineIndex + 1; i < lines.length; i++) {
                              if (lines[i].startsWith('Resume Link:')) break;
                              textAfter.push(lines[i]);
                            }
                            coverLetterText = textAfter.join('\n');
                          }

                          return (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
                              <p className="text-xs font-black text-blue-500 uppercase tracking-wider mb-3">Application Details</p>
                              <div className="text-sm"><span className="font-bold">Position:</span> {get('Applied Position:')} ({get('Department:')})</div>
                              <div className="text-sm"><span className="font-bold">Candidate:</span> {get('Candidate Name:')}</div>
                              <div className="text-sm"><span className="font-bold">Email:</span> {get('Candidate Email:')}</div>
                              <div className="text-sm"><span className="font-bold">Phone:</span> {get('Candidate Phone:')}</div>
                              {coverLetterText && (
                                <div className="text-xs text-muted-foreground bg-secondary/30 p-2.5 rounded-lg mt-2 italic whitespace-pre-line border border-border/20">
                                  "{coverLetterText}"
                                </div>
                              )}
                              {resumeUrl && resumeUrl !== 'No resume uploaded yet.' && (
                                <a href={resumeUrl} target="_blank" rel="noreferrer"
                                  className="mt-3 flex items-center gap-2 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors w-fit">
                                  📄 View / Download Resume
                                </a>
                              )}
                            </div>
                          );
                        })() : (
                          <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                            <p className="text-sm italic text-foreground leading-relaxed">
                              "{inquiry.message}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="font-display font-bold text-2xl flex items-center gap-2">
                  <Settings size={24} className="text-primary" /> Website Settings
                </CardTitle>
                <CardDescription>Update your contact information, address, and WhatsApp link.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail size={14} /> Contact Email</Label>
                    <Input 
                      value={settings.contact_email}
                      onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                      placeholder="email@example.com"
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone size={14} /> Contact Phone Numbers</Label>
                    <Input 
                      value={settings.contact_phone}
                      onChange={(e) => setSettings({...settings, contact_phone: e.target.value})}
                      placeholder="+1 (609) 313-9192, 9384797751"
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MapPin size={14} /> Address</Label>
                    <Input 
                      value={settings.contact_address}
                      onChange={(e) => setSettings({...settings, contact_address: e.target.value})}
                      placeholder="New Jersey, USA"
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MessageSquare size={14} /> WhatsApp Number</Label>
                    <Input 
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({...settings, whatsapp_number: e.target.value})}
                      placeholder="9384797751"
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Linkedin size={14} /> LinkedIn URL</Label>
                    <Input 
                      value={settings.linkedin_url || ''}
                      onChange={(e) => setSettings({...settings, linkedin_url: e.target.value})}
                      placeholder="https://linkedin.com/in/your-profile"
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Instagram size={14} /> Instagram URL</Label>
                    <Input 
                      value={settings.instagram_url || ''}
                      onChange={(e) => setSettings({...settings, instagram_url: e.target.value})}
                      placeholder="https://instagram.com/your-profile"
                      className="bg-secondary/50"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/50 pt-6">
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={savingSettings}
                  className="gradient-bg border-none gap-2 ml-auto"
                >
                  {savingSettings ? "Saving..." : <><Save size={18} /> Save Website Changes</>}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="glass">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="font-display font-bold text-2xl flex items-center gap-2">
                     <Star size={24} className="text-accent" /> Review Moderation
                  </CardTitle>
                  <CardDescription>Approve or delete client stories to be displayed on the website.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                   <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                   <Input 
                      placeholder="Search messages..." 
                      className="pl-10 h-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {searchTerm ? "No matching reviews found." : "No reviews found."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell className="font-medium">{review.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {review.rating} <Star size={14} className="fill-accent text-accent" />
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{review.message}</TableCell>
                            <TableCell>
                              <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold ${
                                review.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                {review.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {review.status === 'pending' ? (
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  className="h-8 w-8 bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/50"
                                  onClick={() => handleUpdateReviewStatus(review.id, 'approved')}
                                  title="Approve"
                                >
                                  <CheckCircle size={14} />
                                </Button>
                              ) : (
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  className="h-8 w-8 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
                                  onClick={() => handleUpdateReviewStatus(review.id, 'pending')}
                                  title="Hide"
                                >
                                  <XCircle size={14} />
                                </Button>
                              )}
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-8 w-8 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/50"
                                onClick={() => handleDeleteReview(review.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Project Form */}
              <Card className="glass lg:col-span-1 h-fit md:sticky md:top-32" id="project-form">
                <CardHeader>
                  <CardTitle className="font-display font-bold text-2xl flex items-center gap-2 text-primary">
                    {isEditingProject ? <Edit size={24} /> : <Plus size={24} />}
                    {isEditingProject ? 'Edit Project' : 'Add New Project'}
                  </CardTitle>
                  <CardDescription>
                    Fill in the details for your portfolio item.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSaveProject}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Project Title</Label>
                      <Input 
                        required
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                        placeholder="e.g. Silk Osai Boutique"
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input 
                        required
                        value={projectForm.category}
                        onChange={(e) => setProjectForm({...projectForm, category: e.target.value})}
                        placeholder="e.g. E-Commerce"
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <select 
                        className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={projectForm.type}
                        onChange={(e) => setProjectForm({...projectForm, type: e.target.value as any})}
                      >
                        <option value="web">Web Application</option>
                        <option value="mobile">Mobile Application</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Live URL (Optional)</Label>
                      <Input 
                        value={projectForm.live_url}
                        onChange={(e) => setProjectForm({...projectForm, live_url: e.target.value})}
                        placeholder="https://..."
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>APK Link (Optional)</Label>
                      <Input 
                        value={projectForm.apk_url}
                        onChange={(e) => setProjectForm({...projectForm, apk_url: e.target.value})}
                        placeholder="Download link for mobile app"
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL (Optional)</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={projectForm.image_url}
                          onChange={(e) => setProjectForm({...projectForm, image_url: e.target.value})}
                          placeholder="https://.../image.png"
                          className="bg-secondary/50 flex-1"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                            onChange={handleFileUpload}
                            disabled={uploading}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            disabled={uploading}
                            onClick={() => document.getElementById('image-upload')?.click()}
                            title="Upload from computer"
                          >
                            <Upload size={18} className={uploading ? "animate-bounce" : ""} />
                          </Button>
                        </div>
                      </div>
                      {projectForm.image_url && (
                        <div className="mt-2 relative rounded-lg overflow-hidden h-32 border border-border">
                          <img src={projectForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setProjectForm({...projectForm, image_url: ''})}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <textarea 
                        className="w-full min-h-[100px] rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                        placeholder="Short project overview..."
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    {isEditingProject && (
                      <Button variant="outline" type="button" onClick={() => {
                        setIsEditingProject(null);
                        setProjectForm({ title: '', category: '', description: '', type: 'web', live_url: '', apk_url: '', image_url: '', color: 'from-[hsl(220,90%,56%)] to-[hsl(270,70%,60%)]' });
                      }}>Cancel</Button>
                    )}
                    <Button type="submit" disabled={savingProject} className="flex-1 gradient-bg border-none gap-2">
                      {savingProject ? 'Saving...' : <><Save size={18} /> {isEditingProject ? 'Update Project' : 'Create Project'}</>}
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Project List */}
              <Card className="glass lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-display font-bold text-2xl flex items-center gap-2">
                    <Briefcase size={24} className="text-primary" /> Portfolio Items
                  </CardTitle>
                  <CardDescription>Manage your showcased works.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Links</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No projects added yet. Use the form to create your first portfolio item.
                            </TableCell>
                          </TableRow>
                        ) : (
                          projects.map((project) => (
                            <TableRow key={project.id}>
                              <TableCell className="font-medium text-foreground">{project.title}</TableCell>
                              <TableCell className="text-muted-foreground">{project.category}</TableCell>
                              <TableCell>
                                <span className="flex items-center gap-1 text-xs text-primary font-bold">
                                  {project.type === 'web' ? <Globe size={12} /> : <Smartphone size={12} />}
                                  {project.type.toUpperCase()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {project.live_url && <a href={project.live_url} target="_blank" rel="noreferrer" title="View Live"><ExternalLink size={16} className="text-primary hover:scale-110 transition-transform" /></a>}
                                  {project.apk_url && <a href={project.apk_url} target="_blank" rel="noreferrer" title="Download APK"><Smartphone size={16} className="text-accent hover:scale-110 transition-transform" /></a>}
                                </div>
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 text-primary hover:bg-primary/10"
                                  onClick={() => handleEditProject(project)}
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                                  onClick={() => handleDeleteProject(project.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <Card className="glass">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="font-display font-bold text-2xl flex items-center gap-2">
                    <Users size={24} className="text-blue-500" /> Registered Users
                  </CardTitle>
                  <CardDescription>A list of all users registered on the platform.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                   <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                   <Input 
                      placeholder="Search users..." 
                      className="pl-10 h-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {searchTerm ? "No matching users found." : "No users found."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name || 'Anonymous'}</TableCell>
                            <TableCell className="text-xs">{user.email}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-tight ${
                                user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                              }`}>
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-[10px]">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                               {user.id !== profile?.id && (
                                <>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => handleToggleRole(user.id, user.role || 'user')}
                                    title="Toggle Role"
                                  >
                                    <ShieldCheck size={14} />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                    onClick={() => handleDeleteUser(user.id)}
                                    title="Delete User"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="glass animate-in fade-in-50 duration-500">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="font-display font-bold text-2xl flex items-center gap-2">
                     <CalendarDays size={24} className="text-orange-500" /> Client Appointment Booking
                  </CardTitle>
                  <CardDescription>Review meeting slot requests from clients, select a slot to confirm, or manage bookings.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                   <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                   <Input 
                      placeholder="Search bookings..." 
                      className="pl-10 h-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
              </CardHeader>
              <CardContent>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Client Contact</TableHead>
                        <TableHead>Proposed Slots (Click one to Confirm)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No appointment bookings requested yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        appointments.filter(a => 
                          (a.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (a.client_email || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (a.client_phone || '').toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(app.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold">{app.client_name}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail size={12} /> {app.client_email}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone size={12} /> {app.client_phone}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2 max-w-sm">
                                {[app.slot_1, app.slot_2, app.slot_3].filter(s => s && s !== "N/A").map((slot, index) => {
                                  const isSelected = app.selected_slot === slot;
                                  const isConfirmed = app.status === 'confirmed';
                                  
                                  return (
                                    <button
                                      key={index}
                                      disabled={isConfirmed}
                                      onClick={() => handleConfirmAppointmentSlot(app.id, slot)}
                                      className={`flex items-center gap-2 text-left text-xs p-2 rounded-lg border transition-all ${
                                        isSelected
                                          ? "bg-green-500/10 border-green-500 text-green-500 font-bold shadow-sm"
                                          : isConfirmed
                                            ? "bg-muted/40 border-border text-muted-foreground opacity-50 cursor-not-allowed"
                                            : "hover:bg-primary/5 hover:border-primary border-primary/20 text-foreground cursor-pointer"
                                      }`}
                                    >
                                      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                                        isSelected ? "bg-green-500 text-white" : "bg-primary/10 text-primary"
                                      }`}>
                                        {index + 1}
                                      </span>
                                      <span className="flex-1">{slot}</span>
                                      {isSelected && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold ${
                                app.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 
                                app.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
                                'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                              }`}>
                                {app.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {app.status === 'confirmed' && app.client_email && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    asChild
                                    className="h-8 border-green-500/30 text-green-500 hover:bg-green-500/10 gap-1 font-bold text-xs"
                                    title="Send Confirmation Email to Client"
                                  >
                                    <a href={getEmailMailtoUrl(app)}>
                                      <Mail size={12} /> Notify Email
                                    </a>
                                  </Button>
                                )}
                                
                                {app.status === 'pending' && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleCancelAppointment(app.id)}
                                    className="h-8 w-8 text-yellow-600 hover:bg-yellow-500/10"
                                    title="Cancel Appointment"
                                  >
                                    <XCircle size={14} />
                                  </Button>
                                )}
                                
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteAppointment(app.id)}
                                  className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                                  title="Delete Appointment"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile view */}
                <div className="md:hidden space-y-4">
                  {appointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No appointment bookings requested yet.</div>
                  ) : (
                    appointments.filter(a => 
                      (a.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (a.client_email || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (a.client_phone || '').toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((app) => (
                      <div key={app.id} className="glass rounded-xl p-5 border border-primary/10 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg text-foreground">{app.client_name}</h4>
                            <p className="text-xs text-muted-foreground">Requested: {new Date(app.created_at).toLocaleString()}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                            app.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 
                            app.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
                            'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <span className="flex items-center gap-1.5 text-muted-foreground"><Mail size={12} /> {app.client_email}</span>
                          <span className="flex items-center gap-1.5 text-muted-foreground"><Phone size={12} /> {app.client_phone}</span>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-primary/5">
                          <p className="text-xs font-bold text-muted-foreground mb-2">Slots (Select one to confirm):</p>
                          {[app.slot_1, app.slot_2, app.slot_3].filter(s => s && s !== "N/A").map((slot, index) => {
                            const isSelected = app.selected_slot === slot;
                            const isConfirmed = app.status === 'confirmed';
                            return (
                              <button
                                key={index}
                                disabled={isConfirmed}
                                onClick={() => handleConfirmAppointmentSlot(app.id, slot)}
                                className={`w-full flex items-center gap-2 text-left text-xs p-2.5 rounded-lg border transition-all ${
                                  isSelected
                                    ? "bg-green-500/10 border-green-500 text-green-500 font-bold"
                                    : isConfirmed
                                      ? "bg-muted/40 border-border text-muted-foreground opacity-50 cursor-not-allowed"
                                      : "bg-secondary/20 hover:bg-primary/5 hover:border-primary border-primary/20 text-foreground cursor-pointer"
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                                  isSelected ? "bg-green-500 text-white" : "bg-primary/10 text-primary"
                                }`}>
                                  {index + 1}
                                </span>
                                <span className="flex-1 leading-normal">{slot}</span>
                                {isSelected && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex gap-2 justify-end pt-2 border-t border-primary/5">
                          {app.status === 'confirmed' && app.client_email && (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="h-9 border-green-500/30 text-green-500 hover:bg-green-500/10 gap-1 font-bold text-xs"
                            >
                              <a href={getEmailMailtoUrl(app)}>
                                <Mail size={12} /> Notify Email
                              </a>
                            </Button>
                          )}
                          
                          {app.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelAppointment(app.id)}
                              className="h-9 text-yellow-600 hover:bg-yellow-500/10 font-bold text-xs"
                            >
                              <XCircle size={14} className="mr-1 inline" /> Cancel
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAppointment(app.id)}
                            className="h-9 text-red-500 hover:bg-red-500/10 font-bold text-xs"
                          >
                            <Trash2 size={14} className="mr-1 inline" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="careers" className="space-y-8 animate-in fade-in-50 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-display font-black text-foreground flex items-center gap-2">
                  <Briefcase size={28} className="text-accent" /> Job Openings & Careers
                </h2>
                <p className="text-muted-foreground text-sm">Post, update, and manage job opportunities visible to candidates.</p>
              </div>
              <Button 
                onClick={() => {
                  setJobForm(blankJobForm);
                  setIsEditingJob('new');
                }} 
                className="gradient-bg text-white font-bold h-10 px-5 rounded-xl shadow-lg hover:shadow-primary/20 flex gap-2 items-center"
              >
                <Plus size={18} /> Post a Job Opening
              </Button>
            </div>

            {/* Post/Edit Job Form */}
            {isEditingJob && (
              <Card className="glass border-accent/20 animate-in slide-in-from-top-4 duration-300" id="job-form">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-display flex items-center gap-2">
                      <Briefcase className="text-accent" /> {isEditingJob === 'new' ? 'New Job Posting' : 'Edit Job Posting'}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingJob(null)} className="h-8 w-8 rounded-lg">
                      <X size={16} />
                    </Button>
                  </div>
                  <CardDescription>All fields marked with * are required. Job details will be formatted for candidate display.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSaveJob} className="space-y-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2 col-span-1 sm:col-span-2">
                        <Label className="text-sm font-semibold">Job Title *</Label>
                        <Input 
                          required 
                          value={jobForm.title} 
                          onChange={e => setJobForm({...jobForm, title: e.target.value})} 
                          placeholder="e.g. Senior Full Stack Developer" 
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Department *</Label>
                        <Input 
                          required 
                          value={jobForm.department} 
                          onChange={e => setJobForm({...jobForm, department: e.target.value})} 
                          placeholder="e.g. Engineering" 
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Location *</Label>
                        <Input 
                          required 
                          value={jobForm.location} 
                          onChange={e => setJobForm({...jobForm, location: e.target.value})} 
                          placeholder="e.g. Hyderabad, IN / Remote" 
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Job Type</Label>
                        <select 
                          value={jobForm.job_type} 
                          onChange={e => setJobForm({...jobForm, job_type: e.target.value})} 
                          className="w-full h-10 px-3 rounded-lg bg-background/50 border border-input focus:border-accent outline-none text-sm"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Remote">Remote</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Salary Range</Label>
                        <Input 
                          value={jobForm.salary_range} 
                          onChange={e => setJobForm({...jobForm, salary_range: e.target.value})} 
                          placeholder="e.g. $80k - $100k / ₹12L - ₹18L" 
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Status</Label>
                        <select 
                          value={jobForm.status} 
                          onChange={e => setJobForm({...jobForm, status: e.target.value})} 
                          className="w-full h-10 px-3 rounded-lg bg-background/50 border border-input focus:border-accent outline-none text-sm"
                        >
                          <option value="Active">Active (Visible)</option>
                          <option value="Draft">Draft (Hidden)</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Job Description *</Label>
                        <textarea 
                          required 
                          rows={6}
                          value={jobForm.description} 
                          onChange={e => setJobForm({...jobForm, description: e.target.value})} 
                          placeholder="Provide a comprehensive job description. Markdown or simple paragraphs are allowed." 
                          className="w-full p-3 rounded-lg bg-background/50 border border-input focus:border-accent outline-none text-sm transition-all resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Job Requirements / Key Skills *</Label>
                        <textarea 
                          required 
                          rows={6}
                          value={jobForm.requirements} 
                          onChange={e => setJobForm({...jobForm, requirements: e.target.value})} 
                          placeholder="List requirements or candidate profile. Put each on a new line or separate by commas." 
                          className="w-full p-3 rounded-lg bg-background/50 border border-input focus:border-accent outline-none text-sm transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                      <Button type="button" variant="outline" onClick={() => setIsEditingJob(null)} className="h-10 px-5 rounded-xl">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={savingJob} className="gradient-bg text-white font-bold h-10 px-5 rounded-xl shadow-lg">
                        {savingJob ? 'Saving...' : 'Save Job Posting'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Job Openings List */}
            <Card className="glass">
              <CardHeader className="border-b border-border/50 pb-4 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-display flex items-center gap-2">
                    <FileText className="text-accent" /> Active Job Postings ({jobs.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {jobs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Briefcase size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                    No jobs posted yet. Click "Post a Job Opening" to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Salary Range</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell className="font-bold text-foreground whitespace-nowrap">{job.title}</TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{job.department || 'N/A'}</TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground flex items-center gap-1 mt-3.5"><MapPin size={12} /> {job.location || 'N/A'}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/80 text-foreground border border-border">
                                {job.job_type}
                              </span>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm font-semibold text-accent">{job.salary_range || 'Not Specified'}</TableCell>
                            <TableCell>
                              <button 
                                onClick={() => handleToggleJobStatus(job)}
                                className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-bold transition-all border ${
                                  job.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20' : 
                                  job.status === 'Draft' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/20' :
                                  'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'
                                }`}
                              >
                                {job.status}
                              </button>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 text-primary hover:bg-primary/10"
                                  onClick={() => handleEditJob(job)}
                                  title="Edit Job"
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                                  onClick={() => handleDeleteJob(job.id)}
                                  title="Delete Job"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners">
            <AdminMasterBrain />
          </TabsContent>
        </Tabs>
        {/* Edit Project Dialog */}
        {/* We reuse the scrollIntoView logic instead of a dialog for projects, but we add Candidate Dialog below */}
        <CandidateProfileDialog 
          candidate={selectedCandidate} 
          isOpen={!!selectedCandidate} 
          onClose={() => setSelectedCandidate(null)} 
          onUpdateStatus={handleUpdateCandidateStatus}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
