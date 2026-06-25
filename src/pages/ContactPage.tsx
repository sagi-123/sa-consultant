import Navbar from '@/components/Navbar';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSEO } from '@/hooks/useSEO';

const ContactPage = () => {
  useScrollReveal();
  useSEO({
    title: "Contact Us | SA Consultant",
    description: "Get in touch with SA Consultant & Staffing. Reach out to our team today for consultation, queries, or partnership opportunities.",
    canonical: "https://www.saconsultantandstaffing.com/contact"
  });

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <Navbar />
      <Contact />
      <Footer />
    </div>
  );
};

export default ContactPage;
