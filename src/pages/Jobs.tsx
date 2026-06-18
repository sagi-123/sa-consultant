import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Briefcase, MapPin, DollarSign, CheckCircle2, X, Upload, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSEO } from '@/hooks/useSEO';

const Jobs = () => {
  useSEO({
    title: "Careers & Remote IT Staffing Openings in USA | SA Consultant & Staffing",
    description: "Explore elite remote job openings and career opportunities in software development, design, and tech consulting across the United States.",
    keywords: "best IT staffing consultants in USA, hire remote developers, remote IT staffing, IT recruitment agency, software developer recruitment, jobs in USA",
    canonical: "https://www.saconsultantandstaffing.com/jobs"
  });
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applyForm, setApplyForm] = useState({ name: '', email: '', phone: '', coverLetter: '' });
  const [isApplying, setIsApplying] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('job_openings')
          .select('*')
          .eq('status', 'Active')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setJobs(data || []);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        toast({
          variant: "destructive",
          title: "Failed to load jobs",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [toast]);

  // Pre-fill application form with candidate/profile data if logged in
  useEffect(() => {
    if (profile) {
      setApplyForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: '', // Can be updated by user
        coverLetter: ''
      });
    }
  }, [profile]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setIsApplying(true);

    try {
      let publicUrl = '';

      // Upload resume if file exists
      if (resumeFile) {
        const fileName = `${Math.random().toString(36).substring(2)}_${resumeFile.name}`;
        const userId = profile?.id || 'anonymous';
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(`${userId}/${fileName}`, resumeFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('resumes')
          .getPublicUrl(`${userId}/${fileName}`);
        
        publicUrl = data.publicUrl;
      }

      // Create a candidate application record in the database
      const { error: insertError } = await supabase.from('candidates').insert({
        user_id: profile?.id || null,
        name: applyForm.name,
        email: applyForm.email,
        phone: applyForm.phone || null,
        job_title: selectedJob.title,
        status: 'New',
        resume_url: publicUrl || null,
        parsed_data: {
          coverLetter: applyForm.coverLetter,
          appliedViaPage: true,
          appliedAt: new Date().toISOString()
        } as any
      });

      if (insertError) throw insertError;

      toast({
        title: "Application Submitted Successfully!",
        description: `Thank you for applying to the ${selectedJob.title} position.`,
      });

      // Clear the state
      setSelectedJob(null);
      setResumeFile(null);
      setApplyForm({ name: '', email: '', phone: '', coverLetter: '' });
    } catch (err: any) {
      console.error('Error submitting application:', err);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: err.message || "Failed to submit application. Please try again.",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <main className="container mx-auto px-4 py-28 flex-grow max-w-5xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight leading-tight">
            Explore <span className="gradient-text">Career Opportunities</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join a forward-thinking team. Find your next role, upload your profile, and grow with us.
          </p>
        </div>

        <Card id="open-jobs" className="glass border-primary/20 mb-8 scroll-mt-24">
          <CardHeader className="border-b border-border/50 pb-6">
            <CardTitle className="text-2xl font-display flex items-center gap-2">
              <Briefcase className="text-primary" /> Current Openings
            </CardTitle>
            <CardDescription>
              We are actively hiring for the following roles. Click apply to submit your details.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p>Loading available positions...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Briefcase size={48} className="mx-auto text-muted-foreground/20 mb-4 animate-pulse" />
                <p className="text-lg font-medium">No active job openings at the moment.</p>
                <p className="text-sm mt-1">Please check back soon or keep an eye on our portal updates!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="glass p-6 rounded-xl border border-primary/10 flex flex-col justify-between hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {job.department || 'General'}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-foreground border border-border">
                          {job.job_type || 'Full-time'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{job.title}</h3>
                      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-accent" /> {job.location || 'Remote'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <DollarSign size={14} className="text-green-500" /> {job.salary_range || 'Not specified'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                        {job.description}
                      </p>
                      {job.requirements && (
                        <div className="mb-6">
                          <h4 className="text-xs font-black text-foreground uppercase tracking-wider mb-2">
                            Key Requirements:
                          </h4>
                          <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                            {job.requirements.split(/[\n,]/).filter(Boolean).slice(0, 3).map((req: string, idx: number) => (
                              <li key={idx} className="line-clamp-1">
                                {req.trim()}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedJob(job);
                        setResumeFile(null);
                        setApplyForm(prev => ({
                          ...prev,
                          phone: '',
                          coverLetter: ''
                        }));
                      }}
                      className="gradient-bg hover:opacity-90 text-white w-full font-bold py-2.5 rounded-xl transition-all shadow-md mt-4"
                    >
                      Apply Now
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Application Dialog */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <Card className="glass border-accent/20 w-full max-w-xl max-h-[95vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border/50 pb-4 relative">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">
                    {selectedJob.department}
                  </span>
                  <CardTitle className="text-xl font-display mt-1">Apply for: {selectedJob.title}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedJob(null)} className="h-8 w-8 rounded-lg absolute right-4 top-4">
                  <X size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={applyForm.name}
                      onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-accent outline-none text-sm transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={applyForm.email}
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-accent outline-none text-sm transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    value={applyForm.phone}
                    onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-accent outline-none text-sm transition-all"
                    placeholder="e.g. +1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Cover Letter / Note to Recruiter</label>
                  <textarea
                    rows={4}
                    value={applyForm.coverLetter}
                    onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                    className="w-full p-3 rounded-lg bg-background/50 border border-border focus:border-accent outline-none text-sm transition-all resize-none"
                    placeholder="Introduce yourself or write a quick note on why you're a great fit!"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold block">Resume/CV (PDF or Word) *</label>
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="relative overflow-hidden hover:border-accent hover:text-accent transition-colors text-xs py-2 h-9" 
                      onClick={() => document.getElementById('apply-resume-upload')?.click()}
                    >
                      <Upload size={14} className="mr-1.5" /> 
                      {resumeFile ? 'Change Resume' : 'Choose Resume'}
                      <input 
                        id="apply-resume-upload" 
                        type="file" 
                        required={!resumeFile}
                        className="hidden" 
                        accept=".pdf,.doc,.docx" 
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)} 
                      />
                    </Button>
                    <span className="text-xs font-medium text-muted-foreground truncate max-w-xs">
                      {resumeFile ? resumeFile.name : 'No file selected'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                  <Button type="button" variant="outline" onClick={() => setSelectedJob(null)} className="h-10 px-5 rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isApplying} className="gradient-bg text-white font-bold h-10 px-6 rounded-xl shadow-lg flex items-center gap-2">
                    {isApplying ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Jobs;
