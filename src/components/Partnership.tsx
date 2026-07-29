import { useState, useEffect } from 'react';
import { Users2, Handshake, Rocket, HeartHandshake, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const programs = [
  {
    icon: Users2,
    title: 'Referral Program',
    description: 'Recommend our services and earn competitive rewards for every successful client partnership.',
    benefits: ['Financial Incentives', 'Quick Payouts', 'Marketing Support'],
  },
  {
    icon: Handshake,
    title: 'Strategic Alliances',
    description: 'Combine your unique expertise with our consulting framework to offer end-to-end solutions.',
    benefits: ['Shared Expertise', 'Expanded Service Portfolio', 'Joint Bidding'],
  },
  {
    icon: Rocket,
    title: 'Co-Marketing',
    description: 'Collaborate on webinars, whitepapers, and events to grow our mutual brand authority.',
    benefits: ['Wider Reach', 'Lead Generation', 'Shared Content Costs'],
  },
  {
    icon: HeartHandshake,
    title: 'Channel Partner',
    description: 'Incorporate SA Consultant solutions into your own product or service offerings.',
    benefits: ['Wholesale Pricing', 'Technical Integration', 'Dedicated Account Manager'],
  },
];

const Partnership = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('Referral Program');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    proposal: '',
    // Referral specific fields
    referrerName: '',
    referrerEmail: '',
    referrerPhone: '',
    purpose: '',
    referredName: '',
    referredEmail: '',
    referredPhone: ''
  });

  const openPartnershipModal = (programTitle: string) => {
    setSelectedProgram(programTitle);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isReferral = selectedProgram === 'Referral Program';
      const applicantName = isReferral ? formData.referrerName : formData.name;
      const applicantEmail = isReferral ? formData.referrerEmail : formData.email;
      const applicantPhone = isReferral ? formData.referrerPhone : formData.phone;

      const messageBody = isReferral ? `[REFERRAL PROGRAM SUBMISSION]

=== REFERRER DETAILS ===
• Name: ${formData.referrerName}
• Email: ${formData.referrerEmail}
• Phone: ${formData.referrerPhone}

=== PURPOSE OF REFERRAL ===
${formData.purpose}

=== REFERRAL CANDIDATE (WHOM THEY REFER) ===
• Name: ${formData.referredName}
• Email: ${formData.referredEmail}
• Phone: ${formData.referredPhone}` : `[PARTNERSHIP APPLICATION: ${selectedProgram.toUpperCase()}]

=== APPLICANT DETAILS ===
• Name: ${formData.name}
• Company / Agency: ${formData.company || 'N/A'}
• Email: ${formData.email}
• Phone: ${formData.phone}

=== PARTNERSHIP PROPOSAL / GOALS ===
${formData.proposal}`;

      const { error } = await supabase
        .from('inquiries')
        .insert([
          {
            name: applicantName,
            email: applicantEmail,
            phone: applicantPhone,
            message: messageBody
          }
        ]);

      if (error) throw error;

      // Send email notification to admins
      const adminRecipients = ['sajaruthmahjabeen@gmail.com', 'sagina111@gmail.com'];
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;color:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
          <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:32px;text-align:center">
            <h1 style="margin:0;font-size:24px;color:#fff">🤝 New ${selectedProgram} Application</h1>
            <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px">SA Consultant &amp; Staffing</p>
          </div>
          <div style="padding:32px">
            <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #e2e8f0">
              <h3 style="margin:0 0 12px;color:#4f46e5;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Applicant Information</h3>
              <p style="margin:0 0 6px;font-size:14px"><strong>Name:</strong> ${applicantName}</p>
              ${!isReferral && formData.company ? `<p style="margin:0 0 6px;font-size:14px"><strong>Company:</strong> ${formData.company}</p>` : ''}
              <p style="margin:0 0 6px;font-size:14px"><strong>Email:</strong> <a href="mailto:${applicantEmail}" style="color:#4f46e5;text-decoration:none">${applicantEmail}</a></p>
              <p style="margin:0;font-size:14px"><strong>Phone:</strong> <a href="tel:${applicantPhone}" style="color:#4f46e5;text-decoration:none">${applicantPhone}</a></p>
            </div>
            <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0">
              <h3 style="margin:0 0 8px;color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Application Details</h3>
              <pre style="margin:0;font-size:13px;line-height:1.6;color:#334155;white-space:pre-wrap;font-family:sans-serif">${messageBody}</pre>
            </div>
            <p style="color:#64748b;font-size:12px;text-align:center;margin:0">Automated notification from SA Consultant & Staffing Website.</p>
          </div>
        </div>`;

      supabase.functions.invoke('send-email', {
        body: {
          recipients: adminRecipients,
          subject: `🤝 New ${selectedProgram} Application from ${applicantName}`,
          text: messageBody,
          html: emailHtml
        }
      }).catch(err => console.error('Error sending partnership email:', err));

      setIsSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: `Thank you for applying for our ${selectedProgram}. We will contact you shortly.`,
      });
    } catch (err: any) {
      console.error('Error submitting application:', err);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was an error submitting your application. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '', email: '', phone: '', company: '', proposal: '',
        referrerName: '', referrerEmail: '', referrerPhone: '', purpose: '',
        referredName: '', referredEmail: '', referredPhone: ''
      });
    }, 300);
  };

  return (
    <section id="partnership" className="section-padding relative overflow-hidden bg-background">
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16 scroll-reveal">
          <span className="text-accent text-sm font-black tracking-[0.2em] uppercase mb-4 block">Collaboration</span>
          <h2 className="text-2xl sm:text-4xl font-display font-black tracking-tight mb-6">
            Our <span className="gradient-text">Partnership Program</span>
          </h2>
          <p className="text-foreground/80 font-medium text-lg max-w-3xl mx-auto leading-relaxed">
            We believe in the power of synergy. Join our network of innovators and professionals to unlock new growth opportunities and deliver exceptional value together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {programs.map((program, i) => {
            return (
              <div 
                key={program.title}
                className="scroll-reveal glass p-8 md:p-10 rounded-[2.5rem] hover-lift hover-glow transition-all duration-500 border border-border group relative overflow-hidden cursor-pointer hover:border-primary/45"
                style={{ transitionDelay: `${i * 150}ms` }}
                onClick={() => openPartnershipModal(program.title)}
              >
                {/* Subtle accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 gradient-bg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Background Morphing Blob */}
                <div 
                  className="absolute -right-10 -bottom-10 w-44 h-44 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-xl animate-morph-blob pointer-events-none group-hover:scale-125 transition-transform duration-700"
                  style={{ animationDelay: `${i * 2}s` }}
                />
                
                <div className="flex flex-col md:flex-row gap-8 items-start h-full justify-between relative z-10">
                  {/* Morphing Blob Icon Container */}
                  <div className="w-16 h-16 relative flex items-center justify-center flex-shrink-0">
                    <div 
                      className="absolute inset-0 bg-gradient-to-tr from-primary to-accent animate-morph-blob shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-500"
                      style={{ animationDelay: `${i * 1.5}s` }}
                    />
                    <program.icon size={28} className="text-white relative z-10" />
                  </div>
                  
                  <div className="flex-1 flex flex-col h-full justify-between">
                    <div>
                      <h3 className="text-2xl font-display font-black mb-4 group-hover:text-primary transition-colors flex items-center gap-2">
                        {program.title}
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 font-bold uppercase tracking-widest group-hover:animate-pulse">
                          Apply Now
                        </span>
                      </h3>
                      <p className="text-muted-foreground font-medium mb-6 leading-relaxed text-sm md:text-base">
                        {program.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      {program.benefits.map((benefit) => (
                        <span key={benefit} className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-secondary text-foreground/70 border border-border">
                          {benefit}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-primary font-black text-xs md:text-sm group-hover:translate-x-1 transition-transform">
                      Apply for {program.title} <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="scroll-reveal glass-strong p-8 md:p-12 rounded-[3rem] text-center max-w-4xl mx-auto border-2 border-primary/10 relative overflow-hidden group">
          {/* Animated Background Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          
          <h3 className="text-3xl font-display font-black mb-6 relative z-10">Ready to build something <span className="gradient-text">great together?</span></h3>
          <p className="text-muted-foreground font-medium text-lg mb-10 max-w-2xl mx-auto relative z-10">
            Whether you're an individual consultant or a tech agency, we have a place for you in our ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button 
              onClick={() => openPartnershipModal('Strategic Alliances')}
              className="px-10 py-5 gradient-bg rounded-2xl font-black text-white hover-lift hover-glow transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              Apply to Partner <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* PARTNERSHIP FORM DIALOG */}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="glass-strong border border-primary/20 max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 pt-10 md:pt-12 rounded-3xl shadow-2xl">
          {!isSubmitted ? (
            <>
              <DialogHeader className="mb-6 pr-8">
                <DialogTitle className="text-xl md:text-2xl font-display font-black tracking-tight flex items-center gap-2">
                  <Users2 className="text-primary" size={24} />
                  SA Consultant <span className="gradient-text">Partnership Application</span>
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  Join our network of strategic partners and explore new growth opportunities together.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Program Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full gradient-bg" />
                    Select Partnership Program *
                  </label>
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background/80 border border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground font-bold text-sm"
                  >
                    {programs.map(p => (
                      <option key={p.title} value={p.title} className="bg-background text-foreground font-medium">
                        {p.title} — {p.description.substring(0, 60)}...
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProgram === 'Referral Program' ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Referrer Details */}
                      <div className="p-5 rounded-2xl bg-secondary/35 border border-primary/5 space-y-4">
                        <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full gradient-bg" />
                          Your Details (Referrer)
                        </h4>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Name *</label>
                            <input
                              type="text"
                              required
                              value={formData.referrerName}
                              onChange={(e) => setFormData({ ...formData, referrerName: e.target.value })}
                              placeholder="John Doe"
                              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Email *</label>
                            <input
                              type="email"
                              required
                              value={formData.referrerEmail}
                              onChange={(e) => setFormData({ ...formData, referrerEmail: e.target.value })}
                              placeholder="john@example.com"
                              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Phone Number *</label>
                            <input
                              type="tel"
                              required
                              value={formData.referrerPhone}
                              onChange={(e) => setFormData({ ...formData, referrerPhone: e.target.value })}
                              placeholder="+1 (123) 456-7890"
                              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Referred Candidate Details */}
                      <div className="p-5 rounded-2xl bg-secondary/35 border border-primary/5 space-y-4">
                        <h4 className="text-xs font-black text-accent uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-accent" />
                          Referred Candidate Details
                        </h4>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={formData.referredName}
                              onChange={(e) => setFormData({ ...formData, referredName: e.target.value })}
                              placeholder="Jane Smith"
                              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Email Address *</label>
                            <input
                              type="email"
                              required
                              value={formData.referredEmail}
                              onChange={(e) => setFormData({ ...formData, referredEmail: e.target.value })}
                              placeholder="jane@example.com"
                              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Phone Number *</label>
                            <input
                              type="tel"
                              required
                              value={formData.referredPhone}
                              onChange={(e) => setFormData({ ...formData, referredPhone: e.target.value })}
                              placeholder="+1 (987) 654-3210"
                              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Purpose of Referral / Referral Details *</label>
                      <textarea
                        required
                        rows={3}
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        placeholder="Describe their project scope, staffing or consulting needs..."
                        className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-foreground text-sm font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-5 rounded-2xl bg-secondary/35 border border-primary/5">
                    <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full gradient-bg" />
                      Partner Application Details
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Smith"
                          className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Company / Organization *</label>
                        <input
                          type="text"
                          required
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Acme Solutions LLC"
                          className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@acme.com"
                          className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Partnership Goals & Proposal *</label>
                      <textarea
                        required
                        rows={3}
                        value={formData.proposal}
                        onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                        placeholder="Tell us about your organization and how you'd like to partner with SA Consultant..."
                        className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-foreground text-sm font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-bg py-4 rounded-2xl font-black text-white hover-lift hover-glow flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed shadow-lg shadow-primary/20 text-base cursor-pointer"
                >
                  {loading ? (
                    <>
                      Submitting Application... <Loader2 className="animate-spin" size={20} />
                    </>
                  ) : (
                    <>
                      Submit {selectedProgram} Application <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-10 px-4 space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto shadow-lg shadow-green-500/10 border border-green-500/20">
                <CheckCircle2 size={48} className="animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-display font-black gradient-text">Application Received!</h3>
                <p className="text-foreground font-black text-xl max-w-md mx-auto leading-relaxed">
                  SA Consultant members will reach you soon!
                </p>
                <p className="text-muted-foreground text-sm font-medium max-w-sm mx-auto leading-relaxed">
                  Thank you for applying to partner with us under the <strong>{selectedProgram}</strong>. Our partnership team will review your application and get back to you shortly.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="px-8 py-3.5 bg-foreground text-background font-black rounded-xl hover-lift transition-all duration-300 text-sm shadow-md cursor-pointer"
              >
                Back to Partnerships
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Partnership;
