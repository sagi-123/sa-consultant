import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Lock, User, ArrowLeft, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  type AuthView = 'login' | 'signup' | 'forgot_password' | 'update_password';
  
  // Initialize view based on hash immediately
  const getInitialView = (): AuthView => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    if (hash && (hash.includes('type=recovery') || hash.includes('access_token'))) {
      return 'update_password';
    }
    if (searchParams.get('type') === 'recovery') {
      return 'update_password';
    }
    return 'login';
  };

  const [view, setView] = useState<AuthView>(getInitialView());
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { toast } = useToast();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event specifically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && window.location.hash.includes('type=recovery'))) {
        setView('update_password');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // REGULAR REDIRECT: Only redirect if NOT in recovery mode and NOT loading auth
    if (!authLoading && user && view !== 'update_password') {
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate(isAdmin ? '/admin' : '/dashboard');
      }
    }
  }, [user, isAdmin, navigate, view, authLoading, returnTo]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) throw error;

      // Manually create profile if signup was successful
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            name: name,
            email: email,
            role: 'user'
          } as any);
        if (profileError) console.error("Error creating profile:", profileError);
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error logging in",
        description: error.message,
      });
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
      toast({
        title: "Reset link sent!",
        description: "Check your email for the password reset link.",
      });
      setView('login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error resetting password",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      if (error) throw error;
      toast({
        title: "Password updated!",
        description: "Your new password has been set successfully. You can now use your account.",
      });
      
      // After update, we can safely redirect to the dashboard
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating password",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // If we are currently handling a recovery link in the URL, don't show the Tabs
  const isRecovering = view === 'update_password';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
      
      <Button 
        variant="ghost" 
        className="absolute top-8 left-8 gap-2"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={18} /> Back to Home
      </Button>

      <Card className="w-full max-w-md glass border-primary/20 relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-display font-bold gradient-text">SA Consultant</CardTitle>
          <CardDescription>
            {isRecovering ? "Securely reset your password" : "Secure access to your dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {view === 'forgot_password' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                  <KeyRound className="text-primary" size={20} /> Reset Password
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="reset-email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-bg" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setView('login')}
                >
                  Back to Login
                </Button>
              </form>
            </div>
          )}

          {view === 'update_password' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="text-green-500" size={20} /> New Password
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please enter your new password below.
                </p>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="update-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="update-password" 
                      type={showPassword ? "text" : "password"} 
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-bg" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>
          )}

          {(view === 'login' || view === 'signup') && (
            <Tabs 
              defaultValue={view} 
              onValueChange={(v) => setView(v as AuthView)} 
              value={view}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Password</Label>
                      <button 
                        type="button"
                        onClick={() => setView('forgot_password')}
                        className="text-xs text-primary hover:underline underline-offset-4"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full gradient-bg" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="name@example.com" 
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-password" 
                        type={showPassword ? "text" : "password"} 
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full gradient-bg" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-xs text-center text-muted-foreground">
            © 2026 SA Consultant & Staffing Solutions.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
