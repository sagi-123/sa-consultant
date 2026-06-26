import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';
import logo from '@/assets/logo.png';

type NavItem =
  | { label: string; href: string; isRoute?: boolean; children?: undefined }
  | { label: string; href?: undefined; children: { label: string; href: string; isRoute?: boolean }[] };

const navItems: NavItem[] = [
  { label: 'Home', href: '/', isRoute: true },
  {
    label: 'About',
    children: [
      { label: 'About Us', href: '/about', isRoute: true },
      { label: 'Services', href: '/services', isRoute: true },
      { label: 'Contact', href: '/contact', isRoute: true },
    ],
  },
  {
    label: 'Jobs',
    children: [
      { label: 'Candidate Portal', href: '/candidate-portal', isRoute: true },
      { label: 'Job Posting', href: '/jobs', isRoute: true },
    ],
  },
  {
    label: 'Partnership',
    children: [
      { label: 'Partnership', href: '/partnership', isRoute: true },
      { label: 'Talent Partner', href: '/vendor-portal', isRoute: true },
    ],
  },
  {
    label: 'Appointment',
    children: [
      { label: 'Appointment Booking', href: '/book', isRoute: true },
    ],
  },
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

// Desktop dropdown item
const DropdownMenu = ({ item }: { item: NavItem }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!item.children) {
    return item.isRoute ? (
      <Link
        to={item.href}
        className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:gradient-bg after:transition-all after:duration-300 hover:after:w-full"
      >
        {item.label}
      </Link>
    ) : (
      <a
        href={item.href}
        className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:gradient-bg after:transition-all after:duration-300 hover:after:w-full"
      >
        {item.label}
      </a>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:gradient-bg after:transition-all after:duration-300 hover:after:w-full"
      >
        {item.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+12px)] left-0 min-w-[180px] glass-strong border border-primary/20 rounded-xl shadow-2xl shadow-background/50 py-2 z-[10000] animate-in fade-in slide-in-from-top-2 duration-200">
          {item.children.map((child) =>
            child.isRoute ? (
              <Link
                key={child.href}
                to={child.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
              >
                {child.label}
              </Link>
            ) : (
              <a
                key={child.href}
                href={child.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
              >
                {child.label}
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
};

// Mobile accordion item
const MobileNavItem = ({ item, onClose }: { item: NavItem; onClose: () => void }) => {
  const [open, setOpen] = useState(false);

  if (!item.children) {
    return item.isRoute ? (
      <Link
        to={item.href}
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground transition-all duration-300 font-medium py-2 border-b border-white/5 block"
      >
        {item.label}
      </Link>
    ) : (
      <a
        href={item.href}
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground transition-all duration-300 font-medium py-2 border-b border-white/5 block"
      >
        {item.label}
      </a>
    );
  }

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 text-muted-foreground hover:text-foreground transition-all duration-300 font-medium"
      >
        {item.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pl-4 pb-2 flex flex-col gap-1 animate-in slide-in-from-top-1 duration-200">
          {item.children.map((child) =>
            child.isRoute ? (
              <Link
                key={child.href}
                to={child.href}
                onClick={onClose}
                className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 font-medium py-1.5 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                {child.label}
              </Link>
            ) : (
              <a
                key={child.href}
                href={child.href}
                onClick={onClose}
                className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 font-medium py-1.5 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                {child.label}
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
};

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

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <DropdownMenu key={item.label} item={item} />
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="ml-8">
            <ThemeToggle />
          </div>

          {!user ? (
            <div className="flex items-center gap-2">
              <Button asChild className="gradient-bg border-none">
                <Link to="/auth">Client Access</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
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
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <MobileNavItem key={item.label} item={item} onClose={() => setMobileOpen(false)} />
            ))}

            <div className="pt-4 flex flex-col gap-3">
              {!user ? (
                <Button asChild className="gradient-bg w-full h-12 rounded-xl text-foreground font-bold">
                  <Link to="/auth" onClick={() => setMobileOpen(false)}>Client Access</Link>
                </Button>
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
