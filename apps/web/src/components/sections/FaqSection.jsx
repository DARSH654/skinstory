"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "Is early access free?",
      a: "Yes, early access is 100% free for all accepted members in this cohort. You will also receive locked-in founding member perks when public features release.",
    },
    {
      q: "Are you going to sell me products or routines?",
      a: "No. We don't sell skincare, serums, or creams. We are an unbiased diagnostic tool designed to help you understand which products you already own are helping or hurting your skin.",
    },
    {
      q: "Do I need special lighting or camera gear?",
      a: "Not at all. Skin Story works directly on your smartphone camera. Our AI model computationally neutralizes room lighting, flash, and shadow angles to give you a true optical baseline.",
    },
    {
      q: "When do I get my invite code?",
      a: "Invites are dispatched in rolling batches of 100. As soon as your spot comes up in line, your exclusive download link and activation code will be delivered directly to your inbox.",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto mt-24 sm:mt-32 relative z-10">
      <div className="text-center mb-10 sm:mb-12">
        <span className="px-3.5 py-1 rounded-full bg-[#937abd]/10 dark:bg-[#937abd]/20 text-[#7a60a3] dark:text-[#c4b5fd] text-xs font-semibold tracking-wider uppercase">
          Early Access Q&amp;A
        </span>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white mt-3 mb-3 font-[family-name:var(--font-outfit)]">
          Before You Join Early Access
        </h2>
        <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base font-normal">
          Answers to common questions about beta rollout, cohort access, and data privacy.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isExpanded = openFaq === index;
          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? "border-[#937abd]/50 bg-purple-50/30 dark:bg-[#937abd]/10 shadow-xs"
                  : "border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isExpanded ? null : index)}
                className="w-full py-4 sm:py-5 px-6 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 dark:text-white text-base sm:text-lg cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#937abd]" />
                  <span>{faq.q}</span>
                </span>
                <ChevronDown
                  size={18}
                  className={`text-zinc-400 dark:text-zinc-400 shrink-0 transition-transform duration-200 ${
                    isExpanded ? "rotate-180 text-[#937abd] dark:text-[#c4b5fd]" : ""
                  }`}
                />
              </button>
              {isExpanded && (
                <div className="px-6 pb-5 pt-1 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal border-t border-purple-100/60 dark:border-zinc-800">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
