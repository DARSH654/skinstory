import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog14() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">

              <p>
                When oily skin or persistent clogged pores appear, the most common instinct is to scrub harder and apply chemical exfoliating acids more frequently. Paradoxically, aggressive over-exfoliation triggers a severe physiological feedback loop: it strips essential surface lipids, causing skin to produce <em>significantly more oil</em> to compensate for barrier loss. <Link href="/blog/how-long-does-it-take-to-repair-a-damaged-skin-barrier" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How long does it take to repair a damaged skin barrier?</Link> Rebound seborrhea is one of the clearest clinical signals of acid-induced barrier damage.
              </p>

              <p>
                When you strip the stratum corneum of its natural ceramides and cholesterol through daily AHA/BHA overuse or scrub brushes, your skin detects acute moisture depletion. Sebaceous glands respond by surging sebum secretion within 2 to 4 hours of washing.
              </p>

              {/* Fast Fact Box */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                  CORE PATTERN KEY
                </p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  Over-exfoliated skin creates <strong className="text-zinc-950 dark:text-white font-bold">"tight yet shiny" dehydration-oiliness</strong>. Your face feels uncomfortably tight when smiling, yet develops a slick, reflective shine within an hour of cleansing.
                </p>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The Rebound Seborrhea Physiological Feedback Loop
              </h2>

              <p>
                How over-exfoliation turns a oily skin concern into a chronic breakdown loop:
              </p>

              <ul className="space-y-4 pl-1 my-6">
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Desmosome Degradation:</strong> Excessive acid application dissolves desmosomes (cellular rivets holding corneocytes together) indiscriminately, stripping living cells alongside dead ones.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Reactive Sebaceous Gland Activation:</strong> Interleukin-1α surges in response to micro-damage, signaling sebocytes to double sebum outflow to form an emergency crude lipid seal.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Clogged Pores from Sticky Rebound Sebum:</strong> Rebound sebum is poor in hydration-binding lipids and rich in sticky squalene, clogging pores faster than before.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Healthy Exfoliation vs. Over-Exfoliation Matrix
              </h2>

              <p>
                Identifying whether your current exfoliation frequency is clinical or destructive. <Link href="/blog/why-do-pores-look-noticeably-larger-when-skin-is-oily" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why do pores look noticeably larger when skin is oily?</Link> Rebound oil distends pore openings further.
              </p>

              {/* Comparison Table */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Exfoliation State vs. Sebum &amp; Barrier Outcome
              </h3>

              <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Exfoliation Regimen</th>
                      <th className="py-3.5 px-4 font-bold">Surface Texture &amp; Sensation</th>
                      <th className="py-3.5 px-4 font-bold">Sebum Outflow &amp; Pore Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Optimal Exfoliation (1–3x / week)</td>
                      <td className="py-3 px-4">Smooth, soft micro-relief; zero stinging</td>
                      <td className="py-3 px-4">Balanced sebum flow; tight, clean pore canals</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Over-Exfoliated (Daily AHAs/BHAs)</td>
                      <td className="py-3 px-4">Waxy, plastic-like shine; tight sensation</td>
                      <td className="py-3 px-4">Severe rebound seborrhea within 60 mins of washing</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Severe Acid Burn / Friction Damage</td>
                      <td className="py-3 px-4">Persistent redness, burning with water, raw patches</td>
                      <td className="py-3 px-4">Compromised barrier; rash-like micro-pustule breakouts</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The 4-Step Rebound Oil Reset Protocol
              </h2>

              <p>
                Halt rebound seborrhea and restore healthy oil-water balance with this clinical reset:
              </p>

              <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Implement an immediate 14-day acid fast:</strong> Stop all Glycolic Acid, Salicylic Acid, Lactic Acid, Mandelic Acid, and physical scrubs.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Hydrate with lightweight water-binding humectants:</strong> Apply Glycerin or Hyaluronic Acid to damp skin to supply water without triggering oil gland overload.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Incorporate Niacinamide at 3–5% concentrations:</strong> Niacinamide actively slows down hyperactive sebocyte oil secretion while repairing lipid ceramides.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Cap future exfoliation to a maximum of 2x per week:</strong> <Link href="/blog/should-you-use-retinol-every-night-or-cycle-it" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Should you use retinol every night or cycle it?</Link> Once healed, separate exfoliating nights from retinoid nights entirely.
                </li>
              </ol>

              
              {/* Related Guide Cards */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
                Related Pattern Guides
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <Link
                  href="/blog/how-long-does-it-take-to-repair-a-damaged-skin-barrier"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    How Long Does It Take to Repair a Damaged Skin Barrier?
                  </p>
                  <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  href="/blog/should-you-use-retinol-every-night-or-cycle-it"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    Should You Use Retinol Every Night or Cycle It?
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
                        Monitor
                      </span>
                      <span
                        className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                        aria-hidden="true"
                      />
                    </span>{" "}
                    your barrier health.
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
                    Skin Story helps you track moisture balance and exfoliation frequency.
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
