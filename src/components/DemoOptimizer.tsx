import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Copy, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Demo optimizer component for the landing page
export const DemoOptimizer = () => {
  const [subjectLine, setSubjectLine] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Demo suggestions (static for landing page)
  const demoSuggestions = [
    "🚀 Your weekly insights are here - 5 min read",
    "Quick question about your marketing goals",
    "The strategy that increased conversions by 40%"
  ];

  const handleOptimize = () => {
    if (!subjectLine.trim()) return;
    setShowSuggestions(true);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleGetFullAccess = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section id="demo" className="py-20 bg-gradient-to-br from-background to-primary/5">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              Try It Now
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              See the Magic in Action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enter any subject line below and watch our AI transform it into something that gets opened.
            </p>
          </div>

          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Subject Line Optimizer (Demo)
              </CardTitle>
              <CardDescription>
                Try our AI optimizer with any subject line
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-3">
                <Input
                  placeholder="e.g., Weekly Newsletter Update"
                  value={subjectLine}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  className="flex-1"
                  maxLength={100}
                />
                <Button 
                  onClick={handleOptimize}
                  disabled={!subjectLine.trim()}
                  className="bg-gradient-primary"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Optimize
                </Button>
              </div>

              {showSuggestions && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-medium text-foreground mb-2">✨ AI-Optimized Suggestions:</h4>
                    <div className="space-y-3">
                      {demoSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                          <span className="text-sm font-medium">{suggestion}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(suggestion, index)}
                            className="h-7 w-7 p-0"
                          >
                            {copiedIndex === index ? (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center pt-4 border-t border-border/50">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Demo Mode
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        This is a preview - real suggestions are personalized
                      </span>
                    </div>
                    
                    <Button 
                      onClick={handleGetFullAccess}
                      size="lg"
                      className="bg-gradient-primary hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      {user ? (
                        <>
                          Go to Full Optimizer
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Get Full Access Free
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {!showSuggestions && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Enter a subject line above to see AI optimization in action</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};