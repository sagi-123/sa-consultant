import Navbar from '@/components/Navbar';
import About from '@/components/About';
import Footer from '@/components/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSEO } from '@/hooks/useSEO';

const AboutPage = () => {
  useScrollReveal();
  useSEO({
    title: "About Us | IT Staffing & Digital Agency | SA Consultant",
    description: "Learn more about SA Consultant & Staffing Solutions - our mission, vision, and core values that drive business growth.",
    canonical: "https://www.saconsultantandstaffing.com/about"
  });

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <Navbar />
      <About />
      <Footer />
    </div>
  );
};

export default AboutPage;
