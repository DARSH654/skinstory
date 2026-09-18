import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog13() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">

              <p>
                Retinoids (Retinol, Tretinoin, Adapalene) are the gold standard of dermatological skincare for a reason: they bind directly to retinoic acid receptors (RARs) in keratinocytes to accelerate cell turnover and boost collagen synthesis. However, the age-old debate remains: <em>Is nightly application superior to Skin Cycling?</em> <Link href="/blog/why-is-my-skin-purging-instead-of-clearing-up" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why is my skin purging instead of clearing up?</Link> Applying retinoids every single night before your skin reaches retinization triggers chronic irritation rather than clinical progress.
              </p>

              <p>
                Skin Cycling—a 4-night rotating routine consisting of Night 1 (Exfoliation), Night 2 (Retinoid), Night 3 (Recovery), and Night 4 (Recovery)—was developed to maximize retinoid benefits while allowing the stratum corneum lipid barrier time to rebuild between active doses.
              </p>

              {/* Fast Fact Box */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                  CORE PATTERN KEY
                </p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  Full epidermal <strong className="text-zinc-950 dark:text-white font-bold">retinization takes 4 to 12 weeks</strong>. Applying retinoids nightly before achieving retinization leads to barrier breakdown, sub-clinical inflammation, and premature discontinuation.
                </p>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The Science of Retinization vs. Barrier Recovery
              </h2>

              <p>
                What happens at the cellular level during nightly retinoid use vs. cycling:
              </p>

              <ul className="space-y-4 pl-1 my-6">
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Stratum Corneum Thinning (Initial Phase):</strong> Retinoids compact the top layer of dead skin cells during early use, increasing temporary susceptibility to TEWL and stinging.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Recovery Night Lipid Synthesis:</strong> Skin Cycling recovery nights allow ceramides and cholesterol to replenish, keeping the skin barrier fully functional while benefiting from retinoids.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Long-Term Dermal Thickening:</strong> Once retinization is fully established, daily application increases collagen density in the deeper dermis without causing surface flaking.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Nightly Retinoid vs. Skin Cycling Comparison
              </h2>

              <p>
                Evaluating which method fits your current skin barrier state. <Link href="/blog/how-long-does-it-take-to-repair-a-damaged-skin-barrier" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How long does it take to repair a damaged skin barrier?</Link> Skin cycling prevents barrier damage before it starts.
              </p>

              {/* Comparison Table */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Nightly Retinol Application vs. Classic Skin Cycling
              </h3>

              <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Application Regimen</th>
                      <th className="py-3.5 px-4 font-bold">Ideal Candidate</th>
                      <th className="py-3.5 px-4 font-bold">Primary Benefit &amp; Risk Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Classic 4-Night Skin Cycling</td>
                      <td className="py-3 px-4">Beginners, sensitive skin, reactive barrier</td>
                      <td className="py-3 px-4">High barrier safety; slow &amp; steady collagen results without redness</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Advanced Nightly Retinoid</td>
                      <td className="py-3 px-4">Fully retinized skin (6+ months consistent use)</td>
                      <td className="py-3 px-4">Maximum collagen stimulation; risk of chronic flaking if barrier drops</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Sandwich Method (Moisturizer-Retinol-Moisturizer)</td>
                      <td className="py-3 px-4">Dry skin types wanting higher frequency</td>
                      <td className="py-3 px-4">Buffers irritation while allowing 3–4x weekly application</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The 4-Night Skin Cycling Protocol
              </h2>

              <p>
                Follow this clinically proven 4-night rotating schedule to introduce retinoids safely:
              </p>

              <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Night 1 (Exfoliate):</strong> Cleanse, dry, and apply a gentle chemical exfoliant (BHA or AHA) to sweep away dead surface cells so the retinoid penetrates evenly the next night.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Night 2 (Retinoid):</strong> Cleanse, ensure skin is bone-dry, and apply a pea-sized amount of Retinol or Tretinoin followed by a basic moisturizer.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Night 3 (Recover):</strong> Pause all active ingredients. Hydrate deeply with Hyaluronic Acid and a ceramide-rich moisturizer.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Night 4 (Recover):</strong> <Link href="/blog/why-is-my-skin-purging-instead-of-clearing-up" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why is my skin purging instead of clearing up?</Link> Repeat recovery night to reinforce lipid barrier thickness before restarting the cycle on Night 1.
                </li>
              </ol>

              
              {/* Related Guide Cards */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
                Related Pattern Guides
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <Link
                  href="/blog/why-is-my-skin-purging-instead-of-clearing-up"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    Why Is My Skin Purging Instead of Clearing Up?
                  </p>
                  <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  href="/blog/can-over-exfoliating-make-your-face-more-oily"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    Can Over-Exfoliating Make Your Face More Oily?
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
                        Track
                      </span>
                      <span
                        className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                        aria-hidden="true"
                      />
                    </span>{" "}
                    your retinization routine.
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
                    Skin Story helps you observe skin tolerance during active ingredient cycling.
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
