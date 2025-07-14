import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle,
  Star
} from 'lucide-react';

interface AnalyticsInsightsProps {
  data: Array<{
    date: string;
    optimized_count: number;
    average_open_rate: number | null;
    total_emails_sent: number;
  }>;
  summary: {
    totalOptimized: number;
    avgOpenRate: number;
    totalEmailsSent: number;
    growthRate: number;
    bestPerformingDay: string;
    improvementTrend: 'up' | 'down' | 'stable';
  } | null;
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  icon: React.ElementType;
  action?: string;
}

export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ data, summary }) => {
  // Generate intelligent insights based on data analysis
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    if (!summary || data.length === 0) {
      return [{
        type: 'info',
        title: 'Start Optimizing',
        description: 'Begin using SubjectAI to optimize your email subject lines and see insights here.',
        icon: Lightbulb,
        action: 'Install browser extension'
      }];
    }

    // Growth trend insights
    if (summary.improvementTrend === 'up' && summary.growthRate > 20) {
      insights.push({
        type: 'success',
        title: 'Excellent Growth!',
        description: `Your optimization usage has increased by ${summary.growthRate.toFixed(1)}%. Keep up the great work!`,
        icon: TrendingUp
      });
    } else if (summary.improvementTrend === 'down' && summary.growthRate < -10) {
      insights.push({
        type: 'warning',
        title: 'Usage Declining',
        description: `Your optimization activity has decreased by ${Math.abs(summary.growthRate).toFixed(1)}%. Consider setting daily goals.`,
        icon: TrendingDown,
        action: 'Set usage reminders'
      });
    }

    // Open rate performance insights
    const avgOpenRatePercent = summary.avgOpenRate * 100;
    const industryAvg = 21.5;

    if (avgOpenRatePercent > industryAvg + 5) {
      insights.push({
        type: 'success',
        title: 'Above Industry Average!',
        description: `Your open rate of ${avgOpenRatePercent.toFixed(1)}% is significantly above the industry average of ${industryAvg}%.`,
        icon: Star
      });
    } else if (avgOpenRatePercent < industryAvg - 5) {
      insights.push({
        type: 'warning',
        title: 'Room for Improvement',
        description: `Your open rate is below industry average. Try optimizing more subject lines and A/B testing different styles.`,
        icon: Target,
        action: 'Optimize more emails'
      });
    }

    // Usage consistency insights
    const daysWithActivity = data.filter(day => day.optimized_count > 0).length;
    const consistencyRate = (daysWithActivity / data.length) * 100;

    if (consistencyRate > 80) {
      insights.push({
        type: 'success',
        title: 'Consistent Usage',
        description: `You've been consistently optimizing emails ${consistencyRate.toFixed(0)}% of days. Consistency leads to better results!`,
        icon: CheckCircle
      });
    } else if (consistencyRate < 30) {
      insights.push({
        type: 'tip',
        title: 'Be More Consistent',
        description: 'Regular optimization leads to better habits and improved performance. Try setting a daily goal.',
        icon: Calendar,
        action: 'Set daily reminder'
      });
    }

    // Best performing day insight
    if (summary.bestPerformingDay) {
      const bestDay = data.find(day => day.date === summary.bestPerformingDay);
      if (bestDay && bestDay.optimized_count > 5) {
        const dayOfWeek = new Date(summary.bestPerformingDay).toLocaleDateString('en-US', { weekday: 'long' });
        insights.push({
          type: 'info',
          title: `${dayOfWeek}s Are Your Best Days`,
          description: `Your peak optimization day was a ${dayOfWeek} with ${bestDay.optimized_count} optimizations. Consider focusing efforts on this day.`,
          icon: Zap
        });
      }
    }

    // Volume insights
    if (summary.totalOptimized > 50) {
      insights.push({
        type: 'success',
        title: 'High Volume User',
        description: `You've optimized ${summary.totalOptimized} subject lines! You're making the most of SubjectAI.`,
        icon: Star
      });
    } else if (summary.totalOptimized < 10) {
      insights.push({
        type: 'tip',
        title: 'Get Started',
        description: 'The more you use SubjectAI, the better you\'ll understand what works for your audience.',
        icon: Lightbulb,
        action: 'Try optimizing more emails'
      });
    }

    // Email sending vs optimization ratio
    const optimizationRate = summary.totalEmailsSent > 0 ? (summary.totalOptimized / summary.totalEmailsSent) * 100 : 0;
    
    if (optimizationRate > 80) {
      insights.push({
        type: 'success',
        title: 'Optimization Champion',
        description: `You're optimizing ${optimizationRate.toFixed(0)}% of your emails. Excellent commitment to improvement!`,
        icon: Star
      });
    } else if (optimizationRate < 20) {
      insights.push({
        type: 'tip',
        title: 'Optimize More Emails',
        description: 'You could optimize more of your outgoing emails. Every optimization is an opportunity to improve performance.',
        icon: Target,
        action: 'Enable auto-optimize'
      });
    }

    return insights.slice(0, 4); // Limit to 4 most relevant insights
  };

  const insights = generateInsights();

  // Get alert variant based on insight type
  const getInsightStyle = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'tip':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Personalized recommendations based on your email optimization patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <Alert 
                key={index} 
                className={`border-l-4 ${getInsightStyle(insight.type)}`}
              >
                <IconComponent className="h-4 w-4" />
                <div>
                  <div className="font-medium mb-1">{insight.title}</div>
                  <AlertDescription className="text-sm">
                    {insight.description}
                  </AlertDescription>
                  {insight.action && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        💡 {insight.action}
                      </Badge>
                    </div>
                  )}
                </div>
              </Alert>
            );
          })}
        </div>

        {/* Quick Stats Summary */}
        {summary && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-3">Quick Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">{summary.totalOptimized}</div>
                <div className="text-xs text-muted-foreground">Optimizations</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {(summary.avgOpenRate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Avg Open Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{summary.totalEmailsSent}</div>
                <div className="text-xs text-muted-foreground">Emails Sent</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${
                  summary.growthRate > 0 ? 'text-green-600' : 
                  summary.growthRate < 0 ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  {summary.growthRate > 0 ? '+' : ''}{summary.growthRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Growth Rate</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};