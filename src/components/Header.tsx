import { Button } from "@/components/ui/button";
import aiBrainLogo from "@/assets/ai-brain-logo.png";

const Header = () => {
  return (
    <header className="w-full py-4 px-6 border-b border-border bg-background/80 backdrop-blur-sm fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={aiBrainLogo} alt="SubjectAI" className="w-8 h-8" />
          <span className="text-xl font-bold text-foreground">SubjectAI</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
            Reviews
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button variant="gradient" size="sm">
            Start Free Trial
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;