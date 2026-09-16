import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — Skin Story",
  description: "How Skin Story collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-2 sm:px-4 lg:px-6 pt-6 pb-16 sm:pb-24 transition-colors duration-200">
        <div className="w-full">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">Privacy Policy</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">Last updated: September 2026</p>

        <div className="space-y-10 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">1. Introduction</h2>
            <p>Skin Story ("we", "our", "us") is an AI-powered skin-care tracking application developed and operated by Skin Story Technologies. We are committed to protecting your privacy and handling your personal data with full transparency and legal compliance. This Privacy Policy explains in detail what data we collect, why we collect it, how we use it, who we share it with, how long we keep it, and what rights you have over it.</p>
            <p className="mt-3">This policy applies to all users of the Skin Story website (getskinstory.com), mobile application, and waitlist service, regardless of where you are located in the world.</p>
            <p className="mt-3">By using Skin Story, you agree to the practices described in this Privacy Policy. If you do not agree, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">2. Data We Collect</h2>
            <p className="mb-3">We collect only the minimum data required to provide and improve our service:</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">a) Email Address</h3>
                <p>Collected when you join our waitlist. Used solely to send you your early access code when your cohort opens. We do not send marketing emails unless you explicitly opt in to a separate mailing list.</p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">b) Skin Analysis Photos and Metrics</h3>
                <p>Once the app launches, you may voluntarily submit photos of your skin and receive AI-derived analysis metrics (e.g., hydration levels, texture uniformity, tone evenness). These photos are processed by our AI system to generate your personal skin reports. Your photos are never shared with third parties, never used for advertising, and never shown to other users.</p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">c) Anonymised Usage Data</h3>
                <p>We collect anonymised, aggregated data about how users interact with the app — for example, which features are used most, session duration, and crash logs. This data contains no personal identifiers. It is used purely to improve our product.</p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">d) Device and Technical Information</h3>
                <p>We collect basic device information such as operating system version, device model, and app version for the purpose of diagnosing crashes and ensuring compatibility. This data is not linked to your identity.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">3. What We Do Not Collect</h2>
            <p>We want to be explicitly clear about what we do not collect:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>We do not collect biometric identifiers (fingerprints, Face ID, voice prints, iris scans).</li>
              <li>We do not collect your location data.</li>
              <li>We do not collect your contacts, camera roll, or any data outside of what you voluntarily submit in the app.</li>
              <li>We do not collect payment information (this is handled by Apple App Store or Google Play).</li>
              <li>We do not build advertising profiles. We do not sell, rent, trade, or broker your data to any third party for commercial purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">4. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>To provide the service:</strong> Your email is used to manage your waitlist position and send your access code.</li>
              <li><strong>To generate your skin reports:</strong> Your submitted photos are processed by our AI models to produce your personal skin analysis.</li>
              <li><strong>To train and improve our AI models:</strong> Anonymised and de-identified skin data (stripped of all personal identifiers) may be used to train and improve the accuracy of our AI. This is data that cannot be traced back to you as an individual. We will never use identifiable photos in model training without your explicit separate consent.</li>
              <li><strong>To fix bugs and improve performance:</strong> Anonymised crash reports and usage patterns help us build a better product.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">5. Data Sharing and Third Parties</h2>
            <p>We do not sell your personal data. We share data with third parties only in the following limited circumstances:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Infrastructure providers:</strong> Cloud storage and computing services (e.g., AWS, Google Cloud) that host our servers. These providers process data only on our instructions and are bound by strict data processing agreements (DPAs). They cannot use your data for their own purposes.</li>
              <li><strong>Legal requirements:</strong> If required by law, court order, or government authority, we may disclose the minimum necessary data. We will notify you unless legally prohibited from doing so.</li>
              <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity. You will be notified before any such transfer occurs, and the acquiring entity will be bound by this Privacy Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">6. Data Retention</h2>
            <p>We retain your personal data only for as long as necessary:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Waitlist email:</strong> Retained until the app launches and your access code is delivered, or until you unsubscribe from the waitlist, whichever comes first.</li>
              <li><strong>In-app account data (photos, metrics):</strong> Retained for the duration of your active account. If you delete your account, your personally identifiable data is deleted within 30 days.</li>
              <li><strong>Anonymised model training data:</strong> De-identified aggregate data may be retained indefinitely as it contains no personal identifiers and cannot be traced back to you.</li>
              <li><strong>Technical/crash logs:</strong> Retained for up to 90 days then automatically deleted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">7. Your Rights (GDPR — European Union and UK Users)</h2>
            <p>If you are located in the European Union or the United Kingdom, the General Data Protection Regulation (GDPR) and the UK GDPR give you the following rights over your personal data:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Right of Access (Article 15 GDPR):</strong> You may request a copy of all personal data we hold about you.</li>
              <li><strong>Right to Rectification (Article 16):</strong> You may request correction of inaccurate or incomplete personal data.</li>
              <li><strong>Right to Erasure / "Right to be Forgotten" (Article 17):</strong> You may request deletion of your personal data. We will delete all personally identifiable data within 30 days. Note: anonymised, non-identifiable data used in AI model training cannot be deleted as it is no longer linked to you.</li>
              <li><strong>Right to Restriction of Processing (Article 18):</strong> You may ask us to pause processing of your data while a dispute or correction request is pending.</li>
              <li><strong>Right to Data Portability (Article 20):</strong> You may request your data in a machine-readable format (JSON or CSV) for transfer to another service.</li>
              <li><strong>Right to Object (Article 21):</strong> You may object to processing of your data for AI model training. We will honour this objection by ensuring your data is excluded from future training runs.</li>
              <li><strong>Rights Related to Automated Decision-Making (Article 22):</strong> Our skin analysis is AI-generated. You have the right to request human review of any AI-generated analysis and to understand the logic behind it.</li>
            </ul>
            <p className="mt-4">Our legal basis for processing your data is:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Contract (Article 6(1)(b)):</strong> Processing your email to fulfil our waitlist commitment.</li>
              <li><strong>Legitimate interest (Article 6(1)(f)):</strong> Anonymised usage analytics and model improvement.</li>
              <li><strong>Consent (Article 6(1)(a)):</strong> Any optional data processing beyond the above.</li>
            </ul>
            <p className="mt-4">To exercise any GDPR right, email <a href="mailto:privacy@getskinstory.com" className="text-[#937abd] hover:underline">privacy@getskinstory.com</a>. We will respond within 30 days. If you believe we have violated your rights, you may lodge a complaint with your local data protection authority (e.g., ICO in the UK, CNIL in France).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">8. Your Rights (CCPA — California, USA Users)</h2>
            <p>If you are a California resident, the California Consumer Privacy Act (CCPA) as amended by the CPRA gives you the following rights:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Right to Know:</strong> You may request disclosure of the specific pieces of personal information we have collected about you, the categories of sources, the business purpose for collection, and the categories of third parties it is shared with.</li>
              <li><strong>Right to Delete:</strong> You may request deletion of your personal information. See Section 6 for our retention and deletion policy.</li>
              <li><strong>Right to Opt Out of Sale:</strong> We do not sell personal information as defined under CCPA. There is nothing to opt out of.</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you (e.g., by denying service or charging a different price) for exercising your CCPA rights.</li>
              <li><strong>Right to Correct:</strong> You may request correction of inaccurate personal information.</li>
              <li><strong>Right to Limit Use of Sensitive Personal Information:</strong> We do not collect sensitive personal information as defined by the CPRA (e.g., SSN, financial data, precise geolocation).</li>
            </ul>
            <p className="mt-4">To submit a CCPA request, email <a href="mailto:privacy@getskinstory.com" className="text-[#937abd] hover:underline">privacy@getskinstory.com</a> with "California Privacy Request" in the subject line. We will respond within 45 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">9. Children{"'"}s Privacy (COPPA)</h2>
            <p>Skin Story is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. Our waitlist and app require users to confirm they are at least 13 years old.</p>
            <p className="mt-3">If you are between 13 and 17 years old, your parent or legal guardian must review and agree to our Terms of Service before you use the app.</p>
            <p className="mt-3">If we discover that we have inadvertently collected personal data from a child under 13, we will delete it immediately. If you are a parent or guardian and believe your child under 13 has provided us with personal data, please contact us at <a href="mailto:privacy@getskinstory.com" className="text-[#937abd] hover:underline">privacy@getskinstory.com</a> and we will take immediate action.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">10. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>All data is encrypted in transit using TLS 1.2 or higher.</li>
              <li>All stored data is encrypted at rest using AES-256.</li>
              <li>Access to personal data is restricted to authorised personnel only, on a need-to-know basis.</li>
              <li>We conduct regular security reviews and vulnerability assessments.</li>
            </ul>
            <p className="mt-3">Despite these measures, no internet-based service is 100% secure. In the event of a data breach that affects your personal data, we will notify you within 72 hours of becoming aware of it (as required by GDPR Article 33).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">11. Cookies</h2>
            <p>We use only essential, functional cookies. We do not use advertising or tracking cookies. For full details, see our <a href="/cookie-policy" className="text-[#937abd] hover:underline">Cookie Policy</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">12. International Data Transfers</h2>
            <p>Skin Story operates globally. If you are located in the EU or UK and your data is transferred outside of the European Economic Area (EEA) or UK, we ensure it is protected by appropriate safeguards such as Standard Contractual Clauses (SCCs) approved by the European Commission, or equivalent mechanisms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">13. Changes to This Policy</h2>
            <p>We may update this Privacy Policy as our service evolves or as legal requirements change. When we make material changes, we will notify waitlist members via email and update the "Last updated" date at the top of this page. We encourage you to review this policy periodically. Continued use of the service after changes constitutes acceptance of the revised policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">14. Contact Us</h2>
            <p>For any questions, concerns, or requests related to your privacy, contact our Data Privacy team:</p>
            <ul className="list-none mt-3 space-y-1">
              <li><strong>Email:</strong> <a href="mailto:privacy@getskinstory.com" className="text-[#937abd] hover:underline">privacy@getskinstory.com</a></li>
              <li><strong>Response time:</strong> Within 30 days (72 hours for breach notifications)</li>
            </ul>
          </section>

        </div>
      </div>
    </main>
    <div className="px-6 sm:px-12 pb-6 bg-white dark:bg-[#121212] transition-colors duration-200">
      <Footer />
    </div>
    </>
  );
}
