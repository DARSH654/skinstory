import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";
import HighlightPhrase from "@/components/HighlightPhrase";
import ContactUsCard from "@/components/ContactUsCard";

export const metadata = {
  title: "Cookie Policy — Skin Story",
  description: "How Skin Story uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-4 sm:px-6 lg:px-8 pt-12 pb-4 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-zinc-950 dark:text-white mb-3 font-[family-name:var(--font-outfit)]">
              Cookie{" "}
              <HighlightPhrase words={[{ text: "Policy", hasSpace: false }]} />
            </h1>
            <p className="text-base sm:text-lg font-medium text-zinc-500 dark:text-zinc-400">Last updated: September 2026</p>
          </div>
          
          <div className="space-y-10 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">

            <section>
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">What Are Cookies?</h2>
              <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  Cookies are small text files, pixels, or local storage data tokens stored directly on your computer or mobile device when you visit a website or access a digital application. They allow digital platforms to recognize your device, maintain active user sessions, store your custom preferences, and understand how users interact with online features.
                </p>
                <p>
                  In addition to standard browser cookies, we may utilize software development kits (&quot;SDKs&quot;), local storage, and server-side log files within the Skin Story mobile application to deliver secure session management and diagnostic analytics.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">First-Party vs. Third-Party Cookies</h2>
              <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  <strong>First-Party Cookies:</strong> These are essential cookies set directly by Skin Story. They are required to keep you logged into your account, remember your theme settings (Light or Dark mode), and ensure platform security across sessions.
                </p>
                <p>
                  <strong>Third-Party Analytics &amp; Infrastructure Cookies:</strong> These are operational cookies and SDK technologies integrated from trusted technology service providers (such as Google Analytics or Firebase). They silently log technical usage details and traffic metrics solely to help us monitor app performance, fix software bugs, and optimize user experience.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Information Collected via Analytics &amp; Tracking</h2>
              <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  To ensure Skin Story runs smoothly, troubleshoot application crashes, and understand user traffic sources, our analytics and infrastructure tools automatically log essential technical data when you use the Application or visit our website. This includes recording referral URLs and traffic sources (identifying whether you arrived via direct web visit, organic search, or referral link), device hardware details (such as your device model, operating system version, screen resolution, and unique device identifiers), general geographic location and IP address (used for security auditing and regional server routing), and application usage metrics (including session duration, feature interaction logs, check-in completion rates, and system crash diagnostic logs).
                </p>
                <p>
                  We collect this diagnostic information solely to maintain platform performance, optimize application features across different screen sizes, and provide a superior, reliable experience for all users.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Zero-Advertising &amp; Strict Non-Sharing Guarantee</h2>
              <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  Skin Story enforces a strict policy regarding user data privacy: we <strong>do not</strong> utilize advertising cookies, cross-site tracking pixels (such as Meta Pixel or ad network trackers), or behavioral targeting algorithms.
                </p>
                <p>
                  We never sell, rent, trade, or monetize any analytics data, IP addresses, location metrics, or cookie records to third-party advertisers, data brokers, or commercial syndicates under any circumstances. All technical analytics collected are strictly restricted to internal performance diagnostics and service improvements.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Global Regulatory Compliance</h2>
              <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  <strong>European Union &amp; United Kingdom (GDPR / ePrivacy Directive):</strong> In compliance with the EU ePrivacy Directive and GDPR, non-essential cookies and analytics SDKs are processed based on legitimate interest for system security or explicit user consent where required. European users retain the right to restrict analytics tracking or request complete erasure of technical logs.
                </p>
                <p>
                  <strong>California (CCPA / CPRA):</strong> Under the California Consumer Privacy Act, we confirm that technical analytics and device identifiers collected via cookies are not &quot;sold&quot; or &quot;shared&quot; for cross-context behavioral advertising.
                </p>
                <p>
                  <strong>India (DPDP Act 2023):</strong> Technical logs and performance metrics are processed strictly for lawful operational purposes as a Data Fiduciary in compliance with the Digital Personal Data Protection Act.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Managing &amp; Controlling Cookies</h2>
              <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  You can control, block, or delete cookies at any time through your web browser or mobile device settings. Most popular web browsers (Chrome, Safari, Firefox, Edge) allow you to refuse cookies or remove previously saved local data.
                </p>
                <p>
                  Please note that if you disable essential cookies or local storage tokens, key features of the Application—such as staying logged in or retaining your theme preference—may not function properly.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Questions &amp; Support</h2>
              <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
                <p>
                  If you have any questions or concerns regarding our Cookie Policy, tracking practices, or data handling, please reach out to our privacy team at{" "}
                  <a href="mailto:support@getskinstory.com" className="font-semibold text-zinc-800 dark:text-zinc-200 hover:underline hover:underline-offset-2">
                    support@getskinstory.com
                  </a>
                  .
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <ContactUsCard
      title="Questions about cookies?"
      email="privacy@getskinstory.com"
    />

      <div className="px-6 sm:px-12 pb-6 bg-white dark:bg-[#121212] transition-colors duration-200">
        <Footer />
      </div>
    </>
  );
}
