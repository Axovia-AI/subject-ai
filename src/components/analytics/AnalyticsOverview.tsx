import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { UsageTrendsChart } from './UsageTrendsChart';
import { PerformanceMetrics } from './PerformanceMetrics';
import { AnalyticsInsights } from './AnalyticsInsights';
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  BarChart3,
  Mail,
  Target,
  Zap
} from 'lucide-react';

// Enhanced interfaces for comprehensive analytics data
interface AnalyticsData {
  date: string;
  optimized_count: number;
  average_open_rate: number | null;
  total_emails_sent: number;
}

interface AnalyticsSummary {
  totalOptimized: number;
  avgOpenRate: number;
  totalEmailsSent: number;
  growthRate: number;
  bestPerformingDay: string;
  improvementTrend: 'up' | 'down' | 'stable';
}

interface AnalyticsOverviewProps {
  userId: string;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ userId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Load comprehensive analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [userId, timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Calculate date range based on selection
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Fetch usage stats for the selected time range
      const { data: stats, error } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('Error loading analytics:', error);
        return;
      }

      const formattedData: AnalyticsData[] = stats || [];
      setAnalyticsData(formattedData);

      // Calculate summary metrics
      if (formattedData.length > 0) {
        const totalOptimized = formattedData.reduce((sum, day) => sum + day.optimized_count, 0);
        const totalEmailsSent = formattedData.reduce((sum, day) => sum + day.total_emails_sent, 0);
        
        // Calculate average open rate (weighted by emails sent)
        let totalOpenRateSum = 0;
        let totalEmailsWithRate = 0;
        
        formattedData.forEach(day => {
          if (day.average_open_rate !== null && day.total_emails_sent > 0) {
            totalOpenRateSum += day.average_open_rate * day.total_emails_sent;
            totalEmailsWithRate += day.total_emails_sent;
          }
        });
        
        const avgOpenRate = totalEmailsWithRate > 0 ? totalOpenRateSum / totalEmailsWithRate : 0;

        // Calculate growth rate (comparing first half vs second half of period)
        const midPoint = Math.floor(formattedData.length / 2);
        const firstHalf = formattedData.slice(0, midPoint);
        const secondHalf = formattedData.slice(midPoint);
        
        const firstHalfAvg = firstHalf.length > 0 
          ? firstHalf.reduce((sum, day) => sum + day.optimized_count, 0) / firstHalf.length 
          : 0;
        const secondHalfAvg = secondHalf.length > 0 
          ? secondHalf.reduce((sum, day) => sum + day.optimized_count, 0) / secondHalf.length 
          : 0;
        
        const growthRate = firstHalfAvg > 0 
          ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 
          : 0;

        // Find best performing day
        const bestDay = formattedData.reduce((best, current) => 
          current.optimized_count > best.optimized_count ? current : best
        );

        // Determine trend
        let improvementTrend: 'up' | 'down' | 'stable' = 'stable';
        if (growthRate > 5) improvementTrend = 'up';
        else if (growthRate < -5) improvementTrend = 'down';

        setSummary({
          totalOptimized,
          avgOpenRate,
          totalEmailsSent,
          growthRate,
          bestPerformingDay: bestDay.date,
          improvementTrend
        });
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Export analytics data
  const exportData = () => {
    const csvContent = [
      ['Date', 'Optimized Count', 'Average Open Rate', 'Total Emails Sent'],
      ...analyticsData.map(row => [
        row.date,
        row.optimized_count.toString(),
        row.average_open_rate?.toString() || 'N/A',
        row.total_emails_sent.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subjectai-analytics-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector and Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your email optimization performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as '7d' | '30d' | '90d')}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
                <TabsTrigger value="90d">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Button variant="outline" onClick={exportData} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Optimized</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {summary?.totalOptimized || 0}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {summary?.improvementTrend === 'up' && (
                <>
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">
                    +{summary.growthRate.toFixed(1)}% growth
                  </span>
                </>
              )}
              {summary?.improvementTrend === 'down' && (
                <>
                  <TrendingDown className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600">
                    {summary.growthRate.toFixed(1)}% decline
                  </span>
                </>
              )}
              {summary?.improvementTrend === 'stable' && (
                <span className="text-xs text-muted-foreground">Stable performance</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary?.avgOpenRate ? `${(summary.avgOpenRate * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Industry avg: 21.5%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary?.totalEmailsSent || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              With optimized subjects
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Day</CardTitle>
            <Zap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {summary?.bestPerformingDay ? 
                new Date(summary.bestPerformingDay).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Peak performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UsageTrendsChart data={analyticsData} timeRange={timeRange} />
        <PerformanceMetrics data={analyticsData} />
      </div>

      {/* Insights Panel */}
      <AnalyticsInsights data={analyticsData} summary={summary} />
    </div>
  );
};