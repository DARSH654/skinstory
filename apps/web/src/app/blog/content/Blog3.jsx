import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog3() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">
      <p>
        The relationship between dietary sugar and acne is a frequent topic in skin health discussions. The key focus is how post-meal glycemic surges interact with internal hormone signals and oil production over time. <Link href="/blog/why-does-stress-cause-breakouts-on-your-chin" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Just as stress can influence chin breakouts</Link>, dietary factors can also play a role in skin clarity.
      </p>

      <p>
        Consuming high-glycemic foods can trigger rapid spikes in blood sugar and insulin. In response, insulin and related growth factors signal glands to produce more sebum, which can contribute to clogged pores. <Link href="/blog/can-lack-of-sleep-lead-to-dull-skin-and-dark-circles" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Can lack of sleep lead to dull skin and dark circles?</Link> Irregular sleep can further compound metabolic responses.
      </p>

      {/* Fast Fact Box */}
      <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
          CORE PATTERN KEY
        </p>
        <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
          High-glycemic meals can increase insulin signals that encourage oil production. Because skin reactions take a few days to show, logging your meals helps highlight patterns.
        </p>
      </div>

      {/* Image in middle */}
      <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden my-10 shadow-sm border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
        <img
          src="/blog-diet-veggies.jpg"
          alt="Balanced diet for clear skin"
          className="w-full h-full object-cover"
        />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Understanding Glycemic Response and Sebum
      </h2>

      <p>
        When refined carbohydrates are consumed, blood glucose rises quickly. Key ways diet influences skin include:
      </p>

      <ul className="space-y-4 pl-1 my-6">
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Increased oil production:</strong> Higher insulin levels can encourage sebaceous glands to secrete more oil.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
          <span>
            <strong className="text-zinc-950 dark:text-white font-bold">Follicular buildup:</strong> Sticky oil can trap dead skin cells inside pores more easily.
          </span>
        </li>
      </ul>

      {/* Comparison Table */}
      <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Glycemic Impact Overview
      </h3>

      <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
            <tr>
              <th className="py-3.5 px-4 font-bold">Food Category</th>
              <th className="py-3.5 px-4 font-bold">Glycemic Profile</th>
              <th className="py-3.5 px-4 font-bold">General Skin Response</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <tr>
              <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Refined Grains &amp; Sugars</td>
              <td className="py-3 px-4">High Glycemic Index</td>
              <td className="py-3 px-4">May trigger rapid insulin and oil surges</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Whole Grains &amp; Legumes</td>
              <td className="py-3 px-4">Low Glycemic Index</td>
              <td className="py-3 px-4">Slower glucose release and steady energy</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
        Balanced Nutrition Habits
      </h2>

      <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">Choose fiber-rich whole foods:</strong> Complex carbs promote steady blood sugar levels.
        </li>
        <li className="leading-relaxed">
          <strong className="text-zinc-950 dark:text-white font-bold">Pair carbs with protein and healthy fats:</strong> Adding protein or healthy fats helps slow sugar absorption.
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
          href="/blog/how-does-high-glycemic-food-affect-sebum-production"
          className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
        >
          <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
            How Does High Glycemic Food Affect Sebum Production?
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
            your dietary habits.
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
            Skin Story helps you log daily meals and observe how your skin responds over time.
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
