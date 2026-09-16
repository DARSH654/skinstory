"use client";

import Link from "next/link";
import { useState } from "react";

const faqs = [
  { q: "What is Skin Story?", a: "Skin Story is an AI-powered skin-care tracking app that helps you understand how your skin changes over time — through consistent self-photos, AI analysis, and personalised insights. No guesswork, no random product recommendations." },
  { q: "When will the app be available?", a: "We are currently in pre-launch. The first cohort of 500 early members will get access before the public launch. Join the waitlist to secure your spot." },
  { q: "Is it available on Android and iOS?", a: "Yes — Skin Story will be available on both the App Store and Google Play. You will receive your access code via email when your cohort opens." },
  { q: "Is my skin data private?", a: "Absolutely. Your photos and skin metrics are yours. We do not sell, share, or use your data for advertising. Read our Privacy Policy for full details." },
  { q: "Does Skin Story give medical advice?", a: "No. Skin Story is an informational tracking tool, not a medical device. Always consult a qualified dermatologist for medical concerns." },
  { q: "What makes Skin Story different?", a: "Most apps recommend products to sell you things. Skin Story does the opposite — objective skin tracking, no product bias, no data monetisation." },
  { q: "How do I cancel my waitlist spot?", a: "Email us at support@getskinstory.com and we will remove you immediately." },
  { q: "Is the app free?", a: "Pricing has not been announced yet. Early members who join the waitlist will receive a special founding-member offer." },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-4 flex items-center justify-between gap-4 group"
      >
        <span className="text-[15px] font-medium text-zinc-900 dark:text-white group-hover:text-[#937abd] transition-colors">{q}</span>
        <span className="text-zinc-400 text-xl shrink-0 transition-transform duration-200" style={{ transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
      </button>
      {open && <p className="text-sm text-zinc-600 dark:text-zinc-400 pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-16 sm:py-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-10 transition-colors">
          ← Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
          Frequently Asked Questions
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-10 text-sm">
          {"Can't find your answer? "}<Link href="/contact" className="text-[#937abd] hover:underline">Contact us</Link>.
        </p>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-6 py-2 shadow-sm">
          {faqs.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </div>
    </main>
  );
}
