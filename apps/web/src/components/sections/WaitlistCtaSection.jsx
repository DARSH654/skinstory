"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export default function WaitlistCtaSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("https://getskinstory.com?ref=4193");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="early-access" className="max-w-6xl mx-auto mt-24 sm:mt-32 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* LEFT COLUMN: Title, Subtitle, and Call to Action (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6 min-w-0">
          
          {/* Emotional, Brand-Focused Title with Underline */}
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl lg:text-[48px] font-semibold tracking-tight text-zinc-950 dark:text-white leading-[1.14] font-[family-name:var(--font-outfit)]">
              Every face has a past. It&apos;s time to{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 font-bold text-zinc-950 dark:text-white">
                  write your story.
                </span>
                <span
                  className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                  aria-hidden="true"
                />
              </span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl">
              Stop jumping between endless products and guessing in the mirror. Connect your daily habits to your biology with clinical-grade clarity.
            </p>
          </div>

          {/* Clean Minimalist Social Proof Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#937abd]" />
            <span><strong className="text-zinc-950 dark:text-white font-semibold">4,192</strong> already in line</span>
            <span className="text-zinc-300 dark:text-zinc-600">•</span>
            <span className="text-[#937abd] font-semibold">108 spots left</span>
          </div>

          {/* Email Form / State */}
          <div className="w-full max-w-lg pt-1">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 bg-zinc-50/90 dark:bg-zinc-900 rounded-2xl sm:rounded-full border border-zinc-300 dark:border-zinc-700 shadow-[0_2px_14px_rgba(0,0,0,0.04)] focus-within:border-[#937abd] dark:focus-within:border-[#937abd] transition-all">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 sm:py-2.5 text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-transparent outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 sm:py-2.5 text-sm sm:text-base font-semibold text-white bg-[#937abd] hover:bg-[#856db0] rounded-xl sm:rounded-full transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>Join Waitlist</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2 pl-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <ShieldCheck size={14} className="text-[#937abd] shrink-0" />
                  <span>Free for early cohort. Zero spam or sponsored product bias.</span>
                </div>
              </form>
            ) : (
              <div className="p-6 rounded-3xl bg-zinc-50/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-[#937abd]/20 text-[#937abd] flex items-center justify-center shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-zinc-950 dark:text-white leading-tight">
                      Spot Reserved — You&apos;re #4,193
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Confirmation sent to <strong className="text-zinc-800 dark:text-zinc-200">{email}</strong>
                    </p>
                  </div>
                </div>

                {/* Share Loop */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-900 dark:text-white">Want early invite?</span>
                    <span className="text-[#937abd]">+10 spots per friend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://getskinstory.com?ref=4193`}
                      className="flex-1 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-hidden select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-zinc-950 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-all cursor-pointer shrink-0"
                    >
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Image / Phone preview (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[340px] sm:max-w-[400px]">
            <img
              src="/hero-phones.webp"
              alt="Skin Story App Screen"
              className="relative z-10 w-full h-auto object-contain drop-shadow-2xl select-none"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
