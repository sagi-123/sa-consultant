import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, User, Phone, Mail, Loader2, ArrowRight, CheckCircle2, Video, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function WebinarFlashcards() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const { toast } = useToast();

  useEffect(() => {
    fetchWebinars();
  }, []);

  // Auto-slide effect if there are multiple webinars
  useEffect(() => {
    if (webinars.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % webinars.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [webinars]);

  const fetchWebinars = async () => {
    try {
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .eq('status', 'upcoming')
        .order('date', { ascending: true });

      if (error) throw error;
      setWebinars(data || []);
    } catch (err) {
      console.error('Error fetching webinars for flashcards:', err);
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
      // 1. Check duplicate
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
          description: 'You have already registered for this webinar using this email.',
        });
        setIsRegistered(true);
        setSubmitting(false);
        return;
      }

      // 2. Insert
      const { error: insertError } = await supabase
        .from('webinar_registrations')
        .insert({
          webinar_id: selectedWebinar.id,
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim(),
        });

      if (insertError) throw insertError;

      // 3. Dispatch confirmation emails
      const adminRecipients = ['sajaruthmahjabeen@gmail.com', 'sagina111@gmail.com'];
      const formattedDate = new Date(selectedWebinar.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

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
          </div>
        </div>`;

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
          </div>
        </div>`;

      const emailPromises = [
        supabase.functions.invoke('send-email', {
          body: {
            recipients: adminRecipients,
            subject: `📹 New Webinar Registration: ${formData.name}`,
            text: `Webinar Registration:\n\nTopic: ${selectedWebinar.title}\nDate: ${formattedDate}\nTime: ${selectedWebinar.time}`,
            html: adminHtml
          }
        }),
        supabase.functions.invoke('send-email', {
          body: {
            recipients: [formData.email],
            subject: `Webinar Registration Confirmed! - ${selectedWebinar.title}`,
            text: `Hi ${formData.name}, your registration is confirmed.`,
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
      console.error('Error registering:', err);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: err.message || 'There was an error processing your registration.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || webinars.length === 0) return null;

  const currentWebinar = webinars[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % webinars.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + webinars.length) % webinars.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-6 sm:mb-8 animate-fade-in relative z-20">
      <div className="relative group bg-gradient-to-r from-primary/15 to-accent/15 backdrop-blur-xl border border-primary/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-primary/10 overflow-hidden flex flex-col md:flex-row items-center gap-4 sm:gap-6 justify-between">
        
        {/* Glow overlay */}
        <div className="absolute -inset-px bg-gradient-to-r from-primary/10 to-accent/10 opacity-50 -z-10 blur-xl" />

        {/* Content */}
        <div className="flex-1 text-left w-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs font-black tracking-widest uppercase text-red-500">UPCOMING LIVE WEBINAR</span>
            {webinars.length > 1 && (
              <span className="text-[10px] bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold ml-auto md:ml-0">
                {currentIndex + 1} of {webinars.length}
              </span>
            )}
          </div>
          
          <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug line-clamp-2">
            {currentWebinar.title}
          </h3>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs font-bold text-gray-700">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-primary" />
              {new Date(currentWebinar.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-primary" />
              {currentWebinar.time}
            </span>
          </div>
        </div>

        {/* Action & Controls */}
        <div className="flex flex-row md:flex-col items-center gap-3 w-full md:w-auto justify-between border-t md:border-t-0 border-border/50 pt-3 md:pt-0">
          <Button
            onClick={() => handleRegisterClick(currentWebinar)}
            className="rounded-xl gradient-bg font-black text-white hover-lift hover-glow shadow-md shadow-primary/20 text-xs px-5 py-3 h-auto w-full md:w-auto"
          >
            Register Free <ArrowRight size={13} className="ml-1" />
          </Button>

          {/* Carousel Arrows */}
          {webinars.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button 
                onClick={prevSlide}
                className="h-7 w-7 rounded-lg glass border border-primary/20 flex items-center justify-center text-foreground hover:bg-primary/10 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={nextSlide}
                className="h-7 w-7 rounded-lg glass border border-primary/20 flex items-center justify-center text-foreground hover:bg-primary/10 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* dialog modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] glass p-8 border border-primary/20">
          {isRegistered ? (
            <div className="text-center py-8">
              <CheckCircle2 size={64} className="mx-auto text-green-500 mb-6 animate-bounce" />
              <DialogTitle className="text-2xl font-display font-black mb-3">Registration Confirmed!</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mb-6">
                Your seat has been reserved. We have sent the webinar details to <strong>{formData.email}</strong>.
              </DialogDescription>
              {selectedWebinar?.meeting_link && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 mb-6 text-left">
                  <p className="text-xs text-primary font-bold uppercase mb-2 tracking-wider">Join Link</p>
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
                  Reserve Your Spot
                </DialogTitle>
                <DialogDescription className="text-muted-foreground pt-1">
                  Fill in your details below to secure your seat.
                </DialogDescription>
              </DialogHeader>

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
    </div>
  );
}
