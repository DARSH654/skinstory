import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog15() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">

              <p>
                Recurring pimples that flare up, heal, and then reappear in the exact same millimeter of skin are among the most frustrating acne patterns. Many people assume this is bad luck or persistent surface dirt. However, localized recurring breakouts indicate a structural or vascular anomaly deep within that specific pilosebaceous unit. <Link href="/blog/why-does-stress-cause-breakouts-on-your-chin" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why does stress cause breakouts on your chin?</Link> Stress hormones selectively activate these pre-damaged, hyper-sensitive follicles first.
              </p>

              <p>
                When a deep cystic papule forms, it alters the microscopic pore canal wall permanently. If a cyst pops or is squeezed, the follicle wall ruptures under pressure, forming a microscopic scar pocket beneath the skin surface that traps sebum repeatedly.
              </p>

              {/* Fast Fact Box */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                  CORE PATTERN KEY
                </p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  Recurring spots are frequently <strong className="text-zinc-950 dark:text-white font-bold">sub-dermal sinus tracts (epithelialized tunnels)</strong>. Once a deep cyst forms a sinus tract, standard surface spot treatments cannot reach the base of the cavity.
                </p>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The Anatomy of Same-Spot Breakout Memory
              </h2>

              <p>
                Why specific pores retain a "memory" for inflammation:
              </p>

              <ul className="space-y-4 pl-1 my-6">
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Ruptured Follicular SAC:</strong> The original inflammatory lesion ruptures the basement membrane. Repair collagen heals around a compressed pocket rather than restoring a straight pore canal.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Localized Androgen Receptor Density:</strong> Specific facial zones contain clusters of sebocytes with 3x higher 5α-reductase enzyme density.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Biofilm Persistence:</strong> Anaerobic <em>C. acnes</em> forms protective polysaccharide biofilms inside sac cavities that resist topical benzoyl peroxide.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Random Breakouts vs. Same-Spot Recurring Lesions
              </h2>

              <p>
                Comparing general acne flares to localized sinus tract lesions. <Link href="/blog/can-dairy-trigger-cystic-acne-on-your-jawline" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Can dairy trigger cystic acne on your jawline?</Link> Systemic dietary triggers target localized structural pockets first.
              </p>

              {/* Comparison Table */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Random Surface Blemishes vs. Anatomical Same-Spot Lesions
              </h3>

              <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Lesion Feature</th>
                      <th className="py-3.5 px-4 font-bold">Random Surface Pustule</th>
                      <th className="py-3.5 px-4 font-bold">Same-Spot Recurring Cyst</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Underlying Sub-structure</td>
                      <td className="py-3 px-4">Normal, straight follicular canal</td>
                      <td className="py-3 px-4">Ruptured canal sac or sub-dermal sinus tract</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Recurrence Frequency</td>
                      <td className="py-3 px-4">Isolated occurrence (Heals &amp; does not return)</td>
                      <td className="py-3 px-4">Flares every 28–30 days in identical position</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Palpable Sub-surface Sensation</td>
                      <td className="py-3 px-4">None once surface lesion flattens</td>
                      <td className="py-3 px-4">Small deep nodular knot remains felt under skin even when calm</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The 4-Step Protocol to Clear Same-Spot Acne
              </h2>

              <p>
                Break the cycle of localized same-spot breakouts with this targeted protocol:
              </p>

              <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Never extract or squeeze deep nodular spots:</strong> Mechanical popping ruptures the basement sac further, expanding the sinus pocket and guaranteeing future recurrence.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Apply micro-dart hydrocolloid patches early:</strong> Deliver targeted salicylic acid and tea tree deep into the sub-dermal pocket before surface swelling occurs.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Maintain continuous retinoid application even when clear:</strong> Do not stop applying retinoid to the spot when it flattens; continue for 8 weeks post-clearance to remodel scar tissue.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Consult a dermatologist for intralesional corticosteroid injection:</strong> <Link href="/blog/why-does-stress-cause-breakouts-on-your-chin" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why does stress cause breakouts on your chin?</Link> A targeted dilute steroid shot collapses chronic sinus tracts permanently.
                </li>
              </ol>

              
              {/* Related Guide Cards */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
                Related Pattern Guides
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <Link
                  href="/blog/why-does-stress-cause-breakouts-on-your-chin"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    Why Does Stress Cause Breakouts on Your Chin?
                  </p>
                  <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  href="/blog/can-changing-your-pillowcase-frequently-actually-stop-acne"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    Can Changing Your Pillowcase Frequently Actually Stop Acne?
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
                    your recurring spots.
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
                    Skin Story helps you log breakout locations and discover hidden triggers.
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
