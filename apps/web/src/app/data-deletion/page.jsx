import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Data Deletion Policy — Skin Story",
  description: "How to request deletion of your personal data from Skin Story.",
};

export default function DataDeletionPage() {
  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-2 sm:px-4 lg:px-6 pt-6 pb-16 sm:pb-24 transition-colors duration-200">
        <div className="w-full">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">Data Deletion Policy</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">Last updated: September 2026</p>

        <div className="space-y-10 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">1. Your Right to Delete Your Data</h2>
            <p>You have the right to request deletion of your personal data held by Skin Story. This right is recognised under multiple legal frameworks including:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li><strong>GDPR (EU):</strong> Article 17 — "Right to Erasure" ("Right to be Forgotten")</li>
              <li><strong>UK GDPR:</strong> Equivalent right under the UK Data Protection Act 2018</li>
              <li><strong>CCPA (California, USA):</strong> Right to Delete personal information</li>
              <li><strong>DPDP Act 2023 (India):</strong> Right to erasure of personal data</li>
            </ul>
            <p className="mt-3">We honour deletion requests from users in all jurisdictions, not only those legally required to do so.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">2. What Gets Deleted</h2>
            <p>When you submit a data deletion request, the following personally identifiable data is permanently deleted:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Email address</strong> — removed from our waitlist and all mailing systems.</li>
              <li><strong>Skin photos</strong> — all photos you have submitted to the app are permanently deleted from our servers.</li>
              <li><strong>Personal skin reports and metrics</strong> — your generated analysis reports and stored metrics linked to your account are deleted.</li>
              <li><strong>Account information</strong> — your user profile, settings, and account records are permanently removed.</li>
              <li><strong>Payment information</strong> — we do not store payment data directly (it is held by Apple/Google/Stripe). Your subscription is cancelled and any billing relationship is terminated.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">3. What Cannot Be Deleted — AI Training Data</h2>
            <p>We want to be completely transparent about one limitation:</p>
            <p className="mt-3">As part of improving the accuracy and fairness of our AI models, we may retain <strong>anonymised, de-identified, and aggregated skin data</strong> for model training purposes. This is data that has been fully stripped of all personal identifiers — it cannot be linked back to you as an individual in any way.</p>
            <p className="mt-3">Because this data contains no personal information, it does not fall under the definition of "personal data" under GDPR, CCPA, or the DPDP Act, and therefore deletion rights do not apply to it under law. However, we take the following additional steps to protect your interests:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Anonymisation is irreversible — once data is de-identified, we have no mechanism to re-link it to you.</li>
              <li>We do not use any personally identifiable photos in AI training without your separate, explicit consent.</li>
              <li>If you object to your data being used in anonymised AI training, you may state this in your deletion request and we will flag your data for exclusion from future training runs. We cannot retroactively remove data from models already trained, but we can exclude your data going forward.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">4. Retention Before Deletion — Backup Period</h2>
            <p>Upon receiving your deletion request, we begin the deletion process immediately. However, due to the technical nature of secure deletion from distributed systems and encrypted backups:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Your data will be removed from all active, live systems within <strong>7 days</strong>.</li>
              <li>Your data will be removed from all encrypted backups within <strong>30 days</strong>.</li>
              <li>During the backup retention window, your data is flagged and inaccessible to any personnel or systems. It is not used for any purpose.</li>
            </ul>
            <p className="mt-3">You will receive a confirmation email once deletion from active systems is complete (within 7 days).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">5. Legal Retention Exceptions</h2>
            <p>In limited circumstances, we may be legally required to retain certain data even after a deletion request. These exceptions are narrow and include:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Legal proceedings:</strong> If your data is relevant to an active legal dispute, investigation, or court order, we may be required to retain it until the matter is resolved.</li>
              <li><strong>Tax and financial records:</strong> If you have made any payments to us, we are legally required to retain transaction records for the period specified by applicable tax law (typically 7 years in India).</li>
              <li><strong>Fraud prevention:</strong> If your account was suspended for fraud or abuse, we may retain the minimum data necessary to prevent re-registration.</li>
            </ul>
            <p className="mt-3">We will inform you if any such exception applies to your deletion request.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">6. How to Submit a Deletion Request</h2>
            <p>To request deletion of your data, send an email to:</p>
            <div className="mt-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4">
              <p><strong>Email:</strong> <a href="mailto:privacy@getskinstory.com" className="text-[#937abd] hover:underline">privacy@getskinstory.com</a></p>
              <p className="mt-1"><strong>Subject line:</strong> Data Deletion Request</p>
              <p className="mt-3"><strong>Include in your email:</strong></p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>The email address associated with your Skin Story account or waitlist registration.</li>
                <li>Whether you want full account deletion or just removal from the waitlist.</li>
                <li>Whether you want to opt out of anonymised AI training data (optional).</li>
              </ul>
            </div>
            <p className="mt-4">We will acknowledge your request within <strong>72 hours</strong> and complete the deletion within <strong>30 days</strong> as required by GDPR. For CCPA requests, we will respond within 45 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">7. Effect of Deletion on Your Access</h2>
            <p>Deleting your data means:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Your waitlist spot is permanently removed. You will need to re-join if you change your mind.</li>
              <li>Your app account is closed and all skin history, reports, and settings are permanently lost.</li>
              <li>Your active subscription (if any) is cancelled with immediate effect. Refund eligibility is subject to our <a href="/refund-cancellation" className="text-[#937abd] hover:underline">Refund &amp; Cancellation Policy</a>.</li>
            </ul>
            <p className="mt-3">Data deletion is <strong>irreversible</strong>. We cannot recover deleted data after the 30-day window.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">8. Contact</h2>
            <p>For any questions about this policy or your data rights, contact us at <a href="mailto:privacy@getskinstory.com" className="text-[#937abd] hover:underline">privacy@getskinstory.com</a>. If you believe we have not handled your deletion request properly, you may escalate to your local data protection authority.</p>
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
