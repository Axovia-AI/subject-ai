import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  History, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Minus
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UsageHistoryProps {
  userId: string;
}

interface DailyUsage {
  date: string;
  optimized_count: number;
  total_emails_sent: number;
  average_open_rate: number | null;
}

type TimeRange = '7d' | '30d' | '3m' | '6m';

export const UsageHistory: React.FC<UsageHistoryProps> = ({ userId }) => {
  const { toast } = useToast();
  const [usageHistory, setUsageHistory] = useState<DailyUsage[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [chartView, setChartView] = useState<'optimizations' | 'emails' | 'performance'>('optimizations');

  // Fetch usage history based on time range
  useEffect(() => {
    fetchUsageHistory();
  }, [userId, timeRange]);

  const fetchUsageHistory = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '3m':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
      }

      const { data, error } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching usage history:', error);
        toast({
          title: "Error loading history",
          description: "Failed to load your usage history.",
          variant: "destructive",
        });
        return;
      }

      setUsageHistory(data || []);
    } catch (error) {
      console.error('Error fetching usage history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const chartData = usageHistory.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    optimizations: day.optimized_count,
    emails: day.total_emails_sent,
    openRate: day.average_open_rate ? (day.average_open_rate * 100) : null,
    fullDate: day.date
  }));

  // Calculate trends
  const calculateTrend = (data: number[]): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, data.length);
    const previous = data.slice(-14, -7).reduce((a, b) => a + b, 0) / Math.min(7, data.length);
    
    if (recent > previous * 1.1) return 'up';
    if (recent < previous * 0.9) return 'down';
    return 'stable';
  };

  const optimizationsTrend = calculateTrend(usageHistory.map(d => d.optimized_count));
  const emailsTrend = calculateTrend(usageHistory.map(d => d.total_emails_sent));

  // Summary statistics
  const totalOptimizations = usageHistory.reduce((sum, day) => sum + day.optimized_count, 0);
  const totalEmails = usageHistory.reduce((sum, day) => sum + day.total_emails_sent, 0);
  const avgDaily = totalOptimizations / Math.max(usageHistory.length, 1);

  // Export data as CSV
  const exportData = () => {
    const csvContent = [
      ['Date', 'Optimizations', 'Emails Sent', 'Open Rate'],
      ...usageHistory.map(day => [
        day.date,
        day.optimized_count.toString(),
        day.total_emails_sent.toString(),
        day.average_open_rate ? (day.average_open_rate * 100).toFixed(2) + '%' : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subjectai-usage-${timeRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: `Your usage data has been exported for the last ${timeRange}.`,
    });
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Loading usage history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Usage History
              </CardTitle>
              <CardDescription>
                Track your SubjectAI usage over time
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Optimizations</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{totalOptimizations}</p>
                  {getTrendIcon(optimizationsTrend)}
                </div>
              </div>
              <Badge variant="secondary" className={getTrendColor(optimizationsTrend)}>
                {timeRange}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Emails</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{totalEmails}</p>
                  {getTrendIcon(emailsTrend)}
                </div>
              </div>
              <Badge variant="secondary" className={getTrendColor(emailsTrend)}>
                {timeRange}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Average</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{avgDaily.toFixed(1)}</p>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <Badge variant="secondary">
                per day
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usage Trends</CardTitle>
            <Select value={chartView} onValueChange={(value) => setChartView(value as any)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="optimizations">Optimizations</SelectItem>
                <SelectItem value="emails">Email Tracking</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'performance' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value?.toFixed(1)}%`, 'Open Rate']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="openRate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    connectNulls={false}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      value,
                      name === 'optimizations' ? 'Optimizations' : 'Emails Sent'
                    ]}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey={chartView} 
                    fill={chartView === 'optimizations' ? 'hsl(var(--primary))' : 'hsl(var(--blue-500))'}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};