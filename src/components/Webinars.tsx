import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, User, Phone, Mail, Loader2, ArrowRight, CheckCircle2, Video } from 'lucide-react';

interface Webinar {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  duration: string | null;
  host_name: string | null;
  meeting_link: string | null;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function Webinars() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchUpcomingWebinars();
  }, []);

  const fetchUpcomingWebinars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .eq('status', 'upcoming')
        .order('date', { ascending: true });

      if (error) throw error;
      setWebinars(data || []);
    } catch (err: any) {
      console.error('Error fetching webinars:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (webinar: Webinar) => {
    setSelectedWebinar(webinar);
    setIsRegistered(false);
    setFormData({ name: '', email: '', phone: '' });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWebinar) return;

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in all details to register.',
      });
      return;
    }

    setSubmitting(true);

    try {
      // 1. Check for duplicate registration
      const { data: existingReg, error: checkError } = await supabase
        .from('webinar_registrations')
        .select('id')
        .eq('webinar_id', selectedWebinar.id)
        .eq('email', formData.email.toLowerCase().trim())
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingReg) {
        toast({
          title: 'Already Registered',
          description: 'You have already registered for this webinar using this email address.',
        });
        setIsRegistered(true);
        setSubmitting(false);
        return;
      }

      // 2. Insert registration
      const { error: insertError } = await supabase
        .from('webinar_registrations')
        .insert({
          webinar_id: selectedWebinar.id,
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim(),
        });

      if (insertError) throw insertError;

      // 3. Send confirmation email to client and notification to both admins
      const adminRecipients = ['sajaruthmahjabeen@gmail.com', 'sagina111@gmail.com'];
      
      const formattedDate = new Date(selectedWebinar.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      // Admin Email Template
      const adminHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;color:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
          <div style="background:linear-gradient(135deg,#14b8a6,#0f766e);padding:32px;text-align:center">
            <h1 style="margin:0;font-size:24px;color:#fff">📹 New Webinar Registration</h1>
            <p style="margin:8px 0 0;color:#ccfbf1;font-size:14px">SA Consultant &amp; Staffing</p>
          </div>
          <div style="padding:32px">
            <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #e2e8f0">
              <h3 style="margin:0 0 12px;color:#0f766e;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Webinar Details</h3>
              <p style="margin:0 0 6px;font-size:14px"><strong>Topic:</strong> ${selectedWebinar.title}</p>
              <p style="margin:0 0 6px;font-size:14px"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin:0;font-size:14px"><strong>Time:</strong> ${selectedWebinar.time} (${selectedWebinar.duration || '1 hour'})</p>
            </div>
            
            <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0">
              <h3 style="margin:0 0 12px;color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Registrant Details</h3>
              <p style="margin:0 0 6px;font-size:14px"><strong>Name:</strong> ${formData.name}</p>
              <p style="margin:0 0 6px;font-size:14px"><strong>Email:</strong> <a href="mailto:${formData.email}" style="color:#0f766e;text-decoration:none">${formData.email}</a></p>
              <p style="margin:0;font-size:14px"><strong>Phone:</strong> <a href="tel:${formData.phone}" style="color:#0f766e;text-decoration:none">${formData.phone}</a></p>
            </div>
            <p style="color:#64748b;font-size:12px;text-align:center;margin:0">This is an automated notification from SA Consultant & Staffing.</p>
          </div>
        </div>`;

      // Client Email Template
      const clientHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;color:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
          <div style="background:linear-gradient(135deg,#06b6d4,#0891b2);padding:32px;text-align:center">
            <h1 style="margin:0;font-size:24px;color:#fff">Seat Reserved! 📹</h1>
            <p style="margin:8px 0 0;color:#c5f2f7;font-size:14px">SA Consultant &amp; Staffing</p>
          </div>
          <div style="padding:32px">
            <p style="font-size:15px;line-height:1.6">Hi ${formData.name},</p>
            <p style="font-size:15px;line-height:1.6">Thank you for registering for our upcoming live webinar. Your seat has been successfully reserved!</p>
            
            <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0">
              <h3 style="margin:0 0 12px;color:#0891b2;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Event Details</h3>
              <p style="margin:0 0 8px;font-size:15px"><strong>Webinar:</strong> ${selectedWebinar.title}</p>
              <p style="margin:0 0 8px;font-size:14px"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin:0 0 8px;font-size:14px"><strong>Time:</strong> ${selectedWebinar.time} (${selectedWebinar.duration || '1 hour'})</p>
              <p style="margin:0 0 8px;font-size:14px"><strong>Host:</strong> ${selectedWebinar.host_name || 'SA Team'}</p>
              ${selectedWebinar.meeting_link ? `<p style="margin:12px 0 0;font-size:14px"><strong>Join Link:</strong> <a href="${selectedWebinar.meeting_link}" style="color:#0891b2;font-weight:bold;text-decoration:underline">Click Here to Join</a></p>` : ''}
            </div>
            
            <p style="font-size:14px;line-height:1.6">We look forward to seeing you there. If you have any questions, feel free to reply to this email.</p>
            <p style="margin:24px 0 0;font-size:14px">Best regards,<br><strong>SA Consultant & Staffing Team</strong></p>
          </div>
        </div>`;

      // Dispatch emails in parallel background processes
      const emailPromises = [
        // 1. Admin Email Notification
        supabase.functions.invoke('send-email', {
          body: {
            recipients: adminRecipients,
            subject: `📹 New Webinar Registration: ${formData.name}`,
            text: `Webinar Registration:\n\nTopic: ${selectedWebinar.title}\nDate: ${formattedDate}\nTime: ${selectedWebinar.time}\n\nRegistrant:\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}`,
            html: adminHtml
          }
        }),
        // 2. Client Confirmation Receipt
        supabase.functions.invoke('send-email', {
          body: {
            recipients: [formData.email],
            subject: `Webinar Registration Confirmed! - ${selectedWebinar.title}`,
            text: `Hi ${formData.name}, your registration is confirmed for the webinar: ${selectedWebinar.title} on ${formattedDate} at ${selectedWebinar.time}.`,
            html: clientHtml
          }
        })
      ];

      Promise.allSettled(emailPromises).catch(err => console.error('Error sending webinar emails:', err));

      setIsRegistered(true);
      toast({
        title: 'Registration Successful',
        description: 'Your seat has been reserved! A confirmation email has been sent.',
      });
    } catch (err: any) {
      console.error('Error registering for webinar:', err);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: err.message || 'There was an error processing your registration.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="webinars" className="py-24 relative overflow-hidden bg-background">
      {/* Decorative Gradients */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 scroll-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-4">
            <Video size={16} className="text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Live Learning & Events</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4">
            Upcoming <span className="gradient-text">Webinars & Masterclasses</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Enhance your career and business strategies with our interactive webinars hosted by industry experts.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : webinars.length === 0 ? (
          <div className="glass p-12 text-center rounded-[2rem] max-w-xl mx-auto border border-border">
            <Video size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No Scheduled Webinars</h3>
            <p className="text-muted-foreground text-sm">
              We are currently planning our next sessions. Check back soon or register for a consultation to talk with our team.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webinars.map((webinar) => (
              <div 
                key={webinar.id} 
                className="scroll-reveal flex flex-col justify-between glass p-8 rounded-[2rem] border border-border hover-lift hover-glow transition-all duration-500 group relative overflow-hidden"
              >
                {/* Background glow hover effect */}
                <div className="absolute -inset-px bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] -z-10" />
                
                <div>
                  {/* Top Meta info */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold tracking-widest uppercase bg-primary/15 text-primary px-3 py-1.5 rounded-full border border-primary/20">
                      {webinar.duration || '1 Hour'}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-green-500 font-semibold uppercase animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Live Session
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors duration-300">
                    {webinar.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                    {webinar.description || 'Join this live session to learn workforce strategies, career development methods, and recruiting hacks from SA Consultant advisors.'}
                  </p>
                </div>

                {/* Event Details Grid */}
                <div className="border-t border-border/60 pt-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <Calendar size={16} className="text-primary" />
                      <span>
                        {new Date(webinar.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground">
                      <Clock size={16} className="text-primary" />
                      <span>{webinar.time}</span>
                    </div>
                    {webinar.host_name && (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <User size={16} className="text-primary" />
                        <span>Hosted by: <strong className="text-foreground">{webinar.host_name}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Register Trigger Button */}
                  <Button 
                    onClick={() => handleRegisterClick(webinar)}
                    className="w-full rounded-xl gradient-bg border-none gap-2 hover:opacity-90 font-bold"
                  >
                    Register Free Spot <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REGISTRATION DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] glass p-8 border border-primary/20">
          {isRegistered ? (
            <div className="text-center py-8">
              <CheckCircle2 size={64} className="mx-auto text-green-500 mb-6 animate-bounce" />
              <DialogTitle className="text-2xl font-display font-black mb-3">Registration Confirmed!</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mb-6">
                Your seat has been reserved. We have sent the webinar joining details and calendar invitation to <strong>{formData.email}</strong>.
              </DialogDescription>
              {selectedWebinar?.meeting_link && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 mb-6 text-left">
                  <p className="text-xs text-primary font-bold uppercase mb-2 tracking-wider">Your Webinar Link</p>
                  <a 
                    href={selectedWebinar.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2 break-all underline"
                  >
                    <Video size={16} className="text-primary flex-shrink-0" />
                    {selectedWebinar.meeting_link}
                  </a>
                </div>
              )}
              <Button 
                onClick={() => setDialogOpen(false)}
                className="w-full rounded-xl gradient-bg border-none font-bold"
              >
                Got it, Thank you!
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Video size={24} />
                </div>
                <DialogTitle className="text-2xl font-display font-black leading-tight">
                  Reserve Your Webinar Spot
                </DialogTitle>
                <DialogDescription className="text-muted-foreground pt-1">
                  Fill in your details below to secure your seat. You will receive an email confirmation.
                </DialogDescription>
              </DialogHeader>

              {/* Webinar Context Bar */}
              {selectedWebinar && (
                <div className="bg-muted/50 rounded-xl p-4 my-2 border border-border text-xs flex flex-col gap-1.5">
                  <p className="font-bold text-foreground line-clamp-1">{selectedWebinar.title}</p>
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    📅 {new Date(selectedWebinar.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedWebinar.time}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-11 rounded-xl bg-background/50 border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-11 rounded-xl bg-background/50 border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="e.g. +1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-11 rounded-xl bg-background/50 border-border focus:border-primary"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-6 rounded-xl gradient-bg border-none h-11 font-bold gap-2"
                >
                  {submitting ? (
                    <>Reserving Seat... <Loader2 className="animate-spin" size={18} /></>
                  ) : (
                    <>Confirm Registration <ArrowRight size={18} /></>
                  )}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
