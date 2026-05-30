import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Rachel M.",
      role: "Email Marketing Manager",
      company: "E-commerce Brand",
      content: "We've seen our open rates increase by about 23% since switching to SubjectAI. The suggestions feel natural and match our brand voice well.",
      rating: 5,
      avatar: "RM"
    },
    {
      name: "James T.",
      role: "Marketing Lead",
      company: "B2B SaaS Company",
      content: "Saves me roughly 2 hours per week that I used to spend brainstorming subject lines. The AI suggestions are a great starting point for our campaigns.",
      rating: 5,
      avatar: "JT"
    },
    {
      name: "Priya S.",
      role: "Newsletter Creator",
      company: "Independent Publisher",
      content: "As a solo creator, I needed something quick and reliable. SubjectAI helps me test different angles without overthinking every send.",
      rating: 4,
      avatar: "PS"
    },
    {
      name: "Michael B.",
      role: "Digital Marketing Consultant",
      company: "Agency",
      content: "I use this for multiple clients across different industries. The variety in suggestions is helpful, though I still tweak about half of them.",
      rating: 4,
      avatar: "MB"
    },
    {
      name: "Sarah K.",
      role: "Growth Marketer",
      company: "Fintech Startup",
      content: "Our promotional emails improved noticeably. Not every suggestion is perfect, but the good ones have definitely moved the needle for us.",
      rating: 5,
      avatar: "SK"
    },
    {
      name: "David L.",
      role: "Content Strategist",
      company: "Media Company",
      content: "Helpful for breaking out of creative ruts. I appreciate having multiple options to choose from rather than staring at a blank field.",
      rating: 4,
      avatar: "DL"
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
            What marketers are saying
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join hundreds of marketers using AI-powered subject line optimization
            to improve their email performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group animate-fade-in hover:bg-gradient-to-br hover:from-background hover:to-primary/5" style={{animationDelay: `${index * 100}ms`}}>
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary group-hover:scale-125 transition-transform duration-300" style={{transitionDelay: `${i * 50}ms`}} />
                  ))}
                </div>
                
                <div className="relative mb-6">
                  <Quote className="absolute -top-2 -left-2 w-6 h-6 text-primary/20 group-hover:text-primary/40 transition-all duration-300 group-hover:scale-110" />
                  <p className="text-foreground leading-relaxed pl-4 group-hover:text-foreground/90 transition-colors duration-300">
                    {testimonial.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold group-hover:scale-110 transition-transform duration-300 animate-glow">
                    {testimonial.avatar}
                  </div>
                  <div className="group-hover:translate-x-1 transition-transform duration-300">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground group-hover:text-primary transition-colors duration-300">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground italic">
            Sample testimonials based on user feedback. Results vary by industry and use case.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;