import { useState, useEffect } from 'react';
import { Users2, Handshake, Rocket, HeartHandshake, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('9384797751');
  const [formData, setFormData] = useState({
    referrerName: '',
    referrerEmail: '',
    referrerPhone: '',
    purpose: '',
    referredName: '',
    referredEmail: '',
    referredPhone: ''
  });

  useEffect(() => {
    const fetchWhatsapp = async () => {
      const { data } = await supabase.from('settings').select('id, value').eq('id', 'whatsapp_number').single();
      if (data?.value) setWhatsappNumber(data.value);
    };
    fetchWhatsapp();
  }, []);

  // Automatically submit referral if returning from login auth
  useEffect(() => {
    const handlePendingReferral = async () => {
      const referralPending = searchParams.get('referralPending');
      const pendingDataStr = sessionStorage.getItem('pending_referral');

      if (referralPending === 'true' && pendingDataStr) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            const pending = JSON.parse(pendingDataStr);
            setLoading(true);

            const messageBody = `[REFERRAL PROGRAM SUBMISSION]

=== REFERRER DETAILS ===
• Name: ${pending.referrerName}
• Email: ${pending.referrerEmail}
• Phone: ${pending.referrerPhone}

=== PURPOSE OF REFERRAL ===
${pending.purpose}

=== REFERRAL CANDIDATE (WHOM THEY REFER) ===
• Name: ${pending.referredName}
• Email: ${pending.referredEmail}
• Phone: ${pending.referredPhone}`;

            const { error } = await supabase
              .from('inquiries')
              .insert([
                {
                  name: pending.referrerName,
                  email: pending.referrerEmail,
                  phone: pending.referrerPhone,
                  message: messageBody
                }
              ]);

            if (error) throw error;

            // Send email to both admins
            const adminRecipients = ['sajaruthmahjabeen@gmail.com', 'sagina111@gmail.com'];
            const emailHtml = `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;color:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
                <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:32px;text-align:center">
                  <h1 style="margin:0;font-size:24px;color:#fff">🤝 New Referral Submission</h1>
                  <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px">SA Consultant &amp; Staffing</p>
                </div>
                <div style="padding:32px">
                  <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #e2e8f0">
                    <h3 style="margin:0 0 12px;color:#4f46e5;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Referrer (Who Referred)</h3>
                    <p style="margin:0 0 6px;font-size:14px"><strong>Name:</strong> ${pending.referrerName}</p>
                    <p style="margin:0 0 6px;font-size:14px"><strong>Email:</strong> <a href="mailto:${pending.referrerEmail}" style="color:#4f46e5;text-decoration:none">${pending.referrerEmail}</a></p>
                    <p style="margin:0;font-size:14px"><strong>Phone:</strong> <a href="tel:${pending.referrerPhone}" style="color:#4f46e5;text-decoration:none">${pending.referrerPhone}</a></p>
                  </div>
                  <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;border-left:4px solid #06b6d4;border:1px solid #e2e8f0">
                    <h3 style="margin:0 0 12px;color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Referred Person (Candidate)</h3>
                    <p style="margin:0 0 6px;font-size:14px"><strong>Name:</strong> ${pending.referredName}</p>
                    <p style="margin:0 0 6px;font-size:14px"><strong>Email:</strong> <a href="mailto:${pending.referredEmail}" style="color:#4f46e5;text-decoration:none">${pending.referredEmail}</a></p>
                    <p style="margin:0;font-size:14px"><strong>Phone:</strong> <a href="tel:${pending.referredPhone}" style="color:#4f46e5;text-decoration:none">${pending.referredPhone}</a></p>
                  </div>
                  <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0">
                    <h3 style="margin:0 0 8px;color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Purpose of Referral</h3>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155">${pending.purpose}</p>
                  </div>
                  <p style="color:#64748b;font-size:12px;text-align:center;margin:0">This is an automated notification from SA Consultant & Staffing Website.</p>
                </div>
              </div>`;

            supabase.functions.invoke('send-email', {
              body: {
                recipients: adminRecipients,
                subject: `🤝 New Referral Submitted by ${pending.referrerName}`,
                text: `New Referral Program Submission:\n\nReferrer:\nName: ${pending.referrerName}\nEmail: ${pending.referrerEmail}\nPhone: ${pending.referrerPhone}\n\nReferred Person:\nName: ${pending.referredName}\nEmail: ${pending.referredEmail}\nPhone: ${pending.referredPhone}\n\nPurpose:\n${pending.purpose}`,
                html: emailHtml
              }
            }).catch(err => console.error('Error sending referral email:', err));

            // Open Dialog and set successful state
            setFormData(pending);
            setIsOpen(true);
            setIsSubmitted(true);

            // Clean up session and search params
            sessionStorage.removeItem('pending_referral');
            searchParams.delete('referralPending');
            setSearchParams(searchParams);

            toast({
              title: "Referral Confirmed!",
              description: "Thank you for recommending us. Your referral is now locked in after logging in.",
            });
          } catch (err: any) {
            console.error('Error auto-submitting pending referral:', err);
            toast({
              variant: 'destructive',
              title: 'Auto-Submit Failed',
              description: err.message || 'Could not finalize your referral automatically.',
            });
          } finally {
            setLoading(false);
          }
        }
      }
    };
    handlePendingReferral();
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce Login: Check auth session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Save current referral details in sessionStorage
      sessionStorage.setItem('pending_referral', JSON.stringify(formData));

      toast({
        title: "Authentication Required",
        description: "Redirecting you to login. Your referral will be submitted automatically right after!",
      });

      // Close referral dialog temporarily
      setIsOpen(false);

      // Redirect to Auth page
      navigate('/auth?returnTo=' + encodeURIComponent('/?referralPending=true'));
      return;
    }

    setLoading(true);

    try {
      const messageBody = `[REFERRAL PROGRAM SUBMISSION]

=== REFERRER DETAILS ===
• Name: ${formData.referrerName}
• Email: ${formData.referrerEmail}
• Phone: ${formData.referrerPhone}

=== PURPOSE OF REFERRAL ===
${formData.purpose}

=== REFERRAL CANDIDATE (WHOM THEY REFER) ===
• Name: ${formData.referredName}
• Email: ${formData.referredEmail}
• Phone: ${formData.referredPhone}`;

      const { error } = await supabase
        .from('inquiries')
        .insert([
          {
            name: formData.referrerName,
            email: formData.referrerEmail,
            phone: formData.referrerPhone,
            message: messageBody
          }
        ]);

      if (error) throw error;

      // Send email to both admins
      const adminRecipients = ['sajaruthmahjabeen@gmail.com', 'sagina111@gmail.com'];
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;color:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
          <div style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:32px;text-align:center">
            <h1 style="margin:0;font-size:24px;color:#fff">🤝 New Referral Submission</h1>
            <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px">SA Consultant &amp; Staffing</p>
          </div>
          <div style="padding:32px">
            <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #e2e8f0">
              <h3 style="margin:0 0 12px;color:#4f46e5;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Referrer (Who Referred)</h3>
              <p style="margin:0 0 6px;font-size:14px"><strong>Name:</strong> ${formData.referrerName}</p>
              <p style="margin:0 0 6px;font-size:14px"><strong>Email:</strong> <a href="mailto:${formData.referrerEmail}" style="color:#4f46e5;text-decoration:none">${formData.referrerEmail}</a></p>
              <p style="margin:0;font-size:14px"><strong>Phone:</strong> <a href="tel:${formData.referrerPhone}" style="color:#4f46e5;text-decoration:none">${formData.referrerPhone}</a></p>
            </div>
            <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;border-left:4px solid #06b6d4;border:1px solid #e2e8f0">
              <h3 style="margin:0 0 12px;color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Referred Person (Candidate)</h3>
              <p style="margin:0 0 6px;font-size:14px"><strong>Name:</strong> ${formData.referredName}</p>
              <p style="margin:0 0 6px;font-size:14px"><strong>Email:</strong> <a href="mailto:${formData.referredEmail}" style="color:#4f46e5;text-decoration:none">${formData.referredEmail}</a></p>
              <p style="margin:0;font-size:14px"><strong>Phone:</strong> <a href="tel:${formData.referredPhone}" style="color:#4f46e5;text-decoration:none">${formData.referredPhone}</a></p>
            </div>
            <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0">
              <h3 style="margin:0 0 8px;color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Purpose of Referral</h3>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#334155">${formData.purpose}</p>
            </div>
            <p style="color:#64748b;font-size:12px;text-align:center;margin:0">This is an automated notification from SA Consultant & Staffing Website.</p>
          </div>
        </div>`;

      supabase.functions.invoke('send-email', {
        body: {
          recipients: adminRecipients,
          subject: `🤝 New Referral Submitted by ${formData.referrerName}`,
          text: `New Referral Program Submission:\n\nReferrer:\nName: ${formData.referrerName}\nEmail: ${formData.referrerEmail}\nPhone: ${formData.referrerPhone}\n\nReferred Person:\nName: ${formData.referredName}\nEmail: ${formData.referredEmail}\nPhone: ${formData.referredPhone}\n\nPurpose:\n${formData.purpose}`,
          html: emailHtml
        }
      }).catch(err => console.error('Error sending referral email:', err));

      setIsSubmitted(true);
      toast({
        title: "Referral Submitted!",
        description: "Thank you for recommending us. We'll be in touch soon.",
      });
    } catch (err: any) {
      console.error('Error submitting referral:', err);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was an error submitting your referral. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after transition finishes
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        referrerName: '',
        referrerEmail: '',
        referrerPhone: '',
        purpose: '',
        referredName: '',
        referredEmail: '',
        referredPhone: ''
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
            const isReferral = program.title === 'Referral Program';
            return (
              <div 
                key={program.title}
                className={`scroll-reveal glass p-8 md:p-10 rounded-[2.5rem] hover-lift hover-glow transition-all duration-500 border border-border group relative overflow-hidden ${isReferral ? 'cursor-pointer hover:border-primary/45' : ''}`}
                style={{ transitionDelay: `${i * 150}ms` }}
                onClick={() => {
                  if (isReferral) {
                    setIsOpen(true);
                  }
                }}
              >
                {/* Subtle accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 gradient-bg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex flex-col md:flex-row gap-8 items-start h-full justify-between">
                  <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                    <program.icon size={32} className="text-white" />
                  </div>
                  
                  <div className="flex-1 flex flex-col h-full justify-between">
                    <div>
                      <h3 className="text-2xl font-display font-black mb-4 group-hover:text-primary transition-colors flex items-center gap-2">
                        {program.title}
                        {isReferral && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 font-bold uppercase tracking-widest group-hover:animate-pulse">
                            Apply Now
                          </span>
                        )}
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

                    {isReferral && (
                      <div className="mt-6 flex items-center gap-2 text-primary font-black text-xs md:text-sm group-hover:translate-x-1 transition-transform">
                        Open Referral Form <ArrowRight size={16} />
                      </div>
                    )}
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
            <a 
              href="#contact" 
              className="px-10 py-5 gradient-bg rounded-2xl font-black text-white hover-lift hover-glow transition-all duration-300 flex items-center justify-center gap-2"
            >
              Apply to Partner <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* REFERRAL FORM DIALOG */}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="glass-strong border border-primary/20 max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 pt-10 md:pt-12 rounded-3xl shadow-2xl">
          {!isSubmitted ? (
            <>
              <DialogHeader className="mb-6 pr-8">
                <DialogTitle className="text-xl md:text-2xl font-display font-black tracking-tight flex items-center gap-2">
                  <Users2 className="text-primary" size={24} />
                  SA Consultant <span className="gradient-text">Referral Program</span>
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  Recommend a client to SA Consultant and earn rewards for every successful partnership!
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Section 1: Referrer Information */}
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

                  {/* Section 2: Referral Candidate Details */}
                  <div className="p-5 rounded-2xl bg-secondary/35 border border-primary/5 space-y-4">
                    <h4 className="text-xs font-black text-accent uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent" />
                      Candidate Details
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

                {/* Section 3: Referral Purpose */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">For which purpose do you refer them? *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Describe their project scope, staffing or consulting needs..."
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-foreground text-sm font-medium"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-bg py-4 rounded-2xl font-black text-white hover-lift hover-glow flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed shadow-lg shadow-primary/20 text-base"
                >
                  {loading ? (
                    <>
                      Submitting Referral... <Loader2 className="animate-spin" size={20} />
                    </>
                  ) : (
                    <>
                      Submit Referral <ArrowRight size={20} />
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
                <h3 className="text-3xl font-display font-black gradient-text">Referral Received!</h3>
                <p className="text-foreground font-black text-xl max-w-md mx-auto leading-relaxed">
                  SA Consultant members will reach you soon!
                </p>
                <p className="text-muted-foreground text-sm font-medium max-w-sm mx-auto leading-relaxed">
                  We appreciate your recommendation. An advisor will contact both you and the referred candidate shortly to coordinate and explain our competitive rewards.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="px-8 py-3.5 bg-foreground text-background font-black rounded-xl hover-lift transition-all duration-300 text-sm shadow-md"
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

