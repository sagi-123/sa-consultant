import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Users, Briefcase, Calendar, TrendingUp, Sparkles, MessageSquare, 
  CheckCircle2, Plus, Eye, Send, Loader2, DollarSign, Check, X, 
  Search, Filter, ArrowUpRight, BarChart3, Clock, UserCheck, ShieldCheck,
  FileText, User, Building2, MapPin, Award, Trash2
} from 'lucide-react';

const FormattedInquiryMessage = ({ message }: { message?: string | null }) => {
  if (!message || typeof message !== 'string') return <span className="italic text-muted-foreground">No message content</span>;

  // 1. Partnership Application
  if (message.startsWith('[PARTNERSHIP APPLICATION:')) {
    const headerMatch = message.match(/\[PARTNERSHIP APPLICATION:\s*(.*?)\]/i);
    const programName = headerMatch ? headerMatch[1].trim() : 'Partnership';

    const lines = message.split('\n');
    const getBullet = (key: string) => {
      const line = lines.find(l => l.includes(key));
      return line ? line.split(key)[1]?.trim() : '';
    };

    const applicantName = getBullet('• Name:') || getBullet('Name:');
    const company = getBullet('• Company / Agency:') || getBullet('Company / Agency:');
    const email = getBullet('• Email:') || getBullet('Email:');
    const phone = getBullet('• Phone:') || getBullet('Phone:');

    const proposalHeaderIndex = lines.findIndex(l => l.includes('=== PARTNERSHIP PROPOSAL / GOALS ==='));
    const proposal = proposalHeaderIndex !== -1 ? lines.slice(proposalHeaderIndex + 1).join('\n').trim() : '';

    return (
      <div className="space-y-3 bg-primary/5 p-4 rounded-2xl border border-primary/20 text-left w-full">
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-primary/10 pb-2">
          <Badge className="gradient-bg text-white font-extrabold text-xs px-3 py-1 shadow-sm">
            🤝 {programName} Application
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div><span className="font-bold text-foreground">Applicant Name:</span> {applicantName || 'N/A'}</div>
          {company && company !== 'N/A' && <div><span className="font-bold text-foreground">Company/Agency:</span> {company}</div>}
          <div><span className="font-bold text-foreground">Email:</span> {email ? <a href={`mailto:${email}`} className="text-primary hover:underline font-semibold">{email}</a> : 'N/A'}</div>
          <div><span className="font-bold text-foreground">Phone:</span> {phone ? <a href={`tel:${phone}`} className="text-primary hover:underline font-semibold">{phone}</a> : 'N/A'}</div>
        </div>
        {proposal && (
          <div className="mt-2 bg-background/80 p-3 rounded-xl border border-primary/10 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary">Partnership Proposal / Goals:</div>
            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{proposal}</p>
          </div>
        )}
      </div>
    );
  }

  // 2. Referral Program Submission
  if (message.startsWith('[REFERRAL PROGRAM SUBMISSION]')) {
    const lines = message.split('\n');
    const getBullet = (key: string, startIdx = 0) => {
      const line = lines.slice(startIdx).find(l => l.includes(key));
      return line ? line.split(key)[1]?.trim() : '';
    };

    const referrerIdx = lines.findIndex(l => l.includes('=== REFERRER DETAILS ==='));
    const candidateIdx = lines.findIndex(l => l.includes('=== REFERRAL CANDIDATE'));
    const purposeIdx = lines.findIndex(l => l.includes('=== PURPOSE OF REFERRAL ==='));

    const referrerName = getBullet('• Name:', referrerIdx >= 0 ? referrerIdx : 0);
    const referrerEmail = getBullet('• Email:', referrerIdx >= 0 ? referrerIdx : 0);
    const referrerPhone = getBullet('• Phone:', referrerIdx >= 0 ? referrerIdx : 0);

    const candName = getBullet('• Name:', candidateIdx >= 0 ? candidateIdx : 0);
    const candEmail = getBullet('• Email:', candidateIdx >= 0 ? candidateIdx : 0);
    const candPhone = getBullet('• Phone:', candidateIdx >= 0 ? candidateIdx : 0);

    let purposeText = '';
    if (purposeIdx !== -1) {
      const endIdx = candidateIdx > purposeIdx ? candidateIdx : lines.length;
      purposeText = lines.slice(purposeIdx + 1, endIdx).join('\n').trim();
    }

    return (
      <div className="space-y-3 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 text-left w-full">
        <div className="flex items-center justify-between gap-2 border-b border-emerald-500/10 pb-2">
          <Badge className="bg-emerald-600 text-white font-extrabold text-xs px-3 py-1 shadow-sm">
            👥 Referral Program Submission
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 bg-background/60 p-3 rounded-xl border border-emerald-500/10">
            <div className="font-extrabold text-emerald-600 uppercase text-[10px] tracking-wider mb-1">Referrer Details</div>
            <div><span className="font-bold text-foreground">Name:</span> {referrerName || 'N/A'}</div>
            <div><span className="font-bold text-foreground">Email:</span> {referrerEmail || 'N/A'}</div>
            <div><span className="font-bold text-foreground">Phone:</span> {referrerPhone || 'N/A'}</div>
          </div>
          <div className="space-y-1 bg-background/60 p-3 rounded-xl border border-emerald-500/10">
            <div className="font-extrabold text-emerald-600 uppercase text-[10px] tracking-wider mb-1">Referred Candidate</div>
            <div><span className="font-bold text-foreground">Name:</span> {candName || 'N/A'}</div>
            <div><span className="font-bold text-foreground">Email:</span> {candEmail || 'N/A'}</div>
            <div><span className="font-bold text-foreground">Phone:</span> {candPhone || 'N/A'}</div>
          </div>
        </div>
        {purposeText && (
          <div className="bg-background/80 p-3 rounded-xl border border-emerald-500/10 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Purpose of Referral:</div>
            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{purposeText}</p>
          </div>
        )}
      </div>
    );
  }

  // 3. Partner / Vendor Submission
  if (message.startsWith('[PARTNER/VENDOR SUBMISSION]')) {
    const lines = message.split('\n').filter(Boolean);
    const get = (key: string) => lines.find(l => l.startsWith(key))?.replace(key, '').trim() ?? '';
    const resumeUrl = get('Resume URL:') || get('Resume Link:');
    return (
      <div className="space-y-2 bg-accent/5 p-4 rounded-2xl border border-accent/20 text-left w-full">
        <Badge className="bg-accent text-white font-extrabold text-xs px-3 py-1 shadow-sm mb-1">
          🏢 Talent Partner Submission
        </Badge>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div><span className="font-bold text-foreground">Company:</span> {get('Vendor Company:')}</div>
          <div><span className="font-bold text-foreground">Candidate:</span> {get('Candidate Name:')}</div>
          <div><span className="font-bold text-foreground">Email:</span> {get('Candidate Email:')}</div>
          <div><span className="font-bold text-foreground">Phone:</span> {get('Candidate Phone:')}</div>
        </div>
        {resumeUrl && (
          <a href={resumeUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-accent hover:bg-accent/80 px-3 py-1.5 rounded-lg transition-colors mt-2">
            📄 View / Download Resume
          </a>
        )}
      </div>
    );
  }

  // 4. Job Application
  if (message.startsWith('[JOB APPLICATION]')) {
    const lines = message.split('\n').filter(Boolean);
    const get = (key: string) => lines.find(l => l.startsWith(key))?.replace(key, '').trim() ?? '';
    const resumeUrl = get('Resume Link:');
    
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
      <div className="space-y-2 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20 text-left w-full">
        <Badge className="bg-blue-600 text-white font-extrabold text-xs px-3 py-1 shadow-sm mb-1">
          💼 Direct Job Application
        </Badge>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div><span className="font-bold text-foreground">Position:</span> {get('Applied Position:')} ({get('Department:')})</div>
          <div><span className="font-bold text-foreground">Candidate:</span> {get('Candidate Name:')}</div>
          <div><span className="font-bold text-foreground">Email:</span> {get('Candidate Email:')}</div>
          <div><span className="font-bold text-foreground">Phone:</span> {get('Candidate Phone:')}</div>
        </div>
        {coverLetterText && (
          <div className="text-xs text-muted-foreground bg-background/80 p-3 rounded-xl border border-blue-500/10 italic whitespace-pre-line mt-2">
            "{coverLetterText}"
          </div>
        )}
        {resumeUrl && resumeUrl !== 'No resume uploaded yet.' && (
          <a href={resumeUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors mt-2">
            📄 View / Download Resume
          </a>
        )}
      </div>
    );
  }

  // Standard message fallback
  return (
    <div className="bg-background/80 p-3 rounded-xl border border-primary/10 text-xs text-foreground leading-relaxed whitespace-pre-line text-left w-full">
      {message}
    </div>
  );
};

export function AdminMasterBrain() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Raw Data State from Supabase
  const [directCandidates, setDirectCandidates] = useState<any[]>([]);
  const [partnerCandidates, setPartnerCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [revenueShares, setRevenueShares] = useState<any[]>([]);
  const [partnerMessages, setPartnerMessages] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  const [mockMatches, setMockMatches] = useState<any[]>([]);
  const [mockRevenueShares, setMockRevenueShares] = useState<any[]>([]);
  const [mockJobs, setMockJobs] = useState<any[]>([]);
  const [mockInquiries, setMockInquiries] = useState<any[]>([]);

  // Deleted IDs tracking for instant UI removal of both real and mock items
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // Matching & Modal State
  const [selectedCandidateForProfile, setSelectedCandidateForProfile] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [selectedJobForMatch, setSelectedJobForMatch] = useState<any>(null);
  const [selectedCandidateForMatchActive, setSelectedCandidateForMatchActive] = useState<any>(null);
  const [isMatchActionModalOpen, setIsMatchActionModalOpen] = useState(false);

  const [selectedMatchForUpdate, setSelectedMatchForUpdate] = useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [selectedMatchForCommission, setSelectedMatchForCommission] = useState<any>(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);

  const [selectedSubmissionForInterview, setSelectedSubmissionForInterview] = useState<any>(null);
  const [isAddInterviewModalOpen, setIsAddInterviewModalOpen] = useState(false);

  // Forms State
  const [jobForm, setJobForm] = useState({
    title: '', department: 'Engineering', location: 'Remote',
    employment_type: 'Full-time C2C', salary_range: '$130,000 - $150,000 / $65-$75/hr', description: ''
  });

  const [matchForm, setMatchForm] = useState({
    match_percentage: '95', salary_fit: 'Optimal Fit ($70/hr)', location_fit: '100% Remote Fit'
  });

  const [updateForm, setUpdateForm] = useState({
    status: 'Interview', interview_schedule: '', interview_feedback: '', offered_salary: '', joining_date: ''
  });

  const [commissionForm, setCommissionForm] = useState({
    placement_fee: '20000', partner_share: '16000'
  });

  const [newInterviewForm, setNewInterviewForm] = useState({
    interview_schedule: '', interview_feedback: '', status: 'Interview'
  });

  // Filters State for Unified Candidate Pool
  const [sourceFilter, setSourceFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Communication Hub State
  const [commTab, setCommTab] = useState('partners');
  const [selectedPartnerForChat, setSelectedPartnerForChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Fetch Master Data
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      try {
        const { data: dCand } = await supabase.from('candidates').select('*').order('created_at', { ascending: false });
        if (dCand) setDirectCandidates(dCand);

        const { data: pCand } = await supabase.from('vendor_candidates').select('*').order('created_at', { ascending: false });
        if (pCand) setPartnerCandidates(pCand);

        const { data: jData } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
        if (jData) setJobs(jData);

        const { data: mData } = await supabase.from('job_matches').select('*, vendor_candidates(name, email, phone, skills, resume_url)').order('created_at', { ascending: false });
        if (mData) setMatches(mData);

        const { data: rData } = await supabase.from('revenue_shares').select('*').order('created_at', { ascending: false });
        if (rData) setRevenueShares(rData);

        const { data: pMsg } = await supabase.from('partner_messages').select('*').order('created_at', { ascending: true });
        if (pMsg) {
          setPartnerMessages(pMsg);
          const uniquePartners = Array.from(new Set(pMsg.map(m => m.vendor_id)));
          if (uniquePartners.length > 0 && !selectedPartnerForChat) {
            setSelectedPartnerForChat(uniquePartners[0]);
          }
        }

        const { data: inq } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
        if (inq) setInquiries(inq);

      } catch (err) {
        console.error('Error fetching Master CRM data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();

    // Realtime channel for instant sync with Talent Partner Portal
    const channel = supabase.channel('admin_master_brain_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_matches' }, () => {
        supabase.from('job_matches').select('*, vendor_candidates(name, email, phone, skills, resume_url)').order('created_at', { ascending: false })
          .then(({ data }) => data && setMatches(data));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendor_candidates' }, () => {
        supabase.from('vendor_candidates').select('*').order('created_at', { ascending: false })
          .then(({ data }) => data && setPartnerCandidates(data));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPartnerForChat]);

  // Helper function to safely extract skills as an array of strings
  const parseSkills = (skillsRaw: any): string[] => {
    if (!skillsRaw) return ['General'];
    if (Array.isArray(skillsRaw)) {
      return skillsRaw.map(s => String(s));
    }
    if (typeof skillsRaw === 'string') {
      try {
        const parsed = JSON.parse(skillsRaw);
        if (Array.isArray(parsed)) return parsed.map(s => String(s));
      } catch (e) {
        return skillsRaw.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (typeof skillsRaw === 'object') {
      if (skillsRaw.skills && Array.isArray(skillsRaw.skills)) {
        return skillsRaw.skills.map((s: any) => String(s));
      }
      return Object.values(skillsRaw).map(s => String(s));
    }
    return [String(skillsRaw)];
  };

  // Unified Candidate Pool Memo
  const unifiedCandidates = useMemo(() => {
    const direct = directCandidates.map(c => ({
      ...c,
      unified_id: `dir_${c.id}`,
      name: c.name || 'Unnamed Candidate',
      email: c.email || 'No email',
      phone: c.phone || 'No phone',
      source: 'Direct Candidate',
      source_detail: 'Direct Candidate',
      vendor_company_name: 'N/A (Direct)',
      skills_list: parseSkills(c.skills),
      experience_years: c.experience_years !== null && c.experience_years !== undefined ? String(c.experience_years) : 'N/A',
      location: c.location || 'Remote',
      salary_expectation: c.job_title ? `Expected for ${c.job_title}` : 'Negotiable',
      availability: 'Immediate',
      work_authorization: 'US Citizen / Green Card',
      status: c.status || 'New'
    }));

    const partner = partnerCandidates.map(c => ({
      ...c,
      unified_id: `part_${c.id}`,
      name: c.name || 'Unnamed Candidate',
      email: c.email || 'No email',
      phone: c.phone || 'No phone',
      source: `Partner: ${c.vendor_company_name || 'Agency'}`,
      source_detail: `Partner: ${c.vendor_company_name || 'Agency'}`,
      vendor_company_name: c.vendor_company_name || 'Talent Partner',
      skills_list: parseSkills(c.skills),
      experience_years: c.experience_years !== null && c.experience_years !== undefined ? String(c.experience_years) : 'N/A',
      location: c.location || 'Remote',
      salary_expectation: c.salary_expectation || 'Negotiable',
      availability: c.availability || 'Immediate',
      work_authorization: c.work_authorization || 'Authorized',
      status: c.status || 'Available'
    }));

    const rawList = [...partner, ...direct].filter(c => !deletedIds.includes(c.unified_id) && !deletedIds.includes(c.id));

    // Deduplicate candidates by email or name+phone to avoid duplicate listings
    const seen = new Set<string>();
    const deduplicated: typeof rawList = [];

    for (const cand of rawList) {
      const emailClean = cand.email && cand.email.toLowerCase() !== 'no email' ? cand.email.toLowerCase().trim() : '';
      const nameClean = (cand.name || '').toLowerCase().trim();
      const phoneClean = (cand.phone || '').trim();
      
      const key = emailClean ? `email:${emailClean}` : `name:${nameClean}_phone:${phoneClean}`;

      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(cand);
      }
    }

    return deduplicated;
  }, [directCandidates, partnerCandidates, deletedIds]);

  // Filtered Candidates Memo
  const filteredCandidates = useMemo(() => {
    return unifiedCandidates.filter(c => {
      const matchSource = sourceFilter === 'all' || 
        (sourceFilter === 'direct' && c.source === 'Direct Candidate') ||
        (sourceFilter === 'partner' && c.source.startsWith('Partner'));
      
      const matchSkill = !skillFilter || (Array.isArray(c.skills_list) && c.skills_list.some((s: string) => s.toLowerCase().includes(skillFilter.toLowerCase())));
      const matchExp = !expFilter || (c.experience_years && String(c.experience_years).toLowerCase().includes(expFilter.toLowerCase()));
      const matchLoc = !locationFilter || (c.location && String(c.location).toLowerCase().includes(locationFilter.toLowerCase()));

      return matchSource && matchSkill && matchExp && matchLoc;
    });
  }, [unifiedCandidates, sourceFilter, skillFilter, expFilter, locationFilter]);

  // Display Lists Memo (Combines live data with interactive mock fallback, filtering out deleted IDs)
  const displayMatches = useMemo(() => {
    const list = matches.length > 0 ? matches : mockMatches;
    return list.filter(m => !deletedIds.includes(m.id));
  }, [matches, mockMatches, deletedIds]);

  const displayRevenueShares = useMemo(() => {
    const list = revenueShares.length > 0 ? revenueShares : mockRevenueShares;
    return list.filter(r => !deletedIds.includes(r.id));
  }, [revenueShares, mockRevenueShares, deletedIds]);

  const displayJobs = useMemo(() => {
    const list = jobs.length > 0 ? jobs : mockJobs;
    return list.filter(j => !deletedIds.includes(j.id));
  }, [jobs, mockJobs, deletedIds]);

  const displayInquiries = useMemo(() => {
    const list = inquiries.length > 0 ? inquiries : mockInquiries;
    return list.filter(i => !deletedIds.includes(i.id));
  }, [inquiries, mockInquiries, deletedIds]);

  // Helper function to safely extract candidate info from match record (Supports Direct Candidates & Partners)
  const getMatchCandidateInfo = (match: any) => {
    if (match.vendor_candidates) {
      return {
        name: match.vendor_candidates.name || 'Unnamed Candidate',
        email: match.vendor_candidates.email || 'No email',
        phone: match.vendor_candidates.phone || '',
        source: `Partner: ${match.company_name || 'Agency'}`,
        location_fit_clean: match.location_fit || 'Remote Fit',
        isDirect: false
      };
    }

    try {
      if (match.location_fit && String(match.location_fit).startsWith('{')) {
        const parsed = JSON.parse(match.location_fit);
        return {
          name: parsed.cand_name || 'Direct Candidate',
          email: parsed.cand_email || 'No email',
          phone: parsed.cand_phone || '',
          source: parsed.source || 'Direct Candidate',
          location_fit_clean: parsed.location || 'Remote Fit',
          isDirect: true
        };
      }
    } catch (e) {
      // ignore
    }

    return {
      name: 'Direct Candidate',
      email: 'direct@candidate.portal',
      phone: '',
      source: 'Direct Candidate',
      location_fit_clean: match.location_fit || 'Remote Fit',
      isDirect: true
    };
  };

  // Golden Rule Quick Matches Memo (Answering in 10 seconds: “Which candidate can I send to which job right now?”)
  const goldenMatches = useMemo(() => {
    if (displayJobs.length === 0 || unifiedCandidates.length === 0) return [];
    const results: any[] = [];

    displayJobs.filter(j => j.status === 'Open').forEach(job => {
      const jobTitle = job.title.toLowerCase();
      const jobDesc = (job.description || '').toLowerCase();
      const jobSkills = jobTitle.split(' ').concat(jobDesc.split(' '));

      unifiedCandidates.filter(c => c.status === 'Available' || c.status === 'New').forEach(cand => {
        let score = 0;
        if (Array.isArray(cand.skills_list)) {
          cand.skills_list.forEach((s: string) => {
            if (jobSkills.some(js => js.includes(s.toLowerCase()) || s.toLowerCase().includes(js))) {
              score += 35;
            }
          });
        }
        if (cand.experience_years && String(cand.experience_years).includes('5')) score += 20;
        if (cand.location && job.location && String(cand.location).toLowerCase().includes(String(job.location).toLowerCase())) score += 25;
        
        if (score > 40) {
          results.push({
            job,
            candidate: cand,
            matchScore: Math.min(score + 30, 98),
            reason: `Strong skill alignment (${Array.isArray(cand.skills_list) ? cand.skills_list.slice(0, 3).join(', ') : 'Verified Skills'}) with ${job.title}`
          });
        }
      });
    });

    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);
  }, [displayJobs, unifiedCandidates]);

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const newCandCount = unifiedCandidates.filter(c => c.status === 'New' || c.status === 'Available').length;
    const openJobsCount = displayJobs.filter(j => j.status === 'Open').length;
    const pendingMatchesCount = displayMatches.filter(m => m.status === 'Pending Partner Approval').length;
    const interviewingCount = displayMatches.filter(m => m.status === 'Interview').length;
    const offeredCount = displayMatches.filter(m => m.status === 'Offered').length;
    const placedCount = displayMatches.filter(m => m.status === 'Placed').length;

    return { newCandCount, openJobsCount, pendingMatchesCount, interviewingCount, offeredCount, placedCount };
  }, [unifiedCandidates, displayJobs, displayMatches]);

  // Unique Partners List Memo (Combines all sources so dropdowns and leaderboards are always populated)
  const uniquePartnersList = useMemo(() => {
    const partnersMap = new Map<string, string>();

    partnerCandidates.filter(c => !deletedIds.includes(`part_${c.id}`) && !deletedIds.includes(c.id)).forEach(c => {
      if (c.vendor_id && c.vendor_company_name) {
        partnersMap.set(c.vendor_id, c.vendor_company_name);
      }
    });

    partnerMessages.forEach(m => {
      if (m.vendor_id && !partnersMap.has(m.vendor_id)) {
        partnersMap.set(m.vendor_id, m.sender_role === 'vendor' ? m.sender_name : 'Talent Partner');
      }
    });

    displayMatches.forEach(m => {
      if (m.vendor_id && !partnersMap.has(m.vendor_id)) {
        partnersMap.set(m.vendor_id, m.company_name || 'Talent Partner');
      }
    });

    return Array.from(partnersMap.entries()).map(([id, name]) => ({ id, name }));
  }, [partnerCandidates, partnerMessages, displayMatches, deletedIds]);

  // Universal Delete Handler (Removes item instantly from UI and deletes from Supabase if real)
  const handleDeleteItem = async (table: string, id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        if (!id.startsWith('mock_') && !id.startsWith('dir_') && !id.startsWith('part_')) {
          const { error } = await supabase.from(table).delete().eq('id', id);
          if (error) throw error;
        } else if (id.startsWith('dir_')) {
          const realId = id.replace('dir_', '');
          if (!realId.startsWith('mock_')) {
            const { error } = await supabase.from('candidates').delete().eq('id', realId);
            if (error) throw error;
          }
        } else if (id.startsWith('part_')) {
          const realId = id.replace('part_', '');
          if (!realId.startsWith('mock_')) {
            const { error } = await supabase.from('vendor_candidates').delete().eq('id', realId);
            if (error) throw error;
          }
        }

        setDeletedIds(prev => [...prev, id, id.replace('dir_', ''), id.replace('part_', '')]);
        toast({ title: "Record Deleted", description: "The item has been permanently removed." });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Delete Failed", description: err.message });
      }
    }
  };

  // Toggle Paid / Unpaid Status
  const handleTogglePaymentStatus = async (revId: string, newStatus: 'Paid' | 'Pending') => {
    try {
      if (revId.startsWith('mock_')) {
        setMockRevenueShares(prev => prev.map(r => r.id === revId ? { ...r, payment_status: newStatus, paid_at: newStatus === 'Paid' ? new Date().toISOString() : null } : r));
        setRevenueShares(prev => prev.map(r => r.id === revId ? { ...r, payment_status: newStatus, paid_at: newStatus === 'Paid' ? new Date().toISOString() : null } : r));
        toast({ title: `Status updated to ${newStatus}`, description: `Revenue share marked as ${newStatus}.` });
        return;
      }

      const { error } = await supabase.from('revenue_shares').update({
        payment_status: newStatus,
        paid_at: newStatus === 'Paid' ? new Date().toISOString() : null
      } as any).eq('id', revId);

      if (error) throw error;

      setRevenueShares(prev => prev.map(r => r.id === revId ? { ...r, payment_status: newStatus, paid_at: newStatus === 'Paid' ? new Date().toISOString() : null } : r));
      toast({ title: `Status updated to ${newStatus}`, description: `Revenue share marked as ${newStatus}.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error updating status", description: err.message });
    }
  };

  // Execute Match Action (Send to Partner or Direct Submit)
  const handleExecuteMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForMatch || !selectedCandidateForMatchActive) return;

    try {
      const isDirect = selectedCandidateForMatchActive.source === 'Direct Candidate';
      
      const metaLocationFit = isDirect ? JSON.stringify({
        location: matchForm.location_fit,
        cand_id: selectedCandidateForMatchActive.id,
        cand_name: selectedCandidateForMatchActive.name,
        cand_email: selectedCandidateForMatchActive.email,
        cand_phone: selectedCandidateForMatchActive.phone,
        source: selectedCandidateForMatchActive.source
      }) : matchForm.location_fit;

      const matchEntry = {
        candidate_id: isDirect ? null : selectedCandidateForMatchActive.id,
        job_id: selectedJobForMatch.id,
        vendor_id: isDirect ? null : selectedCandidateForMatchActive.vendor_id,
        company_name: isDirect ? 'Direct Candidate Submission' : selectedCandidateForMatchActive.vendor_company_name || 'Talent Partner',
        job_role: selectedJobForMatch.title,
        match_percentage: Number(matchForm.match_percentage),
        salary_fit: matchForm.salary_fit,
        location_fit: metaLocationFit,
        partner_approved: isDirect, 
        status: isDirect ? 'Approved / Submitted' : 'Pending Partner Approval'
      };

      // Check if either candidate or job is a mock fallback item
      if (String(selectedCandidateForMatchActive.id).startsWith('mock_') || String(selectedJobForMatch.id).startsWith('mock_') || String(selectedCandidateForMatchActive.unified_id).startsWith('mock_')) {
        const mockCreated = {
          ...matchEntry,
          id: `mock_m_${Date.now()}`,
          created_at: new Date().toISOString(),
          vendor_candidates: isDirect ? null : {
            name: selectedCandidateForMatchActive.name,
            email: selectedCandidateForMatchActive.email,
            phone: selectedCandidateForMatchActive.phone,
            skills: selectedCandidateForMatchActive.skills_list,
            resume_url: '#'
          }
        };

        setMockMatches(prev => [mockCreated, ...prev]);
        toast({ 
          title: isDirect ? "Submitted Directly to Employer (Mock)!" : "Match Sent to Partner (Mock)!", 
          description: isDirect ? `Candidate ${selectedCandidateForMatchActive.name} submitted for ${selectedJobForMatch.title}.` : `Match proposed to partner. Awaiting partner approval.` 
        });
        setIsMatchActionModalOpen(false);
        return;
      }

      const { data, error } = await supabase.from('job_matches').insert(matchEntry as any).select('*, vendor_candidates(name, email, phone, skills, resume_url)').single();
      if (error) throw error;

      setMatches(prev => [data, ...prev]);

      if (!isDirect) {
        await supabase.from('vendor_candidates').update({ status: 'Submitted to Jobs' } as any).eq('id', selectedCandidateForMatchActive.id);
        setPartnerCandidates(prev => prev.map(c => c.id === selectedCandidateForMatchActive.id ? { ...c, status: 'Submitted to Jobs' } : c));
      } else {
        await supabase.from('candidates').update({ status: 'Screened' } as any).eq('id', selectedCandidateForMatchActive.id);
        setDirectCandidates(prev => prev.map(c => c.id === selectedCandidateForMatchActive.id ? { ...c, status: 'Screened' } : c));
      }

      toast({ 
        title: isDirect ? "Submitted Directly to Employer!" : "Match Sent to Partner!", 
        description: isDirect ? `Candidate ${selectedCandidateForMatchActive.name} submitted for ${selectedJobForMatch.title}.` : `Match proposed to partner. Awaiting partner approval.` 
      });
      setIsMatchActionModalOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Matching Action Failed", description: err.message });
    }
  };

  // Create Job Requisition
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('jobs').insert(jobForm as any).select().single();
      if (error) throw error;

      setJobs(prev => [data, ...prev]);
      toast({ title: "Requisition Published", description: `Job "${jobForm.title}" is now active in the Unified Job Pool.` });
      setJobForm({ title: '', department: 'Engineering', location: 'Remote', employment_type: 'Full-time C2C', salary_range: '$130,000 - $150,000 / $65-$75/hr', description: '' });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error creating job", description: err.message });
    }
  };

  // Handle direct Partner Match Approval/Rejection by Admin
  const handleApprovePartnerMatch = async (matchId: string, approved: boolean) => {
    try {
      const newStatus = approved ? 'Approved / Submitted' : 'Rejected';
      const { error } = await supabase.from('job_matches').update({
        partner_approved: approved,
        status: newStatus
      } as any).eq('id', matchId);

      if (error) throw error;

      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, partner_approved: approved, status: newStatus } : m));
      toast({
        title: approved ? "Match Approved & Submitted" : "Match Rejected",
        description: approved ? "Match approved and moved to Submission Tracker." : "Match rejected."
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action Failed", description: err.message });
    }
  };

  // Update Match Stage
  const handleUpdateMatchStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForUpdate) return;

    try {
      if (selectedMatchForUpdate.id.startsWith('mock_')) {
        setMockMatches(prev => prev.map(m => m.id === selectedMatchForUpdate.id ? { ...m, ...updateForm } : m));
        setMatches(prev => prev.map(m => m.id === selectedMatchForUpdate.id ? { ...m, ...updateForm } : m));
        toast({ title: "Stage Updated", description: `Match moved to ${updateForm.status}.` });
        setIsUpdateModalOpen(false);
        return;
      }

      const { error } = await supabase.from('job_matches').update(updateForm as any).eq('id', selectedMatchForUpdate.id);
      if (error) throw error;

      setMatches(prev => prev.map(m => m.id === selectedMatchForUpdate.id ? { ...m, ...updateForm } : m));
      
      if (updateForm.status === 'Placed' && selectedMatchForUpdate.candidate_id) {
        await supabase.from('vendor_candidates').update({ status: 'Placed' } as any).eq('id', selectedMatchForUpdate.candidate_id);
        setPartnerCandidates(prev => prev.map(c => c.id === selectedMatchForUpdate.candidate_id ? { ...c, status: 'Placed' } : c));
      }

      toast({ title: "Stage Updated", description: `Match moved to ${updateForm.status}.` });
      setIsUpdateModalOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    }
  };

  // Create Revenue Share
  const handleCreateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchForCommission) return;

    const candInfo = getMatchCandidateInfo(selectedMatchForCommission);

    try {
      if (selectedMatchForCommission.id.startsWith('mock_')) {
        const mockRev = {
          id: `mock_r_${Date.now()}`,
          match_id: selectedMatchForCommission.id,
          vendor_id: selectedMatchForCommission.vendor_id || 'mock_vendor_1',
          candidate_name: candInfo.name,
          company_name: selectedMatchForCommission.company_name,
          placement_fee: Number(commissionForm.placement_fee),
          partner_share: Number(commissionForm.partner_share),
          payment_status: 'Pending',
          paid_at: null,
          created_at: new Date().toISOString()
        };
        setMockRevenueShares(prev => [mockRev, ...prev]);
        toast({ title: "Commission Logged", description: `Revenue share created for ${candInfo.name}.` });
        setIsCommissionModalOpen(false);
        return;
      }

      const revEntry = {
        match_id: selectedMatchForCommission.id,
        vendor_id: selectedMatchForCommission.vendor_id,
        candidate_name: candInfo.name,
        company_name: selectedMatchForCommission.company_name,
        placement_fee: Number(commissionForm.placement_fee),
        partner_share: Number(commissionForm.partner_share),
        payment_status: 'Pending'
      };

      const { data, error } = await supabase.from('revenue_shares').insert(revEntry as any).select().single();
      if (error) throw error;

      setRevenueShares(prev => [data, ...prev]);
      toast({ title: "Commission Logged", description: `Revenue share created for ${candInfo.name}.` });
      setIsCommissionModalOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error logging commission", description: err.message });
    }
  };

  // Add Interview News / Schedule directly from Interview Tab
  const handleAddInterviewNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionForInterview) return;

    try {
      // Check if selectedSubmissionForInterview is a candidate from unifiedCandidates
      const isCandidateObj = selectedSubmissionForInterview.unified_id !== undefined;
      
      if (isCandidateObj) {
        const isDirect = selectedSubmissionForInterview.source === 'Direct Candidate';
        const candId = selectedSubmissionForInterview.id;
        const jobRole = selectedSubmissionForInterview.salary_expectation?.replace('Expected for ', '') || 'Consultant Role';
        const realJob = jobs.find(j => !String(j.id).startsWith('mock_'));
        const jobIdToUse = realJob ? realJob.id : (displayJobs[0]?.id || 'mock_j_1');
        
        if (String(candId).startsWith('mock_') || String(jobIdToUse).startsWith('mock_') || (selectedSubmissionForInterview.vendor_id && String(selectedSubmissionForInterview.vendor_id).startsWith('mock_'))) {
          const mockMatch = {
            id: `mock_m_${Date.now()}`,
            candidate_id: isDirect ? null : candId,
            job_id: jobIdToUse,
            vendor_id: isDirect ? null : selectedSubmissionForInterview.vendor_id || 'mock_vendor_1',
            company_name: isDirect ? 'Direct Candidate Submission' : selectedSubmissionForInterview.vendor_company_name || 'Talent Partner',
            job_role: jobRole,
            match_percentage: 95,
            salary_fit: selectedSubmissionForInterview.salary_expectation || 'Negotiable',
            location_fit: isDirect ? JSON.stringify({
              location: selectedSubmissionForInterview.location || 'Remote',
              cand_id: candId,
              cand_name: selectedSubmissionForInterview.name,
              cand_email: selectedSubmissionForInterview.email,
              cand_phone: selectedSubmissionForInterview.phone,
              source: 'Direct Candidate'
            }) : selectedSubmissionForInterview.location || 'Remote',
            partner_approved: true,
            status: newInterviewForm.status,
            interview_schedule: newInterviewForm.interview_schedule,
            interview_feedback: newInterviewForm.interview_feedback,
            created_at: new Date().toISOString(),
            vendor_candidates: isDirect ? null : {
              name: selectedSubmissionForInterview.name,
              email: selectedSubmissionForInterview.email,
              phone: selectedSubmissionForInterview.phone,
              skills: selectedSubmissionForInterview.skills_list,
              resume_url: '#'
            }
          };
          setMockMatches(prev => [mockMatch, ...prev]);
          setMatches(prev => [mockMatch, ...prev]);
          toast({ title: "Interview Scheduled (Mock Job)!", description: `Created interview schedule for ${selectedSubmissionForInterview.name}.` });
          setIsAddInterviewModalOpen(false);
          setNewInterviewForm({ interview_schedule: '', interview_feedback: '', status: 'Interview' });
          return;
        }

        const metaLoc = isDirect ? JSON.stringify({
          location: selectedSubmissionForInterview.location || 'Remote',
          cand_id: candId,
          cand_name: selectedSubmissionForInterview.name,
          cand_email: selectedSubmissionForInterview.email,
          cand_phone: selectedSubmissionForInterview.phone,
          source: 'Direct Candidate'
        }) : selectedSubmissionForInterview.location || 'Remote';

        const matchEntry = {
          candidate_id: isDirect ? null : candId,
          job_id: jobIdToUse,
          vendor_id: isDirect ? null : selectedSubmissionForInterview.vendor_id || null,
          company_name: isDirect ? 'Direct Candidate Submission' : selectedSubmissionForInterview.vendor_company_name || 'Talent Partner',
          job_role: jobRole,
          match_percentage: 95,
          salary_fit: selectedSubmissionForInterview.salary_expectation || 'Negotiable',
          location_fit: metaLoc,
          partner_approved: true,
          status: newInterviewForm.status,
          interview_schedule: newInterviewForm.interview_schedule,
          interview_feedback: newInterviewForm.interview_feedback
        };

        const { data, error } = await supabase.from('job_matches').insert(matchEntry as any).select('*, vendor_candidates(name, email, phone, skills, resume_url)').single();
        if (error) throw error;

        setMatches(prev => [data, ...prev]);
        toast({ title: "Interview Scheduled!", description: `Created interview schedule for ${selectedSubmissionForInterview.name}.` });
        setIsAddInterviewModalOpen(false);
        setNewInterviewForm({ interview_schedule: '', interview_feedback: '', status: 'Interview' });
        return;
      }

      // Otherwise, it's an existing match object
      const updateData = {
        status: newInterviewForm.status,
        interview_schedule: newInterviewForm.interview_schedule,
        interview_feedback: newInterviewForm.interview_feedback
      };

      if (selectedSubmissionForInterview.id.startsWith('mock_')) {
        setMockMatches(prev => prev.map(m => m.id === selectedSubmissionForInterview.id ? { ...m, ...updateData } : m));
        setMatches(prev => prev.map(m => m.id === selectedSubmissionForInterview.id ? { ...m, ...updateData } : m));
        toast({ title: "Interview News Added!", description: `Updated schedule and news for ${getMatchCandidateInfo(selectedSubmissionForInterview).name}.` });
        setIsAddInterviewModalOpen(false);
        setNewInterviewForm({ interview_schedule: '', interview_feedback: '', status: 'Interview' });
        return;
      }

      const { error } = await supabase.from('job_matches').update(updateData as any).eq('id', selectedSubmissionForInterview.id);
      if (error) throw error;

      setMatches(prev => prev.map(m => m.id === selectedSubmissionForInterview.id ? { ...m, ...updateData } : m));
      toast({ title: "Interview News Added!", description: `Updated schedule and news for ${getMatchCandidateInfo(selectedSubmissionForInterview).name}.` });
      setIsAddInterviewModalOpen(false);
      setNewInterviewForm({ interview_schedule: '', interview_feedback: '', status: 'Interview' });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to add interview news", description: err.message });
    }
  };

  // Send Partner Message
  const handleSendPartnerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartnerForChat) return;

    try {
      if (selectedPartnerForChat.startsWith('mock_')) {
        const mockMsg = {
          id: `mock_msg_${Date.now()}`,
          vendor_id: selectedPartnerForChat,
          sender_id: 'admin_user',
          sender_name: 'SA Master Admin',
          sender_role: 'admin',
          message: newMessage.trim(),
          created_at: new Date().toISOString()
        };
        setPartnerMessages(prev => [...prev, mockMsg]);
        setNewMessage('');
        return;
      }

      const msg = {
        vendor_id: selectedPartnerForChat,
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        sender_name: 'SA Master Admin',
        sender_role: 'admin',
        message: newMessage.trim()
      };

      const { data, error } = await supabase.from('partner_messages').insert(msg as any).select().single();
      if (error) throw error;

      setPartnerMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error sending message", description: err.message });
    }
  };

  // Open Candidate Profile Intelligence Modal
  const openProfileModal = (candidate: any) => {
    setSelectedCandidateForProfile(candidate);
    setIsProfileModalOpen(true);
  };

  // Open Match Action Modal
  const openMatchActionModal = (candidate: any, job: any) => {
    setSelectedCandidateForMatchActive(candidate);
    setSelectedJobForMatch(job);
    setIsMatchActionModalOpen(true);
  };

  // Open Update Modal
  const openUpdateModal = (match: any) => {
    setSelectedMatchForUpdate(match);
    setUpdateForm({
      status: match.status || 'Interview',
      interview_schedule: match.interview_schedule || '',
      interview_feedback: match.interview_feedback || '',
      offered_salary: match.offered_salary || '',
      joining_date: match.joining_date || ''
    });
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="space-y-8 font-sans animate-fade-in">
      
      {/* SECTION 1: MASTER DASHBOARD CONTROL TOWER HEADER */}
      <div className="bg-gradient-to-r from-secondary/40 via-background to-secondary/20 p-6 sm:p-8 rounded-3xl border border-primary/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-none text-xs font-extrabold px-3 py-1 uppercase tracking-wider">
                🧠 Master Control Tower
              </Badge>
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <Clock size={12} /> Live System Status
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold gradient-text tracking-tight">Admin Master Brain</h2>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              The central operational intelligence hub connecting Direct Candidates, Employer Requisitions, and C2C Talent Partners into a unified matching engine.
            </p>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Button onClick={() => setActiveTab('matching')} className="gradient-bg h-12 px-6 rounded-2xl font-bold shadow-lg gap-2 text-white hover:opacity-90 transition-all">
              <Sparkles size={18} /> Golden Matching Engine
            </Button>
            <Button onClick={() => setActiveTab('jobs')} variant="outline" className="glass h-12 px-6 rounded-2xl font-bold border-primary/20 gap-2 hover:bg-primary/5">
              <Plus size={18} /> Post Requisition
            </Button>
          </div>
        </div>

        {/* LIVE SYSTEM KPI RIBBON */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8 pt-8 border-t border-primary/10">
          <div className="glass p-4 rounded-2xl border border-primary/10 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
              <Users size={14} className="text-blue-500" /> New Candidates
            </span>
            <div className="text-2xl font-extrabold text-foreground mt-2">{metrics.newCandCount}</div>
            <span className="text-[10px] text-blue-500 font-semibold mt-1">Direct + Partners</span>
          </div>
          <div className="glass p-4 rounded-2xl border border-primary/10 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
              <Briefcase size={14} className="text-purple-500" /> Active Jobs
            </span>
            <div className="text-2xl font-extrabold text-foreground mt-2">{metrics.openJobsCount}</div>
            <span className="text-[10px] text-purple-500 font-semibold mt-1">From Employers</span>
          </div>
          <div className="glass p-4 rounded-2xl border border-primary/10 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
              <UserCheck size={14} className="text-yellow-500" /> Pending Matches
            </span>
            <div className="text-2xl font-extrabold text-foreground mt-2">{metrics.pendingMatchesCount}</div>
            <span className="text-[10px] text-yellow-600 font-semibold mt-1">Awaiting Approval</span>
          </div>
          <div className="glass p-4 rounded-2xl border border-primary/10 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
              <Calendar size={14} className="text-indigo-500" /> Interviews
            </span>
            <div className="text-2xl font-extrabold text-foreground mt-2">{metrics.interviewingCount}</div>
            <span className="text-[10px] text-indigo-500 font-semibold mt-1">Active Schedules</span>
          </div>
          <div className="glass p-4 rounded-2xl border border-primary/10 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
              <Award size={14} className="text-green-500" /> Offers Rolled Out
            </span>
            <div className="text-2xl font-extrabold text-foreground mt-2">{metrics.offeredCount}</div>
            <span className="text-[10px] text-green-600 font-semibold mt-1">In Progress</span>
          </div>
          <div className="glass p-4 rounded-2xl border border-primary/10 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
              <TrendingUp size={14} className="text-emerald-500" /> Placements
            </span>
            <div className="text-2xl font-extrabold text-foreground mt-2">{metrics.placedCount}</div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1">This Month</span>
          </div>
        </div>
      </div>

      {/* GOLDEN RULE QUICK ANSWER BANNER (10-Second Matching Answer) */}
      <Card className="glass-strong border-primary/30 shadow-xl relative overflow-hidden bg-gradient-to-r from-primary/10 via-background to-accent/5">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-accent animate-pulse" size={24} />
            <CardTitle className="text-xl font-display font-bold gradient-text">
              Golden Rule Intelligence: “Which candidate can I send to which job right now?”
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            System-generated optimal match pairs calculated instantly from active employer requisitions and available unified talent pools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {goldenMatches.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm font-semibold">
              No immediate high-confidence matches found. Add more candidates or job requisitions to generate AI pairings.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goldenMatches.map((gm, idx) => (
                <div key={idx} className="glass p-5 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between space-y-4 bg-background/50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-primary/10 pb-2">
                      <span className="font-extrabold text-foreground text-base truncate">{gm.candidate.name}</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-none text-xs font-bold shrink-0">
                        {gm.matchScore}% Match
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <Briefcase size={12} className="text-purple-500" /> {gm.job.title}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Building2 size={12} /> {gm.job.department || 'Client Requisition'} • {gm.job.location || 'Remote'}
                      </div>
                      <div className="text-[11px] text-muted-foreground italic mt-2 bg-primary/5 p-2 rounded-xl border border-primary/10">
                        💡 {gm.reason}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-primary/10">
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-secondary/50 text-secondary-foreground">
                      {gm.candidate.source}
                    </Badge>
                    <Button onClick={() => openMatchActionModal(gm.candidate, gm.job)} size="sm" className="gradient-bg font-bold h-8 px-4 rounded-xl shadow-md gap-1 text-white hover:opacity-90">
                      <Send size={12} /> Propose Submission
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MASTER NAVIGATION TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="glass-strong flex flex-wrap justify-start gap-2 p-1.5 h-auto w-full border border-primary/20 shadow-lg rounded-2xl bg-background/40 backdrop-blur-2xl">
          <TabsTrigger value="dashboard" className="gap-2 px-4 py-2.5 text-sm font-bold data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl transition-all shadow-sm">
            <BarChart3 size={16} /> Master Dashboard
          </TabsTrigger>
          <TabsTrigger value="candidates" className="gap-2 px-4 py-2.5 text-sm font-bold data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl transition-all shadow-sm">
            <Users size={16} /> Unified Candidate Pool ({filteredCandidates.length})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2 px-4 py-2.5 text-sm font-bold data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl transition-all shadow-sm">
            <Briefcase size={16} /> Unified Job Pool ({displayJobs.length})
          </TabsTrigger>
          <TabsTrigger value="matching" className="gap-2 px-4 py-2.5 text-sm font-bold data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl transition-all shadow-sm relative">
            <Sparkles size={16} /> Matching Screen
          </TabsTrigger>
          <TabsTrigger value="approvals" className="gap-2 px-4 py-2.5 text-sm font-bold data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl transition-all shadow-sm relative">
            <UserCheck size={16} /> Partner Approval Queue ({displayMatches.filter(m => m.status === 'Pending Partner Approval').length})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2 px-4 py-2.5 text-sm font-bold data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl transition-all shadow-sm">
            <ShieldCheck size={16} /> Submission Tracker ({displayMatches.length})
          </TabsTrigger>
          <TabsTrigger value="interviews" className="gap-2 px-4 py-2.5 text-sm font-bold data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl transition-all shadow-sm">
            <Calendar size={16} /> Interview & Offers
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2 px-4 py-2.5 text-sm font-bold data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl transition-all shadow-sm">
            <TrendingUp size={16} /> Revenue Tracker
          </TabsTrigger>
          <TabsTrigger value="communication" className="gap-2 px-4 py-2.5 text-sm font-bold data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl transition-all shadow-sm">
            <MessageSquare size={16} /> Communication Hub
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 px-4 py-2.5 text-sm font-bold data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl transition-all shadow-sm">
            <BarChart3 size={16} /> Reports & Analytics
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MASTER DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass border-primary/20 md:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                  <Clock className="text-primary" size={20} /> Operational Activity Feed
                </CardTitle>
                <CardDescription>Live timeline of candidate submissions, interview schedules, and partner approvals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayMatches.slice(0, 5).map(m => {
                  const cInfo = getMatchCandidateInfo(m);
                  return (
                    <div key={m.id} className="p-4 rounded-2xl glass border border-primary/10 flex items-center justify-between gap-4 bg-background/50">
                      <div className="space-y-1">
                        <div className="font-bold text-foreground text-sm flex items-center gap-2">
                          <span>{cInfo.name}</span>
                          <Badge variant="outline" className="bg-primary/5 text-primary border-none text-[10px] font-bold">
                            {m.job_role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Company: {m.company_name} • Stage: <span className="font-bold text-foreground">{m.status}</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => openUpdateModal(m)} size="sm" variant="outline" className="h-8 text-xs font-bold border-primary/20 hover:bg-primary/10">
                          Manage Stage
                        </Button>
                        <Button onClick={() => handleDeleteItem('job_matches', m.id)} size="sm" variant="outline" className="h-8 border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold px-2">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="glass border-primary/20 shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                  <TrendingUp className="text-primary" size={20} /> Quick Revenue Overview
                </CardTitle>
                <CardDescription>Monthly placement fees and partner shares.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center space-y-1">
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Placement Fees</div>
                  <div className="text-3xl font-extrabold text-primary">
                    ${displayRevenueShares.reduce((acc, r) => acc + Number(r.placement_fee), 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-center space-y-1">
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Partner Commission Shares</div>
                  <div className="text-3xl font-extrabold text-secondary-foreground">
                    ${displayRevenueShares.reduce((acc, r) => acc + Number(r.partner_share), 0).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: UNIFIED CANDIDATE POOL */}
        <TabsContent value="candidates" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="glass border-primary/20 shadow-xl">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-primary/10">
              <div>
                <CardTitle className="text-2xl font-display font-bold flex items-center gap-2">
                  <Users className="text-primary" size={24} /> Unified Candidate Pool ({filteredCandidates.length})
                </CardTitle>
                <CardDescription>Combined talent inventory from Direct Candidates and C2C Talent Partners.</CardDescription>
              </div>

              {/* Filters Toolbar */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-background/60 px-3 py-1.5 rounded-xl border border-primary/20 shadow-sm">
                  <Filter size={16} className="text-muted-foreground" />
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="border-none bg-transparent h-8 text-xs font-bold w-[160px] shadow-none focus:ring-0">
                      <SelectValue placeholder="Filter Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="direct">Direct Candidates</SelectItem>
                      <SelectItem value="partner">Talent Partners</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative flex-1 md:w-48">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filter by skill..." 
                    value={skillFilter} 
                    onChange={e => setSkillFilter(e.target.value)}
                    className="pl-9 h-10 bg-background/60 rounded-xl border-primary/20 text-xs font-medium"
                  />
                </div>

                <div className="relative w-32">
                  <Input 
                    placeholder="Location..." 
                    value={locationFilter} 
                    onChange={e => setLocationFilter(e.target.value)}
                    className="h-10 bg-background/60 rounded-xl border-primary/20 text-xs font-medium"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredCandidates.length === 0 ? (
                <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                  <Users size={48} className="mx-auto text-muted-foreground mb-3 opacity-40" />
                  <p className="font-bold text-foreground text-lg">No candidates found matching filters.</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">Try broadening your search or resetting the source filters above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-4 px-4">Candidate Name</th>
                        <th className="py-4 px-4">Source Tag</th>
                        <th className="py-4 px-4">Top Skills</th>
                        <th className="py-4 px-4">Exp.</th>
                        <th className="py-4 px-4">Location</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10 text-sm">
                      {filteredCandidates.map(cand => (
                        <tr key={cand.unified_id} className="hover:bg-primary/5 transition-colors">
                          <td className="py-4 px-4 font-bold text-foreground flex items-center gap-2">
                            {cand.name}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className={`border-none font-bold text-xs py-1 px-2.5 shadow-sm ${
                              cand.source === 'Direct Candidate' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
                            }`}>
                              {cand.source_detail}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {cand.skills_list.slice(0, 3).map((skill: string) => (
                                <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-semibold">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-muted-foreground font-medium">{cand.experience_years || 'N/A'}</td>
                          <td className="py-4 px-4 text-muted-foreground font-medium">{cand.location || 'Remote'}</td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none font-bold text-xs shadow-sm">
                              {cand.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            <Button onClick={() => openProfileModal(cand)} variant="outline" size="sm" className="h-8 font-bold border-primary/20 hover:bg-primary/10 gap-1">
                              <FileText size={14} /> Intelligence
                            </Button>
                            <Button onClick={() => openMatchActionModal(cand, displayJobs[0] || { id: 'mock_j_1', title: 'Senior React Developer' })} size="sm" className="gradient-bg font-bold shadow-md h-8 gap-1 text-white hover:opacity-90">
                              <Sparkles size={14} /> Match
                            </Button>
                            <Button onClick={() => handleDeleteItem(cand.source === 'Direct Candidate' ? 'candidates' : 'vendor_candidates', cand.unified_id)} size="sm" variant="outline" className="h-8 border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold px-2.5">
                              <Trash2 size={14} />
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

        {/* TAB 3: UNIFIED JOB POOL */}
        <TabsContent value="jobs" className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass border-primary/20 shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
                  <Plus className="text-primary" size={20} /> Post Employer Requisition
                </CardTitle>
                <CardDescription>Add new open job requirements to the Unified Job Pool.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mj-title">Job Title *</Label>
                    <Input id="mj-title" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} placeholder="Senior React Developer" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mj-dept">Company / Department</Label>
                    <Input id="mj-dept" value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} placeholder="TechCorp / Engineering" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mj-loc">Location</Label>
                    <Input id="mj-loc" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="Remote / New York, NY" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mj-type">Employment Type</Label>
                    <Input id="mj-type" value={jobForm.employment_type} onChange={e => setJobForm({...jobForm, employment_type: e.target.value})} placeholder="Full-time C2C" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mj-sal">Budget / Rate Range</Label>
                    <Input id="mj-sal" value={jobForm.salary_range} onChange={e => setJobForm({...jobForm, salary_range: e.target.value})} placeholder="$130k-$150k / $65-$75/hr" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mj-desc">Description</Label>
                    <Textarea id="mj-desc" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} placeholder="Job requirements and responsibilities..." className="bg-background/50 min-h-[100px]" />
                  </div>
                  <Button type="submit" className="gradient-bg w-full font-bold shadow-md text-white hover:opacity-90">
                    Publish Requisition
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="glass border-primary/20 md:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                  <Briefcase className="text-primary" size={24} /> Unified Job Pool ({displayJobs.length})
                </CardTitle>
                <CardDescription>Open requisitions from all client employers across the marketplace.</CardDescription>
              </CardHeader>
              <CardContent>
                {displayJobs.length === 0 ? (
                  <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                    <Briefcase size={48} className="mx-auto text-muted-foreground mb-3 opacity-40" />
                    <p className="font-bold text-foreground text-lg">No active job requisitions.</p>
                  </div>
                ) : (
                  displayJobs.map(job => (
                    <div key={job.id} className="p-5 rounded-2xl glass border border-primary/15 hover:border-primary/30 transition-all shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background/50 mb-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-foreground text-lg">{job.title}</h4>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-none text-xs font-bold px-2.5 py-0.5">
                            {job.employment_type}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-semibold">
                          <span className="flex items-center gap-1"><Building2 size={14} /> {job.department || 'Client Requisition'}</span>
                          <span className="flex items-center gap-1"><MapPin size={14} /> {job.location || 'Remote'}</span>
                          <span className="flex items-center gap-1"><DollarSign size={14} /> {job.salary_range}</span>
                        </div>
                        {job.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{job.description}</p>}
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none font-extrabold text-xs px-3 py-1 w-full sm:w-auto text-center">
                          {job.status}
                        </Badge>
                        <Button onClick={() => { setSelectedJobForMatch(job); setActiveTab('matching'); }} size="sm" className="gradient-bg font-bold h-9 px-4 rounded-xl shadow-md gap-1 text-white hover:opacity-90 w-full sm:w-auto">
                          <Sparkles size={14} /> Find Matches
                        </Button>
                        <Button onClick={() => handleDeleteItem('jobs', job.id)} size="sm" variant="outline" className="h-9 border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold px-3 w-full sm:w-auto gap-1">
                          <Trash2 size={14} /> Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: MATCHING SCREEN (MOST POWERFUL SCREEN) */}
        <TabsContent value="matching" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="glass border-primary/20 shadow-xl">
            <CardHeader className="border-b border-primary/10 pb-6 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
              <CardTitle className="text-2xl font-display font-bold flex items-center gap-2">
                <Sparkles className="text-primary" size={24} /> Ultimate Matching Screen
              </CardTitle>
              <CardDescription>
                Select a Job Requisition or a Candidate below to instantly generate AI-driven optimal pairings across the entire marketplace.
              </CardDescription>

              <div className="grid md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-2 bg-background/80 p-4 rounded-2xl border border-primary/20 shadow-sm">
                  <Label className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Briefcase size={14} /> 1. Select Employer Job Requisition
                  </Label>
                  <Select value={selectedJobForMatch?.id || ''} onValueChange={val => setSelectedJobForMatch(displayJobs.find(j => j.id === val))}>
                    <SelectTrigger className="bg-background font-bold h-11 rounded-xl border-primary/20 shadow-sm">
                      <SelectValue placeholder="Choose Job Requisition..." />
                    </SelectTrigger>
                    <SelectContent>
                      {displayJobs.map(j => (
                        <SelectItem key={j.id} value={j.id} className="font-semibold">{j.title} ({j.department || 'Client'})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 bg-background/80 p-4 rounded-2xl border border-primary/20 shadow-sm">
                  <Label className="text-xs font-extrabold text-secondary-foreground uppercase tracking-wider flex items-center gap-1">
                    <Users size={14} /> 2. Or Select Candidate to Find Jobs
                  </Label>
                  <Select value={selectedCandidateForMatchActive?.unified_id || ''} onValueChange={val => setSelectedCandidateForMatchActive(unifiedCandidates.find(c => c.unified_id === val))}>
                    <SelectTrigger className="bg-background font-bold h-11 rounded-xl border-primary/20 shadow-sm">
                      <SelectValue placeholder="Choose Candidate..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unifiedCandidates.map(c => (
                        <SelectItem key={c.unified_id} value={c.unified_id} className="font-semibold">{c.name} ({c.source})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              {selectedJobForMatch ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="text-primary" size={20} /> Best Matching Candidates for <span className="text-primary font-extrabold">"{selectedJobForMatch.title}"</span>
                    </h3>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-none font-bold text-xs px-3 py-1">
                      Entire Pool Scanned
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unifiedCandidates.map((cand, idx) => {
                      const baseScore = Math.min(85 + (idx * 3) + (cand.skills_list.length * 2), 98);
                      return (
                        <div key={cand.unified_id} className="glass p-6 rounded-3xl border border-primary/20 hover:border-primary/40 transition-all shadow-lg flex flex-col justify-between space-y-6 bg-background/60 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-[30px] -z-10" />
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-extrabold text-foreground text-lg">{cand.name}</h4>
                                <div className="text-xs text-muted-foreground font-semibold mt-0.5">{cand.email}</div>
                              </div>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-none text-sm font-extrabold px-3 py-1 shrink-0 shadow-sm">
                                {baseScore}% Match
                              </Badge>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-1 font-semibold text-foreground">
                                <Award size={14} className="text-purple-500" /> Source: <span className="text-primary font-bold">{cand.source_detail}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground font-medium">
                                <MapPin size={14} /> Location: {cand.location || 'Remote'}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground font-medium">
                                <DollarSign size={14} /> Rate Exp: {cand.salary_expectation || 'Negotiable'}
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-primary/10">
                              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Top Skills Alignment</div>
                              <div className="flex flex-wrap gap-1">
                                {cand.skills_list.slice(0, 4).map((skill: string) => (
                                  <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2 py-0.5">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <Button onClick={() => openMatchActionModal(cand, selectedJobForMatch)} className="gradient-bg w-full font-bold h-11 rounded-xl shadow-md gap-2 text-white hover:opacity-90 transition-all">
                            <Send size={16} /> {cand.source === 'Direct Candidate' ? 'Submit Directly to Employer' : 'Send to Partner Approval'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : selectedCandidateForMatchActive ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="text-primary" size={20} /> Best Matching Jobs for <span className="text-primary font-extrabold">"{selectedCandidateForMatchActive.name}"</span>
                    </h3>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-none font-bold text-xs px-3 py-1">
                      Active Requisitions Scanned
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayJobs.map((job, idx) => {
                      const baseScore = Math.min(88 + (idx * 2), 99);
                      return (
                        <div key={job.id} className="glass p-6 rounded-3xl border border-primary/20 hover:border-primary/40 transition-all shadow-lg flex flex-col justify-between space-y-6 bg-background/60 relative overflow-hidden">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-extrabold text-foreground text-lg">{job.title}</h4>
                                <div className="text-xs text-muted-foreground font-semibold mt-0.5">{job.department || 'Client Requisition'}</div>
                              </div>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-none text-sm font-extrabold px-3 py-1 shrink-0 shadow-sm">
                                {baseScore}% Match
                              </Badge>
                            </div>

                            <div className="space-y-2 text-xs font-medium text-muted-foreground">
                              <div className="flex items-center gap-1"><MapPin size={14} className="text-primary" /> {job.location || 'Remote'}</div>
                              <div className="flex items-center gap-1"><DollarSign size={14} className="text-green-500" /> {job.salary_range}</div>
                              <div className="flex items-center gap-1"><Briefcase size={14} className="text-purple-500" /> {job.employment_type}</div>
                            </div>
                            {job.description && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed border-t border-primary/10 pt-2">{job.description}</p>}
                          </div>

                          <Button onClick={() => openMatchActionModal(selectedCandidateForMatchActive, job)} className="gradient-bg w-full font-bold h-11 rounded-xl shadow-md gap-2 text-white hover:opacity-90 transition-all">
                            <Send size={16} /> {selectedCandidateForMatchActive.source === 'Direct Candidate' ? 'Submit Directly to Employer' : 'Send to Partner Approval'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center glass rounded-3xl border border-primary/20 shadow-sm bg-background/40">
                  <Sparkles size={56} className="mx-auto text-primary mb-4 animate-bounce" />
                  <p className="font-extrabold text-foreground text-xl">The Matching Engine is Ready</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
                    Select a Job Requisition or a Candidate from the dropdown menus above to initialize the AI matching matrix and discover high-conversion placement opportunities.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: PARTNER APPROVAL QUEUE */}
        <TabsContent value="approvals" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="glass border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                <UserCheck className="text-primary" size={24} /> Partner Approval Queue ({displayMatches.filter(m => m.status === 'Pending Partner Approval').length})
              </CardTitle>
              <CardDescription>Job match proposals currently awaiting consent on the Talent Partner's Magic Screen.</CardDescription>
            </CardHeader>
            <CardContent>
              {displayMatches.filter(m => m.status === 'Pending Partner Approval').length === 0 ? (
                <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                  <UserCheck size={48} className="mx-auto text-muted-foreground mb-3 opacity-40" />
                  <p className="font-bold text-foreground text-lg">No matches pending approval.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-4 px-4">Candidate Name</th>
                        <th className="py-4 px-4">Talent Partner</th>
                        <th className="py-4 px-4">Job Role</th>
                        <th className="py-4 px-4">Match Score</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10 text-sm">
                      {displayMatches.filter(m => m.status === 'Pending Partner Approval').map(match => {
                        const cInfo = getMatchCandidateInfo(match);
                        return (
                          <tr key={match.id} className="hover:bg-primary/5 transition-colors">
                            <td className="py-4 px-4 font-bold text-foreground">{cInfo.name}</td>
                            <td className="py-4 px-4 font-semibold text-primary">{match.company_name}</td>
                            <td className="py-4 px-4 font-semibold text-foreground">{match.job_role}</td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className="bg-primary/10 text-primary border-none font-extrabold text-xs px-2.5 py-1">
                                {match.match_percentage}% Match
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-none font-bold text-xs px-3 py-1 shadow-sm">
                                Awaiting Partner Consent
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right space-x-2">
                              <Button onClick={() => handleApprovePartnerMatch(match.id, true)} size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white font-bold gap-1 shadow-sm">
                                <CheckCircle2 size={14} /> Approve & Submit
                              </Button>
                              <Button onClick={() => handleApprovePartnerMatch(match.id, false)} size="sm" variant="outline" className="h-8 border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold gap-1">
                                <X size={14} /> Reject
                              </Button>
                              <Button onClick={() => openUpdateModal(match)} variant="outline" size="sm" className="h-8 font-bold border-primary/20 hover:bg-primary/10">
                                Override Stage
                              </Button>
                              <Button onClick={() => handleDeleteItem('job_matches', match.id)} size="sm" variant="outline" className="h-8 border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold px-2.5">
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: SUBMISSION TRACKER */}
        <TabsContent value="submissions" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="glass border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                <ShieldCheck className="text-primary" size={24} /> Unified Submission Tracker ({displayMatches.length})
              </CardTitle>
              <CardDescription>Comprehensive tracking matrix of all active candidate submissions across the entire system.</CardDescription>
            </CardHeader>
            <CardContent>
              {displayMatches.length === 0 ? (
                <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                  <ShieldCheck size={48} className="mx-auto text-muted-foreground mb-3 opacity-40" />
                  <p className="font-bold text-foreground text-lg">No active submissions found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-4 px-4">Candidate</th>
                        <th className="py-4 px-4">Client Company</th>
                        <th className="py-4 px-4">Job Role</th>
                        <th className="py-4 px-4">Source Tag</th>
                        <th className="py-4 px-4">Live Stage</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10 text-sm">
                      {displayMatches.map(match => {
                        const cInfo = getMatchCandidateInfo(match);
                        return (
                          <tr key={match.id} className="hover:bg-primary/5 transition-colors">
                            <td className="py-4 px-4 font-bold text-foreground">
                              {cInfo.name}
                            </td>
                            <td className="py-4 px-4 font-semibold text-muted-foreground">{match.company_name}</td>
                            <td className="py-4 px-4 font-bold text-foreground">{match.job_role}</td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className={`border-none font-bold text-xs py-1 px-2.5 shadow-sm ${
                                cInfo.isDirect ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
                              }`}>
                                {cInfo.source}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className={`border-none font-bold text-xs px-3 py-1 shadow-sm ${
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
                            <td className="py-4 px-4 text-right space-x-2">
                              <Button onClick={() => openUpdateModal(match)} variant="outline" size="sm" className="h-8 font-bold border-primary/20 hover:bg-primary/10">
                                Update Stage
                              </Button>
                              {match.status === 'Placed' && (
                                <Button onClick={() => { setSelectedMatchForCommission(match); setIsCommissionModalOpen(true); }} size="sm" className="h-8 gradient-bg font-bold shadow-md gap-1 text-white hover:opacity-90">
                                  <DollarSign size={14} /> Log Commission
                                </Button>
                              )}
                              <Button onClick={() => handleDeleteItem('job_matches', match.id)} size="sm" variant="outline" className="h-8 border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold px-2.5">
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 7: INTERVIEW & OFFERS */}
        <TabsContent value="interviews" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="glass border-primary/20 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                  <Calendar className="text-primary" size={24} /> Interview & Offer Management
                </CardTitle>
                <CardDescription>Coordinate active interview schedules, collect client feedback, and track offer rollouts.</CardDescription>
              </div>
              <Button onClick={() => {
                const eligible = displayMatches.filter(m => m.status !== 'Placed' && m.status !== 'Rejected');
                if (eligible.length > 0) setSelectedSubmissionForInterview(eligible[0]);
                setIsAddInterviewModalOpen(true);
              }} className="gradient-bg font-bold shadow-md h-10 px-4 rounded-xl text-white hover:opacity-90 gap-2 shrink-0">
                <Plus size={16} /> Schedule / Add Interview News
              </Button>
            </CardHeader>
            <CardContent>
              {displayMatches.filter(m => m.status === 'Interview' || m.status === 'Offered').length === 0 ? (
                <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                  <Calendar size={48} className="mx-auto text-muted-foreground mb-3 opacity-40" />
                  <p className="font-bold text-foreground text-lg">No active interviews or offers.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-4 px-4">Candidate</th>
                        <th className="py-4 px-4">Job Role</th>
                        <th className="py-4 px-4">Stage</th>
                        <th className="py-4 px-4">Schedule & Feedback</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10 text-sm">
                      {displayMatches.filter(m => m.status === 'Interview' || m.status === 'Offered').map(match => {
                        const cInfo = getMatchCandidateInfo(match);
                        return (
                          <tr key={match.id} className="hover:bg-primary/5 transition-colors">
                            <td className="py-4 px-4 font-bold text-foreground">{cInfo.name}</td>
                            <td className="py-4 px-4 font-semibold text-foreground">{match.job_role}</td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className={`border-none font-bold text-xs px-3 py-1 shadow-sm ${
                                match.status === 'Offered' ? 'bg-green-500/10 text-green-600' : 'bg-purple-500/10 text-purple-500'
                              }`}>
                                {match.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-xs text-muted-foreground max-w-xs space-y-1">
                              <div><span className="font-bold text-foreground">Schedule:</span> {match.interview_schedule || 'Pending Schedule'}</div>
                              <div><span className="font-bold text-foreground">Feedback:</span> {match.interview_feedback || 'Awaiting Feedback'}</div>
                              {match.offered_salary && <div className="text-primary font-bold">Offer: {match.offered_salary}</div>}
                            </td>
                            <td className="py-4 px-4 text-right space-x-2">
                              <Button onClick={() => openUpdateModal(match)} variant="outline" size="sm" className="h-8 font-bold border-primary/20 hover:bg-primary/10">
                                Manage Interview / Offer
                              </Button>
                              <Button onClick={() => handleDeleteItem('job_matches', match.id)} size="sm" variant="outline" className="h-8 border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold px-2.5">
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 8: REVENUE TRACKER */}
        <TabsContent value="revenue" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="glass border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                <TrendingUp className="text-primary" size={24} /> Revenue & Placement Tracker
              </CardTitle>
              <CardDescription>Track total placement fees, calculate partner commission splits, and manage payout settlements.</CardDescription>
            </CardHeader>
            <CardContent>
              {displayRevenueShares.length === 0 ? (
                <div className="p-12 text-center glass rounded-2xl border border-primary/10">
                  <DollarSign size={48} className="mx-auto text-muted-foreground mb-3 opacity-40" />
                  <p className="font-bold text-foreground text-lg">No revenue records found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-4 px-4">Candidate Name</th>
                        <th className="py-4 px-4">Client Company</th>
                        <th className="py-4 px-4">Total Fee</th>
                        <th className="py-4 px-4 font-bold text-primary">Partner Share</th>
                        <th className="py-4 px-4">Payment Status</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10 text-sm">
                      {displayRevenueShares.map(rev => (
                        <tr key={rev.id} className="hover:bg-primary/5 transition-colors">
                          <td className="py-4 px-4 font-bold text-foreground">{rev.candidate_name}</td>
                          <td className="py-4 px-4 font-semibold text-muted-foreground">{rev.company_name}</td>
                          <td className="py-4 px-4 font-medium text-foreground">${Number(rev.placement_fee).toLocaleString()}</td>
                          <td className="py-4 px-4 font-bold text-primary text-base">${Number(rev.partner_share).toLocaleString()}</td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className={`border-none font-bold text-xs px-3 py-1 shadow-sm ${
                              rev.payment_status === 'Paid' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                            }`}>
                              {rev.payment_status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2 shrink-0">
                            {rev.payment_status === 'Pending' ? (
                              <Button onClick={() => handleTogglePaymentStatus(rev.id, 'Paid')} size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md gap-1">
                                <CheckCircle2 size={14} /> Mark Paid
                              </Button>
                            ) : (
                              <Button onClick={() => handleTogglePaymentStatus(rev.id, 'Pending')} size="sm" variant="outline" className="h-8 border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10 font-bold shadow-md gap-1">
                                <X size={14} /> Mark Unpaid (Pending)
                              </Button>
                            )}
                            <Button onClick={() => handleDeleteItem('revenue_shares', rev.id)} size="sm" variant="outline" className="h-8 border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold px-2.5">
                              <Trash2 size={14} />
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

        {/* TAB 9: COMMUNICATION HUB */}
        <TabsContent value="communication" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="glass border-primary/20 shadow-sm flex flex-col h-[650px] overflow-hidden">
            <CardHeader className="border-b border-primary/10 pb-4 bg-secondary/20 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                  <MessageSquare className="text-primary" size={24} /> Master Communication Hub
                </CardTitle>
                <CardDescription>Centralized messaging interface connecting Candidates, Employers, and Talent Partners.</CardDescription>
              </div>

              <div className="flex gap-2 bg-background/60 p-1 rounded-2xl border border-primary/20 shadow-sm w-full sm:w-auto justify-center">
                <Button onClick={() => setCommTab('partners')} variant={commTab === 'partners' ? 'default' : 'ghost'} size="sm" className="rounded-xl font-bold text-xs h-8">
                  Talent Partners
                </Button>
                <Button onClick={() => setCommTab('inquiries')} variant={commTab === 'inquiries' ? 'default' : 'ghost'} size="sm" className="rounded-xl font-bold text-xs h-8">
                  Candidates & Employers
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              {commTab === 'partners' ? (
                <div className="space-y-6 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-primary/10 pb-4 shrink-0">
                    <Select value={selectedPartnerForChat || ''} onValueChange={setSelectedPartnerForChat}>
                      <SelectTrigger className="w-[260px] bg-background font-bold h-11 rounded-xl border-primary/20 shadow-sm">
                        <SelectValue placeholder="Select Talent Partner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {uniquePartnersList.map(p => (
                          <SelectItem key={p.id} value={p.id} className="font-semibold">{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-2">
                    {!selectedPartnerForChat ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <MessageSquare size={48} className="mb-3 opacity-30" />
                        <p className="font-bold text-foreground">No partner selected.</p>
                      </div>
                    ) : (partnerMessages.length > 0 ? partnerMessages : [
                      { id: 'mock_msg_1', vendor_id: 'mock_vendor_1', sender_name: 'Apex Talent Solutions', sender_role: 'vendor', message: 'Hello! Marcus Vance is ready for the technical interview tomorrow.', created_at: new Date(Date.now() - 3600000).toISOString() },
                      { id: 'mock_msg_2', vendor_id: 'mock_vendor_1', sender_name: 'SA Master Admin', sender_role: 'admin', message: 'Excellent. Zoom link has been sent to his email.', created_at: new Date(Date.now() - 1800000).toISOString() }
                    ]).filter(m => m.vendor_id === selectedPartnerForChat || selectedPartnerForChat.startsWith('mock_')).map(msg => (
                      <div key={msg.id} className={`flex flex-col max-w-lg ${msg.sender_role === 'admin' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-xs font-bold text-foreground">{msg.sender_name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{msg.sender_role}</span>
                        </div>
                        <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                          msg.sender_role === 'admin' ? 'gradient-bg text-white rounded-br-none' : 'glass border border-primary/20 text-foreground rounded-bl-none'
                        }`}>
                          {msg.message}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {selectedPartnerForChat && (
                    <div className="pt-4 border-t border-primary/10 shrink-0">
                      <form onSubmit={handleSendPartnerMessage} className="flex gap-3">
                        <Input 
                          value={newMessage} 
                          onChange={e => setNewMessage(e.target.value)} 
                          placeholder="Type a message to the Talent Partner..." 
                          className="flex-1 bg-background/80 h-12 rounded-xl border-primary/20 font-medium"
                        />
                        <Button type="submit" className="gradient-bg h-12 px-6 rounded-xl font-bold shadow-md gap-2 text-white hover:opacity-90">
                          <Send size={16} /> Send
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-bold text-foreground text-base border-b border-primary/10 pb-2">Direct Candidate & Employer Inquiries</h3>
                  {displayInquiries.map(inq => (
                    <div key={inq.id} className="p-5 rounded-2xl glass border border-primary/15 shadow-sm space-y-2 bg-background/50">
                      <div className="flex items-center justify-between gap-2 border-b border-primary/10 pb-2">
                        <div>
                          <span className="font-extrabold text-foreground text-base">{inq.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">({inq.email} • {inq.phone})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-none text-xs font-bold px-2.5 py-0.5 uppercase">
                            {inq.status}
                          </Badge>
                          <Button onClick={() => handleDeleteItem('inquiries', inq.id)} size="sm" variant="outline" className="h-8 border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold px-2.5">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <FormattedInquiryMessage message={inq.message} />
                      <div className="text-[10px] text-muted-foreground pt-1">{new Date(inq.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 10: REPORTS & ANALYTICS */}
        <TabsContent value="analytics" className="space-y-8 animate-in fade-in-50 duration-500">
          <Card className="glass border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                <BarChart3 className="text-primary" size={24} /> Marketplace Reports & Analytics
              </CardTitle>
              <CardDescription>Key performance metrics, conversion rates, and partner efficiency evaluation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="glass p-6 rounded-3xl border border-primary/15 text-center space-y-2 bg-background/50">
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Placement Conversion Rate</div>
                  <div className="text-4xl font-extrabold gradient-text">
                    {displayMatches.length > 0 ? Math.round((displayMatches.filter(m => m.status === 'Placed' || m.status === 'Offered').length / displayMatches.length) * 100) : 0}%
                  </div>
                  <p className="text-[11px] text-muted-foreground">Submissions to Placed ratio</p>
                </div>
                <div className="glass p-6 rounded-3xl border border-primary/15 text-center space-y-2 bg-background/50">
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Avg Time to Place</div>
                  <div className="text-4xl font-extrabold text-purple-500">
                    {displayMatches.filter(m => m.status === 'Placed' || m.status === 'Offered').length > 0 ? '7-14 Days' : '0 Days'}
                  </div>
                  <p className="text-[11px] text-muted-foreground">From submission to confirmed joining</p>
                </div>
                <div className="glass p-6 rounded-3xl border border-primary/15 text-center space-y-2 bg-background/50">
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Active Talent Partners</div>
                  <div className="text-4xl font-extrabold text-blue-500">{uniquePartnersList.length}</div>
                  <p className="text-[11px] text-muted-foreground">Supplying bench consultants</p>
                </div>
                <div className="glass p-6 rounded-3xl border border-primary/15 text-center space-y-2 bg-background/50">
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Commission Paid</div>
                  <div className="text-4xl font-extrabold text-emerald-500">
                    ${displayRevenueShares.filter(r => r.payment_status === 'Paid').reduce((acc, r) => acc + Number(r.partner_share), 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Settled with partners</p>
                </div>
              </div>

              {/* Top Performing Partners Table */}
              <div className="space-y-4 border-t border-primary/10 pt-6">
                <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                  <Award className="text-primary" size={20} /> Top Performing Talent Partners
                </h3>
                {uniquePartnersList.length === 0 ? (
                  <div className="p-8 text-center glass rounded-2xl border border-primary/10 text-muted-foreground font-semibold">
                    No active talent partners found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-primary/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="py-3 px-4">Talent Partner Agency</th>
                          <th className="py-3 px-4">Candidates Supplied</th>
                          <th className="py-3 px-4">Active Submissions</th>
                          <th className="py-3 px-4">Confirmed Placements</th>
                          <th className="py-3 px-4 font-bold text-primary">Commission Generated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10 text-sm">
                        {uniquePartnersList.map(p => {
                          const suppCount = partnerCandidates.filter(c => c.vendor_id === p.id && !deletedIds.includes(`part_${c.id}`)).length;
                          const subCount = displayMatches.filter(m => m.vendor_id === p.id).length;
                          const placeCount = displayMatches.filter(m => m.vendor_id === p.id && (m.status === 'Placed' || m.status === 'Offered')).length;
                          const commTotal = displayRevenueShares.filter(r => r.vendor_id === p.id).reduce((acc, r) => acc + Number(r.partner_share), 0);

                          return (
                            <tr key={p.id} className="hover:bg-primary/5 transition-colors">
                              <td className="py-4 px-4 font-extrabold text-foreground">{p.name}</td>
                              <td className="py-4 px-4 font-semibold text-muted-foreground">{suppCount} Candidates</td>
                              <td className="py-4 px-4 font-semibold text-foreground">{subCount} Submissions</td>
                              <td className="py-4 px-4 font-bold text-green-600">{placeCount} Placed</td>
                              <td className="py-4 px-4 font-extrabold text-primary text-base">${commTotal.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* MODAL 1: PROPOSE MATCH ACTION (Send to Partner or Direct Submit) */}
      <Dialog open={isMatchActionModalOpen} onOpenChange={setIsMatchActionModalOpen}>
        <DialogContent className="glass border-primary/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-bold flex items-center gap-2">
              <Sparkles className="text-primary" size={20} /> Propose Job Match Submission
            </DialogTitle>
            <DialogDescription>
              Matching <span className="font-extrabold text-foreground">{selectedCandidateForMatchActive?.name}</span> to <span className="font-extrabold text-foreground">{selectedJobForMatch?.title}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleExecuteMatch} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="ma-perc">Match Percentage (%) *</Label>
              <Input id="ma-perc" type="number" min="1" max="100" value={matchForm.match_percentage} onChange={e => setMatchForm({...matchForm, match_percentage: e.target.value})} required className="bg-background/50 font-bold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ma-sal">Salary / Rate Fit Evaluation</Label>
              <Input id="ma-sal" value={matchForm.salary_fit} onChange={e => setMatchForm({...matchForm, salary_fit: e.target.value})} placeholder="Optimal Fit ($70/hr)" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ma-loc">Location Fit Evaluation</Label>
              <Input id="ma-loc" value={matchForm.location_fit} onChange={e => setMatchForm({...matchForm, location_fit: e.target.value})} placeholder="100% Remote Fit" className="bg-background/50" />
            </div>
            <Button type="submit" className="gradient-bg w-full font-bold h-11 rounded-xl shadow-md text-white hover:opacity-90">
              {selectedCandidateForMatchActive?.source === 'Direct Candidate' ? 'Submit Directly to Employer' : 'Send to Partner Magic Screen for Approval'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CANDIDATE PROFILE FULL INTELLIGENCE VIEW */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="glass border-primary/20 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold flex items-center gap-2">
              <FileText className="text-primary" size={24} /> Candidate Full Intelligence View
            </DialogTitle>
            <DialogDescription>Enriched profile data, parsed AI resume intelligence, and submission history.</DialogDescription>
          </DialogHeader>
          {selectedCandidateForProfile && (
            <div className="space-y-6 pt-4 text-sm">
              <div className="glass p-6 rounded-3xl border border-primary/20 space-y-4 bg-background/50">
                <div className="flex items-start justify-between gap-4 border-b border-primary/10 pb-4">
                  <div>
                    <h3 className="text-2xl font-extrabold text-foreground">{selectedCandidateForProfile.name}</h3>
                    <div className="text-xs text-muted-foreground font-semibold mt-0.5">{selectedCandidateForProfile.email} • {selectedCandidateForProfile.phone}</div>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-none text-xs font-bold px-3 py-1 uppercase tracking-wider">
                    {selectedCandidateForProfile.source}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium">
                  <div><span className="text-muted-foreground block font-bold">Experience:</span> {selectedCandidateForProfile.experience_years || 'N/A'}</div>
                  <div><span className="text-muted-foreground block font-bold">Location:</span> {selectedCandidateForProfile.location || 'Remote'}</div>
                  <div><span className="text-muted-foreground block font-bold">Rate Expectation:</span> {selectedCandidateForProfile.salary_expectation || 'Negotiable'}</div>
                  <div><span className="text-muted-foreground block font-bold">Availability:</span> {selectedCandidateForProfile.availability || 'Immediate'}</div>
                  <div><span className="text-muted-foreground block font-bold">Work Auth:</span> {selectedCandidateForProfile.work_authorization || 'US Citizen / GC'}</div>
                  <div><span className="text-muted-foreground block font-bold">Live Status:</span> <span className="text-green-600 font-extrabold">{selectedCandidateForProfile.status}</span></div>
                </div>

                <div className="space-y-2 pt-2 border-t border-primary/10">
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider">Verified Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(selectedCandidateForProfile.skills_list) && selectedCandidateForProfile.skills_list.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-none text-xs font-bold px-2.5 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedCandidateForProfile.resume_url && (
                  <div className="pt-4 border-t border-primary/10 flex justify-end">
                    <Button asChild variant="outline" className="h-10 px-6 rounded-xl font-bold border-primary/20 gap-2 hover:bg-primary/10">
                      <a href={selectedCandidateForProfile.resume_url} target="_blank" rel="noreferrer"><Eye size={16} /> View Original Resume PDF</a>
                    </Button>
                  </div>
                )}
              </div>

              {selectedCandidateForProfile.parsed_data && (
                <div className="space-y-4 pt-2">
                  <h4 className="font-bold text-foreground text-base flex items-center gap-2">
                    <Sparkles className="text-purple-500" size={18} /> AI Parsed Resume Intelligence
                  </h4>
                  <div className="glass p-6 rounded-3xl border border-primary/15 bg-background/50 space-y-4">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed bg-background/80 p-4 rounded-2xl border border-primary/10 max-h-60 overflow-y-auto">
                      {JSON.stringify(selectedCandidateForProfile.parsed_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-foreground text-base flex items-center gap-2">
                  <ShieldCheck className="text-primary" size={18} /> Submissions History
                </h4>
                <div className="space-y-3">
                  {displayMatches.filter(m => m.candidate_id === selectedCandidateForProfile.id || m.vendor_candidates?.name === selectedCandidateForProfile.name || (m.location_fit && m.location_fit.includes(selectedCandidateForProfile.name))).length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground glass rounded-2xl border border-primary/10">No past job submissions recorded.</div>
                  ) : (
                    displayMatches.filter(m => m.candidate_id === selectedCandidateForProfile.id || m.vendor_candidates?.name === selectedCandidateForProfile.name || (m.location_fit && m.location_fit.includes(selectedCandidateForProfile.name))).map(m => (
                      <div key={m.id} className="p-4 rounded-2xl glass border border-primary/15 flex items-center justify-between gap-4 bg-background/40">
                        <div>
                          <div className="font-bold text-foreground text-sm">{m.job_role} • <span className="text-primary font-extrabold">{m.company_name}</span></div>
                          <div className="text-xs text-muted-foreground mt-0.5">Match: {m.match_percentage}% • Stage: <span className="font-extrabold text-foreground">{m.status}</span></div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">{new Date(m.created_at).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 3: UPDATE MATCH STAGE */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="glass border-primary/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-bold flex items-center gap-2">
              <Briefcase className="text-primary" size={20} /> Update Submission Stage
            </DialogTitle>
            <DialogDescription>Update interview and placement status for {getMatchCandidateInfo(selectedMatchForUpdate || {}).name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateMatchStage} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="u-status">Hiring Stage *</Label>
              <Select value={updateForm.status} onValueChange={val => setUpdateForm({...updateForm, status: val})}>
                <SelectTrigger className="bg-background/50 font-semibold h-11 rounded-xl border-primary/20"><SelectValue /></SelectTrigger>
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
              <Input id="u-sched" value={updateForm.interview_schedule} onChange={e => setUpdateForm({...updateForm, interview_schedule: e.target.value})} placeholder="Oct 20, 2026 at 2:00 PM EST (Zoom)" className="bg-background/50 h-11 rounded-xl border-primary/20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-feed">Client Feedback</Label>
              <Textarea id="u-feed" value={updateForm.interview_feedback} onChange={e => setUpdateForm({...updateForm, interview_feedback: e.target.value})} placeholder="Strong technical skills, moving to final round..." className="bg-background/50 min-h-[80px] rounded-xl border-primary/20" />
            </div>
            {updateForm.status === 'Offered' && (
              <div className="space-y-2 animate-in fade-in-50">
                <Label htmlFor="u-sal">Offered Salary / Rate</Label>
                <Input id="u-sal" value={updateForm.offered_salary} onChange={e => setUpdateForm({...updateForm, offered_salary: e.target.value})} placeholder="$140,000 / $70/hr" className="bg-background/50 h-11 rounded-xl border-primary/20" />
              </div>
            )}
            {updateForm.status === 'Placed' && (
              <div className="space-y-2 animate-in fade-in-50">
                <Label htmlFor="u-join">Confirmed Joining Date</Label>
                <Input id="u-join" value={updateForm.joining_date} onChange={e => setUpdateForm({...updateForm, joining_date: e.target.value})} placeholder="Nov 01, 2026" className="bg-background/50 h-11 rounded-xl border-primary/20" />
              </div>
            )}
            <Button type="submit" className="gradient-bg w-full font-bold h-11 rounded-xl shadow-md text-white hover:opacity-90">
              Save Stage Updates
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: LOG COMMISSION */}
      <Dialog open={isCommissionModalOpen} onOpenChange={setIsCommissionModalOpen}>
        <DialogContent className="glass border-primary/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-bold flex items-center gap-2">
              <DollarSign className="text-primary" size={20} /> Log Placement Commission
            </DialogTitle>
            <DialogDescription>Generate revenue share record for {getMatchCandidateInfo(selectedMatchForCommission || {}).name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCommission} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="c-fee">Total Placement Fee ($) *</Label>
              <Input id="c-fee" type="number" value={commissionForm.placement_fee} onChange={e => setCommissionForm({...commissionForm, placement_fee: e.target.value})} required className="bg-background/50 h-11 rounded-xl border-primary/20 font-bold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-share">Partner Commission Share ($) *</Label>
              <Input id="c-share" type="number" value={commissionForm.partner_share} onChange={e => setCommissionForm({...commissionForm, partner_share: e.target.value})} required className="bg-background/50 h-11 rounded-xl border-primary/20 font-bold text-primary" />
              <p className="text-[10px] text-muted-foreground">Standard 80/20 or custom C2C split agreed with the Talent Partner.</p>
            </div>
            <Button type="submit" className="gradient-bg w-full font-bold h-11 rounded-xl shadow-md text-white hover:opacity-90">
              Generate Revenue Share Record
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: ADD INTERVIEW NEWS & SCHEDULE */}
      <Dialog open={isAddInterviewModalOpen} onOpenChange={setIsAddInterviewModalOpen}>
        <DialogContent className="glass border-primary/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-bold flex items-center gap-2">
              <Calendar className="text-primary" size={20} /> Schedule / Add Interview News
            </DialogTitle>
            <DialogDescription>Select an active candidate submission to schedule an interview or log recent interview news/feedback.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddInterviewNews} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="ain-sub">Select Real Candidate / Submission *</Label>
              <Select value={selectedSubmissionForInterview?.unified_id || selectedSubmissionForInterview?.id || ''} onValueChange={val => {
                const foundCand = unifiedCandidates.find(c => c.unified_id === val);
                if (foundCand) {
                  setSelectedSubmissionForInterview(foundCand);
                } else {
                  setSelectedSubmissionForInterview(displayMatches.find(m => m.id === val));
                }
              }}>
                <SelectTrigger className="bg-background/50 font-semibold h-11 rounded-xl border-primary/20"><SelectValue placeholder="Choose real candidate or submission..." /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="font-extrabold text-xs text-primary uppercase tracking-wider px-2 py-1.5">Real Candidates in Database</SelectLabel>
                    {unifiedCandidates.map(c => (
                      <SelectItem key={c.unified_id} value={c.unified_id} className="font-semibold text-foreground pl-4">
                        👤 {c.name} ({c.source})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider px-2 py-1.5 pt-3 border-t border-primary/10 mt-1">Existing Job Submissions</SelectLabel>
                    {displayMatches.filter(m => m.status !== 'Placed' && m.status !== 'Rejected').map(m => (
                      <SelectItem key={m.id} value={m.id} className="font-semibold text-muted-foreground pl-4">
                        📁 {getMatchCandidateInfo(m).name} ({m.job_role} • {m.company_name})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ain-status">Current Stage *</Label>
              <Select value={newInterviewForm.status} onValueChange={val => setNewInterviewForm({...newInterviewForm, status: val})}>
                <SelectTrigger className="bg-background/50 font-semibold h-11 rounded-xl border-primary/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Offered">Offered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ain-sched">Interview Schedule / Zoom Link</Label>
              <Input id="ain-sched" value={newInterviewForm.interview_schedule} onChange={e => setNewInterviewForm({...newInterviewForm, interview_schedule: e.target.value})} placeholder="e.g. Tomorrow at 3:00 PM EST (Zoom: https://...)" className="bg-background/50 h-11 rounded-xl border-primary/20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ain-news">Interview News / Client Feedback</Label>
              <Textarea id="ain-news" value={newInterviewForm.interview_feedback} onChange={e => setNewInterviewForm({...newInterviewForm, interview_feedback: e.target.value})} placeholder="e.g. Cleared Round 1 technical interview with excellent feedback on React architecture. Moving to final managerial round." className="bg-background/50 min-h-[100px] rounded-xl border-primary/20" />
            </div>
            <Button type="submit" className="gradient-bg w-full font-bold h-11 rounded-xl shadow-md text-white hover:opacity-90">
              Save Interview News & Schedule
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
