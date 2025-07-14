import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from '@supabase/supabase-js';
import { BarChart3, Mail, TrendingUp, Settings, LogOut, User as UserIcon, Activity, Target } from 'lucide-react';
import aiBrainLogo from "@/assets/ai-brain-logo.png";
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { UsageOverview } from '@/components/usage/UsageOverview';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface UsageStats {
  optimized_count: number;
  average_open_rate: number | null;
  total_emails_sent: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication and load user data
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      await loadUserData(session.user.id);
      setIsLoading(false);
    };

    initializeUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load user profile and stats
  const loadUserData = async (userId: string) => {
    try {
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      } else {
        setUserProfile(profile);
      }

      // Load usage stats for today
      const today = new Date().toISOString().split('T')[0];
      const { data: stats, error: statsError } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error loading stats:', statsError);
      } else {
        setUsageStats(stats);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

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
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={aiBrainLogo} alt="SubjectAI" className="w-8 h-8" />
              <span className="text-xl font-bold text-foreground">SubjectAI</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="w-4 h-4" />
                <span className="text-muted-foreground">
                  {userProfile?.full_name || user?.email}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back{userProfile?.full_name ? `, ${userProfile.full_name}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your SubjectAI usage and performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subject Lines Optimized</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageStats?.optimized_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                Today's optimizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usageStats?.average_open_rate ? `${(usageStats.average_open_rate * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Email performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageStats?.total_emails_sent || 0}</div>
              <p className="text-xs text-muted-foreground">
                Using optimized subjects
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="extension">Browser Extension</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Follow these steps to start optimizing your email subject lines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <Badge variant="secondary" className="mt-1">1</Badge>
                  <div>
                    <h4 className="font-medium">Install Browser Extension</h4>
                    <p className="text-sm text-muted-foreground">
                      Add our Chrome extension to optimize Gmail subject lines in real-time
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge variant="secondary" className="mt-1">2</Badge>
                  <div>
                    <h4 className="font-medium">Connect Your Email</h4>
                    <p className="text-sm text-muted-foreground">
                      The extension will automatically detect when you're composing emails
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge variant="secondary" className="mt-1">3</Badge>
                  <div>
                    <h4 className="font-medium">Get AI Suggestions</h4>
                    <p className="text-sm text-muted-foreground">
                      Our AI will suggest optimized subject lines based on your email content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsOverview userId={user?.id || ''} />
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <UsageOverview userId={user?.id || ''} />
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionManager userId={user?.id || ''} />
          </TabsContent>

          <TabsContent value="extension" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Browser Extension</CardTitle>
                <CardDescription>
                  Install and manage your SubjectAI browser extension
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Extension Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Extension installation and management features will be available soon.
                  </p>
                  <Button variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;