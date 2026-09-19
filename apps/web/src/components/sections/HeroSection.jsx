"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import HighlightPhrase from "@/components/HighlightPhrase";

export default function HeroSection() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      router.push(`/checkout?email=${encodeURIComponent(email.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center relative z-10">
      {/* LEFT COLUMN: Content & Form (7.5 / 4.5 column balance on desktop) */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left min-w-0">
        {/* Top Badge: Pill */}
        <div className="inline-flex items-center gap-1.5 md:gap-2.5 pl-1 md:pl-1.5 pr-2.5 md:pr-3.5 py-1 md:py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-3.5 select-none max-w-full">
          {/* Overlapping user avatars */}
          <div className="flex -space-x-1.5 md:-space-x-2 overflow-hidden shrink-0">
            <img
              className="inline-block h-6 w-6 md:h-[34px] md:w-[34px] rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover"
              src="/avatar-user.jpg"
              alt="Member"
            />
            <img
              className="inline-block h-6 w-6 md:h-[34px] md:w-[34px] rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces"
              alt="Member"
            />
            <img
              className="inline-block h-6 w-6 md:h-[34px] md:w-[34px] rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces"
              alt="Member"
            />
          </div>
          <span className="text-[11px] sm:text-xs md:text-sm font-medium text-zinc-700 dark:text-zinc-300 tracking-tight inline-flex items-center whitespace-nowrap">
            <span className="whitespace-nowrap"><strong className="font-semibold text-zinc-950 dark:text-white">4,192</strong> on waitlist</span><span className="inline-block w-[5px] h-[5px] md:w-[6px] md:h-[6px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white shrink-0 mx-1 md:mx-1.5" /><span className="whitespace-nowrap"><strong className="font-semibold text-zinc-950 dark:text-white">500</strong> early members secured</span>
          </span>
        </div>

        {/* Headings: Full original big font size */}
        <div className="mb-3.5 space-y-1.5 w-full">
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-semibold tracking-tight text-zinc-950 dark:text-white leading-[1.08] font-[family-name:var(--font-outfit)]">
            Meet Skin Story
          </h1>
          <h2 className="text-3xl sm:text-5xl lg:text-[50px] font-normal tracking-tight text-zinc-800 dark:text-zinc-200 leading-[1.16] text-balance">
            Stop guessing. See the{" "}
            <HighlightPhrase 
              words={[
                { text: "exact", hasSpace: true },
                { text: "insights", hasSpace: false }
              ]} 
            />{" "}
            you&apos;ve been missing.
          </h2>
        </div>

        {/* Subtitle: Shifted upwards */}
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto lg:mx-0 mb-3.5 leading-relaxed font-normal">
          We use technology which filters out background noise to the iris by neutralizing the light angle and isolating skin-level data. It extracts pinpoint-accurate insights without the guesswork.
        </p>

        {/* Email Capture / Call To Action Form - Pill Shaped */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto lg:mx-0 mb-1.5">
            <div className="flex items-center p-1.5 bg-zinc-50/80 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-900 focus-within:bg-white dark:focus-within:bg-zinc-900 rounded-full border border-zinc-200/90 dark:border-zinc-700 focus-within:border-[3px] focus-within:border-black dark:focus-within:border-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 min-w-0 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-transparent outline-hidden text-left"
              />
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#937abd] rounded-full hover:bg-[#856db0] active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>{t("nav.earlyAccess") || "Get Early Access"}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        ) : (
          <div className="w-full max-w-md mx-auto lg:mx-0 p-3.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-center lg:justify-start gap-3 mb-1.5 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">
              You’re on the early access waitlist! We will notify you soon.
            </span>
          </div>
        )}

        {/* Microcopy: Tightened gap */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium text-center lg:text-left lg:pl-3">
          Only 108 early member spots remaining.
        </p>
      </div>

      {/* RIGHT COLUMN: Hero Phones Image (5 cols) */}
      <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end items-center">
        <img
          src="/hero-phones.webp"
          alt="App Preview"
          className="w-full max-w-[420px] sm:max-w-[460px] xl:max-w-[480px] h-auto object-contain drop-shadow-xl select-none pointer-events-none"
        />
      </div>
    </div>
  );
}
