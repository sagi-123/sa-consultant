import Navbar from '@/components/Navbar';
import Partnership from '@/components/Partnership';
import Footer from '@/components/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSEO } from '@/hooks/useSEO';

const PartnershipPage = () => {
  useScrollReveal();
  useSEO({
    title: "Partnership Program | SA Consultant",
    description: "Join SA Consultant partnership program to grow your business, earn competitive rewards, and build strategic alliances.",
    canonical: "https://www.saconsultantandstaffing.com/partnership"
  });

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <Navbar />
      <Partnership />
      <Footer />
    </div>
  );
};

export default PartnershipPage;
