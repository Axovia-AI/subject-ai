import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon } from 'lucide-react';
import aiBrainLogo from "@/assets/ai-brain-logo.png";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication status
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You've been logged out of your account.",
      });
    }
  };

  return (
    <header className="w-full py-4 px-6 border-b border-border bg-background/80 backdrop-blur-sm fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={aiBrainLogo} alt="SubjectAI" className="w-8 h-8" />
          <span className="text-xl font-bold text-foreground">SubjectAI</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
            Reviews
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            // Authenticated user menu
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <UserIcon className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            // Unauthenticated user buttons
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button variant="gradient" size="sm" onClick={() => navigate('/auth')}>
                Start Free Trial
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;