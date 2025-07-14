import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Target, Award, AlertCircle, CheckCircle } from 'lucide-react';

interface PerformanceMetricsProps {
  data: Array<{
    date: string;
    optimized_count: number;
    average_open_rate: number | null;
    total_emails_sent: number;
  }>;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ data }) => {
  // Calculate performance metrics
  const totalOptimized = data.reduce((sum, day) => sum + day.optimized_count, 0);
  const totalEmailsSent = data.reduce((sum, day) => sum + day.total_emails_sent, 0);
  
  // Calculate average open rate (weighted)
  let totalOpenRateSum = 0;
  let totalEmailsWithRate = 0;
  
  data.forEach(day => {
    if (day.average_open_rate !== null && day.total_emails_sent > 0) {
      totalOpenRateSum += day.average_open_rate * day.total_emails_sent;
      totalEmailsWithRate += day.total_emails_sent;
    }
  });
  
  const avgOpenRate = totalEmailsWithRate > 0 ? totalOpenRateSum / totalEmailsWithRate : 0;
  const openRatePercent = avgOpenRate * 100;

  // Performance categories
  const optimizationRate = totalEmailsSent > 0 ? (totalOptimized / totalEmailsSent) * 100 : 0;
  
  // Industry benchmarks
  const industryAvgOpenRate = 21.5;
  const openRateComparison = openRatePercent - industryAvgOpenRate;
  
  // Performance distribution for pie chart
  const performanceData = [
    { name: 'Excellent', value: Math.max(0, openRatePercent - 25), color: 'hsl(var(--green-500, 34 197 94))' },
    { name: 'Good', value: Math.max(0, Math.min(openRatePercent, 25) - 15), color: 'hsl(var(--blue-500, 59 130 246))' },
    { name: 'Average', value: Math.max(0, Math.min(openRatePercent, 15)), color: 'hsl(var(--yellow-500, 234 179 8))' },
    { name: 'Below Average', value: Math.max(0, 100 - openRatePercent), color: 'hsl(var(--red-500, 239 68 68))' }
  ].filter(item => item.value > 0);

  // Daily performance bars
  const dailyPerformance = data
    .filter(day => day.average_open_rate !== null)
    .slice(-7) // Last 7 days with data
    .map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      openRate: (day.average_open_rate || 0) * 100,
      optimized: day.optimized_count,
      sent: day.total_emails_sent
    }));

  // Performance status
  const getPerformanceStatus = (rate: number) => {
    if (rate >= 25) return { status: 'excellent', color: 'green', icon: Award };
    if (rate >= 20) return { status: 'good', color: 'blue', icon: CheckCircle };
    if (rate >= 15) return { status: 'average', color: 'yellow', icon: Target };
    return { status: 'needs improvement', color: 'red', icon: AlertCircle };
  };

  const performanceStatus = getPerformanceStatus(openRatePercent);
  const StatusIcon = performanceStatus.icon;

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Detailed analysis of your email optimization performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Performance Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Overall Performance</h4>
            <Badge 
              variant={performanceStatus.color === 'green' ? 'default' : 'secondary'}
              className={`
                ${performanceStatus.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                ${performanceStatus.color === 'blue' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                ${performanceStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                ${performanceStatus.color === 'red' ? 'bg-red-100 text-red-800 border-red-200' : ''}
              `}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {performanceStatus.status}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Open Rate</span>
              <span className="font-medium">{openRatePercent.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(openRatePercent, 40)} 
              max={40} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {openRateComparison >= 0 ? '+' : ''}{openRateComparison.toFixed(1)}% vs industry average ({industryAvgOpenRate}%)
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-primary">{optimizationRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Optimization Rate</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{totalOptimized}</div>
            <div className="text-xs text-muted-foreground">Total Optimized</div>
          </div>
        </div>

        {/* Performance Distribution */}
        {performanceData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Performance Distribution</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value.toFixed(1)}%`, 'Performance']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {performanceData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Daily Performance */}
        {dailyPerformance.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Recent Performance</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs text-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    className="text-xs text-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'openRate' ? `${value.toFixed(1)}%` : value,
                      name === 'openRate' ? 'Open Rate' : name === 'optimized' ? 'Optimized' : 'Sent'
                    ]}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="openRate" 
                    fill="hsl(var(--primary))" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};