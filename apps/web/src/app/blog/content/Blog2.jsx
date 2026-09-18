import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog2() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">

              <p>
                Everyone has experienced the morning-after effect of a terrible night's sleep: a pale, sunken complexion, visible puffiness under the eyes, and a dull, lifeless texture that no moisturiser seems to fix. But this is not simply cosmetic. The cellular mechanisms behind sleep deprivation and skin deterioration are deeply physiological. <Link href="/blog/why-does-stress-cause-breakouts-on-your-chin" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why does stress cause breakouts on your chin?</Link> Stress and sleep share the same hormonal highway: elevated cortisol overnight is the direct bridge between a restless night and a reactive complexion the next morning.
              </p>

              <p>
                Dermatological research confirms that sleep deprivation measurably degrades perceived skin health across four dimensions: radiance, evenness of tone, barrier integrity, and fine-line depth. What most people miss is how rapidly these changes accumulate. Two consecutive nights below six hours of sleep is clinically sufficient to produce visible transepidermal water loss (TEWL) increases of up to 30%, measurable under laboratory conditions.
              </p>

              {/* Fast Fact Box */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                  CORE PATTERN KEY
                </p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  During Stage 3 non-REM deep sleep, your body releases human growth hormone (HGH). This is the primary driver of overnight cellular renewal. Cutting sleep short reduces this essential repair window.
                </p>
              </div>

              {/* Image 2 */}
              <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden my-10 shadow-sm border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                <img
                  src="/blog-sleep-dark-circles.jpg"
                  alt="Sleep deprivation and cortisol impact on skin barrier diagram"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The HGH Window and Why It Cannot Be Hacked
              </h2>

              <p>
                Human growth hormone secretion is tightly linked to slow-wave sleep (SWS) — specifically the deep sleep phases that occur in the first half of the night. When sleep is shortened or fragmented by late-night screen exposure, slow-wave sleep duration decreases.
              </p>

              <ul className="space-y-4 pl-1 my-6">
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Collagen synthesis slows:</strong> Fibroblasts in the dermis rely on overnight recovery. Less deep sleep means reduced overnight repair, contributing to long-term skin thinning.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Epidermal cell turnover slows:</strong> Cell proliferation in the basal layer relies on nocturnal rest. Sluggish turnover lets dead surface cells accumulate, creating visible dullness.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Barrier lipid replenishment slows:</strong> Ceramide and fatty acid synthesis in the stratum corneum decreases during poor sleep, raising sensitivity to environmental factors.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Dark Circles: The Periorbital Vascular Mechanism
              </h2>

              <p>
                Dark circles are often a vascular and structural effect amplified by poor sleep. Under sleep deprivation, cortisol keeps small capillaries in a dilated state overnight. Blood pools in the delicate periorbital tissue under the eye, creating visible blue-purple tones through thin skin.
              </p>

              <p>
                Simultaneously, fluid distribution overnight is affected when sleep is shallow. <Link href="/blog/how-long-does-it-take-to-repair-a-damaged-skin-barrier" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How long does it take to repair a damaged skin barrier?</Link> Supporting the skin barrier helps maintain hydration levels throughout the day.
              </p>

              {/* Comparison Table */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Good Sleep vs. Poor Sleep: Measurable Skin Outcomes
              </h3>

              <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Skin Metric</th>
                      <th className="py-3.5 px-4 font-bold">7–9 hrs Quality Sleep</th>
                      <th className="py-3.5 px-4 font-bold">Under 6 hrs Sleep</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">HGH Secretion</td>
                      <td className="py-3 px-4">Full nocturnal surge</td>
                      <td className="py-3 px-4">Suppressed SWS window</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Cortisol Level</td>
                      <td className="py-3 px-4">Lowest point of the day overnight</td>
                      <td className="py-3 px-4">Elevated overnight</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">TEWL (Barrier Loss)</td>
                      <td className="py-3 px-4">Normal lipid replenishment</td>
                      <td className="py-3 px-4">Increased moisture loss</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The Clinical Sleep-to-Skin Recovery Protocol
              </h2>

              <p>
                Addressing sleep-related skin changes requires both improving sleep routines and supporting the skin barrier during busy periods.
              </p>

              <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Protect your wind-down time:</strong> Limit bright screens before bed to support natural sleep onset and deep sleep cycles.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Apply a hydrating moisturizer before sleep:</strong> Ceramide-rich creams help lock in moisture overnight.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Use a cool compress in the morning:</strong> A brief cool compress over the eye area helps soothe morning puffiness.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Track your daily habits:</strong> <Link href="/blog/why-does-stress-cause-breakouts-on-your-chin" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Understanding how your sleep correlates with skin appearance</Link> helps you build consistent routines.
                </li>
              </ol>

              
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
                Related Pattern Guides
              </h3>

              

              
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
          href="/blog/how-does-dehydration-directly-affect-skin-elasticity"
          className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
        >
          <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
            How Does Dehydration Directly Affect Skin Elasticity?
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
                    your skin patterns.
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
                    Skin Story helps you log daily sleep habits and track skin clarity over time.
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
