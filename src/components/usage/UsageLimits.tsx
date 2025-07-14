import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap, 
  Crown, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  TrendingUp,
  Mail,
  Target
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UsageLimitsProps {
  userId: string;
}

interface PlanLimits {
  name: string;
  optimizations: number;
  emails: number;
  analytics: boolean;
  priority: string;
  price: string;
}

interface UsageData {
  currentOptimizations: number;
  currentEmails: number;
  periodStart: string;
  periodEnd: string;
}

const PLANS: Record<string, PlanLimits> = {
  free: {
    name: 'Free Plan',
    optimizations: 25,
    emails: 100,
    analytics: false,
    priority: 'Standard',
    price: '$0/month'
  },
  pro: {
    name: 'Pro Plan',
    optimizations: 500,
    emails: 2500,
    analytics: true,
    priority: 'Priority',
    price: '$19/month'
  },
  enterprise: {
    name: 'Enterprise Plan',
    optimizations: -1, // Unlimited
    emails: -1, // Unlimited
    analytics: true,
    priority: 'Dedicated',
    price: 'Custom'
  }
};

export const UsageLimits: React.FC<UsageLimitsProps> = ({ userId }) => {
  const { toast } = useToast();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [isLoading, setIsLoading] = useState(true);

  // Calculate billing period (monthly)
  const getBillingPeriod = () => {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: periodStart.toISOString().split('T')[0],
      end: periodEnd.toISOString().split('T')[0]
    };
  };

  // Fetch usage data from the current billing period
  useEffect(() => {
    fetchUsageData();
  }, [userId]);

  const fetchUsageData = async () => {
    try {
      setIsLoading(true);
      const period = getBillingPeriod();
      
      // Fetch usage stats for the current billing period
      const { data: stats, error } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', userId)
        .gte('date', period.start)
        .lte('date', period.end);

      if (error) {
        console.error('Error fetching usage data:', error);
        toast({
          title: "Error loading usage data",
          description: "Failed to load your usage statistics.",
          variant: "destructive",
        });
        return;
      }

      // Aggregate usage data
      const totalOptimizations = stats?.reduce((sum, day) => sum + day.optimized_count, 0) || 0;
      const totalEmails = stats?.reduce((sum, day) => sum + day.total_emails_sent, 0) || 0;

      setUsageData({
        currentOptimizations: totalOptimizations,
        currentEmails: totalEmails,
        periodStart: period.start,
        periodEnd: period.end
      });

    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate usage percentages
  const getUsagePercentage = (current: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  // Get status color based on usage
  const getStatusColor = (percentage: number): string => {
    if (percentage >= 90) return 'destructive';
    if (percentage >= 75) return 'yellow';
    return 'default';
  };

  // Get current plan limits
  const planLimits = PLANS[currentPlan];
  
  const optimizationPercentage = usageData 
    ? getUsagePercentage(usageData.currentOptimizations, planLimits.optimizations)
    : 0;
    
  const emailPercentage = usageData 
    ? getUsagePercentage(usageData.currentEmails, planLimits.emails)
    : 0;

  // Format period dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Loading usage data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentPlan === 'free' ? (
                  <Zap className="w-5 h-5 text-blue-500" />
                ) : currentPlan === 'pro' ? (
                  <Crown className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Target className="w-5 h-5 text-purple-500" />
                )}
                {planLimits.name}
              </CardTitle>
              <CardDescription>
                Current billing period: {usageData && formatDate(usageData.periodStart)} - {usageData && formatDate(usageData.periodEnd)}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {planLimits.price}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Alerts */}
      {optimizationPercentage >= 90 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You've used {optimizationPercentage.toFixed(0)}% of your optimization limit. 
            Consider upgrading to continue optimizing emails.
          </AlertDescription>
        </Alert>
      )}

      {emailPercentage >= 90 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You've tracked {emailPercentage.toFixed(0)}% of your email limit. 
            Upgrade for higher limits and better analytics.
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Optimizations Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-primary" />
              Subject Line Optimizations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Used this period</span>
              <span className="font-medium">
                {usageData?.currentOptimizations || 0}
                {planLimits.optimizations !== -1 && ` / ${planLimits.optimizations}`}
              </span>
            </div>
            
            {planLimits.optimizations !== -1 ? (
              <div className="space-y-2">
                <Progress 
                  value={optimizationPercentage} 
                  className="h-2"
                  color={getStatusColor(optimizationPercentage)}
                />
                <p className="text-xs text-muted-foreground">
                  {planLimits.optimizations - (usageData?.currentOptimizations || 0)} optimizations remaining
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Unlimited</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Tracking Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              Email Performance Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Emails tracked</span>
              <span className="font-medium">
                {usageData?.currentEmails || 0}
                {planLimits.emails !== -1 && ` / ${planLimits.emails}`}
              </span>
            </div>
            
            {planLimits.emails !== -1 ? (
              <div className="space-y-2">
                <Progress 
                  value={emailPercentage} 
                  className="h-2"
                  color={getStatusColor(emailPercentage)}
                />
                <p className="text-xs text-muted-foreground">
                  {planLimits.emails - (usageData?.currentEmails || 0)} emails remaining
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Unlimited</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Plan Features
          </CardTitle>
          <CardDescription>
            What's included in your current plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Support Priority</p>
                <p className="text-xs text-muted-foreground">{planLimits.priority}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Advanced Analytics</p>
                <p className="text-xs text-muted-foreground">
                  {planLimits.analytics ? 'Included' : 'Not available'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Zap className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">AI Model</p>
                <p className="text-xs text-muted-foreground">
                  {currentPlan === 'free' ? 'Standard' : 'Premium'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {currentPlan === 'free' && (optimizationPercentage > 60 || emailPercentage > 60) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Upgrade to Pro
            </CardTitle>
            <CardDescription>
              Get 20x more optimizations, unlimited email tracking, and advanced analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-2xl font-bold text-primary">500</div>
                <div className="text-sm text-muted-foreground">Optimizations/month</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-2xl font-bold text-blue-600">2,500</div>
                <div className="text-sm text-muted-foreground">Emails tracked</div>
              </div>
            </div>
            <Button className="w-full" size="lg">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro - $19/month
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};