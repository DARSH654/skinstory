"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const faqs = [
  {
    q: "How does the Pre-Launch Offer work?",
    a: "Joining the waitlist is 100% free. Waitlist members have the exclusive opportunity to secure a Pre-Launch Offer for a one-time payment to receive a digital scratch card in their email, unlocking up to 6 months of premium access upon application launch.",
    links: [
      { title: "About Pre-Launch Orders", href: "/refund-cancellation#pre-launch" },
      { title: "7-Day Money-Back Guarantee", href: "/refund-cancellation#pre-launch" },
    ],
  },
  {
    q: "Are pre-orders and subscriptions refundable?",
    a: "Pre-orders and direct web purchases carry a 7-day money-back guarantee, provided the digital scratch card sent to your email has not been scratched or revealed. In-app store purchases follow Apple App Store and Google Play Store policies.",
    links: [
      { title: "About Pre-Launch Orders", href: "/refund-cancellation#pre-launch" },
      { title: "In-App Purchases & Subscriptions", href: "/refund-cancellation#subscriptions" },
    ],
  },
  {
    q: "Is my facial scan and biometric data private?",
    a: "Yes, 100%. Facial scans and skin texture maps are processed exclusively by our internal custom technology and proprietary AI models. We never sell, rent, or share your facial photos or biometric data with third parties or external AI models.",
    links: [
      { title: "Biometric Data Protection", href: "/privacy-policy#biometric-data" },
    ],
  },
  {
    q: "Does Skin Story use advertising or tracking cookies?",
    a: "Never. Skin Story enforces a strict zero-advertising guarantee. We do not use cross-site tracking pixels, advertising cookies, or behavioral targeting tools, and we never sell or share cookie data with third-party advertisers or data brokers.",
    links: [
      { title: "Zero-Advertising Guarantee", href: "/cookie-policy#zero-advertising" },
    ],
  },
  {
    q: "Is joining the Skin Story waitlist completely free?",
    a: "Yes, 100%. There is no charge or credit card required to sign up for our waitlist, and we will notify you as soon as the Application officially launches.",
    links: [
      { title: "Pre-Launch Policy Guidelines", href: "/refund-cancellation#pre-launch" },
    ],
  },
];

function FaqItem({ q, a, links, isOpen, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden transition-colors duration-150 cursor-pointer ${
        isOpen
          ? "border-2 border-black dark:border-white"
          : "border border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="w-full text-left px-7 py-6 flex items-center justify-between gap-4">
        <span className="text-lg sm:text-xl font-medium text-zinc-900 dark:text-white leading-snug">
          {q}
        </span>
        <span
          className={`shrink-0 transition-transform duration-200 flex items-center justify-center ${
            isOpen ? "text-black dark:text-white" : "text-zinc-400 dark:text-zinc-500"
          }`}
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </div>
      {isOpen && (
        <div className="px-7 pb-6 pt-1 space-y-4">
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {a}
          </p>
          {links && links.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                >
                  <span className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-white sm:whitespace-nowrap leading-none">
                    {link.title}
                  </span>
                  <ArrowUpRight size={16} className="text-zinc-950 dark:text-white shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="max-w-3xl mx-auto mt-14 sm:mt-20 relative z-10">
      {/* Headings */}
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-3 font-[family-name:var(--font-outfit)]">
          Frequently Asked{" "}
          <span className="relative inline-block">
            <span className="relative z-10">Questions</span>
            <span
              className="absolute left-[-2px] right-[-2px] bottom-1 h-2.5 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
              aria-hidden="true"
            />
          </span>
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base font-normal">
          Everything you need to know about early access, data privacy, and how it works.
        </p>
      </div>

      {/* FAQ Cards */}
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <FaqItem
            key={index}
            q={faq.q}
            a={faq.a}
            links={faq.links}
            isOpen={openFaq === index}
            onToggle={() => setOpenFaq(openFaq === index ? null : index)}
          />
        ))}
      </div>

      {/* See all FAQs pill */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/faq"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 text-sm font-semibold text-zinc-900 dark:text-white transition-all cursor-pointer group"
        >
          <span>See all FAQs</span>
          <ArrowRight size={15} className="text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
