import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog19() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">

              <p>
                If you recently moved to a new city or neighborhood and suddenly developed unexplained facial acne or persistent skin dryness, the culprit may be coming directly out of your bathroom faucet. Hard water—water containing high concentrations of dissolved minerals like Calcium (Ca2+) and Magnesium (Mg2+)—interferes directly with cleanser chemistry and skin mantle pH. <Link href="/blog/is-it-bad-to-wash-your-face-in-hot-water-everyday" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Is it bad to wash your face in hot water everyday?</Link> Combining thermal heat with mineral-dense hard water drastically accelerates lipid barrier destruction.
              </p>

              <p>
                When heavy calcium and magnesium ions mix with fatty acids in standard facial cleansers, they undergo an insoluble chemical precipitation reaction, forming a sticky, microscopic film known as <strong className="font-semibold text-zinc-950 dark:text-white">Soap Scum (Calcium Stearate)</strong> that clings to facial skin.
              </p>

              {/* Fast Fact Box */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                  CORE PATTERN KEY
                </p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  Hard water minerals <strong className="text-zinc-950 dark:text-white font-bold">elevate facial skin pH to 7.5–8.0</strong>. This alkaline environment deactivates acid-dependent ceramidase enzymes, preventing skin from manufacturing its own protective lipids.
                </p>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The Hard Water Mineral-to-Pore Clogging Pathway
              </h2>

              <p>
                How mineral-heavy tap water impairs pore health and triggers breakouts:
              </p>

              <ul className="space-y-4 pl-1 my-6">
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Soap Scum Pore Occlusion:</strong> Insoluble mineral precipitates coat the follicle neck, trapping dead skin cells and sebum inside the canal.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Disruption of Acid Mantle Microflora:</strong> Alkaline hard water neutralizes the protective acid mantle, allowing pathogenic <em>C. acnes</em> strains to overgrow rapidly.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Heavy Metal Free-Radical Generation:</strong> Traces of Iron and Copper in hard water catalyze lipid peroxidation, oxidizing sebum into inflammatory comedogenic squalene.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Soft Water vs. Hard Water Dermatological Matrix
              </h2>

              <p>
                Comparing skin health metrics between soft water and mineral-rich hard tap water. <Link href="/blog/how-long-does-it-take-to-repair-a-damaged-skin-barrier" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How long does it take to repair a damaged skin barrier?</Link> Hard water extends barrier recovery timelines significantly.
              </p>

              {/* Comparison Table */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Water Mineral Hardness vs. Skin Barrier Outcome
              </h3>

              <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Water Hardness Rating</th>
                      <th className="py-3.5 px-4 font-bold">Mineral Content (GPG / PPM)</th>
                      <th className="py-3.5 px-4 font-bold">Facial Skin Manifestation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Soft Water (&lt; 1 GPG)</td>
                      <td className="py-3 px-4">Low Calcium &amp; Magnesium (&lt; 17 PPM)</td>
                      <td className="py-3 px-4">Cleansers rinse completely clean; acid mantle remains at optimal pH 5.5</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Moderate Hard Water (3.5–7 GPG)</td>
                      <td className="py-3 px-4">60–120 PPM Calcium carbonate</td>
                      <td className="py-3 px-4">Mild post-cleansing tightness; subtle texture buildup over weeks</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Very Hard Water (&gt; 10.5 GPG)</td>
                      <td className="py-3 px-4">High Calcium &amp; Magnesium (&gt; 180 PPM)</td>
                      <td className="py-3 px-4">Heavy soap film buildup, persistent micro-comedones, severe TEWL</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The 4-Step Hard Water Skin Protection Protocol
              </h2>

              <p>
                Protect facial skin from hard water mineral buildup with these four practical steps:
              </p>

              <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Use a chelating Micellar Water final rinse:</strong> After cleansing with tap water, sweep face with a chelating micellar water (containing Disodium EDTA) to bind and remove mineral residue.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Switch to non-foaming synthetic detergent (Syndet) bars:</strong> Syndet cleansers do not contain traditional soap fatty acids, preventing soap scum formation in hard water.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Install a shower head mineral filter with KDF-55:</strong> KDF-55 filter media reduces heavy metals and chlorine before water contacts facial skin.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Apply a low-pH hydrating toner immediately after drying:</strong> <Link href="/blog/is-it-bad-to-wash-your-face-in-hot-water-everyday" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Is it bad to wash your face in hot water everyday?</Link> Restore facial skin pH to 5.5 immediately after tap water exposure.
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
                    your water routine.
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
                    Skin Story helps you track environmental changes and skin comfort.
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
