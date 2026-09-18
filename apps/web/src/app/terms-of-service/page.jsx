import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";
import HighlightPhrase from "@/components/HighlightPhrase";
import ContactUsCard from "@/components/ContactUsCard";

export const metadata = {
  title: "Terms of Service — Skin Story",
  description: "Terms and conditions for using the Skin Story application and services.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-4 sm:px-6 lg:px-8 pt-12 pb-4 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-zinc-950 dark:text-white mb-3 font-[family-name:var(--font-outfit)]">
              Terms of{" "}
              <HighlightPhrase words={[{ text: "Service", hasSpace: false }]} />
            </h1>
            <p className="text-base sm:text-lg font-medium text-zinc-500 dark:text-zinc-400">Last updated: September 2026</p>
          </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Acceptance of Terms</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                By downloading, installing, accessing, or using the Skin Story mobile application, website, or associated services (&quot;Skin Story,&quot; &quot;the Service,&quot; &quot;the Application,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you confirm that you have read, understood, and agreed to be legally bound by these Terms of Service (&quot;Terms&quot;). These Terms form a binding legal contract between you and Skin Story. If you do not agree to all of these Terms, you are strictly prohibited from using the Application and must immediately cease access and delete the Application from your device.
              </p>
              <p>
                We reserve the right to update, amend, or modify these Terms at any time without prior individual notice. Any changes will become effective immediately upon being posted within the Application or on our website. Your continued use of Skin Story following the posting of updated Terms constitutes your explicit acceptance of those changes.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Eligibility &amp; Account Registration</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                To access or use Skin Story, you must be at least the digital minimum legal age in your country of residence (13 in the United States, UK, and India; 15 or 16 across European Union member states). If you are between the minimum legal age and the age of legal majority in your jurisdiction, you represent and warrant that your parent or legal guardian has reviewed and agreed to these Terms on your behalf before you create an account or use any feature of the Service.
              </p>
              <p>
                When creating an account or registering for access, you agree to provide accurate, current, and complete information and to keep your account credentials secure. You are solely responsible for all activity that occurs under your account. If you suspect any unauthorized access to or compromise of your credentials, you must notify us immediately at{" "}
                <a href="mailto:support@getskinstory.com" className="font-semibold text-zinc-800 dark:text-zinc-200 hover:underline hover:underline-offset-2">
                  support@getskinstory.com
                </a>
                . We reserve the right to suspend or terminate any account that contains inaccurate information or violates eligibility requirements.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Description of Service</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                Skin Story is a mobile application designed to deliver real, observable skin awareness insights based directly on user-submitted data. The Application features non-clinical facial scan analysis, personalized skin health scoring, daily lifestyle logging (including sleep, stress, water intake, and product usage), and custom routine creation. When a user creates a custom routine, they generate routine cards and invite codes from which they can share their custom routines with other users across the platform.
              </p>
              <p>
                The Application is provided for informational and general wellness tracking purposes only. Features, functionality, interface design, and availability may be modified, updated, or temporarily suspended by us at any time without prior liability.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Health &amp; Medical Disclaimer</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                Skin Story is strictly a non-clinical wellness and tracking tool. The Application is not a medical device, is not intended for dermatological diagnosis, prevention, monitoring, treatment, or cure of any medical condition or skin disease, and does not constitute medical advice under any circumstances.
              </p>
              <p>
                All insights, scores, pattern analyses, and product tracking reports generated by the Application are non-clinical estimations derived solely from your self-reported inputs and uploaded photos. You should never disregard professional dermatological advice, delay seeking medical treatment, or alter prescribed skincare treatments based on information within the Application. By using Skin Story, you acknowledge and agree that we bear zero medical or legal liability for health decisions or outcomes resulting from your reliance on the Application.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Acceptable Use &amp; User-Generated Routines</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                You agree to use Skin Story only for lawful, personal, non-commercial purposes. You are strictly prohibited from uploading photos of third parties without explicit consent, attempting automated data scraping or reverse engineering, circumventing security controls, or distributing malicious code through the Service.
              </p>
              <p>
                Skin Story allows users to create custom skincare routines, generate routine cards, and obtain invite codes to share those routines with others. Any custom routine created by a user is classified as User-Generated Content (&quot;UGC&quot;). The creator of a custom routine bears 100% legal responsibility and liability for its safety, suitability, ingredients, and accuracy. Skin Story acts strictly as a neutral digital bridge for code sharing and does not test, verify, or endorse any user-created routine.
              </p>
              <p>
                As a user receiving or importing a shared routine, you must understand that the routine was created by another user, not by Skin Story. You are responsible for verifying all ingredients and products for personal allergies or sensitivities before applying them to your skin. If you experience an adverse reaction, skin irritation, harm, or allergy from following a shared routine, the creator holds sole legal liability, and Skin Story carries zero legal responsibility or liability.
              </p>
              <p>
                We reserve the absolute right to immediately delete, disable, or remove any custom routine, routine card, or sharing code that is reported, deemed dangerous, harmful, inaccurate, or inappropriate, without prior notice or liability. In the event of legal disputes, victim complaints, or regulatory inquiries, Skin Story will fully cooperate with law enforcement and legal authorities by providing necessary technical logs and account data to facilitate investigation.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">User Data &amp; Ownership</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                You retain 100% ownership of all photos, facial images, daily lifestyle logs, and personal inputs you submit to Skin Story. By submitting data to the Application, you grant Skin Story a limited, non-exclusive, royalty-free license to store, process, and analyze your data solely for the purpose of operating the Service, delivering personalized insights, and training our internal proprietary technology layers.
              </p>
              <p>
                You hold complete rights to request data deletion for any photo, daily check-in, or custom routine at any time. When you request full account deletion, all your associated stored photos, facial scans, and lifestyle data will be permanently wiped from our active database servers within 30 days in accordance with our Privacy Policy.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Intellectual Property</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                All proprietary algorithms, technology layers, custom AI models, software code, user interface designs, graphics, branding, trademarks, logos, and written content contained within Skin Story are the exclusive intellectual property of Skin Story.
              </p>
              <p>
                You are granted a limited, personal, non-exclusive, non-transferable, revocable license to use the Application on your personal mobile device for personal wellness tracking. You may not copy, modify, distribute, sell, lease, reverse engineer, or create derivative works based on any portion of the Application or its underlying technology without our explicit prior written authorization.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Subscriptions &amp; Payment Terms</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                Certain features of Skin Story may be offered on a paid subscription basis or through on-page checkout. Paid transactions are processed through official mobile store billing gateways (Apple App Store and Google Play Store) or independent payment infrastructure providers, including Stripe and Razorpay.
              </p>
              <p>
                Subscription fees are billed automatically on a recurring weekly, monthly, or annual basis until canceled. You may cancel your subscription at any time through your mobile app store settings or payment manager. All billing disputes and refund requests are governed by our{" "}
                <Link href="/refund-cancellation" className="font-semibold text-zinc-800 dark:text-zinc-200 hover:underline hover:underline-offset-2">
                  Refund &amp; Cancellation Policy
                </Link>
                .
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Limitation of Liability &amp; Warranties</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                Skin Story is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, whether express, implied, or statutory. To the fullest extent permitted by applicable law, we disclaim all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p>
                To the maximum extent permitted by law, Skin Story, its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, personal injury, allergic reaction, or financial loss arising out of your access to or use of the Application or shared user content.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Termination &amp; Governing Law</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                We reserve the right to suspend or permanently terminate your account and access to Skin Story at our sole discretion, without prior notice, if you violate these Terms, engage in illegal activity, or submit harmful user content.
              </p>
              <p>
                Except where mandatory local consumer protection laws apply, these Terms shall be governed by and construed in accordance with the laws of India. Any legal disputes arising out of or in connection with these Terms or your use of Skin Story shall be subject to the exclusive jurisdiction of the courts located in India.
              </p>
            </div>
          </section>

        </div>
      </div>
    </main>

    <ContactUsCard
      title="Questions about our terms?"
      email="legal@getskinstory.com"
    />

    <div className="px-6 sm:px-12 pb-6 bg-white dark:bg-[#121212] transition-colors duration-200">
      <Footer />
    </div>
    </>
  );
}
