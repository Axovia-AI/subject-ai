import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: May 30, 2026
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <p className="text-lg leading-relaxed">
                At Axovia AI, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use Subject AI, our email subject line optimization service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (email address, name, password)</li>
                <li>Email subject lines you submit for optimization</li>
                <li>Payment and billing information</li>
                <li>Usage data and preferences</li>
                <li>Communications you send to us</li>
              </ul>
              <p className="mt-4">We also automatically collect certain information when you use our service:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Usage patterns and feature interactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your email subject line optimization requests</li>
                <li>Process payments and manage your subscription</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent security incidents</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
              <p className="mb-4">
                We use trusted third-party services to help us operate our business. These services may have access to your information only to perform specific tasks on our behalf:
              </p>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">OpenAI</h3>
                  <p className="text-muted-foreground">
                    We use OpenAI's API to power our email subject line optimization features. Email subject lines you submit are processed by OpenAI to generate optimized suggestions. OpenAI's use of this data is governed by their privacy policy and data processing terms.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Stripe</h3>
                  <p className="text-muted-foreground">
                    We use Stripe to process payments securely. Your payment information is handled directly by Stripe and is subject to their privacy policy. We do not store your full credit card details on our servers.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Supabase</h3>
                  <p className="text-muted-foreground">
                    We use Supabase for authentication and database services. Your account information and usage data are stored securely on Supabase infrastructure in compliance with industry security standards.
                  </p>
                </div>
              </div>
            </section>

            <section id="cookies">
              <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to collect and track information about your use of our service. Cookies help us:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep you signed in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Understand how you interact with our service</li>
                <li>Improve our service based on usage patterns</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active or as needed to provide you services. We will also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="mb-4">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The right to access the personal information we hold about you</li>
                <li>The right to request correction of inaccurate personal information</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent at any time</li>
                <li>The right to object to processing of your personal information</li>
                <li>The right to lodge a complaint with a supervisory authority</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, please contact us at the email address provided below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
              <p>
                Our service is not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our service after any changes indicates your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
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

export default PrivacyPolicy;
