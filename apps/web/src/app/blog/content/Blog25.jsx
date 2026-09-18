import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog25() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">
      <p>
        Post-Inflammatory Hyperpigmentation (PIH) and Post-Inflammatory Erythema (PIE) are two biologically distinct tissue recovery responses following acne inflammation. While PIE represents dilated dermal capillary micro-vascular damage, PIH stems from hyper-active melanocytes depositing excess melanin granules into damaged epidermal basal layers. <Link href="/blog/why-do-acne-scars-take-months-to-fade-completely" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why do acne scars take months to fade completely?</Link> Cellular turnover cycles dictate pigment shedding speed.
      </p>

      {/* Fast Fact Box */}
      <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
          CORE PATTERN KEY
        </p>
        <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
          Trauma to basal keratinocytes causes pigmentary incontinence, allowing melanin to drop down into the papillary dermis where macrophage phagocytosis takes up to 6–12 months to clear.
        </p>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Why Acne Scars and Pigment Marks Persist
      </h2>

      <p>
        Key physiological factors prolonging post-acne mark duration:
      </p>

      <ul className="space-y-4 pl-1 my-6">
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Tyrosinase Over-Stimulation:</strong> Inflammatory cytokines (IL-1, TNF-alpha) stimulate tyrosinase activity long after acne papules flatten.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Unshielded UV Exposure:</strong> Ambient UV light activates melanocyte melanosome synthesis, darkening resolving spots instantly.
          </span>
        </li>
      </ul>

      {/* Comparison Table */}
      <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Melanin Clearance Timeline vs. Skin Turnover
      </h3>

      <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950 shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
            <tr>
              <th className="py-3.5 px-4 font-bold">Recovery Stage</th>
              <th className="py-3.5 px-4 font-bold">Biological Phase Name</th>
              <th className="py-3.5 px-4 font-bold">Tissue Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
            <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Days 1–14</td>
              <td className="py-3 px-4">Acute Inflammation Phase</td>
              <td className="py-3 px-4">Capillaries dilate; melanocytes deposit excess melanin in response to cellular injury.</td>
            </tr>
            <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Days 15–60</td>
              <td className="py-3 px-4">Epidermal Migration Phase</td>
              <td className="py-3 px-4">Melanin pigment migrates upward through stratum spinosum cell layers.</td>
            </tr>
            <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Months 2–6+</td>
              <td className="py-3 px-4">Dermal Macrophage Clearance</td>
              <td className="py-3 px-4">Deep dermal pigment deposits are slowly phagocytized by tissue macrophages.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Accelerated Fading Protocol
      </h2>

      <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">Apply Tyrosinase Inhibitors (Tranexamic Acid / Alpha Arbutin):</strong> Block melanin synthesis pathways before pigment deposits form.
        </li>
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">Incorporate Retinoids (Tretinoin / Adapalene):</strong> Accelerate epidermal desquamation rate, sloughing pigmented keratinocytes faster.
        </li>
      </ol>

      

      
      
      {/* Related Guide Cards */}
      <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
        Related Pattern Guides
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <Link
          href="/blog/why-do-breakouts-keep-happening-in-the-exact-same-spot"
          className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
        >
          <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
            Why Do Breakouts Keep Happening in the Exact Same Spot?
          </p>
          <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <Link
          href="/blog/how-long-does-it-take-to-repair-a-damaged-skin-barrier"
          className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
        >
          <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
            How Long Does It Take to Repair a Damaged Skin Barrier?
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
                Log
              </span>
              <span
                className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                aria-hidden="true"
              />
            </span>{" "}
            your skin progression.
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
            Skin Story helps you track post-breakout marks over time.
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
