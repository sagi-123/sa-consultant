import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Partnership from '@/components/Partnership';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Testimonials from '@/components/Testimonials';
import BookingCalendar from '@/components/BookingCalendar';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const Index = () => {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <About />
      <Partnership />
      <Services />
      <Portfolio />
      <Testimonials />
      <BookingCalendar />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
