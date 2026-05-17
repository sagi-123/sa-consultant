import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Briefcase, Download, ExternalLink, GraduationCap, LayoutDashboard, FileCode2, Globe } from 'lucide-react';

interface CandidateProfileDialogProps {
  candidate: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}

export function CandidateProfileDialog({ candidate, isOpen, onClose, onUpdateStatus }: CandidateProfileDialogProps) {
  if (!candidate) return null;

  const parsed = candidate.parsed_data || {};
  const skills = parsed.skills || [];
  const experienceTimeline = parsed.experienceTimeline || [];
  const projects = parsed.projects || [];
  const education = parsed.education || [];
  const links = parsed.links || {};

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const statusColors: Record<string, string> = {
    'New': 'bg-blue-500 text-white',
    'Screened': 'bg-yellow-500 text-white',
    'Interview': 'bg-purple-500 text-white',
    'Offer': 'bg-green-500 text-white',
    'Rejected': 'bg-red-500 text-white',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-0 overflow-hidden bg-background border-primary/20">
        
        {/* Sticky Header */}
        <DialogHeader className="p-4 border-b border-border/50 bg-secondary/30 shrink-0 flex flex-row items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border-2 border-background shadow-sm">
              {getInitials(candidate.name)}
            </div>
            <div>
              <DialogTitle className="text-xl font-display font-bold flex items-center gap-2">
                {candidate.name}
                <Badge variant="outline" className={`${statusColors[candidate.status] || 'bg-secondary'} border-none shadow-sm ml-2`}>
                  {candidate.status}
                </Badge>
              </DialogTitle>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><Briefcase size={14} /> {candidate.job_title || 'No Title'} • {candidate.experience_years || '0 Yrs'} Exp</span>
                {candidate.location && <span className="flex items-center gap-1"><MapPin size={14} /> {candidate.location}</span>}
                {candidate.email && <a href={`mailto:${candidate.email}`} className="flex items-center gap-1 hover:text-primary"><Mail size={14} /> {candidate.email}</a>}
                {candidate.phone && <a href={`tel:${candidate.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone size={14} /> {candidate.phone}</a>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1 mr-4">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Change Stage</span>
              <Select value={candidate.status} onValueChange={(val) => onUpdateStatus(candidate.id, val)}>
                <SelectTrigger className="w-[140px] h-8 text-xs font-semibold">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Screened">Screened</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {candidate.resume_url && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href={candidate.resume_url} target="_blank" rel="noreferrer" download>
                  <Download size={14} /> Download PDF
                </a>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Split Pane Content */}
        <div className="flex flex-1 overflow-hidden h-full">
          
          {/* Left Pane: Resume PDF */}
          <div className="w-1/2 border-r border-border/50 bg-muted/20 relative hidden md:block">
            {candidate.resume_url ? (
              <iframe 
                src={`${candidate.resume_url}#toolbar=0&navpanes=0`} 
                className="w-full h-full border-0" 
                title={`${candidate.name} Resume`}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No resume file attached.
              </div>
            )}
          </div>

          {/* Right Pane: Parsed Intelligence */}
          <div className="w-full md:w-1/2 overflow-y-auto p-6 bg-background">
            <Tabs defaultValue="experience" className="w-full">
              <TabsList className="glass-strong w-full flex overflow-x-auto justify-start mb-6 p-1 h-auto touch-pan-x sticky top-0 z-10">
                <TabsTrigger value="experience" className="gap-2 px-4 py-2 data-[state=active]:gradient-bg">
                  <Briefcase size={14} /> Experience
                </TabsTrigger>
                <TabsTrigger value="skills" className="gap-2 px-4 py-2 data-[state=active]:gradient-bg">
                  <FileCode2 size={14} /> Skills
                </TabsTrigger>
                <TabsTrigger value="projects" className="gap-2 px-4 py-2 data-[state=active]:gradient-bg">
                  <LayoutDashboard size={14} /> Projects
                </TabsTrigger>
                <TabsTrigger value="education" className="gap-2 px-4 py-2 data-[state=active]:gradient-bg">
                  <GraduationCap size={14} /> Education
                </TabsTrigger>
              </TabsList>

              <TabsContent value="experience" className="space-y-6">
                {experienceTimeline.length > 0 ? experienceTimeline.map((exp: any, idx: number) => (
                  <div key={idx} className="glass p-4 rounded-xl border border-primary/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{exp.role}</h4>
                        <p className="text-sm font-medium text-accent">{exp.company}</p>
                      </div>
                      <span className="text-xs font-semibold bg-secondary px-2 py-1 rounded text-muted-foreground whitespace-nowrap">
                        {exp.duration}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-3">{exp.description}</p>
                  </div>
                )) : (
                  <p className="text-muted-foreground italic">No experience data found.</p>
                )}
              </TabsContent>

              <TabsContent value="skills" className="grid md:grid-cols-2 gap-4">
                {skills.length > 0 ? skills.map((skillGroup: any, idx: number) => (
                  <div key={idx} className="glass p-4 rounded-xl border border-primary/10">
                    <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {skillGroup.category}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {skillGroup.items.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-none text-xs hover:bg-primary/20 transition-colors">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground italic">No skills data found.</p>
                )}
              </TabsContent>

              <TabsContent value="projects" className="grid md:grid-cols-2 gap-4">
                {projects.length > 0 ? projects.map((proj: any, idx: number) => (
                  <div key={idx} className="glass p-4 rounded-xl border border-primary/10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-foreground">{proj.name}</h4>
                      {proj.link && (
                        <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {proj.technologies?.map((tech: string) => (
                        <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground italic">No projects data found.</p>
                )}
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                {education.length > 0 ? education.map((edu: any, idx: number) => (
                  <div key={idx} className="glass p-4 rounded-xl border-l-4 border-l-accent flex flex-col gap-1">
                    <h4 className="font-bold text-foreground">{edu.degree}</h4>
                    <p className="text-sm font-medium text-muted-foreground">{edu.institution}</p>
                    <p className="text-xs text-primary font-semibold">{edu.year}</p>
                  </div>
                )) : (
                  <p className="text-muted-foreground italic">No education data found.</p>
                )}
                
                {(links.linkedin || links.github || links.portfolio) && (
                  <div className="mt-8">
                    <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Web Links</h3>
                    <div className="glass p-4 rounded-xl space-y-3">
                      {links.linkedin && (
                        <a href={links.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors break-all">
                          <Globe size={16} className="text-primary/70 shrink-0" /> {links.linkedin}
                        </a>
                      )}
                      {links.github && (
                        <a href={links.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors break-all">
                          <Globe size={16} className="text-primary/70 shrink-0" /> {links.github}
                        </a>
                      )}
                      {links.portfolio && (
                        <a href={links.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors break-all">
                          <Globe size={16} className="text-primary/70 shrink-0" /> {links.portfolio}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
