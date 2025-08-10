import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, TrendingUp, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import heroDashboard from "@/assets/hero-dashboard.png";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleTryOptimizer = () => {
    if (user) {
      // Navigate to optimizer tab in dashboard
      navigate('/dashboard');
      // We'll add a URL parameter later to auto-select the optimizer tab
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-primary opacity-10 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in border border-primary/20">
                <Sparkles className="w-4 h-4" />
                AI-Powered Email Optimization
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
                Boost Your Email 
                <span className="bg-gradient-primary bg-clip-text text-transparent block mt-2">
                  Open Rates by 40%
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in leading-relaxed">
                Transform boring subject lines into compelling hooks that drive engagement. 
                Our AI analyzes millions of high-performing emails to craft subject lines that get opened.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in" role="group" aria-label="Hero actions">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  aria-label={user ? 'Go to Dashboard' : 'Get Started Free'}
                  className="bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold px-8"
                >
                  {user ? (
                    <>
                      <Zap className="w-5 h-5 mr-2" aria-hidden="true" />
                      Go to Dashboard
                    </>
                  ) : (
                    <>
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleTryOptimizer}
                  aria-label="Try Optimizer"
                  className="hover:bg-primary/5 hover:border-primary/50 hover:scale-105 transition-all duration-300 font-semibold px-8"
                >
                  <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
                  Try Optimizer
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50 animate-fade-in">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">40%</div>
                  <div className="text-sm text-muted-foreground">Higher Open Rates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">10K+</div>
                  <div className="text-sm text-muted-foreground">Emails Optimized</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">5-sec</div>
                  <div className="text-sm text-muted-foreground">Processing Time</div>
                </div>
              </div>
            </div>

            {/* Right content - Dashboard Preview */}
            <div className="relative animate-fade-in">
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                <img 
                  src={heroDashboard} 
                  alt="SubjectAI Dashboard" 
                  className="w-full h-auto rounded-lg shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500"
                />
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-primary text-white p-3 rounded-full shadow-lg animate-bounce">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-gradient-primary text-white p-3 rounded-full shadow-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;