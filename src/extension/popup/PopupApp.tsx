/// <reference types="chrome"/>
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, TrendingUp, Mail, LogOut, User } from 'lucide-react';
import { authUtils, dbUtils, logger } from '../utils/supabase';

interface ExtensionStats {
  optimizedToday: number;
  averageOpenRate: number;
  isLoggedIn: boolean;
  userEmail?: string;
  userName?: string;
}

interface AuthForm {
  email: string;
  password: string;
  fullName?: string;
  isSignUp: boolean;
}

export function PopupApp() {
  const [stats, setStats] = useState<ExtensionStats>({
    optimizedToday: 0,
    averageOpenRate: 0,
    isLoggedIn: false
  });
  
  const [authForm, setAuthForm] = useState<AuthForm>({
    email: '',
    password: '',
    fullName: '',
    isSignUp: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
    
    // Listen for auth state changes
    const { data: { subscription } } = authUtils.onAuthStateChange((session) => {
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setStats(prev => ({ ...prev, isLoggedIn: false, userEmail: undefined, userName: undefined }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeApp = async () => {
    try {
      const session = await authUtils.getSession();
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        setStats(prev => ({ ...prev, isLoggedIn: false }));
      }
    } catch (error) {
      logger.error('Failed to initialize app:', error);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const [profileResult, statsResult] = await Promise.all([
        dbUtils.getUserProfile(userId),
        dbUtils.getTodayStats(userId)
      ]);
      
      setStats({
        optimizedToday: statsResult.data?.optimized_count || 0,
        averageOpenRate: statsResult.data?.average_open_rate || 0,
        isLoggedIn: true,
        userEmail: profileResult.data?.email || '',
        userName: profileResult.data?.full_name || ''
      });
    } catch (error) {
      logger.error('Failed to load user data:', error);
    }
  };

  const handleAuth = async () => {
    if (!authForm.email || !authForm.password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      if (authForm.isSignUp) {
        result = await authUtils.signUp(authForm.email, authForm.password, authForm.fullName);
      } else {
        result = await authUtils.signIn(authForm.email, authForm.password);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        setAuthForm({ email: '', password: '', fullName: '', isSignUp: false });
        if (authForm.isSignUp) {
          setError('Please check your email to confirm your account');
        }
      }
    } catch (error: any) {
      logger.error('Auth error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authUtils.signOut();
      setStats({
        optimizedToday: 0,
        averageOpenRate: 0,
        isLoggedIn: false
      });
      logger.info('User signed out successfully');
    } catch (error) {
      logger.error('Sign out error:', error);
    }
  };

  const handleOpenDashboard = () => {
    chrome.tabs.create({ url: 'https://subjectai.lovable.app' });
  };

  if (!stats.isLoggedIn) {
    return (
      <div className="w-80 p-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="w-6 h-6 text-primary" />
              <CardTitle className="text-lg">SubjectAI</CardTitle>
            </div>
            <CardDescription>
              {authForm.isSignUp ? 'Create an account' : 'Sign in to start optimizing your email subject lines'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            
            {authForm.isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name (Optional)</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Your Name"
                />
              </div>
            )}
            
            <Button 
              onClick={handleAuth} 
              className="w-full"
              size="sm"
              disabled={loading}
            >
              {loading ? 'Loading...' : (authForm.isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
            
            <Button 
              onClick={() => setAuthForm(prev => ({ ...prev, isSignUp: !prev.isSignUp }))}
              variant="ghost" 
              className="w-full"
              size="sm"
            >
              {authForm.isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </Button>
            
            <Button 
              onClick={handleOpenDashboard} 
              variant="outline" 
              className="w-full"
              size="sm"
            >
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-80 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">SubjectAI</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
              <Button 
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <LogOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <CardDescription className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {stats.userName || stats.userEmail}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Today</span>
              </div>
              <div className="text-xl font-bold text-primary">
                {stats.optimizedToday}
              </div>
              <div className="text-xs text-muted-foreground">Optimized</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium">Avg Rate</span>
              </div>
              <div className="text-xl font-bold text-green-600">
                {stats.averageOpenRate}%
              </div>
              <div className="text-xs text-muted-foreground">Open Rate</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Start composing an email to see AI suggestions
            </p>
            <Button 
              onClick={handleOpenDashboard} 
              variant="outline" 
              className="w-full"
              size="sm"
            >
              Open Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}