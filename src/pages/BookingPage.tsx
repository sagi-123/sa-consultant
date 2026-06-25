import Navbar from '@/components/Navbar';
import BookingCalendar from '@/components/BookingCalendar';
import Footer from '@/components/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSEO } from '@/hooks/useSEO';

const BookingPage = () => {
  useScrollReveal();
  useSEO({
    title: "Appointment Booking | SA Consultant",
    description: "Book an appointment for consultation with our experts at SA Consultant & Staffing.",
    canonical: "https://www.saconsultantandstaffing.com/book"
  });

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      <Navbar />
      <BookingCalendar />
      <Footer />
    </div>
  );
};

export default BookingPage;
