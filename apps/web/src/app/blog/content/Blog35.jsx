import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog35() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">
      <p>
        The 28-day menstrual skin cycle is governed by predictable hormone fluctuations across four biological phases: Follicular, Ovulatory, Luteal, and Menstrual. Because sebaceous gland androgen receptors react to systemic hormone ratios with high sensitivity, anticipating hormone shifts allows you to adjust exfoliation intensity and lipid barrier support before sebum hyper-viscosity triggers deep jawline cysts. <Link href="/blog/why-does-skin-flare-up-right-before-your-menstrual-cycle" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why does skin flare up right before your menstrual cycle?</Link> Late luteal progesterone peaks drive pore constriction.
      </p>

      {/* Core Pattern Key Box */}
      <div className="my-8 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border-[3px] border-zinc-950 dark:border-white bg-white dark:bg-zinc-950 shadow-md">
        <p className="text-xs font-black uppercase tracking-widest text-[#937abd] mb-2 font-[family-name:var(--font-outfit)]">
          CORE PATTERN KEY
        </p>
        <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
          Estrogen promotes epidermal hydration and collagen synthesis during days 1–14, while progesterone triggers tissue swelling and sebum thickening during days 15–28.
        </p>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        The 4 Phases of the Hormonal Skin Cycle
      </h2>

      <ul className="space-y-4 pl-1 my-6">
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Phase 1: Menstrual Phase (Days 1–5):</strong> Estrogen &amp; progesterone are low; skin barrier sensitivity is high and dry flaking occurs.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Phase 2: Follicular Phase (Days 6–13):</strong> Estrogen surges; skin glow, barrier hydration, and collagen production reach optimal monthly levels.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Phase 3: Ovulatory Phase (Day 14):</strong> Luteinizing Hormone (LH) surges; mild sebum increase begins.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Phase 4: Luteal Phase (Days 15–28):</strong> Progesterone surges and drops sharply right before menstruation, causing pore constriction and deep acne flare-ups.
          </span>
        </li>
      </ul>

      {/* Comparison Table */}
      <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Hormonal Phase vs. Recommended Skincare Focus
      </h3>

      <div className="my-8 overflow-hidden rounded-2xl border-[3px] border-zinc-950 dark:border-white bg-white dark:bg-zinc-950 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-900">
                <th className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white text-base font-[family-name:var(--font-outfit)]">Cycle Phase</th>
                <th className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white text-base font-[family-name:var(--font-outfit)]">Dominant Hormone Ratio</th>
                <th className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white text-base font-[family-name:var(--font-outfit)]">Recommended Skincare Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-zinc-200 dark:divide-zinc-800">
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white">Menstrual Phase</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">Low Estrogen / Low Progesterone</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">Barrier repair, ceramides, soothing humectants</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white">Follicular Phase</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">Rising Estrogen Dominance</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">Active treatments (Retinoids, Vitamin C)</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white">Luteal Phase</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">High Progesterone &amp; Relative Androgen Peak</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">Pre-emptive 2% BHA, oil-free hydration, anti-inflammatory actives</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Hormonal Cycle Syncing Protocol
      </h2>

      <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">Log your start date consistently:</strong> Identify your personal day 15 transition to initiate pre-emptive luteal pore clearing.
        </li>
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">Scale down active exfoliation during Menstrual phase:</strong> Protect sensitive stratum corneum when estrogen levels drop.
        </li>
      </ol>

      

      
      
      {/* Related Guide Cards */}
      <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
        Related Pattern Guides
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <Link
          href="/blog/why-does-skin-flare-up-right-before-your-menstrual-cycle"
          className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
        >
          <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
            Why Does Skin Flare Up Right Before Your Menstrual Cycle?
          </p>
          <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <Link
          href="/blog/does-sugar-really-cause-hormonal-acne-spikes"
          className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
        >
          <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
            Does Sugar Really Cause Hormonal Acne Spikes?
          </p>
          <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Bottom CTA */}
      <div className="mt-14 sm:mt-20 text-center flex flex-col items-center justify-center gap-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl lg:text-[48px] font-normal tracking-tight text-zinc-800 dark:text-zinc-200 leading-[1.14] font-[family-name:var(--font-outfit)]">
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10 font-medium text-zinc-950 dark:text-white">
                Map
              </span>
              <span
                className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                aria-hidden="true"
              />
            </span>{" "}
            your 28-day skin cycle.
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
            Skin Story helps you log monthly cycle phases and track skin changes.
          </p>
        </div>

        <div className="w-full max-w-md mx-auto pt-1">
          <form action="/#early-access" className="space-y-3">
            <div className="flex items-center p-1.5 bg-zinc-50/90 dark:bg-zinc-900 rounded-full border border-zinc-300 dark:border-zinc-700 focus-within:border-[3px] focus-within:border-black dark:focus-within:border-white shadow-[0_2px_14px_rgba(0,0,0,0.04)] transition-all">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="flex-1 min-w-0 px-4 py-2.5 text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-transparent outline-hidden text-left"
              />
              <button
                type="submit"
                className="px-5 sm:px-6 py-2.5 text-sm sm:text-base font-semibold text-white bg-[#937abd] hover:bg-[#856db0] rounded-full transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Join Waitlist</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
