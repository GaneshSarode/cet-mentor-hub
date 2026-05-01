import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms of Service | CET Mentor Hub",
  description: "Terms of service for CET Mentor Hub.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

          <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. About This Platform</h2>
              <p>
                CET Mentor Hub is a free educational platform created by students to help MHTCET aspirants with college prediction, previous year question practice, and mentorship. This platform is not affiliated with any government body, CET Cell, or any college.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. Use of the Platform</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>You must be at least 13 years old to use this platform</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You agree not to misuse the platform or attempt to disrupt its services</li>
                <li>The test engine is for practice purposes only — do not share questions externally</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. Accuracy of Information</h2>
              <p>
                We strive to provide accurate cutoff data, college information, and question content. However, we make <strong className="text-foreground">no guarantees</strong> about the accuracy of this information. Always verify important decisions with official sources like <a href="https://cetcell.mahacet.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cetcell.mahacet.org</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Mentorship</h2>
              <p>
                Mentors on this platform are current college students sharing their personal experiences. Their advice is based on individual experience and should not be considered professional counseling. Mentorship sessions are free and provided voluntarily.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Intellectual Property</h2>
              <p>
                Previous year question papers are sourced from publicly available resources. Original content on this platform (design, code, analysis) is owned by CET Mentor Hub. You may not reproduce or redistribute platform content without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
              <p>
                CET Mentor Hub is provided &quot;as is&quot; without warranties. We are not liable for any decisions made based on information from this platform, including college choices, exam preparation strategies, or mentorship advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Changes</h2>
              <p>
                We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">8. Contact</h2>
              <p>
                For questions about these terms, contact us at <a href="mailto:cetmentorhub@gmail.com" className="text-primary hover:underline">cetmentorhub@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
