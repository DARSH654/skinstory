import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog24() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">
      <p>
        Dry skin (alipidic skin) is a genetic skin type lacking oil-producing sebaceous activity, whereas dehydrated skin is a temporary condition characterized by a deficit of water in the stratum corneum. Confusing these two distinct biological states leads millions of individuals to apply heavy occlusive oils to water-starved skin, exacerbating pore blockage. <Link href="/blog/how-long-does-it-take-to-repair-a-damaged-skin-barrier" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How long does it take to repair a damaged skin barrier?</Link> Barrier restoration requires addressing water vs lipid balance.
      </p>

      {/* Fast Fact Box */}
      <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
          CORE PATTERN KEY
        </p>
        <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
          If your skin feels tight and shiny simultaneously while still producing oil, your skin is <strong className="text-zinc-950 dark:text-white font-bold">Dehydrated</strong> (lacks water), not dry (lacks lipids).
        </p>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Biological Distinctions
      </h2>

      <p>
        Understanding how sebum levels vs. Natural Moisturizing Factors (NMF) dictate skin feel:
      </p>

      <ul className="space-y-4 pl-1 my-6">
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Dry Skin (Lacks Lipids):</strong> Micro-sebaceous glands secrete inadequate ceramides, cholesterol, and fatty acids, producing fine flaking across all facial zones.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Dehydrated Skin (Lacks Water):</strong> Stratum corneum cells collapse due to low humidity or harsh cleansers, causing dullness and shadow exaggeration.
          </span>
        </li>
      </ul>

      {/* Comparison Table */}
      <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Dry vs. Dehydrated Skin Symptom Matrix
      </h3>

      <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950 shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
            <tr>
              <th className="py-3.5 px-4 font-bold">Feature Parameter</th>
              <th className="py-3.5 px-4 font-bold">Dry Skin (Genetic Type)</th>
              <th className="py-3.5 px-4 font-bold">Dehydrated Skin (Condition)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
            <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Root Cause</td>
              <td className="py-3 px-4">Low Lipid Secretion</td>
              <td className="py-3 px-4">TEWL / Water Deficit</td>
            </tr>
            <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Pore Appearance</td>
              <td className="py-3 px-4">Small, invisible pores</td>
              <td className="py-3 px-4">Pores may look dilated</td>
            </tr>
            <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Surface Feel</td>
              <td className="py-3 px-4">Rough, flaky surface texture</td>
              <td className="py-3 px-4">Tight papery surface feel</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Targeted Treatment Steps
      </h2>

      <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">For Dehydrated Skin:</strong> Layer humectants (Glycerin, Hyaluronic Acid) onto damp skin to pull water into corneal cells.
        </li>
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">For Dry Skin:</strong> Apply lipid-replenishing physiological creams containing 3:1:1 ratio Ceramides, Cholesterol, and Free Fatty Acids.
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
                Identify
              </span>
              <span
                className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                aria-hidden="true"
              />
            </span>{" "}
            your skin state.
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
            Skin Story helps you distinguish hydration levels from natural oil production.
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
