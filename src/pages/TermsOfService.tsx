import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: May 30, 2026
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <p className="text-lg leading-relaxed">
                Welcome to Subject AI. These Terms of Service ("Terms") govern your use of Subject AI, an email subject line optimization service operated by Axovia AI ("Company," "we," "us," or "our"). By accessing or using our service, you agree to be bound by these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
              <p className="mb-4">
                Subject AI is a software-as-a-service (SaaS) platform that uses artificial intelligence to help you optimize email subject lines for better engagement and open rates. Our service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI-powered email subject line analysis and optimization</li>
                <li>Performance predictions and scoring</li>
                <li>Multiple subject line variations and suggestions</li>
                <li>Historical optimization tracking</li>
                <li>API access (depending on your subscription tier)</li>
              </ul>
              <p className="mt-4">
                We reserve the right to modify, suspend, or discontinue any aspect of the service at any time, with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">User Obligations</h2>
              <p className="mb-4">By using Subject AI, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not submit content that is illegal, harmful, or violates others' rights</li>
                <li>Not attempt to reverse engineer, decompile, or disassemble our service</li>
                <li>Not use the service to send spam or unsolicited communications</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
              <p className="mt-4">
                You are responsible for all activity that occurs under your account. We may suspend or terminate your account if you violate these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Payment Terms</h2>
              <p className="mb-4">
                Subject AI offers various subscription plans with different features and pricing:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Free Tier:</strong> Limited access with basic features at no cost</li>
                <li><strong>Paid Subscriptions:</strong> Monthly or annual billing with expanded features</li>
              </ul>
              <p className="mt-4 mb-4">By subscribing to a paid plan, you agree that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All fees are charged in advance on a recurring basis</li>
                <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>You authorize us to charge your payment method for recurring fees</li>
                <li>We may change pricing with 30 days notice; continued use constitutes acceptance</li>
                <li>Failed payments may result in suspension of service</li>
              </ul>
              <p className="mt-4">
                Payment processing is handled by Stripe. By providing payment information, you also agree to Stripe's terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
              <p className="mb-4">
                The Subject AI service, including its original content, features, and functionality, is owned by Axovia AI and is protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You retain ownership of the content you submit to our service. By submitting content, you grant us a limited license to process and analyze it for the purpose of providing our optimization services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The service is provided "as is" and "as available" without warranties of any kind, either express or implied</li>
                <li>We do not guarantee that our AI-generated suggestions will improve your email performance</li>
                <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Our total liability shall not exceed the amount you paid us in the twelve (12) months preceding the claim</li>
                <li>We are not responsible for any third-party services, including OpenAI, Stripe, or Supabase</li>
              </ul>
              <p className="mt-4">
                Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability, so some of the above may not apply to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Axovia AI and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the service, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Breach of these Terms</li>
                <li>Non-payment of fees</li>
                <li>Fraudulent or illegal activity</li>
                <li>At our sole discretion for any other reason</li>
              </ul>
              <p className="mt-4">
                Upon termination, your right to use the service will immediately cease. You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Delaware. If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on our website and updating the "Last updated" date. Your continued use of the service after changes are posted constitutes your acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-semibold">Axovia AI</p>
                <p>Email: <a href="mailto:support@axovia.ai" className="text-primary hover:underline">support@axovia.ai</a></p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t">
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
