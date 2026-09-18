import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog34() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">
      <p>
        Shower water with high concentrations of dissolved heavy minerals (specifically Calcium Carbonate and Magnesium Sulfate) alters skin chemistry through insoluble lipid precipitation. When hard minerals bind with facial cleansing surfactants and natural sebum, they form an insoluble mineral film ("soap scum") that coats facial pores, strips natural intercellular lipids, and elevates skin pH from healthy acidic levels (4.5–5.5) to alkaline levels above 7.5. <Link href="/blog/can-hard-water-cause-persistent-facial-acne" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Can hard water cause persistent facial acne?</Link> Mineral residue destabilizes acid mantle protection.
      </p>

      {/* Core Pattern Key Box */}
      <div className="my-8 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border-[3px] border-zinc-950 dark:border-white bg-white dark:bg-zinc-950 shadow-md">
        <p className="text-xs font-black uppercase tracking-widest text-[#937abd] mb-2 font-[family-name:var(--font-outfit)]">
          CORE PATTERN KEY
        </p>
        <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
          Calcium ions bind to epidermal fatty acids, creating insoluble calcium stearate micro-deposits that physically clog pore exits while accelerating Transepidermal Water Loss.
        </p>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        How Hard Water Minerals Damage Skin Barrier Health
      </h2>

      <ul className="space-y-4 pl-1 my-6">
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Acid Mantle Alkalinization:</strong> High mineral content elevates skin surface pH, deactivating acid-dependent serine protease enzymes required for ceramide processing.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Surfactant Residue Entrapment:</strong> Insoluble soap-mineral complexes remain stuck in follicular entrances, irritating sensitive skin.
          </span>
        </li>
      </ul>

      {/* Comparison Table */}
      <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Hard Water vs. Soft / Filtered Water Effects
      </h3>

      <div className="my-8 overflow-hidden rounded-2xl border-[3px] border-zinc-950 dark:border-white bg-white dark:bg-zinc-950 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-900">
                <th className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white text-base font-[family-name:var(--font-outfit)]">Water Type</th>
                <th className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white text-base font-[family-name:var(--font-outfit)]">Mineral Deposit Risk</th>
                <th className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white text-base font-[family-name:var(--font-outfit)]">Impact on Acid Mantle</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-zinc-200 dark:divide-zinc-800">
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white">Hard Water (&gt;120 ppm)</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">High Risk</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">Leaves insoluble film, elevates skin pH above 7.0, causes tightness &amp; pore clogging.</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-zinc-950 dark:text-white">Soft / Filtered Water (&lt;60 ppm)</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">Minimal / None</td>
                <td className="p-4 sm:p-5 text-zinc-700 dark:text-zinc-300">Rinses cleansers completely, maintains healthy acidic 5.0 pH, preserves ceramides.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Hard Water Neutralization Protocol
      </h2>

      <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">Install a KDF-55 / Vitamin C Shower Filter:</strong> Neutralize heavy metals and chlorine before water contacts facial skin.
        </li>
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">Apply a Low-pH Chelating Toner (pH 4.5–5.0) immediately after cleansing:</strong> Bind and dissolve residual calcium ions while re-establishing acid mantle pH.
        </li>
      </ol>

      

      
      
      {/* Related Guide Cards */}
      <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
        Related Pattern Guides
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <Link
          href="/blog/is-it-bad-to-wash-your-face-in-hot-water-everyday"
          className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
        >
          <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
            Is It Bad to Wash Your Face in Hot Water Everyday?
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
            your shower habits.
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
            Skin Story helps you track environmental exposure and skin comfort.
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
