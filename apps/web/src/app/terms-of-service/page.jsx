import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service — Skin Story",
  description: "Terms and conditions for using the Skin Story application and services.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-2 sm:px-4 lg:px-6 pt-6 pb-16 sm:pb-24 transition-colors duration-200">
        <div className="w-full">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">Terms of Service</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">Last updated: September 2026</p>

        <div className="space-y-10 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Skin Story ("Service", "App", "we", "us"), including our waitlist at getskinstory.com, you confirm that you have read, understood, and agree to be legally bound by these Terms of Service ("Terms"). If you do not agree to these Terms in their entirety, you must immediately stop using the Service.</p>
            <p className="mt-3">These Terms constitute a legally binding agreement between you and Skin Story Technologies. If you are using the Service on behalf of an organisation, you represent that you have the authority to bind that organisation to these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">2. Description of Service</h2>
            <p>Skin Story is an AI-powered skin-care tracking application. The Service allows users to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Track changes in their skin over time through consistent self-photography.</li>
              <li>Receive AI-generated analysis of skin metrics such as texture, hydration, and tone.</li>
              <li>View personalised skin progression reports and historical comparisons.</li>
              <li>Join a waitlist to receive early access before the public launch.</li>
            </ul>
            <p className="mt-3">The Service is currently in pre-launch stage. Access is limited to waitlist members who receive an early access code. Features, pricing, and availability are subject to change.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">3. Eligibility</h2>
            <p>To use Skin Story, you must:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Be at least 13 years of age.</li>
              <li>If you are between 13 and 17 years old, have your parent or legal guardian read and agree to these Terms on your behalf before you use the Service.</li>
              <li>Not be prohibited from receiving our services under the laws of your jurisdiction.</li>
              <li>Not have a previously terminated Skin Story account due to a Terms violation.</li>
            </ul>
            <p className="mt-3">By using the Service, you represent and warrant that you meet all eligibility requirements above.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">4. Account and Waitlist Registration</h2>
            <p>To join our waitlist, you must provide a valid email address. You agree to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Provide accurate, current, and complete information.</li>
              <li>Maintain and update your information to keep it accurate.</li>
              <li>Keep your access code confidential and not share it with others.</li>
              <li>Notify us immediately at <a href="mailto:support@getskinstory.com" className="text-[#937abd] hover:underline">support@getskinstory.com</a> if you suspect unauthorised use of your account.</li>
            </ul>
            <p className="mt-3">Each email address may only register for the waitlist once. Creating multiple waitlist entries to gain additional spots is prohibited and will result in removal from the waitlist.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">5. Acceptable Use Policy</h2>
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Use the Service for any illegal purpose or in violation of any applicable local, national, or international law.</li>
              <li>Upload any content that is defamatory, obscene, abusive, threatening, or otherwise objectionable.</li>
              <li>Attempt to gain unauthorised access to any part of the Service, our servers, or any database connected to the Service.</li>
              <li>Use automated tools, bots, scripts, or crawlers to access the Service without our written permission.</li>
              <li>Reverse engineer, decompile, disassemble, or attempt to extract the source code of any part of the Service.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service or its infrastructure.</li>
              <li>Impersonate any person or entity or falsely represent your affiliation with any person or entity.</li>
              <li>Use the Service to upload photos of other individuals without their explicit consent.</li>
              <li>Use the Service in any way that could damage, disable, overburden, or impair our servers.</li>
            </ul>
            <p className="mt-3">Violation of the Acceptable Use Policy may result in immediate suspension or termination of your account without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">6. Health and Medical Disclaimer</h2>
            <p>This is critically important. Please read carefully.</p>
            <p className="mt-3">Skin Story is a personal tracking and informational tool. It is <strong>not a medical device</strong>, <strong>not a diagnostic tool</strong>, and does <strong>not constitute medical advice, diagnosis, or treatment</strong>.</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>AI-generated skin analysis is for informational and tracking purposes only. It has not been reviewed, validated, or approved by any medical regulatory body (FDA, CE, CDSCO, or equivalent).</li>
              <li>Skin Story is not a substitute for professional dermatological consultation. If you have concerns about your skin health, seek advice from a qualified dermatologist or medical professional.</li>
              <li>Do not make medical decisions based solely on Skin Story analysis.</li>
              <li>The app does not recommend specific medical treatments, prescription products, or clinical procedures.</li>
            </ul>
            <p className="mt-3">By using the Service, you acknowledge and accept these limitations. Skin Story and its team are not liable for any health decisions you make based on the app{"'"}s analysis.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">7. Intellectual Property</h2>
            <p>All content, features, functionality, branding, code, and technology within the Service — including but not limited to the Skin Story name, logo, two-square mark, AI models, algorithms, design, and text — are the exclusive intellectual property of Skin Story Technologies or its licensors and are protected by applicable copyright, trademark, patent, and trade secret laws.</p>
            <p className="mt-3">You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Service for your personal, non-commercial use. This licence does not include the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Copy, reproduce, or distribute any part of the Service.</li>
              <li>Modify or create derivative works based on the Service.</li>
              <li>Commercially exploit any content from the Service.</li>
              <li>Remove any copyright, trademark, or proprietary notices.</li>
            </ul>
            <p className="mt-3">You retain full ownership of any photos you submit to the Service. By submitting photos, you grant Skin Story a limited licence to process them solely for the purpose of generating your personal analysis. We do not claim ownership of your photos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">8. Disclaimer of Warranties</h2>
            <p>The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. To the fullest extent permitted by law, Skin Story disclaims all warranties including, without limitation:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Implied warranties of merchantability and fitness for a particular purpose.</li>
              <li>Warranties that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.</li>
              <li>Warranties regarding the accuracy, reliability, or completeness of any AI-generated analysis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, Skin Story Technologies and its directors, employees, and agents shall not be liable for any:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Indirect, incidental, consequential, special, or punitive damages.</li>
              <li>Loss of revenue, profits, data, or goodwill.</li>
              <li>Damages resulting from your reliance on any AI-generated skin analysis for health or medical decisions.</li>
              <li>Damages arising from unauthorised access to or alteration of your data.</li>
            </ul>
            <p className="mt-3">In jurisdictions that do not allow the exclusion of certain warranties or limitation of liability, our liability is limited to the maximum extent permitted by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">10. Termination</h2>
            <p>We reserve the right to suspend or permanently terminate your access to the Service at any time, with or without notice, for any reason, including but not limited to violation of these Terms, abusive behaviour, or fraudulent activity.</p>
            <p className="mt-3">You may terminate your account at any time by submitting a data deletion request to <a href="mailto:privacy@getskinstory.com" className="text-[#937abd] hover:underline">privacy@getskinstory.com</a>. Upon termination, your personally identifiable data will be deleted within 30 days per our <a href="/data-deletion" className="text-[#937abd] hover:underline">Data Deletion Policy</a>.</p>
            <p className="mt-3">Sections 6 (Health Disclaimer), 7 (Intellectual Property), 8 (Disclaimer of Warranties), 9 (Limitation of Liability), and 11 (Governing Law) survive termination.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">11. Governing Law and Disputes</h2>
            <p>These Terms are governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of India.</p>
            <p className="mt-3">For international users: nothing in this clause limits your rights under the mandatory consumer protection laws of your country of residence.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">12. Changes to These Terms</h2>
            <p>We reserve the right to modify these Terms at any time. When we make material changes, we will notify you via email (if you are on our waitlist) and update the "Last updated" date at the top of this page. Your continued use of the Service after any changes constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">13. Contact</h2>
            <p>For questions about these Terms of Service, please contact:</p>
            <ul className="list-none mt-3 space-y-1">
              <li><strong>Email:</strong> <a href="mailto:legal@getskinstory.com" className="text-[#937abd] hover:underline">legal@getskinstory.com</a></li>
              <li><strong>General:</strong> <a href="mailto:hello@getskinstory.com" className="text-[#937abd] hover:underline">hello@getskinstory.com</a></li>
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
