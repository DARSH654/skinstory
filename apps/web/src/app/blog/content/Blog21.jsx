import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog21() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">
      <p>
        The T-Zone (forehead, nose, and chin) contains up to 800 sebaceous glands per square centimeter—nearly double the concentration found on your cheeks. This physiological distribution is designed to maintain micro-lipid protection over high-movement facial zones, but under hormonal or thermal stress, hyper-secretion leads to localized pore congestion. <Link href="/blog/why-do-pores-look-noticeably-larger-when-skin-is-oily" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why do pores look noticeably larger when skin is oily?</Link> Sebum pool pooling stretches follicular walls.
      </p>

      {/* Fast Fact Box */}
      <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
          CORE PATTERN KEY
        </p>
        <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
          T-Zone sebocytes exhibit up to 3x higher enzyme 5-alpha reductase activity, converting circulating testosterone into potent dihydrotestosterone (DHT) directly within the pore follicle.
        </p>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Why Sebum Concentration Differs Across Facial Zones
      </h2>

      <p>
        Key physiological mechanisms causing T-Zone hyper-production while cheeks remain dry or normal:
      </p>

      <ul className="space-y-4 pl-1 my-6">
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Follicular Density Gradient:</strong> Central facial zones possess high-density pilosebaceous units designed to trap humidity and shield against environmental exposure.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Androgen Receptor Density:</strong> T-Zone sebocytes express elevated androgen receptor sites, amplifying sebum secretion responses to mild emotional stress or cortisol spikes.
          </span>
        </li>
      </ul>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Facial Zone Comparison: T-Zone vs. Lateral Cheeks
      </h2>

      {/* Comparison Table */}
      <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950 shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
            <tr>
              <th className="py-3.5 px-4 font-bold">Facial Zone</th>
              <th className="py-3.5 px-4 font-bold">Sebaceous Gland Density</th>
              <th className="py-3.5 px-4 font-bold">Primary Sebum Components</th>
              <th className="py-3.5 px-4 font-bold">Common Skin Concerns</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
            <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">T-Zone (Forehead &amp; Nose)</td>
              <td className="py-3 px-4">400 – 800 glands/cm²</td>
              <td className="py-3 px-4">Squalene, Wax Esters, Triglycerides</td>
              <td className="py-3 px-4">Blackheads, enlarged pores, oil shine</td>
            </tr>
            <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">U-Zone (Cheeks &amp; Jaw)</td>
              <td className="py-3 px-4">100 – 300 glands/cm²</td>
              <td className="py-3 px-4">Cholesterol, Free Fatty Acids</td>
              <td className="py-3 px-4">Dehydration flaking, barrier breakdown</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Targeted Zone-Based Balancing Steps
      </h2>

      <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">Multi-masking with 2% Salicylic Acid:</strong> Apply BHA exclusively to the T-Zone to dissolve lipid congestion without drying cheek lipid barriers.
        </li>
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">Use Niacinamide (2-5%) daily:</strong> Regulates sebum synthesis in high-density sebaceous zones without causing moisture loss on lateral cheeks.
        </li>
      </ol>

      

      
      
      {/* Related Guide Cards */}
      <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
        Related Pattern Guides
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <Link
          href="/blog/why-do-pores-look-noticeably-larger-when-skin-is-oily"
          className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
        >
          <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
            Why Do Pores Look Noticeably Larger When Skin Is Oily?
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
                Observe
              </span>
              <span
                className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                aria-hidden="true"
              />
            </span>{" "}
            your T-zone balance.
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
            Skin Story helps you log zone-specific oiliness and daily comfort.
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
