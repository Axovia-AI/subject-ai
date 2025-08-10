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
    <header className="w-full py-4 px-6 border-b border-border/50 bg-background/80 backdrop-blur-md fixed top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={aiBrainLogo} alt="SubjectAI" className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
            SubjectAI
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          <a href="#features" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full">
            Features
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full">
            Pricing
          </a>
          <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full">
            Reviews
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            // Authenticated user menu
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105">
                <UserIcon className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200 hover:scale-105">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            // Unauthenticated user buttons
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105">
                Sign In
              </Button>
              <Button variant="gradient" size="sm" onClick={() => navigate('/auth')} className="hover:scale-105 hover:shadow-lg transition-all duration-200">
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