import Navbar from '@/components/Navbar';
import Services from '@/components/Services';
import Footer from '@/components/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSEO } from '@/hooks/useSEO';

const ServicesPage = () => {
  useScrollReveal();
  useSEO({
    title: "Our Services | IT Staffing & Digital Agency | SA Consultant",
    description: "Explore our professional consulting services, including custom website development, mobile app development, IT staffing, and recruitment solutions.",
    canonical: "https://www.saconsultantandstaffing.com/services"
  });

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <Navbar />
      <Services />
      <Footer />
    </div>
  );
};

export default ServicesPage;
