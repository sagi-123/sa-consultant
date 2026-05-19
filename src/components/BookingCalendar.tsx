import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, Trash2, User, Mail, Phone, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [preferredSlots, setPreferredSlots] = useState<{ date: Date; time: string }[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('9384797751');
  const { toast } = useToast();

  // Load WhatsApp number from settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('value').eq('id', 'whatsapp_number').single();
      if (data) setWhatsappNumber(data.value);
    };
    fetchSettings();
  }, []);

  // Time slots available (9 AM to 5 PM)
  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM'
  ];

  // Helper to check if a slot is already added
  const isSlotAdded = (date: Date, time: string) => {
    return preferredSlots.some(
      (slot) => slot.date.toDateString() === date.toDateString() && slot.time === time
    );
  };

  // Add slot to selections (Exactly 3)
  const handleAddSlot = () => {
    if (!selectedDate || !selectedTime) return;

    if (preferredSlots.length >= 3) {
      toast({
        variant: "destructive",
        title: "Max slots reached",
        description: "You have already selected 3 preferred slots."
      });
      return;
    }

    if (isSlotAdded(selectedDate, selectedTime)) {
      toast({
        variant: "destructive",
        title: "Slot already selected",
        description: "You have already added this preferred slot."
      });
      return;
    }

    setPreferredSlots([...preferredSlots, { date: selectedDate, time: selectedTime }]);
    setSelectedTime(null);

    toast({
      title: "Slot Added",
      description: `Added: ${selectedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })} at ${selectedTime}`
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

    if (preferredSlots.length !== 3) {
      toast({
        variant: "destructive",
        title: "Incomplete Slot Selection",
        description: "Please choose exactly 3 preferred slots."
      });
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

      const s1 = formatSlot(preferredSlots[0]);
      const s2 = formatSlot(preferredSlots[1]);
      const s3 = formatSlot(preferredSlots[2]);

      // 1. Save to Supabase appointments table
      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            client_name: formData.name,
            client_email: formData.email,
            client_phone: formData.phone,
            slot_1: s1,
            slot_2: s2,
            slot_3: s3,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      // 2. Build WhatsApp confirmation text
      const whatsappText = `🤝 *New Appointment Request from SA CONSULTANT AND STAFFING*%0A%0A` +
        `*Client:* ${formData.name}%0A` +
        `*Email:* ${formData.email}%0A` +
        `*Phone:* ${formData.phone}%0A%0A` +
        `*Preferred Slots (Please confirm one):*%0A` +
        `1️⃣ ${s1}%0A` +
        `2️⃣ ${s2}%0A` +
        `3️⃣ ${s3}`;

      const cleanedNumber = whatsappNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${whatsappText}`;

      // Open WhatsApp in a new window/tab
      window.open(whatsappUrl, '_blank');

      setIsSuccess(true);
      toast({
        title: "Slots Booked Successfully!",
        description: "Your slots have been saved. Sending a message on WhatsApp..."
      });

      // Reset form
      setFormData({ name: '', email: '', phone: '' });
      setPreferredSlots([]);
      setSelectedDate(undefined);
      setSelectedTime(null);
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

  // Custom function to disable weekends and past dates
  const isDateDisabled = (date: Date) => {
    const day = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day === 0 || day === 6 || date < today;
  };

  return (
    <section id="book" className="pt-10 pb-24 sm:py-16 md:py-20 relative overflow-hidden w-full bg-secondary/20">
      <style>{`
        /* Responsive DayPicker Custom Styles */
        .rdp-months {
          width: 100% !important;
          justify-content: center !important;
        }
        .rdp-month {
          width: 100% !important;
          max-width: 100% !important;
        }
        .rdp-table {
          width: 100% !important;
          max-width: 100% !important;
        }
        .rdp-day {
          width: 100% !important;
          max-width: 36px !important;
          height: 36px !important;
          margin: 0 auto !important;
        }
        .rdp-head_cell {
          width: 100% !important;
          max-width: 36px !important;
          font-weight: 600 !important;
        }
        
        @media (max-width: 380px) {
          .rdp-day {
            max-width: 30px !important;
            height: 30px !important;
            font-size: 11px !important;
          }
          .rdp-head_cell {
            max-width: 30px !important;
            font-size: 10px !important;
          }
          .rdp-caption_label {
            font-size: 13px !important;
          }
        }
      `}</style>
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
      <div className="container mx-auto relative z-10 w-full px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10 lg:mb-16 scroll-reveal">
          <span className="text-primary text-sm font-semibold tracking-widest uppercase">Appointments</span>
          <h2 className="fluid-h2 font-display font-black tracking-tight mt-3 mb-4 lg:mb-6">
            Book a <span className="gradient-text">Meeting</span>
          </h2>
          <p className="text-foreground font-semibold max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Ready to consult with us? Select exactly <span className="text-primary font-black">three preferred slots</span> below to reserve your appointment on weekdays.
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
                We have registered your 3 preferred meeting slots. We are redirecting you to WhatsApp to notify our consultant instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                If the WhatsApp tab did not open automatically, please click the button below to complete your booking notification.
              </p>
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
                <CardContent className="p-3 xs:p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-6 justify-between flex-1 items-stretch">
                  {/* Calendar Widget */}
                  <div className="flex-1 flex justify-center items-center bg-secondary/30 p-1 sm:p-2 rounded-xl border border-border/50 max-w-full overflow-hidden">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }}
                      disabled={isDateDisabled}
                      className="rounded-md border-0 w-full"
                    />
                  </div>

                  {/* Hours Selector */}
                  <div className="md:w-60 flex flex-col mt-4 md:mt-0">
                    <Label className="text-sm font-bold text-foreground mb-3 flex items-center gap-1">
                      <Clock size={14} className="text-accent" /> Time Slots ({selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Choose Date'})
                    </Label>
                    {selectedDate ? (
                      <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-2 gap-1.5 sm:gap-2 max-h-[280px] overflow-y-auto pr-1">
                        {timeSlots.map((time) => {
                          const isAdded = isSlotAdded(selectedDate, time);
                          const isSelected = selectedTime === time;
                          return (
                            <Button
                              key={time}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              disabled={isAdded}
                              onClick={() => setSelectedTime(time)}
                              className={`h-9 sm:h-10 text-[10px] xs:text-xs font-bold rounded-lg ${
                                isAdded 
                                  ? "bg-muted text-muted-foreground line-through opacity-40 border-muted" 
                                  : isSelected
                                    ? "gradient-bg text-white border-none shadow-md shadow-primary/20 scale-105"
                                    : "hover:bg-primary/5 hover:border-primary/50 text-foreground"
                              }`}
                            >
                              {time}
                            </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 py-8 text-center text-muted-foreground border border-dashed border-border/80 rounded-xl bg-secondary/10">
                        <CalendarIcon size={24} className="opacity-40 mb-2" />
                        <span className="text-xs font-medium px-4">Please select a weekday on the calendar</span>
                      </div>
                    )}

                    {selectedDate && selectedTime && (
                      <Button
                        type="button"
                        onClick={handleAddSlot}
                        disabled={preferredSlots.length >= 3}
                        className="mt-4 w-full bg-primary font-bold text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all h-9 sm:h-10 rounded-lg text-xs"
                      >
                        Add to List ({preferredSlots.length}/3 Selected)
                      </Button>
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
                    Provide your contact details. Choose exactly 3 slots to finalize.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1">
                  {/* Slots display */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold flex justify-between items-center text-foreground">
                      <span>Selected Slots Required:</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                        preferredSlots.length === 3 
                          ? "bg-green-500/10 text-green-500 border border-green-500/30" 
                          : "bg-primary/10 text-primary border border-primary/30"
                      }`}>
                        {preferredSlots.length} / 3 Chosen
                      </span>
                    </Label>

                    {preferredSlots.length === 0 ? (
                      <div className="border border-dashed border-border p-4 sm:p-5 rounded-xl text-center text-xs sm:text-sm text-muted-foreground bg-secondary/10">
                        No slots selected yet. Pick a day and time above to select 3 preferred meeting slots.
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

                    <Button
                      type="submit"
                      disabled={preferredSlots.length !== 3 || isSubmitting}
                      className="w-full gradient-bg font-black text-white hover-lift hover-glow py-3 h-auto min-h-12 rounded-xl flex items-center justify-center gap-2 transition-all mt-4 sm:mt-6 shadow-lg shadow-primary/20 text-sm sm:text-base"
                    >
                      {isSubmitting ? (
                        "Booking Slots..."
                      ) : (
                        <>
                          <span className="sm:hidden">Book & Open WhatsApp</span>
                          <span className="hidden sm:inline">Book Slots & Open WhatsApp</span>
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
