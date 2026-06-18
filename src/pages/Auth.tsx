import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Lock, User, ArrowLeft, KeyRound, CheckCircle2, Eye, EyeOff,
  Megaphone, Users, Pencil, Code2, Briefcase, HeartHandshake,
  TrendingUp, Search, BarChart3, Globe, FileText, Award,
  Smartphone, ShoppingCart, Palette, Plug, Zap, Cloud, Headphones, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSEO } from '@/hooks/useSEO';

// ─── Service cards data for mosaic background ───────────────────────────────
const SERVICE_CARDS = [
  { 
    icon: Globe,      
    label: 'Website Development',      
    sub: 'Beautiful, responsive websites built for performance and modern user experience.',          
    image: '/images/auth/web_dev.png', 
    accent: '#ef4444' 
  },
  { 
    icon: Smartphone, 
    label: 'Mobile App Development',  
    sub: 'Custom mobile apps for iOS and Android that engage users and grow your business.',      
    image: '/images/auth/mobile_dev.png', 
    accent: '#ec4899' 
  },
  { 
    icon: ShoppingCart, 
    label: 'E-commerce Solutions',   
    sub: 'Secure and scalable online stores with seamless payment integration.',     
    image: '/images/auth/ecommerce.png', 
    accent: '#10b981' 
  },
  { 
    icon: Palette,    
    label: 'UI/UX Design',           
    sub: 'User-centered design that is intuitive, engaging and focused on your users.',   
    image: '/images/auth/ui_ux.png', 
    accent: '#8b5cf6' 
  },
  { 
    icon: Code2,      
    label: 'Web Application Dev',    
    sub: 'Powerful web applications built with modern frameworks and clean architecture.',     
    image: '/images/auth/web_app.png', 
    accent: '#3b82f6' 
  },
  { 
    icon: FileText,   
    label: 'CMS Development',        
    sub: 'Easy to manage CMS websites using WordPress, Strapi and custom solutions.',   
    image: '/images/auth/web_dev.png', 
    accent: '#2563eb' 
  },
  { 
    icon: Zap,        
    label: 'API Development',        
    sub: 'Robust APIs and third-party integrations to extend your platform capabilities.',        
    image: '/images/auth/ui_ux.png', 
    accent: '#10b981' 
  },
  { 
    icon: Cloud,      
    label: 'Cloud & DevOps',         
    sub: 'Scalable cloud solutions with CI/CD, automation and infrastructure management.',       
    image: '/images/auth/cloud_devops.png', 
    accent: '#3b82f6' 
  },
  { 
    icon: Headphones, 
    label: 'Maintenance & Support',  
    sub: 'Ongoing support and maintenance to keep your website or app running fast.',       
    image: '/images/auth/ecommerce.png', 
    accent: '#84cc16' 
  },
  { 
    icon: TrendingUp, 
    label: 'SEO & Performance',      
    sub: 'Improve your visibility, speed and performance for better rankings and conversions.',       
    image: '/images/auth/mobile_dev.png', 
    accent: '#f97316' 
  },
];

// Duplicate for seamless infinite scroll
const COL_CARDS = [...SERVICE_CARDS, ...SERVICE_CARDS];

function ServiceCard({ icon: Icon, label, sub, image, accent }: typeof SERVICE_CARDS[0]) {
  return (
    <div style={{
      width: '100%',
      background: '#ffffff',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      border: '1px solid rgba(0, 0, 0, 0.05)',
      position: 'relative',
    }}>
      {/* Top half: Illustration Image */}
      <div style={{
        width: '100%',
        height: '135px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <img 
          src={image} 
          alt={label}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      {/* Intersecting Badge for Icon */}
      <div style={{
        position: 'absolute',
        top: '115px',
        left: '20px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        zIndex: 2,
        border: `2px solid ${accent}`,
      }}>
        <Icon size={18} style={{ color: accent }} />
      </div>

      {/* Text Section */}
      <div style={{
        padding: '26px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
        minHeight: '155px',
        background: '#ffffff',
      }}>
        <div>
          <h3 style={{
            fontSize: '17px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 6px',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.35,
            letterSpacing: '-0.02em',
          }}>{label}</h3>
          
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            margin: 0,
            lineHeight: 1.45,
            fontWeight: 400,
            fontFamily: 'Inter, sans-serif',
          }}>{sub}</p>
        </div>

        {/* Accent Arrow Circle Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '10px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: `${accent}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            cursor: 'pointer',
          }}>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrollColumn({ cards, direction }: { cards: typeof COL_CARDS; direction: 'up' | 'down' }) {
  const duration = direction === 'up' ? 32 : 40;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', overflow: 'hidden', flex: 1 }}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '18px',
        animation: `scroll-${direction} ${duration}s linear infinite`,
      }}>
        {cards.map((c, i) => <ServiceCard key={i} {...c} />)}
      </div>
    </div>
  );
}

// ─── Main Auth Component ─────────────────────────────────────────────────────
const Auth = () => {
  useSEO({
    title: "Access Portal | SA Consultant & Staffing",
    description: "Secure login and registration portal for candidates, vendors, and clients of SA Consultant & Staffing.",
    canonical: "https://www.saconsultantandstaffing.com/auth"
  });
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  type AuthView = 'login' | 'signup' | 'forgot_password' | 'update_password';

  const getInitialView = (): AuthView => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    if (hash && (hash.includes('type=recovery') || hash.includes('access_token'))) return 'update_password';
    if (searchParams.get('type') === 'recovery') return 'update_password';
    return 'login';
  };

  const [view, setView] = useState<AuthView>(getInitialView());
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && window.location.hash.includes('type=recovery'))) {
        setView('update_password');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && user && view !== 'update_password') {
      if (returnTo) navigate(returnTo);
      else navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [user, isAdmin, navigate, view, authLoading, returnTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
      // useEffect above handles navigation via returnTo
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error logging in', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email, password, options: { data: { name } },
      });
      if (error) throw error;
      if (authData.user) {
        await supabase.from('profiles').upsert({ id: authData.user.id, name, email, role: 'user' } as any);
      }
      toast({ title: 'Account created!', description: 'Please check your email to verify your account.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error signing up', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast({ title: 'Reset link sent!', description: 'Check your email for the password reset link.' });
      setView('login');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error resetting password', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: 'Password updated!', description: 'Your new password has been set successfully.' });
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error updating password', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Build 4 columns with different starting offsets
  const col1 = COL_CARDS.slice(0, 12);
  const col2 = COL_CARDS.slice(3, 15);
  const col3 = COL_CARDS.slice(6, 18);
  const col4 = COL_CARDS.slice(9, 21);

  return (
    <>
      {/* ── Keyframe Animations ─────────────────────────────────────── */}
      <style>{`
        @keyframes scroll-up {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scroll-down {
          0%   { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .auth-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #fff;
          color: #1a202c;
        }
        .auth-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
        }
        .auth-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg,#1e3a8a,#1d4ed8,#2563eb);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
        }
        .auth-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .tab-btn {
          flex: 1;
          padding: 10px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          background: transparent;
          cursor: pointer;
          border-bottom: 2.5px solid transparent;
          color: #64748b;
          transition: color 0.2s, border-color 0.2s;
        }
        .tab-btn.active {
          color: #1d4ed8;
          border-bottom-color: #1d4ed8;
        }
        @media (max-width: 1024px) {
          .bg-col-4 {
            display: none !important;
          }
        }
        @media (max-width: 800px) {
          .bg-col-3 {
            display: none !important;
          }
        }
        @media (max-width: 500px) {
          .bg-col-2 {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

        {/* ── Mosaic Background ──────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', gap: '18px', padding: '18px',
          overflow: 'hidden',
          background: '#f8fafc',
        }}>
          <div className="bg-col-1" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ScrollColumn cards={col1} direction="up" />
          </div>
          <div className="bg-col-2" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ScrollColumn cards={col2} direction="down" />
          </div>
          <div className="bg-col-3" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ScrollColumn cards={col3} direction="up" />
          </div>
          <div className="bg-col-4" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ScrollColumn cards={col4} direction="down" />
          </div>
        </div>

        {/* ── Dark overlay ──────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.4) 100%)',
        }} />

        {/* ── Back Button ───────────────────────────────────────────── */}
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute', top: '24px', left: '24px',
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '50px',
            padding: '8px 16px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            zIndex: 10,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* ── Center Modal ──────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%', maxWidth: '420px',
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          padding: '36px 32px 28px',
          zIndex: 10,
        }}>
          {/* Logo + Title */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'linear-gradient(135deg,#1e3a8a,#2563eb)',
              marginBottom: '12px',
            }}>
              <Briefcase size={26} style={{ color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', fontFamily: 'Inter,sans-serif' }}>
              SA Consultant & Staffing
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              {view === 'forgot_password' ? 'Reset your password' :
               view === 'update_password' ? 'Set a new password' :
               'Secure access to your account'}
            </p>
          </div>

          {/* ── Forgot Password View ── */}
          {view === 'forgot_password' && (
            <div>
              <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <KeyRound size={18} style={{ color: '#2563eb', marginTop: '1px', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: 1.5 }}>
                  Enter your email and we'll send you a secure link to reset your password.
                </p>
              </div>
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input className="auth-input" type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => setView('login')}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '14px', cursor: 'pointer', textAlign: 'center', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  Back to Login
                </button>
              </form>
            </div>
          )}

          {/* ── Update Password View ── */}
          {view === 'update_password' && (
            <div>
              <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} style={{ color: '#16a34a', marginTop: '1px', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#15803d', lineHeight: 1.5 }}>
                  Enter your new password below to complete the reset.
                </p>
              </div>
              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* ── Login / Sign Up Tabs ── */}
          {(view === 'login' || view === 'signup') && (
            <div>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1.5px solid #e2e8f0', marginBottom: '24px' }}>
                <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Log In</button>
                <button className={`tab-btn ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Sign Up</button>
              </div>

              {/* Login Form */}
              {tab === 'login' && (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input className="auth-input" type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Password</label>
                      <button type="button" onClick={() => setView('forgot_password')}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                        Forgot password?
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: '6px' }}>
                    {loading ? 'Logging in...' : 'Log In'}
                  </button>
                </form>
              )}

              {/* Sign Up Form */}
              {tab === 'signup' && (
                <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input className="auth-input" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input className="auth-input" type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: '6px' }}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '24px', marginBottom: 0 }}>
            © 2026 SA Consultant & Staffing Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default Auth;
