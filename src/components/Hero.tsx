import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.png";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 px-6 bg-gradient-secondary relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Floating animated elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-40 right-16 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl animate-bounce delay-1000"></div>
      <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl animate-bounce delay-500"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <Badge variant="outline" className="mb-6 border-primary text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105">
            <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
            AI-Powered Email Optimization
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-scale-in">
            Boost Email Open Rates by{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent animate-pulse">
              127%
            </span>{" "}
            with AI
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Generate high-converting email subject lines in seconds using advanced AI. 
            Join 12,000+ marketers who've transformed their email campaigns.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in delay-300">
            <div className="flex gap-2 w-full sm:w-auto">
              <Input 
                placeholder="Enter your email to get started"
                className="min-w-[300px] bg-background/80 backdrop-blur-sm border-border/50 focus:border-primary/50 hover:bg-background/90 transition-all duration-300 focus:scale-105"
              />
              <Button variant="gradient" className="px-8 group hover:scale-105 hover:shadow-xl transition-all duration-300 hover:rotate-1">
                Try Free <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
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

        <div className="relative max-w-5xl mx-auto group">
          <div className="absolute inset-0 bg-gradient-primary rounded-3xl opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-500"></div>
          <img 
            src={heroDashboard} 
            alt="SubjectAI Dashboard"
            className="relative w-full rounded-3xl shadow-strong border border-border/50 group-hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;