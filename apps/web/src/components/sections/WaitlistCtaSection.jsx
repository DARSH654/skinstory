"use client";

import WaitlistForm from "@/components/WaitlistForm";

export default function WaitlistCtaSection() {
  return (
    <section id="early-access" className="max-w-6xl mx-auto mt-14 sm:mt-20 relative z-10">
      <div className="flex flex-col items-center text-center space-y-5 max-w-4xl mx-auto">
        
        {/* Social Proof Pill */}
        <div className="inline-flex items-center gap-1.5 md:gap-2 pl-4 md:pl-5 pr-3 md:pr-3.5 py-2 md:py-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)] select-none max-w-full">
          <span className="text-[13px] sm:text-sm md:text-base font-medium text-zinc-700 dark:text-zinc-300 tracking-tight inline-flex items-center whitespace-nowrap">
            <span className="whitespace-nowrap"><strong className="font-semibold text-zinc-950 dark:text-white">4,192</strong> already in line</span><span className="inline-block w-[5px] h-[5px] md:w-[6px] md:h-[6px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white shrink-0 mx-1 md:mx-1.5" /><span className="whitespace-nowrap"><strong className="font-semibold text-zinc-950 dark:text-white">108</strong> spots left</span>
          </span>
        </div>

        {/* Title & Subtitle Centered - Enlarged Title */}
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-6xl lg:text-[56px] font-normal tracking-tight text-zinc-800 dark:text-zinc-200 leading-[1.12] font-[family-name:var(--font-outfit)]">
            Every face has a past. It&apos;s time to{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 font-medium text-zinc-950 dark:text-white">
                write your story.
              </span>
              <span
                className="absolute left-[-2px] right-[-2px] bottom-1 h-3.5 sm:h-4 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                aria-hidden="true"
              />
            </span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-xl leading-relaxed font-normal max-w-2xl mx-auto">
            Stop jumping between endless products and guessing in the mirror. Connect your daily habits to your biology with clinical-grade clarity.
          </p>
        </div>

        {/* Email Form / Clean Pill Confirmation */}
        <div className="w-full max-w-md mx-auto pt-2">
          <WaitlistForm source="waitlist_cta" showShield center />
        </div>

      </div>
    </section>
  );
}
