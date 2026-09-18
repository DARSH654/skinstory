import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog17() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">

              <p>
                Alcohol consumption triggers immediate and multi-systemic facial skin reactions that manifest within hours of ingestion. From morning-after facial puffiness and persistent cheek flushing to delayed inflammatory acne flares 48 hours later, ethanol metabolic breakdown products directly impair epidermal homeostasis. <Link href="/blog/how-does-dehydration-directly-affect-skin-elasticity" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How does dehydration directly affect skin elasticity?</Link> Alcohol acts as a potent diuretic, compounding cellular dehydration across all skin layers.
              </p>

              <p>
                When liver enzymes metabolize ethanol, they convert it into <strong className="font-semibold text-zinc-950 dark:text-white">Acetaldehyde</strong>—a highly reactive toxic compound that stimulates histamine release and dilates peripheral facial capillaries.
              </p>

              {/* Fast Fact Box */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                  CORE PATTERN KEY
                </p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  Alcohol suppresses <strong className="text-zinc-950 dark:text-white font-bold">Vasopressin (Anti-Diuretic Hormone)</strong> in the pituitary gland. For every alcoholic drink consumed, kidneys excrete 4x more fluid than ingested, stripping deep dermal reserves rapidly.
                </p>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The Metabolic Alcohol-Skin Flare Cycle
              </h2>

              <p>
                The physiological steps connecting evening drink consumption with morning skin degradation:
              </p>

              <ul className="space-y-4 pl-1 my-6">
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Acetaldehyde Vasodilation:</strong> Toxic metabolites cause persistent vasodilation of facial venules, leading to chronic rosacea-like flushing across cheeks.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">REM Sleep Architecture Collapse:</strong> Alcohol disrupts REM sleep cycles, elevating nocturnal cortisol and suppressing overnight growth hormone repair.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Congestive rebound Sebum Surge:</strong> Sugary mixed drinks spike insulin and IGF-1, causing delayed inflammatory pustules 48 hours post-drinking.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Alcohol Beverage Type &amp; Skin Pathology Matrix
              </h2>

              <p>
                Comparing the dermatological impact of different alcoholic beverages. <Link href="/blog/does-sugar-really-cause-hormonal-acne-spikes" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Does sugar really cause hormonal acne spikes?</Link> High-sugar cocktails double skin damage.
              </p>

              {/* Comparison Table */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Beverage Category vs. Specific Skin Pathology
              </h3>

              <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Alcohol Type</th>
                      <th className="py-3.5 px-4 font-bold">Histamine &amp; Congener Level</th>
                      <th className="py-3.5 px-4 font-bold">Primary Facial Manifestation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Red Wine</td>
                      <td className="py-3 px-4">Extreme (High histamine &amp; sulfites)</td>
                      <td className="py-3 px-4">Immediate facial flushing, rosacea flare-ups, capillary dilation</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Sugary Cocktails / Mixers</td>
                      <td className="py-3 px-4">High (Added refined fructose)</td>
                      <td className="py-3 px-4">IGF-1 insulin spike, cystic jawline breakouts 48h later</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Clear Spirits (Vodka / Gin)</td>
                      <td className="py-3 px-4">Low (Minimal congeners)</td>
                      <td className="py-3 px-4">Dehydration &amp; dull skin texture; lower inflammatory flare risk</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The 4-Step Post-Alcohol Skin Recovery Protocol
              </h2>

              <p>
                Mitigate alcohol-induced skin flushing and dehydration with this targeted protocol:
              </p>

              <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Drink 500ml water with electrolytes before sleeping:</strong> Restore vasopressin-depleted mineral reserves to prevent overnight dermal water loss.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Apply cold-compressed Niacinamide in the morning:</strong> Niacinamide constricts dilated micro-capillaries while strengthening barrier lipid synthesis.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Pause all active retinoids and acids for 24 hours:</strong> <Link href="/blog/how-long-does-it-take-to-repair-a-damaged-skin-barrier" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How long does it take to repair a damaged skin barrier?</Link> Avoid applying strong actives to heat-flushed, dehydrated skin.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Use an occlusive ceramide mask overnight:</strong> Seal in remaining surface hydration to counteract vasopressin suppression.
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
                        Observe
                      </span>
                      <span
                        className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                        aria-hidden="true"
                      />
                    </span>{" "}
                    your daily triggers.
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
                    Skin Story helps you log lifestyle habits and track skin clarity changes.
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
