"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "Is early access free?",
      bullets: [
        { label: "100% Free", text: "Early access is completely free for all accepted members in this cohort." },
        { label: "Founding Perks", text: "You get locked-in founding member perks and priority access when public features release." },
      ],
      action: { label: "Claim early spot", href: "#early-access" },
    },
    {
      q: "Are you going to sell me products or routines?",
      bullets: [
        { label: "Unbiased", text: "No. We don't sell skincare, serums, creams, or affiliate products." },
        { label: "Root-Cause Intelligence", text: "We are an unbiased diagnostic tool built to reveal which habits and products actually help or harm your skin." },
      ],
    },
    {
      q: "Do I need special lighting or camera gear?",
      bullets: [
        { label: "Smartphone Native", text: "Not at all. Skin Story works directly using your regular smartphone camera." },
        { label: "Light Neutralization", text: "Our optical engine neutralizes room glare, shadows, and angle variations to extract a consistent skin baseline." },
      ],
    },
    {
      q: "When do I get my invite code?",
      bullets: [
        { label: "Rolling Batches", text: "Invites are dispatched in batches of 100 as spots open." },
        { label: "Inbox Delivery", text: "As soon as your spot comes up in line, your activation link will be delivered directly to your email." },
      ],
      action: { label: "Check your spot", href: "#early-access" },
    },
    {
      q: "Is my personal skin data kept private?",
      bullets: [
        { label: "Private & Encrypted", text: "Your scans and personal inputs are encrypted end-to-end and never sold to third parties." },
        { label: "No Ad Tracking", text: "We do not monetize your photos or use them for behavioral advertising." },
      ],
      action: { label: "Read Privacy Policy", href: "/privacy-policy" },
    },
  ];

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

      {/* Modern Cal AI Style Stacked FAQ Cards */}
      <div className="space-y-3.5">
        {faqs.map((faq, index) => {
          const isExpanded = openFaq === index;
          return (
            <div
              key={index}
              className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isExpanded ? null : index)}
                className="w-full py-5 sm:py-5.5 px-6 sm:px-8 text-left flex items-center justify-between gap-4 font-semibold text-zinc-950 dark:text-white text-base sm:text-lg cursor-pointer"
              >
                <span>{faq.q}</span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <ChevronDown
                    size={16}
                    className={`text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-zinc-950 dark:text-white" : ""
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 sm:px-8 pb-6 pt-1 space-y-4">
                  {/* Clean bulleted response like Cal AI */}
                  <ul className="space-y-2.5 text-[15px] sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                    {faq.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 mt-2.5 shrink-0" />
                        <span>
                          <strong className="font-semibold text-zinc-900 dark:text-white">
                            {bullet.label}:{" "}
                          </strong>
                          {bullet.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Optional action pill inside expanded card */}
                  {faq.action && (
                    <div className="pt-2">
                      <a
                        href={faq.action.href}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white transition-colors cursor-pointer border border-zinc-200/60 dark:border-zinc-700"
                      >
                        <span>{faq.action.label}</span>
                        <ArrowRight size={13} />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cal AI Style 'See all FAQs ->' Pill */}
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
