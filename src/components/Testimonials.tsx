import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechFlow SaaS",
      content: "SubjectAI increased our email open rates from 18% to 47% in just two weeks. The ROI has been incredible - we've generated an extra $50k in revenue this quarter.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "E-commerce Manager",
      company: "FreshStyle Boutique",
      content: "I was skeptical about AI-generated subject lines, but the results speak for themselves. Our click-through rates doubled, and customer engagement is through the roof.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Emily Watson",
      role: "Newsletter Creator",
      company: "The Daily Insight",
      content: "As a solo entrepreneur, I don't have time to A/B test subject lines manually. SubjectAI does it all for me, and my subscriber growth has been phenomenal.",
      rating: 5,
      avatar: "EW"
    },
    {
      name: "David Park",
      role: "Growth Lead",
      company: "Startup Accelerator",
      content: "We use SubjectAI for all our portfolio companies. The time savings alone is worth it, but the performance improvements have been game-changing.",
      rating: 5,
      avatar: "DP"
    },
    {
      name: "Lisa Thompson",
      role: "Email Marketing Specialist",
      company: "Global Retail Corp",
      content: "The industry-specific templates are brilliant. SubjectAI understands our retail audience and consistently generates subject lines that convert.",
      rating: 5,
      avatar: "LT"
    },
    {
      name: "Alex Kumar",
      role: "Founder",
      company: "MedTech Solutions",
      content: "In the healthcare industry, trust is everything. SubjectAI helps us craft professional, compliant subject lines that our doctors and patients actually open.",
      rating: 5,
      avatar: "AK"
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary text-primary">
            Customer Success
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Trusted by 12,000+ marketers worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how businesses like yours are transforming their email marketing 
            with AI-powered subject line optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border hover:shadow-soft transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                
                <div className="relative mb-6">
                  <Quote className="absolute -top-2 -left-2 w-6 h-6 text-primary/20" />
                  <p className="text-foreground leading-relaxed pl-4">
                    {testimonial.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">127%</div>
              <div className="text-muted-foreground">Avg. open rate increase</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">12,000+</div>
              <div className="text-muted-foreground">Active users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50M+</div>
              <div className="text-muted-foreground">Subject lines generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
              <div className="text-muted-foreground">Customer rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;