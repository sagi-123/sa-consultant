import { useState, useEffect } from 'react';
import { Send, MapPin, Mail, Phone, CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [settings, setSettings] = useState({
    contact_email: 'mahjabeensajaruth@gmail.com',
    contact_phone: '+1 (609) 313-9192, 9384797751',
    contact_address: 'New Jersey, USA',
  });

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ num1, num2 });
    setCaptchaAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const settingsMap = data.reduce((acc: any, item: any) => {
          acc[item.id] = item.value;
          return acc;
        }, {});
        setSettings({
          contact_email: settingsMap.contact_email || settings.contact_email,
          contact_phone: settingsMap.contact_phone || settings.contact_phone,
          contact_address: settingsMap.contact_address || settings.contact_address,
        });
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseInt(captchaAnswer) !== captchaQuestion.num1 + captchaQuestion.num2) {
      toast({
        variant: "destructive",
        title: "Incorrect Captcha",
        description: "Please solve the math problem correctly to prove you are human.",
      });
      generateCaptcha();
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Store in Supabase
      const { error } = await supabase
        .from('inquiries')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }]);

      if (error) throw error;

      // 2. Send email notification to both admins
      const adminRecipients = ['sajaruthmahjabeen@gmail.com', 'sagina111@gmail.com'];
      const subject = `New Contact Inquiry from ${formData.name}`;
      const text = `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`;
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #4f46e5;">New Contact Inquiry</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${formData.message}</p>
        </div>
      `;

      await supabase.functions.invoke('send-email', {
        body: { recipients: adminRecipients, subject, text, html },
      });

      // 3. Reset form, trigger toast, and show inline success banner
      setFormData({ name: '', email: '', phone: '', message: '' });
      generateCaptcha();
      setIsSuccess(true);
      toast({
        title: "Inquiry Submitted Successfully!",
        description: "Thank you for reaching out. We have happily received your message.",
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error sending your message. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-10 md:py-20 lg:py-28 relative overflow-hidden w-full">
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-16 scroll-reveal">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Contact</span>
          <h2 className="fluid-h2 font-display font-black tracking-tight mt-3 mb-4 lg:mb-6">
            Let's <span className="gradient-text">Connect</span>
          </h2>
          <p className="text-foreground font-semibold max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Ready to transform your business? Get in touch with us today.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto w-full">
          {/* Contact info */}
          <div className="scroll-reveal space-y-6 lg:space-y-8 w-full max-w-full">
            <div>
              <h3 className="text-xl md:text-2xl font-display font-black tracking-tight mb-3 lg:mb-4">Get In Touch</h3>
              <p className="text-foreground font-medium text-sm md:text-base leading-relaxed">
                We'd love to hear about your project. Reach out and let's create something extraordinary together.
              </p>
            </div>

            <div className="space-y-4 lg:space-y-6 w-full">
              {[
                { icon: MapPin, label: 'Address', value: settings.contact_address },
                { icon: Mail, label: 'Email', value: settings.contact_email },
                { icon: Phone, label: 'Phone', value: settings.contact_phone },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 overflow-hidden w-full">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} className="text-foreground" />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-xs md:text-sm text-foreground font-black uppercase tracking-tighter opacity-70">{item.label}</p>
                    <p className="text-sm md:text-base text-foreground font-bold break-words whitespace-pre-wrap leading-relaxed">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="scroll-reveal glass rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 lg:space-y-6 w-full max-w-full overflow-hidden box-border relative">
            {isSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-500 text-sm font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-300 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 animate-bounce" />
                  <span>Your message has been successfully submitted! We will connect shortly.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="text-green-500 hover:bg-green-500/20 p-1 rounded-full transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="w-full">
              <label className="text-sm text-foreground font-bold mb-1.5 md:mb-2 block">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm md:text-base box-border"
                placeholder="John Doe"
              />
            </div>
            <div className="w-full">
              <label className="text-sm text-foreground font-bold mb-1.5 md:mb-2 block">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm md:text-base box-border"
                placeholder="john@example.com"
              />
            </div>
            <div className="w-full">
              <label className="text-sm text-foreground font-bold mb-1.5 md:mb-2 block">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm md:text-base box-border"
                placeholder="+1 (123) 456-7890"
              />
            </div>
            <div className="w-full">
              <label className="text-sm text-foreground font-bold mb-1.5 md:mb-2 block">Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-foreground text-sm md:text-base box-border"
                placeholder="Tell us about your project..."
              />
            </div>

            {/* Captcha */}
            <div className="w-full">
              <label className="text-sm text-foreground font-bold mb-1.5 md:mb-2 block">
                Captcha: What is {captchaQuestion.num1} + {captchaQuestion.num2}?
              </label>
              <input
                type="number"
                required
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm md:text-base box-border"
                placeholder="Enter the sum"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full gradient-bg py-3.5 md:py-4 rounded-lg font-black text-white hover-lift hover-glow flex items-center justify-center gap-2 transition-all duration-300 text-sm md:text-base disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'} <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
