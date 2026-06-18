import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Star, MessageSquare, LogOut, LayoutDashboard, User, Users, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/types/database.types';
import { useSEO } from '@/hooks/useSEO';

type Review = Database['public']['Tables']['reviews']['Row'];

const UserDashboard = () => {
  useSEO({
    title: "User Dashboard | SA Consultant & Staffing",
    description: "Manage your client account, view details, and submit reviews for SA Consultant & Staffing.",
    canonical: "https://www.saconsultantandstaffing.com/dashboard"
  });
  const { profile, signOut } = useAuth();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchMyReviews = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setMyReviews(data || []);
    }
  }, [profile]);

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: profile.id,
        name: profile.name || 'Anonymous',
        rating,
        message,
        status: 'pending'
      } as any);

      if (error) throw error;

      toast({
        title: "Review submitted!",
        description: "Your review is pending approval from the admin.",
      });
      setMessage('');
      setRating(5);
      fetchMyReviews();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error submitting review",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-display font-bold gradient-text">User Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
              <LayoutDashboard size={18} /> Home
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut size={18} /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Talent Partner Promotional Banner */}
        <Card className="glass border-primary/20 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
            <div className="space-y-1">
              <Badge variant="outline" className="bg-primary/10 text-primary border-none text-xs font-bold mb-1 py-0.5 px-2.5">
                C2C Staffing Supplier Program
              </Badge>
              <CardTitle className="text-2xl font-display font-bold gradient-text">Talent Partner Portal</CardTitle>
              <CardDescription className="text-sm max-w-xl">
                Are you a C2C partner agency, subcontracting vendor, or freelance recruiter? Access your dedicated portal to browse open job requisitions, submit bench candidates with AI parsing, and track your revenue shares.
              </CardDescription>
            </div>
            <Button onClick={() => navigate('/vendor-portal')} className="gradient-bg h-12 px-6 rounded-xl font-bold shadow-lg gap-2 shrink-0">
              <Users size={18} /> Open Partner Portal <ArrowUpRight size={18} />
            </Button>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="glass h-fit">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="text-primary" size={32} />
              </div>
              <CardTitle>{profile?.name || 'User'}</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Member since: </span>
                  <span>{new Date(profile?.created_at || '').toLocaleDateString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Role: </span>
                  <span className="capitalize">{profile?.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Submission & List */}
          <div className="md:col-span-2 space-y-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="text-accent" size={20} /> Submit a Review
                </CardTitle>
                <CardDescription>Share your experience with SA Consultant</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 transition-colors ${rating >= star ? 'text-accent' : 'text-muted-foreground/30'}`}
                        >
                          <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Write your review here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-bg" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-display font-semibold flex items-center gap-2">
                <MessageSquare size={20} /> My Reviews
              </h3>
              {myReviews.length === 0 ? (
                <p className="text-muted-foreground p-8 text-center glass rounded-lg">You haven't submitted any reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {myReviews.map((review) => (
                    <Card key={review.id} className="glass">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < review.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}
                              />
                            ))}
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold ${
                            review.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {review.status}
                          </span>
                        </div>
                        <p className="text-sm mb-4 italic text-foreground/80">"{review.message}"</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
