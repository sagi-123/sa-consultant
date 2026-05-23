import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import UserDashboard from "./pages/UserDashboard.tsx";
import CandidatePortal from "./pages/CandidatePortal.tsx";
import VendorPortal from "./pages/VendorPortal.tsx";
import Jobs from "./pages/Jobs.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!user) return <Navigate to={`/auth?returnTo=${encodeURIComponent(location.pathname)}`} />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" />;

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme" attribute="class">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/candidate-portal" 
                element={
                  <ProtectedRoute>
                    <CandidatePortal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor-portal" 
                element={
                  <ProtectedRoute>
                    <VendorPortal />
                  </ProtectedRoute>
                } 
              />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
