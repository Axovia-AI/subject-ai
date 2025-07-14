/// <reference types="chrome"/>
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Mail } from 'lucide-react';

interface ExtensionStats {
  optimizedToday: number;
  averageOpenRate: number;
  isLoggedIn: boolean;
}

export function PopupApp() {
  const [stats, setStats] = useState<ExtensionStats>({
    optimizedToday: 0,
    averageOpenRate: 0,
    isLoggedIn: false
  });

  useEffect(() => {
    // Load stats from chrome.storage
    chrome.storage.local.get(['optimizedToday', 'averageOpenRate', 'isLoggedIn'], (result) => {
      setStats({
        optimizedToday: result.optimizedToday || 0,
        averageOpenRate: result.averageOpenRate || 0,
        isLoggedIn: result.isLoggedIn || false
      });
    });
  }, []);

  const handleOpenDashboard = () => {
    chrome.tabs.create({ url: 'https://subjectai.lovable.app' });
  };

  const handleLogin = () => {
    chrome.tabs.create({ url: 'https://subjectai.lovable.app/auth' });
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
              Sign in to start optimizing your email subject lines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleLogin} 
              className="w-full"
              size="sm"
            >
              Sign In
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
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          </div>
          <CardDescription>
            AI-powered subject line optimization
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