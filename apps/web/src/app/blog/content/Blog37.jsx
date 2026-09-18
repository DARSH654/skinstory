import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog37() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">
      <p>
        Caffeine acts as a systemic adenosine receptor antagonist and potent central nervous system stimulant that elevates adrenal Cortisol production. While oral caffeine intake increases renal diuresis, its primary dermatological impact is vasoconstriction of cutaneous micro-capillaries, reducing blood flow to the dermal papilla and elevating Transepidermal Water Loss (TEWL) across facial skin. <Link href="/blog/how-do-cortisol-spikes-damage-skin-collagen-over-time" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How do cortisol spikes damage skin collagen over time?</Link> Stress hormones driven by caffeine impair barrier lipids.
      </p>

      {/* Core Pattern Key Box */}
      <div className="my-8 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border-[3px] border-zinc-950 dark:border-white bg-white dark:bg-zinc-950 shadow-md">
        <p className="text-xs font-black uppercase tracking-widest text-[#937abd] mb-2 font-[family-name:var(--font-outfit)]">
          CORE PATTERN KEY
        </p>
        <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
          Exceeding 300mg daily caffeine (approx. 3 espresso shots) elevates basal cortisol by 25%, causing peripheral micro-vascular constriction and moisture depletion.
        </p>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Pathways of Caffeine-Induced Skin Dehydration
      </h2>

      <ul className="space-y-4 pl-1 my-6">
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Cutaneous Micro-Vascular Constriction:</strong> Reduced blood flow decreases oxygen and nutrient delivery to basal keratinocytes, dampening natural moisturizing factor (NMF) synthesis.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Diuretic Electrolyte Loss:</strong> Increased urinary excretion depletes intracellular Potassium and Magnesium necessary for cellular hydration.
          </span>
        </li>
      </ul>

      {/* Comparison Table */}
      <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Daily Caffeine Intake vs. Facial Hydration Metrics
      </h3>

      <div className="my-8 overflow-hidden rounded-2xl border-[3px] border-zinc-950 dark:border-white bg-white dark:bg-zinc-950 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-900">
                <th className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white text-base font-[family-name:var(--font-outfit)]">Daily Caffeine Volume</th>
                <th className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white text-base font-[family-name:var(--font-outfit)]">Cortisol Response Elevation</th>
                <th className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white text-base font-[family-name:var(--font-outfit)]">Capillary Blood Flow</th>
                <th className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white text-base font-[family-name:var(--font-outfit)]">TEWL Barrier Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-zinc-200 dark:divide-zinc-800">
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white">&lt; 100 mg (1 cup coffee)</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">Minimal / Baseline</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">Normal circulation</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">No measurable change</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white">&gt; 300 mg (3+ cups coffee)</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">+25–35% Cortisol Spike</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">Sustained Micro-Constriction</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">Elevated TEWL &amp; papery skin texture</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Hydration Balancing Steps for Coffee Drinkers
      </h2>

      <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">Drink 500ml water per cup of coffee:</strong> Offset diuretic fluid loss and maintain plasma volume.
        </li>
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">Incorporate L-Theanine with Caffeine:</strong> Smooths out adrenal cortisol spikes and mitigates micro-vascular constriction.
        </li>
      </ol>

      

      
      
      {/* Related Guide Cards */}
      <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
        Related Pattern Guides
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <Link
          href="/blog/how-does-dehydration-directly-affect-skin-elasticity"
          className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
        >
          <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
            How Does Dehydration Directly Affect Skin Elasticity?
          </p>
          <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <Link
          href="/blog/does-drinking-3-liters-of-water-clear-acne-on-its-own"
          className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
        >
          <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
            Does Drinking 3 Liters of Water Clear Acne on Its Own?
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
                Observe
              </span>
              <span
                className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                aria-hidden="true"
              />
            </span>{" "}
            your daily coffee habits.
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
            Skin Story helps you log daily caffeine intake alongside skin hydration levels.
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
