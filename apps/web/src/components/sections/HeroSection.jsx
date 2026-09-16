"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
      {/* LEFT COLUMN: Content & Form (7 cols) */}
      <div className="lg:col-span-7 flex flex-col items-start text-left">
        {/* Top Badge: Proportionally scaled pill (avatars, text, height, and paddings) */}
        <div className="inline-flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-3.5 select-none">
          {/* Overlapping user avatars */}
          <div className="flex -space-x-2 overflow-hidden">
            <img
              className="inline-block h-[34px] w-[34px] rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover"
              src="/avatar-user.jpg"
              alt="Member"
            />
            <img
              className="inline-block h-[34px] w-[34px] rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces"
              alt="Member"
            />
            <img
              className="inline-block h-[34px] w-[34px] rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces"
              alt="Member"
            />
          </div>
          <span className="text-[13.5px] sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 tracking-tight flex items-center gap-1">
            <span>
              <strong className="font-semibold text-zinc-950 dark:text-white">4,192</strong> on waitlist
            </span>
            {/* 6.5px dot with black border and minimal gap */}
            <span className="inline-block w-[6.5px] h-[6.5px] rounded-full bg-[#937abd] border border-black shrink-0" />
            <span className="text-zinc-600 dark:text-zinc-400">500 early members secured</span>
          </span>
        </div>

        {/* Headings: Shifted upwards with reduced gaps */}
        <div className="mb-3.5 space-y-1.5">
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-semibold tracking-tight text-zinc-950 dark:text-white leading-[1.08] font-[family-name:var(--font-outfit)]">
            Meet Skin Story
          </h1>
          <h2 className="text-3xl sm:text-5xl lg:text-[50px] font-normal tracking-tight text-zinc-800 dark:text-zinc-200 leading-[1.16]">
            {/* Line 1: Stop guessing. See the exact */}
            <span className="block">
              Stop guessing. See the{" "}
              <span className="relative inline-block">
                <span className="relative z-10 font-medium text-zinc-950 dark:text-white">exact</span>
                <span
                  className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                  aria-hidden="true"
                />
              </span>
            </span>
            {/* Line 2: insights you've been missing. */}
            <span className="block">
              <span className="relative inline-block">
                <span className="relative z-10 font-medium text-zinc-950 dark:text-white">insights</span>
                <span
                  className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                  aria-hidden="true"
                />
              </span>{" "}
              you&apos;ve been missing.
            </span>
          </h2>
        </div>

        {/* Subtitle: Shifted upwards */}
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mb-3.5 leading-relaxed font-normal">
          We use technology which filters out background noise to the iris by neutralizing the light angle and isolating skin-level data. It extracts pinpoint-accurate insights without the guesswork.
        </p>

        {/* Email Capture / Call To Action Form - Pill Shaped */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full max-w-md mb-1.5">
            <div className="flex items-center p-1.5 bg-zinc-50/80 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-850 focus-within:bg-white dark:focus-within:bg-zinc-850 rounded-full border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-within:border-zinc-300 dark:focus-within:border-zinc-700 transition-all">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 min-w-0 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-transparent outline-hidden"
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
          <div className="w-full max-w-md p-3.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 mb-1.5 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">
              You’re on the early access waitlist! We will notify you soon.
            </span>
          </div>
        )}

        {/* Microcopy: Tightened gap */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium pl-3">
          Only 108 early member spots remaining.
        </p>
      </div>

      {/* RIGHT COLUMN: Hero Phones Image (5 cols) */}
      <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
        <img
          src="/hero-phones.webp"
          alt="App Preview"
          className="w-full max-w-[440px] sm:max-w-[480px] lg:max-w-none h-auto object-contain drop-shadow-xl select-none pointer-events-none"
        />
      </div>
    </div>
  );
}
