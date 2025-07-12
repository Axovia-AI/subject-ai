import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.png";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 px-6 bg-gradient-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-6 border-primary text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Email Optimization
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Boost Email Open Rates by{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              127%
            </span>{" "}
            with AI
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Generate high-converting email subject lines in seconds using advanced AI. 
            Join 12,000+ marketers who've transformed their email campaigns.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="flex gap-2 w-full sm:w-auto">
              <Input 
                placeholder="Enter your email to get started"
                className="min-w-[300px]"
              />
              <Button variant="gradient" className="px-8">
                Try Free <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground mb-12">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Average 127% open rate increase</span>
            </div>
            <div className="hidden sm:block">•</div>
            <div>No credit card required</div>
            <div className="hidden sm:block">•</div>
            <div>Free 14-day trial</div>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-primary rounded-3xl opacity-20 blur-3xl"></div>
          <img 
            src={heroDashboard} 
            alt="SubjectAI Dashboard"
            className="relative w-full rounded-3xl shadow-strong border border-border"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;