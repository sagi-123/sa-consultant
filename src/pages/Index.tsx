import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Partnership from '@/components/Partnership';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Webinars from '@/components/Webinars';
import Testimonials from '@/components/Testimonials';
import BookingCalendar from '@/components/BookingCalendar';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Link } from 'react-router-dom';

const Index = () => {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      {/* Browse Jobs Section */}
      <section className="py-12 bg-gradient-to-r from-primary/10 to-accent/10 glass-strong text-center rounded-xl mx-4 my-8">
        <h2 className="text-3xl font-display font-bold gradient-text mb-4">Explore Career Opportunities</h2>
        <p className="text-lg text-muted-foreground mb-6">Find your next role and join our growing team.</p>
        <Link to="/jobs" className="inline-block bg-primary hover:bg-primary/80 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors duration-300">
          Browse Jobs
        </Link>
      </section>
      <About />
      <Partnership />
      <Services />
      <Portfolio />
      <Webinars />
      <Testimonials />
      <BookingCalendar />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
