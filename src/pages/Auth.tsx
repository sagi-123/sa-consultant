import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Lock, User, ArrowLeft, KeyRound, CheckCircle2, Eye, EyeOff,
  Megaphone, Users, Pencil, Code2, Briefcase, HeartHandshake,
  TrendingUp, Search, BarChart3, Globe, FileText, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// ─── Service cards data for mosaic background ───────────────────────────────
const SERVICE_CARDS = [
  { icon: Megaphone,      label: 'Digital Marketing',      sub: 'SEO · PPC · Social Ads',          gradient: 'linear-gradient(135deg,#f97316,#ef4444)' },
  { icon: Users,          label: 'Staffing & Recruiting',  sub: 'Top talent, fast placements',      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { icon: Pencil,         label: 'Content Creation',       sub: 'Blogs · Videos · Copywriting',     gradient: 'linear-gradient(135deg,#10b981,#059669)' },
  { icon: Code2,          label: 'Web & App Dev',          sub: 'React · Node · Mobile',            gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
  { icon: Briefcase,      label: 'Business Consulting',    sub: 'Strategy · Growth · Advisory',     gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { icon: HeartHandshake, label: 'HR Solutions',           sub: 'Payroll · Compliance · Culture',   gradient: 'linear-gradient(135deg,#ec4899,#be185d)' },
  { icon: TrendingUp,     label: 'Brand Strategy',         sub: 'Identity · Positioning · Voice',   gradient: 'linear-gradient(135deg,#14b8a6,#0f766e)' },
  { icon: Search,         label: 'Executive Search',       sub: 'C-Suite · Directors · VPs',        gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  { icon: BarChart3,      label: 'Social Media Mgmt',      sub: 'Instagram · LinkedIn · X',         gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
  { icon: Globe,          label: 'IT Staffing',            sub: 'Developers · QA · DevOps',         gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)' },
  { icon: FileText,       label: 'Resume & Career',        sub: 'CV Writing · Interview Prep',      gradient: 'linear-gradient(135deg,#84cc16,#65a30d)' },
  { icon: Award,          label: 'Training & Development', sub: 'Workshops · Certifications',       gradient: 'linear-gradient(135deg,#f97316,#dc2626)' },
];

// Duplicate for seamless infinite scroll
const COL_CARDS = [...SERVICE_CARDS, ...SERVICE_CARDS];

function ServiceCard({ icon: Icon, label, sub, gradient }: typeof SERVICE_CARDS[0]) {
  return (
    <div
      style={{
        background: gradient,
        borderRadius: '20px',
        padding: '24px 20px',
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: '6px',
        flexShrink: 0,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Big icon watermark top-right */}
      <Icon
        size={72}
        style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          opacity: 0.18,
          color: '#fff',
        }}
      />
      <Icon size={28} style={{ color: '#fff', opacity: 0.95 }} />
      <p style={{ color: '#fff', fontWeight: 800, fontSize: '15px', lineHeight: 1.2, margin: 0 }}>{label}</p>
      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', margin: 0 }}>{sub}</p>
    </div>
  );
}

function ScrollColumn({ cards, direction }: { cards: typeof COL_CARDS; direction: 'up' | 'down' }) {
  const duration = direction === 'up' ? 28 : 34;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'hidden', flex: 1 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          animation: `scroll-${direction} ${duration}s linear infinite`,
        }}
      >
        {cards.map((c, i) => <ServiceCard key={i} {...c} />)}
      </div>
    </div>
  );
}

// ─── Main Auth Component ─────────────────────────────────────────────────────
const Auth = () => {
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
      `}</style>

      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

        {/* ── Mosaic Background ──────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', gap: '14px', padding: '14px',
          overflow: 'hidden',
        }}>
          <ScrollColumn cards={col1} direction="up" />
          <ScrollColumn cards={col2} direction="down" />
          <ScrollColumn cards={col3} direction="up" />
          <ScrollColumn cards={col4} direction="down" />
        </div>

        {/* ── Dark overlay ──────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(10,20,50,0.55)',
          backdropFilter: 'blur(2px)',
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
