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
  Upload
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

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
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

  const fetchAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [usersResponse, reviewsResponse, projectsResponse, inquiriesResponse, candidatesResponse] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('candidates').select('*').order('created_at', { ascending: false }),
      ]);

      if (usersResponse.error) throw usersResponse.error;
      if (reviewsResponse.error) throw reviewsResponse.error;
      if (projectsResponse.error) throw projectsResponse.error;
      if (inquiriesResponse.error) throw inquiriesResponse.error;
      if (candidatesResponse.error && candidatesResponse.error.code !== '42P01') throw candidatesResponse.error; // Ignore table missing error for now

      setUsers(usersResponse.data || []);
      setReviews(reviewsResponse.data || []);
      setProjects(projectsResponse.data || []);
      setInquiries(inquiriesResponse.data || []);
      setCandidates(candidatesResponse.data || []);
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
    { label: 'Total Reviews', value: reviews.length, icon: Star, color: 'text-yellow-500' },
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="glass-strong flex lg:grid lg:grid-cols-6 overflow-x-auto w-full h-auto p-1 sticky top-20 z-40 backdrop-blur-xl border border-primary/20 touch-pan-x gap-1 justify-start flex-nowrap">
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
                <CardDescription>Everything is running smoothly. There are {candidates.filter(c => c.status === 'New').length} new candidate applications and {inquiries.filter(i => i.status === 'new').length} new messages.</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4 flex-wrap">
                <Button onClick={() => setActiveTab('candidates')} className="gradient-bg border-none">
                   Review Candidates
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
                              <Button variant="outline" size="sm" className="h-8" onClick={() => setSelectedCandidate(candidate)}>
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
                            <TableCell className="font-medium whitespace-nowrap">{inquiry.name}</TableCell>
                            <TableCell className="text-xs">
                              <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1"><Mail size={12} className="text-primary" /> {inquiry.email}</span>
                                <span className="flex items-center gap-1"><Phone size={12} className="text-accent" /> {inquiry.phone}</span>
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[200px] text-sm italic">"{inquiry.message}"</TableCell>
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
                      <div key={inquiry.id} className="glass rounded-xl p-5 border border-primary/10 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
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

                        <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                          <p className="text-sm italic text-foreground leading-relaxed">
                            "{inquiry.message}"
                          </p>
                        </div>
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
