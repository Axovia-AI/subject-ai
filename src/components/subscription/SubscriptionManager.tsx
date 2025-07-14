import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Crown, Zap } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

interface SubscriptionManagerProps {
  userId: string;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ userId }) => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  // Check subscription status
  const checkSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create checkout session
  const handleSubscribe = async () => {
    try {
      setActionLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planName: "SubjectAI Premium" }
      });
      
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Open customer portal
  const handleManageSubscription = async () => {
    try {
      setActionLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
    
    // Auto-refresh subscription status every 30 seconds
    const interval = setInterval(checkSubscription, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Checking subscription status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card className={subscriptionData?.subscribed ? "border-primary" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {subscriptionData?.subscribed ? (
                  <>
                    <Crown className="h-5 w-5 text-primary" />
                    Premium Plan
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Free Plan
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {subscriptionData?.subscribed 
                  ? `Active ${subscriptionData.subscription_tier} subscription`
                  : "Upgrade to unlock unlimited email optimizations"
                }
              </CardDescription>
            </div>
            <Badge variant={subscriptionData?.subscribed ? "default" : "secondary"}>
              {subscriptionData?.subscribed ? "Active" : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {subscriptionData?.subscribed ? (
            <div className="space-y-4">
              {subscriptionData.subscription_end && (
                <p className="text-sm text-muted-foreground">
                  Next billing: {new Date(subscriptionData.subscription_end).toLocaleDateString()}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handleManageSubscription}
                  disabled={actionLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {actionLoading ? "Opening..." : "Manage Subscription"}
                </Button>
                <Button
                  onClick={checkSubscription}
                  variant="ghost"
                  size="sm"
                >
                  Refresh Status
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>✨ Unlimited email optimizations</p>
                <p>📈 Advanced analytics</p>  
                <p>⚡ Priority support</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubscribe}
                  disabled={actionLoading}
                  className="flex items-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Crown className="h-4 w-4" />
                  )}
                  {actionLoading ? "Starting..." : "Upgrade to Premium - $19.99/mo"}
                </Button>
                <Button
                  onClick={checkSubscription}
                  variant="ghost" 
                  size="sm"
                >
                  Refresh Status
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Features Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-lg">Free Plan</CardTitle>
            <CardDescription>Get started with basic features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>✅ 10 email optimizations/month</div>
            <div>✅ Basic analytics</div>
            <div>✅ Standard support</div>
            <div className="pt-4">
              <Badge variant="secondary">Current Plan</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className={`relative ${subscriptionData?.subscribed ? 'border-primary bg-primary/5' : ''}`}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Premium Plan
            </CardTitle>
            <CardDescription>Unlock the full power of SubjectAI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>✅ Unlimited email optimizations</div>
            <div>✅ Advanced analytics & insights</div>
            <div>✅ Priority support</div>
            <div>✅ Custom optimization models</div>
            <div className="pt-4">
              {subscriptionData?.subscribed ? (
                <Badge>Your Plan</Badge>
              ) : (
                <Badge variant="outline">$19.99/month</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};