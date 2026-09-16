import { ArrowRight } from "lucide-react";

export default function ComparisonSection() {
  return (
    <section className="max-w-6xl mx-auto mt-6 sm:mt-8">
      {/* App Insight Preview & Direct Comparison - Dark in light mode, White in dark mode */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-3xl p-8 sm:p-12 shadow-xl border border-transparent dark:border-zinc-200/80 transition-colors">
        <div className="lg:col-span-5 flex justify-center">
          <img
            src="/hero-phones.webp"
            alt="Skin Story Real Insight Screen"
            className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-contain drop-shadow-2xl"
          />
        </div>

        <div className="lg:col-span-7 text-left space-y-6">
          <span className="px-3.5 py-1 rounded-full bg-[#937abd]/20 dark:bg-[#937abd]/15 border border-[#937abd]/40 dark:border-[#937abd]/30 text-[#d6cbe8] dark:text-[#7a60a3] text-xs font-semibold tracking-wide uppercase">
            The Fundamental Difference
          </span>
          <h3 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white dark:text-zinc-950 leading-tight font-[family-name:var(--font-outfit)]">
            Why generic beauty apps fail you.
          </h3>

          {/* 2 Column Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 dark:bg-zinc-100 border border-white/10 dark:border-zinc-200">
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Other Apps
              </p>
              <p className="text-sm text-zinc-300 dark:text-zinc-700 leading-relaxed">
                Arbitrary score. Generic advice. Automated affiliate sales pitching you more products you don&apos;t need.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#937abd]/20 dark:bg-[#937abd]/10 border border-[#937abd]/50 dark:border-[#937abd]/40">
              <p className="text-xs font-semibold text-[#d6cbe8] dark:text-[#7a60a3] uppercase tracking-wider mb-2">
                Skin Story
              </p>
              <p className="text-sm text-white dark:text-zinc-950 font-medium leading-relaxed">
                Exact Score + Trigger + Root Cause + Action. 100% personalized to your specific biology.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="#early-access"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-950 dark:text-white bg-white dark:bg-zinc-950 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-all shadow-md cursor-pointer"
            >
              <span>Claim Your Spot</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
