import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface OptimizedResult {
  optimizedSubjects: string[];
  originalSubject: string;
  success: boolean;
}

// Email optimization component for testing and manual optimization
export const EmailOptimizer = () => {
  const [originalSubject, setOriginalSubject] = useState('');
  const [emailContext, setEmailContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState<OptimizedResult | null>(null);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

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

            <Button 
              onClick={handleOptimize} 
              disabled={isOptimizing || !originalSubject.trim()}
              className="w-full"
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
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Optimized Subject Lines
            </CardTitle>
            <CardDescription>
              Here are AI-generated alternatives to improve your email open rates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Original Subject */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">Original</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(results.originalSubject, -1)}
                >
                  {copiedIndex === -1 ? (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm">{results.originalSubject}</p>
            </div>

            {/* Optimized Suggestions */}
            <div className="space-y-3">
              {results.optimizedSubjects.map((subject, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Suggestion {index + 1}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(subject, index)}
                    >
                      {copiedIndex === index ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm">{subject}</p>
                </div>
              ))}
            </div>

            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                These suggestions are based on best practices for email subject lines. 
                Test different options to see what works best for your audience!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};