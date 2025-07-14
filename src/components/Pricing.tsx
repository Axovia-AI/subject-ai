import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: 19,
      description: "Perfect for small businesses and freelancers",
      features: [
        "500 subject lines per month",
        "Basic AI optimization",
        "Email platform integrations",
        "Performance tracking",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: 49,
      description: "For growing businesses and marketing teams",
      features: [
        "2,500 subject lines per month",
        "Advanced AI with tone control",
        "A/B testing recommendations",
        "Industry-specific templates",
        "Priority support",
        "Team collaboration",
        "Custom branding"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: 149,
      description: "For large organizations with high volume needs",
      features: [
        "Unlimited subject lines",
        "Custom AI model training",
        "White-label solution",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee"
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 px-6 bg-gradient-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary text-primary">
            Simple Pricing
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Choose the plan that fits your needs
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Start free, upgrade when you need more. All plans include our core AI optimization features.
          </p>
          
          <div className="inline-flex items-center gap-4 p-1 bg-muted rounded-lg">
            <Button variant="secondary" size="sm" className="bg-background shadow-sm">
              Monthly
            </Button>
            <Button variant="ghost" size="sm">
              Annual <Badge className="ml-1 bg-primary">Save 20%</Badge>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative group transition-all duration-300 ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105 hover:scale-110 hover:shadow-xl bg-gradient-to-b from-background to-primary/5' 
                  : 'border-border hover:border-primary/30 hover:scale-105 hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-primary px-4 py-1 animate-pulse shadow-md">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button 
                  variant={plan.popular ? "gradient" : "outline"} 
                  className={`w-full mb-6 transition-all duration-200 ${
                    plan.popular 
                      ? 'hover:scale-105 hover:shadow-xl' 
                      : 'hover:scale-105 hover:shadow-md hover:border-primary'
                  }`}
                >
                  {plan.popular ? "Start Free Trial" : "Get Started"}
                </Button>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-200">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span>💳 Cancel anytime</span>
            <span>🔒 Secure payments</span>
            <span>📞 24/7 support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;