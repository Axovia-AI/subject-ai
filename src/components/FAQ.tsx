import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqItems = [
    {
      question: "How does Subject AI improve my email open rates?",
      answer:
        "Subject AI uses advanced machine learning algorithms trained on millions of high-performing email campaigns. It analyzes your email content, audience, and industry to generate subject lines optimized for engagement. Our users typically see a 20-40% improvement in open rates.",
    },
    {
      question: "What AI technology powers Subject AI?",
      answer:
        "Subject AI is powered by state-of-the-art large language models fine-tuned specifically for email marketing. We combine natural language processing with performance data from billions of email sends to predict which subject lines will resonate with your audience.",
    },
    {
      question: "Is my email content secure and private?",
      answer:
        "Absolutely. We take data security seriously. Your email content is encrypted in transit and at rest. We never share your data with third parties or use it to train models for other customers. We are SOC 2 Type II certified and GDPR compliant.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time with no questions asked. Your account will remain active until the end of your current billing period, and you won't be charged again.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes! All plans include a 14-day free trial with full access to all features. No credit card required to start. You can upgrade, downgrade, or cancel at any time during or after your trial.",
    },
    {
      question: "What email platforms do you integrate with?",
      answer:
        "Subject AI integrates with all major email marketing platforms including Mailchimp, HubSpot, Klaviyo, Constant Contact, SendGrid, Mailgun, and many more. We also offer API access for custom integrations.",
    },
    {
      question: "How many subject lines can I optimize per month?",
      answer:
        "It depends on your plan. Starter plans include 500 optimizations per month, Professional plans include 2,500, and Enterprise plans offer unlimited optimizations. Check our pricing section for full details.",
    },
  ];

  return (
    <section id="faq" className="py-20 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary text-primary">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about Subject AI. Can't find the answer
            you're looking for? Reach out to our support team.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-medium text-foreground hover:text-primary hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
