import { useState, useEffect } from 'react';
import { Send, MapPin, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [settings, setSettings] = useState({
    contact_email: 'mahjabeensajaruth@gmail.com',
    contact_phone: '+1 (609) 313-9192, 9384797751',
    contact_address: 'New Jersey, USA',
    whatsapp_number: '9384797751'
  });

  useEffect(() => {
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
          whatsapp_number: settingsMap.whatsapp_number || settings.whatsapp_number
        });
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 1. Store in Supabase first
      const { error } = await supabase
        .from('inquiries')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
          }
        ]);

      if (error) throw error;

      // 2. Construct WhatsApp message and redirect
      const whatsappMessage = `*New Inquiry from SA CONSULTANT AND STAFFING Website*%0A%0A` +
        `*Name:* ${formData.name}%0A` +
        `*Email:* ${formData.email}%0A` +
        `*Phone:* ${formData.phone}%0A%0A` +
        `*Message:*%0A${formData.message}`;

      const whatsappUrl = `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=${whatsappMessage}`;
      
      // Redirect to WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // 3. Reset form
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('There was an error sending your message. Please try again.');
    }
  };

  return (
    <section id="contact" className="pt-10 pb-24 md:py-20 lg:py-28 px-4 md:px-8 relative overflow-hidden w-full">
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10 w-full px-4 sm:px-6">
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
          <form onSubmit={handleSubmit} className="scroll-reveal glass rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 lg:space-y-6 w-full max-w-full overflow-hidden box-border">
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
            <button
              type="submit"
              className="w-full gradient-bg py-3.5 md:py-4 rounded-lg font-black text-white hover-lift hover-glow flex items-center justify-center gap-2 transition-all duration-300 text-sm md:text-base"
            >
              Send Message <Send size={18} />
            </button>
            <div className="h-2 sm:hidden" />
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
