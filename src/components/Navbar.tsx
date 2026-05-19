import { useState, useEffect } from 'react';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';
import logo from '@/assets/logo.png';

const navLinks = [
  { label: 'About', href: '/#about' },
  { label: 'Partnership', href: '/#partnership' },
  { label: 'Services', href: '/#services' },
  { label: 'Portfolio', href: '/#portfolio' },
  { label: 'Testimonials', href: '/#testimonials' },
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
          {navLinks.map((link) => (
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
          <div className="flex items-center gap-2 mr-2">
            <SocialIcon href={socialLinks.linkedin}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </SocialIcon>
            <SocialIcon href={socialLinks.instagram}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </SocialIcon>
            <SocialIcon href={`https://wa.me/${socialLinks.whatsapp}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </SocialIcon>
          </div>

          <ThemeToggle />

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
        <div className="lg:hidden flex items-center gap-2 ml-auto">
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
            <a
              href="/#home"
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-all duration-300 font-medium py-2 border-b border-white/5"
            >
              Home
            </a>
            {navLinks.map((link) => (
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
