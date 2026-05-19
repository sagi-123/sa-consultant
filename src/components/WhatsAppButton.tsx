import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const WhatsAppButton = () => {
  const [whatsapp, setWhatsapp] = useState('9384797751');
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    const fetchWhatsApp = async () => {
      const { data } = await supabase.from('settings').select('value').eq('id', 'whatsapp_number').single() as any;
      if (data) setWhatsapp(data.value);
    };
    fetchWhatsApp();

    // Hide floating button when booking or contact section is in viewport to prevent clashing with forms/CTAs
    const observer = new IntersectionObserver(
      (entries) => {
        const isAnyIntersecting = entries.some((entry) => entry.isIntersecting);
        setShouldHide(isAnyIntersecting);
      },
      { threshold: 0.05 }
    );

    const bookSection = document.getElementById('book');
    const contactSection = document.getElementById('contact');

    if (bookSection) observer.observe(bookSection);
    if (contactSection) observer.observe(contactSection);

    return () => {
      if (bookSection) observer.unobserve(bookSection);
      if (contactSection) observer.unobserve(contactSection);
    };
  }, []);

  return (
    <>
      <style>{`
        .floating-whatsapp-btn {
          right: 16px !important;
          left: auto !important;
          bottom: 16px !important;
          width: 3rem !important; /* 48px */
          height: 3rem !important; /* 48px */
        }
        .floating-whatsapp-btn svg {
          width: 1.5rem !important; /* 24px */
          height: 1.5rem !important; /* 24px */
        }
        @media (min-width: 768px) {
          .floating-whatsapp-btn {
            right: 24px !important;
            left: auto !important;
            bottom: 24px !important;
            width: 3.5rem !important; /* 56px */
            height: 3.5rem !important; /* 56px */
          }
          .floating-whatsapp-btn svg {
            width: 1.75rem !important; /* 28px */
            height: 1.75rem !important; /* 28px */
          }
        }
      `}</style>
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className={`fixed z-50 rounded-full bg-[hsl(142,70%,45%)] flex items-center justify-center shadow-lg shadow-[hsl(142,70%,45%)]/30 hover:scale-110 hover:shadow-xl hover:shadow-[hsl(142,70%,45%)]/40 transition-all duration-500 floating-whatsapp-btn ${
          shouldHide ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        style={{ '--tw-shadow-color': 'hsl(142 70% 45% / 0.3)' } as React.CSSProperties}
      >
        <svg className="text-foreground" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  );
};

export default WhatsAppButton;
