import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Clock, Trash2, User, Mail, Phone, CheckCircle2, Sparkles, Send, Briefcase, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

import { getAdminBookingEmailHtml, getClientBookingEmailHtml } from '@/utils/emailTemplates';

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [preferredSlots, setPreferredSlots] = useState<{ date: Date; time: string }[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [callMeBotKey, setCallMeBotKey] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  // whatsappNumber will be loaded from settings
  // Load CallMeBot API key from settings
useEffect(() => {
  const fetchApiKey = async () => {
    try {
      // Fetch all rows from settings table
      const { data, error } = await supabase.from('settings').select('*');
      console.log('📦 Settings fetch result:', { data, error });

      if (error) {
        console.warn('⚠️ Error fetching settings, proceeding with available data');
      }

      let apiKey: string | undefined;
      if (Array.isArray(data)) {
        for (const row of data) {
          // Direct column named whatsapp_api_key
          if ((row as any).whatsapp_api_key) {
            apiKey = (row as any).whatsapp_api_key;
            break;
          }
          // Conventional id/key with separate value column
          if ((row as any).id === 'whatsapp_api_key' && (row as any).value) {
            apiKey = (row as any).value;
            break;
          }
          if ((row as any).key === 'whatsapp_api_key' && (row as any).value) {
            apiKey = (row as any).value;
            break;
          }
        }
      }

      if (apiKey) {
        setCallMeBotKey(apiKey);
        console.log('✅ CallMeBot key loaded from Supabase settings');
      } else {
        console.warn('⚠️ CallMeBot API key not found in Supabase settings');
      }
    } catch (e) {
      console.error('❌ Unexpected error while fetching CallMeBot key:', e);
    }
  };
  fetchApiKey();
}, []);
  const { toast } = useToast();

  // Load CallMeBot API key from settings (explicit query)
  useEffect(() => {
    const fetchKey = async () => {
      // Try fetching via a column named 'key'
      let { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'whatsapp_api_key')
        .single();
      if (!error && data && (data as any).value) {
        setCallMeBotKey((data as any).value);
        console.log('✅ CallMeBot key fetched via key column');
        return;
      }
      // Fallback: fetch via id column
      ({ data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 'whatsapp_api_key')
        .single());
      if (!error && data && (data as any).value) {
        setCallMeBotKey((data as any).value);
        console.log('✅ CallMeBot key fetched via id column');
      } else {
        console.warn('⚠️ CallMeBot API key not found in settings after explicit queries');
      }
    };
    fetchKey();
  }, []);

  // Load WhatsApp number from settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('value').eq('id', 'whatsapp_number').single();
      if (data) setWhatsappNumber(data.value);
    };
    fetchSettings();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ num1, num2 });
    setCaptchaAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const timeSlots = [
    '10:00 AM (EST)',
    '12:00 PM (EST)',
    '2:00 PM (EST)'
  ];

  // Helper to check if a slot is already added
  const isSlotAdded = (date: Date, time: string) => {
    return preferredSlots.some(
      (slot) => slot.date.toDateString() === date.toDateString() && slot.time === time
    );
  };

  // Add slot directly to selections
  const handleAddSlot = (date: Date, time: string) => {
    if (isSlotAdded(date, time)) {
      toast({
        variant: "destructive",
        title: "Slot already selected",
        description: "You have already added this preferred slot."
      });
      return;
    }

    setPreferredSlots([...preferredSlots, { date, time }]);

    toast({
      title: "Slot Added",
      description: `Added: ${date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })} at ${time}`
    });
  };

  // Remove slot from selections
  const handleRemoveSlot = (index: number) => {
    const updated = [...preferredSlots];
    updated.splice(index, 1);
    setPreferredSlots(updated);
  };

  // Submit appointment booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (preferredSlots.length === 0) {
      toast({
        variant: "destructive",
        title: "No Slots Selected",
        description: "Please select at least one preferred slot."
      });
      return;
    }

    if (parseInt(captchaAnswer) !== captchaQuestion.num1 + captchaQuestion.num2) {
      toast({
        variant: "destructive",
        title: "Incorrect Verification",
        description: "Please solve the math problem correctly to prove you are human."
      });
      generateCaptcha();
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the three slots into user-friendly text
      const formatSlot = (slot: { date: Date; time: string }) => {
        const formattedDate = slot.date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        return `${formattedDate} at ${slot.time}`;
      };

      const s1 = preferredSlots[0] ? formatSlot(preferredSlots[0]) : "N/A";
      const s2 = preferredSlots[1] ? formatSlot(preferredSlots[1]) : "N/A";
      let s3 = preferredSlots[2] ? formatSlot(preferredSlots[2]) : "N/A";

      if (preferredSlots.length > 3) {
        s3 = preferredSlots.slice(2).map(formatSlot).join(', ');
      }

      // 1. Save to Supabase appointments table
      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            client_name: formData.name,
            client_email: formData.email,
            client_phone: formData.phone,
            service: formData.service,
            message: formData.message,
            slot_1: s1,
            slot_2: s2,
            slot_3: s3,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      // Send booking details via email using our upgraded Edge Function
      const adminRecipients = ['sajaruthmahjabeen@gmail.com', 'sagina111@gmail.com'];
      const adminSubject = `New Appointment Request - ${formData.name}`;
      const plainTextFallback = `New consultation request from ${formData.name}.\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nPreferred slots:\n${preferredSlots
        .map((slot, i) => `${i + 1}. ${slot.date.toLocaleDateString()} at ${slot.time}`)
        .join('\n')}`;
      const adminHtml = getAdminBookingEmailHtml(formData.name, formData.email, formData.phone, formData.service, formData.message, preferredSlots);
      const clientHtml = getClientBookingEmailHtml(formData.name, preferredSlots);

      // Trigger both email dispatches concurrently so they do not block each other
      const emailPromises = [
        // 1. Send detailed notification to administrators
        supabase.functions.invoke('send-email', {
          body: {
            recipients: adminRecipients,
            subject: adminSubject,
            text: plainTextFallback,
            html: adminHtml,
          },
        }),
        // 2. Send professional confirmation receipt to the client
        supabase.functions.invoke('send-email', {
          body: {
            recipients: [formData.email],
            subject: 'Booking Request Placed! - SA Consultant & Staffing',
            text: `Hi ${formData.name}, thank you for choosing SA Consultant. Your preferred slots are registered. An SA Consultant and Staffing member will contact you through email to finalize your appointment.`,
            html: clientHtml,
          },
        })
      ];

      try {
        const results = await Promise.allSettled(emailPromises);
        let emailFailed = false;

        results.forEach((res, idx) => {
          if (res.status === 'rejected') {
            console.error(`📧 Email dispatch ${idx === 0 ? 'Admin' : 'Client'} failed:`, res.reason);
            emailFailed = true;
          } else if (res.value.error) {
            console.error(`📧 Email dispatch ${idx === 0 ? 'Admin' : 'Client'} returned error:`, res.value.error);
            emailFailed = true;
          } else {
            console.log(`✅ Email dispatch ${idx === 0 ? 'Admin' : 'Client'} succeeded:`, res.value.data);
          }
        });

        if (emailFailed) {
          toast({
            variant: 'destructive',
            title: 'Partial Email Notification Delay',
            description: 'Your booking has been registered, but some email confirmations could not be dispatched instantly.',
          });
        }
      } catch (emailErr) {
        console.error('📧 Email processing error:', emailErr);
      }

      // Reset form state first, then show success card
      setFormData({ name: '', email: '', phone: '', service: '', message: '' });
      setPreferredSlots([]);
      setSelectedDate(undefined);
      generateCaptcha();
      setIsSuccess(true);
      toast({
        title: 'Booking Request Placed!',
        description: 'Your preferred meeting slots have been successfully registered.',
      });
    } catch (err: any) {
      console.error('Error saving appointment:', err);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: err.message || "There was an error booking your slots. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Disable weekends and all dates within 2 days of today
  // Clients can only book starting 2 days from today (e.g., Mon today → Wed onwards available)
  const isDateDisabled = (date: Date) => {
    const day = date.getDay(); // 0=Sun, 6=Sat
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 2); // Bookings start from 2 days after today

    // Disable: weekends, and any day before minDate
    return day === 0 || day === 6 || date < minDate;
  };

  return (
    <section id="book" className="py-10 md:py-20 lg:py-28 relative overflow-hidden w-full bg-secondary/20">
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
      <div className="container mx-auto relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-16 scroll-reveal">
          <span className="text-primary text-sm font-semibold tracking-widest uppercase">Appointment Booking</span>
          <h2 className="fluid-h2 font-display font-black tracking-tight mt-3 mb-4 lg:mb-6">
            Book a <span className="gradient-text">Meeting</span>
          </h2>
          <p className="text-foreground font-semibold max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Ready to consult with us? Select your preferred slots below to reserve your appointment on weekdays.
          </p>
        </div>

        {isSuccess ? (
          <Card className="glass border-green-500/30 max-w-2xl mx-auto p-4 sm:p-6 md:p-10 text-center space-y-6">
            <CardHeader className="flex flex-col items-center p-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 size={36} className="text-green-500 animate-bounce" />
              </div>
              <CardTitle className="text-2xl font-bold font-display text-green-500 flex items-center gap-2">
                Booking Request Placed! <Sparkles size={20} className="text-accent" />
              </CardTitle>
              <CardDescription className="text-base text-foreground font-medium mt-2">
                We are happy to announce that your booking request has been successfully placed! Our consultant will review your preferred slots and get in touch with you shortly to confirm your appointment.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Button
                onClick={() => {
                  setIsSuccess(false);
                }}
                className="gradient-bg font-bold rounded-xl h-12 px-8"
              >
                Book Another Meeting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 max-w-6xl mx-auto w-full">
            {/* Column 1: Date & Time Picker */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Card className="glass border-primary/20 shadow-sm flex-1 flex flex-col">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                  <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
                    <CalendarIcon size={20} className="text-primary" /> Step 1: Select Date & Time
                  </CardTitle>
                  <CardDescription>Meetings only available on weekdays (9:00 AM - 5:00 PM).</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 flex-1">
                  {/* Calendar Widget */}
                  <div className="w-full flex justify-center items-center bg-secondary/30 p-3 sm:p-4 rounded-xl border border-border/50 overflow-hidden">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                      }}
                      disabled={isDateDisabled}
                      className="rounded-md border-0 mx-auto"
                    />
                  </div>

                  {/* Hours Selector */}
                  <div className="w-full flex flex-col">
                    <Label className="text-sm font-bold text-foreground mb-3 flex items-center justify-center sm:justify-start gap-1">
                      <Clock size={14} className="text-accent" /> Time Slots ({selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Choose Date'})
                    </Label>
                    {selectedDate ? (
                      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                        {timeSlots.map((time) => {
                          const isAdded = isSlotAdded(selectedDate, time);
                          return (
                            <Button
                              key={time}
                              type="button"
                              variant="outline"
                              disabled={isAdded}
                              onClick={() => selectedDate && handleAddSlot(selectedDate, time)}
                              className={`h-auto min-h-[44px] py-2 px-1 text-xs font-bold rounded-lg text-center ${isAdded
                                  ? "bg-muted text-muted-foreground line-through opacity-40 border-muted"
                                  : "hover:bg-primary/5 hover:border-primary/50 text-foreground"
                                }`}
                            >
                              {time}
                            </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-start flex-1 pt-6 pb-6 text-center text-muted-foreground border border-dashed border-border/80 rounded-xl bg-secondary/10">
                        <CalendarIcon size={24} className="opacity-40 mb-2" />
                        <span className="text-xs font-medium px-4">Please select a weekday on the calendar</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Selected Slots & Client Booking Form */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <Card className="glass border-primary/20 shadow-sm flex flex-col h-full justify-between">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                  <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
                    <Sparkles size={20} className="text-accent" /> Step 2: Book Your Slots
                  </CardTitle>
                  <CardDescription>
                    Provide your contact details. Choose your preferred slots to finalize.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1">
                  {/* Slots display */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold flex justify-between items-center text-foreground">
                      <span>Selected Slots</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-black ${preferredSlots.length > 0
                          ? "bg-green-500/10 text-green-500 border border-green-500/30"
                          : "bg-primary/10 text-primary border border-primary/30"
                        }`}
                      >{preferredSlots.length} Chosen</span>
                    </Label>

                    {preferredSlots.length === 0 ? (
                      <div className="border border-dashed border-border p-4 sm:p-5 rounded-xl text-center text-xs sm:text-sm text-muted-foreground bg-secondary/10">
                        No slots selected yet. Pick a day and time above to select your preferred meeting slots.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {preferredSlots.map((slot, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center bg-secondary/40 border border-primary/10 p-2 sm:p-3 rounded-xl animate-in slide-in-from-top-1 duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                                {i + 1}
                              </span>
                              <div className="text-xs">
                                <p className="font-bold text-foreground">
                                  {slot.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="text-muted-foreground flex items-center gap-1 font-medium mt-0.5">
                                  <Clock size={10} /> {slot.time}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveSlot(i)}
                              className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form fields */}
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-foreground">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 sm:top-3.5 text-muted-foreground/60" size={16} />
                        <Input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="pl-10 h-10 sm:h-11 bg-secondary/40 rounded-lg text-sm"
                          placeholder="Your Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-foreground">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 sm:top-3.5 text-muted-foreground/60" size={16} />
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 h-10 sm:h-11 bg-secondary/40 rounded-lg text-sm"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-foreground">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 sm:top-3.5 text-muted-foreground/60" size={16} />
                        <Input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-10 h-10 sm:h-11 bg-secondary/40 rounded-lg text-sm"
                          placeholder="+1 (123) 456-7890"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-foreground">Services Looking For</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 sm:top-3.5 text-muted-foreground/60 z-10" size={16} />
                        <Select
                          value={formData.service}
                          onValueChange={(value) => setFormData({ ...formData, service: value })}
                          required
                        >
                          <SelectTrigger className="pl-10 h-10 sm:h-11 bg-secondary/40 rounded-lg text-sm">
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                            <SelectItem value="Staffing and Recruiting">Staffing and Recruiting</SelectItem>
                            <SelectItem value="Content Creation">Content Creation</SelectItem>
                            <SelectItem value="Web and App Development">Web and App Development</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-foreground">Message</Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 sm:top-3.5 text-muted-foreground/60 z-10" size={16} />
                        <Textarea
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="pl-10 min-h-[100px] bg-secondary/40 rounded-lg text-sm pt-3 sm:pt-3.5"
                          placeholder="Tell us about the services you are looking for..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-foreground">Captcha: What is {captchaQuestion.num1} + {captchaQuestion.num2}?</Label>
                      <Input
                        type="number"
                        required
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        className="h-10 sm:h-11 bg-secondary/40 rounded-lg text-sm"
                        placeholder="Enter the sum"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={preferredSlots.length === 0 || isSubmitting}
                      className="w-full gradient-bg font-black text-white hover-lift hover-glow py-3 h-auto min-h-12 rounded-xl flex items-center justify-center gap-2 transition-all mt-4 sm:mt-6 shadow-lg shadow-primary/20 text-sm sm:text-base"
                    >
                      {isSubmitting ? (
                        "Booking Slots..."
                      ) : (
                        <>
                          <span className="sm:hidden">Confirm Booking</span>
                          <span className="hidden sm:inline">Confirm Booking</span>
                        </>
                      )}
                      <Send size={16} className="flex-shrink-0" />
                    </Button>
                    <div className="h-2 sm:hidden" />
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
