import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  BarChart3, 
  Target, 
  Clock, 
  Shield,
  Lightbulb,
  Rocket,
  Users
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Generation",
      description: "Advanced GPT-4 model trained on millions of high-performing email subject lines",
      badge: "Core Feature"
    },
    {
      icon: Target,
      title: "A/B Testing Ready",
      description: "Generate multiple variations instantly for split testing your campaigns",
      badge: "Pro"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track open rates, click-through rates, and ROI for each generated subject line",
      badge: "Analytics"
    },
    {
      icon: Zap,
      title: "Instant Generation",
      description: "Get 10+ subject line variations in under 3 seconds",
      badge: "Speed"
    },
    {
      icon: Users,
      title: "Industry Templates",
      description: "Pre-built templates for e-commerce, SaaS, newsletters, and more",
      badge: "Templates"
    },
    {
      icon: Shield,
      title: "Spam Filter Safe",
      description: "All suggestions are tested against major spam filters automatically",
      badge: "Security"
    },
    {
      icon: Lightbulb,
      title: "Tone Customization",
      description: "Adjust for professional, casual, urgent, or friendly tones",
      badge: "Customization"
    },
    {
      icon: Rocket,
      title: "API Integration",
      description: "Connect with Mailchimp, ConvertKit, and 50+ email platforms",
      badge: "Integration"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support and optimization advice",
      badge: "Support"
    }
  ];

  return (
    <section id="features" className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary text-primary">
            Powerful Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything you need to optimize email performance
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI analyzes your content, audience, and industry trends to generate 
            subject lines that actually get opened.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-2xl transition-all duration-500 border-border hover:border-primary/30 hover:scale-105 hover:-translate-y-2 animate-fade-in hover:bg-gradient-to-br hover:from-background hover:to-primary/5" style={{animationDelay: `${index * 120}ms`}}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 animate-glow">
                      <feature.icon className="w-6 h-6 text-primary group-hover:text-primary/90 transition-colors duration-300" />
                    </div>
                  </div>
                  <div className="flex-1 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                      <Badge variant="secondary" className="text-xs group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                        {feature.badge}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;