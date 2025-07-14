import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { authUtils, dbUtils, logger } from '../utils/supabase';
import { 
  TrendingUp, 
  Mail, 
  Settings, 
  ExternalLink, 
  LogOut, 
  BarChart3,
  User,
  Loader2
} from 'lucide-react';
import aiBrainLogo from "@/assets/ai-brain-logo.png";

// Data interfaces
interface ExtensionStats {
  optimizedCount: number;
  averageOpenRate: number | null;
  isLoggedIn: boolean;
  userEmail: string | null;
  userName: string | null;
}

interface AuthForm {
  email: string;
  password: string;
  fullName: string;
  isSignUp: boolean;
}

// Main popup component
export const PopupApp: React.FC = () => {
  // State management
  const [stats, setStats] = useState<ExtensionStats>({
    optimizedCount: 0,
    averageOpenRate: null,
    isLoggedIn: false,
    userEmail: null,
    userName: null,
  });

  const [authForm, setAuthForm] = useState<AuthForm>({
    email: '',
    password: '',
    fullName: '',
    isSignUp: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize app and load user data
  useEffect(() => {
    initializeApp();

    // Listen for auth state changes
    const unsubscribe = authUtils.onAuthStateChange((session) => {
      if (session) {
        loadUserData(session.user.id);
      } else {
        // Reset stats when user logs out
        setStats({
          optimizedCount: 0,
          averageOpenRate: null,
          isLoggedIn: false,
          userEmail: null,
          userName: null,
        });
        setIsLoading(false);
      }
    });

    return () => {
      if (unsubscribe?.data?.subscription) {
        unsubscribe.data.subscription.unsubscribe();
      }
    };
  }, []);

  // Initialize the app by checking for existing session
  const initializeApp = async (): Promise<void> => {
    try {
      logger.info('Initializing popup app');
      const session = await authUtils.getSession();
      
      if (session) {
        await loadUserData(session.user.id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      logger.error('Failed to initialize app', error);
      setError('Failed to initialize app');
      setIsLoading(false);
    }
  };

  // Load user data including profile and stats
  const loadUserData = async (userId: string): Promise<void> => {
    try {
      logger.info('Loading user data', { userId });

      // Load user profile
      const { data: profile, error: profileError } = await dbUtils.getUserProfile(userId);
      if (profileError && profileError.code !== 'PGRST116') {
        logger.error('Error loading profile', profileError);
      }

      // Load today's usage stats
      const { data: todayStats, error: statsError } = await dbUtils.getTodayStats(userId);
      if (statsError && statsError.code !== 'PGRST116') {
        logger.error('Error loading stats', statsError);
      }

      // Update state with loaded data
      setStats({
        optimizedCount: todayStats?.optimized_count || 0,
        averageOpenRate: todayStats?.average_open_rate || null,
        isLoggedIn: true,
        userEmail: profile?.email || null,
        userName: profile?.full_name || null,
      });

      setIsLoading(false);
      logger.info('User data loaded successfully');
    } catch (error) {
      logger.error('Failed to load user data', error);
      setError('Failed to load user data');
      setIsLoading(false);
    }
  };

  // Handle authentication (both sign in and sign up)
  const handleAuth = async (): Promise<void> => {
    setAuthLoading(true);
    setError('');

    try {
      let result;
      
      if (authForm.isSignUp) {
        // Sign up user
        result = await authUtils.signUp(
          authForm.email, 
          authForm.password, 
          authForm.fullName
        );
        
        if (!result.error) {
          setError('');
          // Show success message for email confirmation
          setError('Check your email for a confirmation link to complete registration.');
        }
      } else {
        // Sign in user
        result = await authUtils.signIn(authForm.email, authForm.password);
      }

      if (result.error) {
        setError(result.error.message);
        logger.error('Auth error', result.error);
      } else {
        logger.info(authForm.isSignUp ? 'User signed up' : 'User signed in');
        
        // Clear form on successful auth
        setAuthForm({
          email: '',
          password: '',
          fullName: '',
          isSignUp: false,
        });
      }
    } catch (error) {
      logger.error('Auth failed', error);
      setError('Authentication failed. Please try again.');
    }

    setAuthLoading(false);
  };

  // Handle user sign out
  const handleSignOut = async (): Promise<void> => {
    try {
      logger.info('Signing out user');
      await authUtils.signOut();
      
      // Reset form and stats
      setAuthForm({
        email: '',
        password: '',
        fullName: '',
        isSignUp: false,
      });
      
      setStats({
        optimizedCount: 0,
        averageOpenRate: null,
        isLoggedIn: false,
        userEmail: null,
        userName: null,
      });
      
      logger.info('User signed out successfully');
    } catch (error) {
      logger.error('Sign out failed', error);
      setError('Sign out failed. Please try again.');
    }
  };

  // Open dashboard in new tab
  const handleOpenDashboard = (): void => {
    // Get the extension's base URL and append the dashboard route
    const extensionUrl = chrome.runtime.getURL('');
    // Remove trailing slash and add proper route
    const baseUrl = extensionUrl.replace(/\/$/, '');
    chrome.tabs.create({ 
      url: `${window.location.origin}/dashboard`
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-80 min-h-96 p-6 bg-background">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Authenticated user UI
  if (stats.isLoggedIn) {
    return (
      <div className="w-80 bg-background">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={aiBrainLogo} alt="SubjectAI" className="w-6 h-6" />
              <span className="font-semibold text-foreground">SubjectAI</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-2 flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate">
              {stats.userName || stats.userEmail || 'User'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Today's Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Optimized</span>
                <Badge variant="secondary" className="px-2 py-1">
                  {stats.optimizedCount}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Open Rate</span>
                <span className="text-sm font-medium">
                  {stats.averageOpenRate 
                    ? `${(stats.averageOpenRate * 100).toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={handleOpenDashboard}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  chrome.tabs.create({ url: 'https://gmail.com' });
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Open Gmail
              </Button>
            </CardContent>
          </Card>

          {/* Status */}
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              Extension Active
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              AI suggestions ready in Gmail
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated user UI (Login/Signup)
  return (
    <div className="w-80 bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={aiBrainLogo} alt="SubjectAI" className="w-6 h-6" />
          <span className="font-semibold text-foreground">SubjectAI</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Sign in to optimize your email subject lines
        </p>
      </div>

      {/* Auth Form */}
      <div className="p-4">
        <Tabs value={authForm.isSignUp ? "signup" : "login"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger 
              value="login"
              onClick={() => setAuthForm({ ...authForm, isSignUp: false })}
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              onClick={() => setAuthForm({ ...authForm, isSignUp: true })}
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAuth();
            }}
            className="space-y-3"
          >
            {authForm.isSignUp && (
              <div>
                <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your name"
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                  className="h-9"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
                className="h-9"
              />
            </div>

            {error && (
              <Alert variant={error.includes('Check your email') ? 'default' : 'destructive'}>
                <AlertDescription className="text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full h-9" 
              disabled={authLoading}
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {authForm.isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                authForm.isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <Separator className="my-4" />
          
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleOpenDashboard}
              className="text-xs"
            >
              Visit Dashboard
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  );
};