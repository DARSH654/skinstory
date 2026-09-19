"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";
import HighlightPhrase from "@/components/HighlightPhrase";

// FAQ data grouped by 5 exact categories
const faqCategories = [
  {
    id: "privacy",
    label: "Privacy & Data",
    faqs: [
      {
        q: "When did this Privacy Policy take effect?",
        a: "This Privacy Policy became effective on September 16, 2026. It applies to all users of the Skin Story application worldwide.",
        relatedLinks: [
          { title: "Effective Date & Jurisdiction", href: "/privacy-policy#effective-date" },
          { title: "Read Terms of Service", href: "/terms-of-service" },
        ],
      },
      {
        q: "Who is eligible to use Skin Story?",
        a: "Skin Story is available to users worldwide who meet the digital minimum age in their country—13 in the US, UK, and India; 15–16 across the European Economic Area (EEA); and 16 in Australia, Brazil, Malaysia, and Indonesia. Minors below these legal age thresholds are prohibited from submitting data without explicit parental consent.",
        relatedLinks: [
          { title: "User Eligibility Rules", href: "/privacy-policy#eligibility" },
          { title: "Children's Privacy (COPPA)", href: "/privacy-policy#childrens-privacy" },
        ],
      },
      {
        q: "What personal information does Skin Story collect?",
        a: "We collect basic profile details (display name, email, age), self-reported lifestyle logs (sleep, stress, water intake, diet, and skincare routines), camera-captured facial scans, and technical device diagnostics.",
        relatedLinks: [
          { title: "Information We Collect", href: "/privacy-policy#information-collected" },
          { title: "Cookie & Analytics Policy", href: "/cookie-policy" },
        ],
      },
      {
        q: "Is personal information shared, stored, or sold to third parties?",
        a: "Never. All data is processed exclusively by our internal custom technology and proprietary AI models. We never sell, rent, trade, or share your personal data, facial photos, or biometric data with third parties, advertisers, or external AI models.",
        relatedLinks: [
          { title: "Zero-Selling Data Policy", href: "/privacy-policy#zero-selling" },
          { title: "Third Party Sharing Terms", href: "/privacy-policy#zero-selling" },
        ],
      },
      {
        q: "Is my facial scan and biometric data private?",
        a: "Yes, 100%. Facial scans and skin texture maps are processed exclusively by our internal custom technology and proprietary AI models. We never sell, rent, or share your facial photos or biometric data with third parties or external AI models.",
        relatedLinks: [
          { title: "Biometric Data Protection", href: "/privacy-policy#biometric-data" },
          { title: "Camera Permission Guidelines", href: "/privacy-policy#biometric-data" },
        ],
      },
      {
        q: "Can I request complete data deletion?",
        a: "Yes. You have full ownership of your data. You can delete individual photos or request complete account deletion anytime. All your facial scans, daily lifestyle logs, and profile records are permanently wiped from our active servers within 30 days.",
        relatedLinks: [
          { title: "Submit Data Deletion Request", href: "/data-deletion" },
          { title: "Data Retention & Storage", href: "/privacy-policy#data-retention" },
        ],
      },
      {
        q: "How does Skin Story handle third-party service providers and data security?",
        a: "We partner only with trusted technical infrastructure providers (such as encrypted cloud hosting platforms and official billing gateways like Apple, Google Play, Stripe, and Razorpay) bound by strict confidentiality contracts. Third parties are strictly prohibited from viewing or analyzing your personal logs or facial scans. All data is protected with SSL/TLS encryption in transit and AES encryption at rest.",
        relatedLinks: [
          { title: "Third Party Service Providers", href: "/privacy-policy#third-party-providers" },
          { title: "Data Security Standards", href: "/privacy-policy#data-security" },
        ],
      },
      {
        q: "How are global privacy rights and children's privacy rights handled?",
        a: "Skin Story complies with CCPA/CPRA in California, GDPR in Europe (including the Right to be Forgotten), UK GDPR in the UK, and India's DPDP Act 2023. Users across all these regions have full rights to access, correct, port, or permanently erase their data. In accordance with COPPA and international standards, we do not knowingly collect data from children under the legal digital age limit; any inadvertent data is immediately and permanently deleted.",
        relatedLinks: [
          { title: "Regional Privacy Rights", href: "/privacy-policy#global-rights" },
          { title: "Child Privacy Safeguards", href: "/privacy-policy#childrens-privacy" },
        ],
      },
    ],
  },
  {
    id: "support",
    label: "Support",
    faqs: [
      {
        q: "How do I reach the right support team for my inquiry?",
        a: "For general app help, email support@getskinstory.com. For privacy inquiries, email privacy@getskinstory.com. For billing and refund requests, email billing@getskinstory.com. For terms and legal questions, email legal@getskinstory.com.",
        relatedLinks: [
          { title: "How to Request a Refund", href: "/refund-cancellation#request-refund" },
          { title: "Read Privacy Policy", href: "/privacy-policy#introduction" },
        ],
      },
      {
        q: "Does Skin Story provide medical advice or dermatological diagnoses?",
        a: "No. Skin Story is strictly a non-clinical wellness and tracking tool. All scores and insights are non-clinical estimations derived from your inputs. The app is not a medical device and does not substitute for professional dermatological consultation.",
        relatedLinks: [
          { title: "Health & Medical Disclaimer", href: "/terms-of-service#medical-disclaimer" },
          { title: "Non-Clinical Guidance Notice", href: "/privacy-policy#introduction" },
        ],
      },
      {
        q: "What are the expected response times for support inquiries?",
        a: "General and technical queries are resolved within 24 to 48 hours. Billing and refund requests are processed within 2 to 5 business days. Legal and compliance inquiries are handled within 4 to 7 business days.",
        relatedLinks: [
          { title: "Support Response Times SLA", href: "/terms-of-service#support-response-times" },
        ],
      },
    ],
  },
  {
    id: "prelaunch",
    label: "Pre-Launch Offer",
    faqs: [
      {
        q: "How does the $4.99 Pre-Launch Offer work?",
        a: "Joining the waitlist is 100% free. Waitlist members have the exclusive opportunity to secure a Pre-Launch Offer for a one-time payment of $4.99 to receive a digital scratch card in their email, unlocking up to 6 months of premium access upon application launch.",
        relatedLinks: [
          { title: "About Pre-Launch Orders", href: "/refund-cancellation#pre-launch" },
          { title: "14-Day Money-Back Guarantee", href: "/refund-cancellation#pre-launch" },
        ],
      },
      {
        q: "Is joining the Skin Story waitlist completely free?",
        a: "Yes, 100%. There is no charge or credit card required to sign up for our waitlist, and we will notify you as soon as the Application officially launches.",
        relatedLinks: [
          { title: "Pre-Launch Policy Guidelines", href: "/refund-cancellation#pre-launch" },
        ],
      },
    ],
  },
  {
    id: "refund",
    label: "Refund & Cancellation",
    faqs: [
      {
        q: "Are pre-orders and subscriptions refundable?",
        a: "Pre-orders and direct web purchases carry a 14-day money-back guarantee, provided the digital scratch card sent to your email has not been scratched or revealed. In-app store purchases follow Apple App Store and Google Play Store policies.",
        relatedLinks: [
          { title: "About Pre-Launch Orders", href: "/refund-cancellation#pre-launch" },
          { title: "In-App Purchases & Subscriptions", href: "/refund-cancellation#subscriptions" },
        ],
      },
      {
        q: "How do I cancel my recurring subscription?",
        a: "You can cancel anytime through your mobile app store settings (Apple App Store / Google Play Store) or web billing dashboard with zero cancellation fees. Access remains active until your current billing cycle ends.",
        relatedLinks: [
          { title: "Subscription Cancellation Guidelines", href: "/refund-cancellation#cancellation" },
        ],
      },
      {
        q: "What is the 14-day money-back guarantee policy?",
        a: "Pre-orders and direct web purchases processed via Stripe or Razorpay carry a full 14-day money-back guarantee, provided the digital scratch card sent to your email has not been scratched or revealed. This ensures you can try our pre-launch offer with zero risk.",
        relatedLinks: [
          { title: "About Pre-Launch Orders", href: "/refund-cancellation#pre-launch" },
          { title: "Direct Web Purchase Guarantee", href: "/refund-cancellation#subscriptions" },
        ],
      },
      {
        q: "How do I request a refund for an eligible purchase?",
        a: "To request a refund within the 14-day window, email billing@getskinstory.com with your account email address and purchase receipt. Approved refunds are credited back to your original payment method within 5–10 business days.",
        relatedLinks: [
          { title: "How to Request a Refund", href: "/refund-cancellation#request-refund" },
          { title: "Read Billing Guidelines", href: "/refund-cancellation#request-refund" },
        ],
      },
    ],
  },
  {
    id: "cookies",
    label: "Cookie Handling",
    faqs: [
      {
        q: "What cookies and tracking technologies does Skin Story use?",
        a: "Skin Story uses essential session cookies, local storage tokens, and operational analytics SDKs. These technologies maintain secure user authentication, remember your preferences (like Light/Dark theme), and collect diagnostic metrics to fix software bugs and optimize app performance.",
        relatedLinks: [
          { title: "What Are Cookies?", href: "/cookie-policy#what-are-cookies" },
          { title: "First-Party vs Third-Party Cookies", href: "/cookie-policy#first-vs-third-party" },
        ],
      },
      {
        q: "What technical information is collected via analytics?",
        a: "Our infrastructure tools log diagnostic technical details including traffic sources (referral URLs), device hardware model, operating system version, screen resolution, IP address for security auditing, and app interaction/crash reports.",
        relatedLinks: [
          { title: "Information Collected via Analytics", href: "/cookie-policy#information-collected" },
          { title: "Privacy & Data Policy", href: "/privacy-policy#information-collected" },
        ],
      },
      {
        q: "Does Skin Story use advertising or tracking cookies?",
        a: "Never. Skin Story enforces a strict zero-advertising guarantee. We do not use cross-site tracking pixels (like Meta Pixel), advertising cookies, or behavioral targeting tools, and we never sell or share cookie data with third-party advertisers or data brokers.",
        relatedLinks: [
          { title: "Zero-Advertising Guarantee", href: "/cookie-policy#zero-advertising" },
        ],
      },
      {
        q: "How are cookie practices compliant with global privacy laws (GDPR, CCPA, DPDP)?",
        a: "In compliance with EU/UK GDPR, California CCPA/CPRA, and India's DPDP Act 2023, analytics metrics are processed strictly for essential system diagnostics as a Data Fiduciary. European users retain full rights to restrict tracking or request log erasure.",
        relatedLinks: [
          { title: "Global Regulatory Compliance", href: "/cookie-policy#global-compliance" },
          { title: "European & UK GDPR Rights", href: "/cookie-policy#global-compliance" },
          { title: "California CCPA/CPRA Terms", href: "/cookie-policy#global-compliance" },
        ],
      },
      {
        q: "How can I manage or disable cookies on my browser?",
        a: "You can control, block, or delete cookies anytime through your web browser or mobile device settings (Chrome, Safari, Firefox, Edge). Note that disabling essential cookies may impact staying logged in or theme preference persistence.",
        relatedLinks: [
          { title: "Managing & Controlling Cookies", href: "/cookie-policy#managing-cookies" },
          { title: "Read full Cookie Policy", href: "/cookie-policy" },
        ],
      },
    ],
  },
];

function FaqItem({ q, a, relatedLinks, isOpen, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden transition-colors duration-150 cursor-pointer ${
        isOpen
          ? "border-2 border-black dark:border-white"
          : "border border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 group">
        <span className="text-base sm:text-lg font-medium text-zinc-900 dark:text-white leading-snug">
          {q}
        </span>
        <span
          className={`shrink-0 transition-transform duration-200 flex items-center justify-center ${
            isOpen ? "text-black dark:text-white" : "text-zinc-400 dark:text-zinc-500"
          }`}
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </div>
      {isOpen && (
        <div className="px-6 pb-5 pt-1 space-y-3.5">
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {a}
          </p>
          {relatedLinks && relatedLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {relatedLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                >
                  <span className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-white sm:whitespace-nowrap leading-none">
                    {link.title}
                  </span>
                  <ArrowUpRight size={16} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [openFaqKey, setOpenFaqKey] = useState(null);

  function handlePillClick(id) {
    setActiveCategory(id);
    const el = document.getElementById(`faq-section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const topCategories = faqCategories.slice(0, 2);
  const bottomCategories = faqCategories.slice(2);

  return (
    <>
      <FloatingNavbar />
      <main className="bg-white dark:bg-[#121212] px-6 sm:px-12 pt-16 sm:pt-24 pb-10 transition-colors duration-200">
        <div className="max-w-3xl mx-auto">

          {/* Centered Header */}
          <div className="text-center mb-5">
            <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-zinc-800 dark:text-zinc-200 mb-4 font-[family-name:var(--font-outfit)]">
              Frequently Asked{" "}
              <HighlightPhrase
                words={[
                  { text: "Questions", hasSpace: false },
                ]}
              />
            </h1>
            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 font-normal max-w-xl mx-auto">
              Everything about skin tracking, privacy, and the app.
            </p>
          </div>

          {/* Centered Category Pills — 2 on top row, 3 on bottom row */}
          <div className="flex flex-col items-center gap-2.5 mb-10 max-w-xl mx-auto">
            {/* Top row: 2 pills */}
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              {topCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handlePillClick(cat.id)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-[#937abd] text-white border-2 border-black dark:border-white shadow-sm"
                        : "bg-transparent text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:border-2"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
            {/* Bottom row: 3 pills */}
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              {bottomCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handlePillClick(cat.id)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-[#937abd] text-white border-2 border-black dark:border-white shadow-sm"
                        : "bg-transparent text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:border-2"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqCategories.map((group) => (
              <div key={group.id} id={`faq-section-${group.id}`} className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  {group.label}
                </h2>
                <div className="space-y-3">
                  {group.faqs.map((item, i) => {
                    const itemKey = `${group.id}-${i}`;
                    const isOpen = openFaqKey === itemKey;
                    return (
                      <FaqItem
                        key={i}
                        q={item.q}
                        a={item.a}
                        relatedLinks={item.relatedLinks}
                        isOpen={isOpen}
                        onToggle={() => setOpenFaqKey(isOpen ? null : itemKey)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Still stuck? — sits directly above the footer, no floating gap */}
      <div className="px-6 sm:px-12 bg-white dark:bg-[#121212] transition-colors duration-200">
        <div className="max-w-3xl mx-auto py-10">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-8 py-12 text-center shadow-sm">
            <h3 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white mb-3 font-[family-name:var(--font-outfit)]">
              Still stuck?
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
              Our support team is real humans who actually care. Reach out and we&apos;ll figure it out together.
            </p>
            <a
              href="mailto:support@getskinstory.com"
              className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium text-sm px-6 py-3 rounded-full hover:opacity-80 transition-opacity"
            >
              Email support@getskinstory.com
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-12 pb-6 bg-white dark:bg-[#121212] transition-colors duration-200">
        <Footer />
      </div>
    </>
  );
}

