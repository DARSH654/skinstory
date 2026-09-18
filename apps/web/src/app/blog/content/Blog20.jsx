import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog20() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">

              <p>
                The Gut-Skin Axis is one of the most rapidly expanding fields in dermatological science, proving that persistent facial redness, acne, and eczema are frequently systemic manifestations of intestinal dysbiosis. When intestinal lining integrity breaks down, lipopolysaccharides (LPS endotoxins) leak into systemic blood circulation, triggering low-grade inflammatory cascades across facial skin follicles. <Link href="/blog/can-dairy-trigger-cystic-acne-on-your-jawline" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Can dairy trigger cystic acne on your jawline?</Link> Dietary triggers alter gut microflora diversity long before skin symptoms appear.
              </p>

              <p>
                Intestinal hyper-permeability ("Leaky Gut") allows bacterial endotoxins to activate Toll-Like Receptors (TLR-4) in facial sebocytes, upregulating inflammatory cytokines IL-1α and TNF-α.
              </p>

              {/* Fast Fact Box */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                  CORE PATTERN KEY
                </p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  Beneficial gut bacteria ferment dietary fiber into <strong className="text-zinc-950 dark:text-white font-bold">Short-Chain Fatty Acids (SCFAs: Acetate, Propionate, Butyrate)</strong>. SCFAs suppress systemic skin inflammation and reinforce epidermal barrier lipid synthesis from within.
                </p>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The Gut-Skin Axis Biological Transmission Pathway
              </h2>

              <p>
                How intestinal microbiome imbalances transmit signals to facial skin:
              </p>

              <ul className="space-y-4 pl-1 my-6">
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">LPS Endotoxin Translocation:</strong> Gram-negative gut bacteria release lipopolysaccharides that cross compromised intestinal walls, entering facial skin capillaries.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Sub-Clinical Substance P Release:</strong> Intestinal nerve irritation triggers neuropeptide Substance P, which stimulates facial sebaceous glands to produce viscous inflammatory sebum.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">SCFA Deficiency:</strong> Low dietary fiber starves *Bifidobacterium* strains, reducing systemic anti-inflammatory signaling to facial melanocytes and keratinocytes.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Gut Microbiome Status vs. Facial Skin Pathology
              </h2>

              <p>
                Comparing balanced intestinal microflora with dysbiosis outcomes on facial skin. <Link href="/blog/does-sugar-really-cause-hormonal-acne-spikes" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Does sugar really cause hormonal acne spikes?</Link> High-sugar diets select for pro-inflammatory gut species.
              </p>

              {/* Comparison Table */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Intestinal Microbiome Health vs. Facial Skin Manifestation
              </h3>

              <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Intestinal Microbiome State</th>
                      <th className="py-3.5 px-4 font-bold">Systemic SCFA &amp; Endotoxin Balance</th>
                      <th className="py-3.5 px-4 font-bold">Facial Skin Manifestation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Eubiosis (Balanced Microflora)</td>
                      <td className="py-3 px-4">High Butyrate &amp; Acetate; Zero LPS translocation</td>
                      <td className="py-3 px-4">Clear complexion, rapid wound healing, strong barrier resilience</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Mild Dysbiosis (Low Fiber Diet)</td>
                      <td className="py-3 px-4">Reduced SCFA production</td>
                      <td className="py-3 px-4">Sub-clinical facial redness, mild pore congestion, slower healing</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Intestinal Hyper-Permeability</td>
                      <td className="py-3 px-4">High circulating LPS endotoxins &amp; Substance P</td>
                      <td className="py-3 px-4">Persistent inflammatory acne, rosacea flares, high sensitivity</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The 4-Step Gut-Skin Axis Restoration Protocol
              </h2>

              <p>
                Restore gut mucosal barrier integrity and calm facial inflammation from within:
              </p>

              <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Consume 30g diverse prebiotic plant fiber daily:</strong> Feed *Bifidobacterium* species with chicory root, Jerusalem artichoke, garlic, and leeks to maximize SCFA Butyrate output.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Incorporate spore-forming Probiotics (Bacillus coagulans):</strong> Spore probiotics survive gastric acid to colonize the lower intestine and reduce LPS endotoxin translocation.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Supplement with L-Glutamine (3–5g daily):</strong> L-Glutamine provides energy for enterocytes, restoring tight junction proteins in the intestinal lining.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Minimize artificial sweeteners and ultra-processed emulsifiers:</strong> <Link href="/blog/does-sugar-really-cause-hormonal-acne-spikes" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Does sugar really cause hormonal acne spikes?</Link> Synthetic emulsifiers strip mucosal gut lining layers.
                </li>
              </ol>

              
              {/* Related Guide Cards */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
                Related Pattern Guides
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <Link
                  href="/blog/can-dairy-trigger-cystic-acne-on-your-jawline"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    Can Dairy Trigger Cystic Acne on Your Jawline?
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
                        Understand
                      </span>
                      <span
                        className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                        aria-hidden="true"
                      />
                    </span>{" "}
                    your skin response.
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
                    Skin Story helps you observe dietary patterns and skin comfort trends.
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
