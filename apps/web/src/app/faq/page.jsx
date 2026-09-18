"use client";

import { useState } from "react";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";
import HighlightPhrase from "@/components/HighlightPhrase";

// FAQ data grouped by category
const faqCategories = [
  {
    id: "general",
    label: "General",
    faqs: [
      { q: "What is Skin Story?", a: "Skin Story is an AI-powered skin-care tracking app that helps you understand how your skin changes over time — through consistent self-photos, AI analysis, and personalised insights. No guesswork, no random product recommendations." },
      { q: "What makes Skin Story different?", a: "Most apps recommend products to sell you things. Skin Story does the opposite — objective skin tracking, no product bias, no data monetisation." },
    ],
  },
  {
    id: "availability",
    label: "Availability",
    faqs: [
      { q: "When will the app be available?", a: "We are currently in pre-launch. The first cohort of 500 early members will get access before the public launch. Join the waitlist to secure your spot." },
      { q: "Is it available on Android and iOS?", a: "Yes — Skin Story will be available on both the App Store and Google Play. You will receive your access code via email when your cohort opens." },
    ],
  },
  {
    id: "privacy",
    label: "Privacy & Data",
    faqs: [
      { q: "Is my skin data private?", a: "Absolutely. Your photos and skin metrics are yours. We do not sell, share, or use your data for advertising. Read our Privacy Policy for full details." },
      { q: "Does Skin Story give medical advice?", a: "No. Skin Story is an informational tracking tool, not a medical device. Always consult a qualified dermatologist for medical concerns." },
    ],
  },
  {
    id: "waitlist",
    label: "Waitlist & Pricing",
    faqs: [
      { q: "Is the app free?", a: "Pricing has not been announced yet. Early members who join the waitlist will receive a special founding-member offer." },
      { q: "How do I cancel my waitlist spot?", a: "Email us at support@getskinstory.com and we will remove you immediately." },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 group"
      >
        <span className="text-base sm:text-lg font-medium text-zinc-900 dark:text-white group-hover:text-[#937abd] transition-colors leading-snug">
          {q}
        </span>
        <span
          className="shrink-0 text-zinc-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 px-6 pb-5 leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

export default function FaqPage() {
  // null = no filter active (show all sections)
  const [activeCategory, setActiveCategory] = useState(null);

  const visibleCategories = activeCategory
    ? faqCategories.filter((c) => c.id === activeCategory)
    : faqCategories;

  function handlePillClick(id) {
    if (activeCategory === id) {
      // clicking the active pill deselects it → show all
      setActiveCategory(null);
    } else {
      setActiveCategory(id);
      setTimeout(() => {
        const el = document.getElementById(`faq-section-${id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }

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

          {/* Category Pills */}
          <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto mb-8">
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handlePillClick(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                  activeCategory === cat.id
                    ? "bg-[#937abd] text-white border-[#937abd] shadow-sm"
                    : "bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-[#937abd] hover:text-[#937abd]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Sections — all visible by default, filtered when a pill is active */}
          <div className="space-y-8">
            {visibleCategories.map((group) => (
              <div key={group.id} id={`faq-section-${group.id}`} className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                  {group.label}
                </h2>
                <div className="space-y-3">
                  {group.faqs.map((item, i) => (
                    <FaqItem key={i} q={item.q} a={item.a} />
                  ))}
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

