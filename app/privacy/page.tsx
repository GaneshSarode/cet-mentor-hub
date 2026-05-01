import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy | CET Mentor Hub",
  description: "Privacy policy for CET Mentor Hub — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

          <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
              <p>
                When you sign up via Clerk authentication, we collect your name, email address, and profile picture. When you take PYQ tests, we store your test sessions, answers, and scores to provide you with result analytics.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Data</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To provide test results, analytics, and progress tracking</li>
                <li>To authenticate you and secure your account</li>
                <li>To improve the platform based on aggregated, anonymized usage data</li>
              </ul>
              <p>We do <strong className="text-foreground">not</strong> sell your data to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. Third-Party Services</h2>
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-foreground">Clerk</strong> — Authentication and user management</li>
                <li><strong className="text-foreground">Supabase</strong> — Database for test data</li>
                <li><strong className="text-foreground">Vercel</strong> — Hosting and analytics</li>
              </ul>
              <p>Each service has its own privacy policy governing how they handle your data.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Cookies</h2>
              <p>
                We use essential cookies for authentication. We use Vercel Analytics in production which may use anonymized, cookie-less analytics.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Data Deletion</h2>
              <p>
                You can request deletion of your account and all associated data by contacting us at <a href="mailto:cetmentorhub@gmail.com" className="text-primary hover:underline">cetmentorhub@gmail.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Changes</h2>
              <p>
                We may update this privacy policy from time to time. Changes will be reflected on this page with an updated date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
              <p>
                For privacy-related questions, contact us at <a href="mailto:cetmentorhub@gmail.com" className="text-primary hover:underline">cetmentorhub@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
