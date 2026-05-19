import { useState, useEffect } from 'react';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';
import logo from '@/assets/logo.png';

const desktopNavLinks = [
  { label: 'Home', href: '/#home' },
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Partnership', href: '/#partnership' },
  { label: 'Appointments', href: '/#book' },
  { label: 'Contact', href: '/#contact' },
];

const mobileNavLinks = [
  { label: 'Home', href: '/#home' },
  { label: 'About', href: '/#about' },
  { label: 'Partnership', href: '/#partnership' },
  { label: 'Services', href: '/#services' },
  { label: 'Portfolio', href: '/#portfolio' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'Appointments', href: '/#book' },
  { label: 'Contact', href: '/#contact' },
];

const SocialIcon = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/50 transition-all duration-300"
  >
    {children}
  </a>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    whatsapp: '9384797751',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com'
  });
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Fetch social settings
    const fetchSocialLinks = async () => {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const settingsMap = data.reduce((acc: any, item: any) => {
          acc[item.id] = item.value;
          return acc;
        }, {});
        setSocialLinks({
          whatsapp: settingsMap.whatsapp_number || socialLinks.whatsapp,
          linkedin: settingsMap.linkedin_url || socialLinks.linkedin,
          instagram: settingsMap.instagram_url || socialLinks.instagram
        });
      }
    };
    fetchSocialLinks();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-300 ${scrolled ? 'glass-strong py-4 shadow-lg shadow-background/50' : 'glass-strong py-4'}`}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-4">
          <img src={logo} alt="SA Consultant logo" className="h-8 sm:h-10 md:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105" />
          <span className="text-xs sm:text-sm md:text-lg font-display font-black tracking-widest gradient-text leading-tight uppercase">
            SA Consultant & Staffing
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {desktopNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:gradient-bg after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="ml-8">
            <ThemeToggle />
          </div>

          {!user ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Link to="/vendor-portal">Talent Partner</Link>
              </Button>
              <Button asChild variant="outline" className="glass border-primary/20">
                <Link to="/candidate-portal">Candidate Portal</Link>
              </Button>
              <Button asChild className="gradient-bg border-none">
                <Link to="/auth">Client Access</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!isAdmin && (
                <>
                  <Button asChild variant="ghost" size="sm" className="hidden sm:flex text-primary font-semibold">
                    <Link to="/vendor-portal">Talent Partner</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                    <Link to="/candidate-portal">Candidate Portal</Link>
                  </Button>
                </>
              )}
              <Button asChild variant="outline" size="sm" className="glass">
                <Link to={isAdmin ? "/admin" : "/dashboard"} className="gap-2">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => signOut()} title="Logout">
                <LogOut size={18} />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center gap-8 ml-auto">
          <ThemeToggle />
          <button
            className="text-foreground p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden glass-strong mt-2 mx-4 rounded-2xl p-6 animate-fade-in border border-primary/20 shadow-2xl backdrop-blur-3xl overflow-hidden">
          <div className="flex flex-col gap-5">
            {mobileNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-all duration-300 font-medium py-2 border-b border-white/5"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/vendor-portal"
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-all duration-300 font-medium py-2 border-b border-white/5"
            >
              Talent Partner
            </Link>
            <Link
              to="/candidate-portal"
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-all duration-300 font-medium py-2 border-b border-white/5 last:border-0"
            >
              Candidate Portal
            </Link>
            <div className="pt-2 flex flex-col gap-3">
              {!user ? (
                <div className="flex flex-col gap-3">
                  <Button asChild className="gradient-bg w-full h-12 rounded-xl text-foreground font-bold">
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>Client Access</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button asChild variant="outline" className="w-full h-12 glass rounded-xl border-primary/30">
                    <Link to={isAdmin ? "/admin" : "/dashboard"} onClick={() => setMobileOpen(false)}>
                      <LayoutDashboard size={18} className="mr-2" /> Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full h-12 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => { signOut(); setMobileOpen(false); }}>
                    <LogOut size={18} className="mr-2" /> Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
