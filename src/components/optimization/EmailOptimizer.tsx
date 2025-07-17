import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Copy, CheckCircle, AlertCircle, Loader2, Lightbulb, TrendingUp, Zap, History } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface OptimizedResult {
  optimizedSubjects: string[];
  originalSubject: string;
  success: boolean;
}

interface UsageStats {
  optimized_count: number;
  total_emails_sent: number;
}

// Example subject lines to help users get started
const EXAMPLE_SUBJECTS = [
  { original: "Meeting Request", context: "Team sync meeting for project updates", tone: "professional" },
  { original: "New Product Launch", context: "Announcing our latest software feature", tone: "friendly" },
  { original: "Weekly Newsletter", context: "Company updates and industry news", tone: "casual" },
  { original: "Important Update", context: "Critical system maintenance notification", tone: "urgent" },
  { original: "Quarterly Report", context: "Financial results and business metrics", tone: "formal" },
];

// Subject line best practices tips
const OPTIMIZATION_TIPS = [
  "Keep it under 50 characters for mobile visibility",
  "Use action words to create urgency",
  "Personalize when possible (names, companies)",
  "Ask questions to spark curiosity",
  "Include numbers or stats for credibility",
  "Avoid spam trigger words (FREE, URGENT, !!!)",
  "Test different variations to see what works",
  "Consider your audience and timing",
];

// Email optimization component for testing and manual optimization
export const EmailOptimizer = () => {
  const [originalSubject, setOriginalSubject] = useState('');
  const [emailContext, setEmailContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState<OptimizedResult | null>(null);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [showTips, setShowTips] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Load usage stats on component mount
  useEffect(() => {
    if (user?.id) {
      loadUsageStats();
    }
  }, [user?.id]);

  // Load current usage stats
  const loadUsageStats = async () => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('usage_stats')
        .select('optimized_count, total_emails_sent')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading usage stats:', error);
      } else {
        setUsageStats(data);
      }
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  // Load example subject line
  const loadExample = (example: typeof EXAMPLE_SUBJECTS[0]) => {
    setOriginalSubject(example.original);
    setEmailContext(example.context);
    setTone(example.tone);
    setError('');
    setResults(null);
  };

  // Handle optimization request
  const handleOptimize = async () => {
    if (!originalSubject.trim()) {
      setError('Please enter a subject line to optimize');
      return;
    }

    if (!user) {
      setError('Please sign in to use the optimization feature');
      return;
    }

    setIsOptimizing(true);
    setError('');
    setResults(null);

    try {
      // Get the current session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      // Call the optimize-subject edge function
      const { data, error } = await supabase.functions.invoke('optimize-subject', {
        body: {
          originalSubject: originalSubject.trim(),
          emailContext: emailContext.trim() || undefined,
          tone: tone,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setResults(data);
        // Reload usage stats after successful optimization
        loadUsageStats();
        toast({
          title: "Subject lines optimized!",
          description: "AI has generated 3 optimized alternatives for you.",
        });
      } else {
        throw new Error(data.error || 'Failed to optimize subject line');
      }
    } catch (error: any) {
      console.error('Optimization error:', error);
      setError(error.message || 'Failed to optimize subject line. Please try again.');
      toast({
        title: "Optimization failed",
        description: "Please check your input and try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Copy subject line to clipboard
  const copyToClipboard = async (subject: string, index: number) => {
    try {
      await navigator.clipboard.writeText(subject);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: "Copied!",
        description: "Subject line copied to clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Usage Stats Banner */}
      {usageStats && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Today's Usage:</span>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {usageStats.optimized_count} optimizations
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTips(!showTips)}
                className="flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                {showTips ? 'Hide Tips' : 'Show Tips'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Tips */}
      {showTips && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Subject Line Best Practices
            </CardTitle>
            <CardDescription>
              Follow these tips to create more effective email subject lines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OPTIMIZATION_TIPS.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Email Subject Line Optimizer
          </CardTitle>
          <CardDescription>
            Enter your original subject line and let our AI suggest optimized alternatives to improve open rates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Example Subject Lines */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Quick Start Examples:</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_SUBJECTS.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample(example)}
                  className="text-xs h-7"
                >
                  {example.original}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Input Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="original-subject">Original Subject Line *</Label>
              <Input
                id="original-subject"
                placeholder="e.g., Meeting Request for Tomorrow"
                value={originalSubject}
                onChange={(e) => setOriginalSubject(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {originalSubject.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-context">Email Context (Optional)</Label>
              <Textarea
                id="email-context"
                placeholder="Provide context about your email content to help AI generate better suggestions..."
                value={emailContext}
                onChange={(e) => setEmailContext(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {emailContext.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleOptimize} 
                disabled={isOptimizing || !originalSubject.trim()}
                className="flex-1"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Optimize Subject Line
                  </>
                )}
              </Button>
              {originalSubject && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setOriginalSubject('');
                    setEmailContext('');
                    setResults(null);
                    setError('');
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Optimized Subject Lines
            </CardTitle>
            <CardDescription>
              Here are AI-generated alternatives designed to improve your email open rates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Performance Hint */}
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Well-optimized subject lines can improve open rates by 15-25%. Test these suggestions to see what works best for your audience!
              </AlertDescription>
            </Alert>

            {/* Original Subject */}
            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Original</Badge>
                  <span className="text-xs text-muted-foreground">
                    {results.originalSubject.length} characters
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(results.originalSubject, -1)}
                  className="h-7 w-7 p-0"
                >
                  {copiedIndex === -1 ? (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm font-medium">{results.originalSubject}</p>
            </div>

            {/* Optimized Suggestions */}
            <div className="space-y-3">
              {results.optimizedSubjects.map((subject, index) => {
                const improvement = subject.length <= 50 ? "Mobile-friendly" : "Desktop optimized";
                const hasNumbers = /\d/.test(subject);
                const hasQuestion = subject.includes('?');
                
                return (
                  <div key={index} className="p-4 border rounded-lg hover:bg-background/80 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          Suggestion {index + 1}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {subject.length} chars • {improvement}
                        </span>
                        {hasNumbers && (
                          <Badge variant="secondary" className="text-xs h-5">📊 Numbers</Badge>
                        )}
                        {hasQuestion && (
                          <Badge variant="secondary" className="text-xs h-5">❓ Question</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(subject, index)}
                        className="h-7 w-7 p-0"
                      >
                        {copiedIndex === index ? (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{subject}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <History className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground mb-1">Next Steps:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Copy your preferred subject line and use it in your email</li>
                    <li>• Track open rates to measure performance</li>
                    <li>• A/B test different versions with your audience</li>
                    <li>• Save high-performing subjects for future reference</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};