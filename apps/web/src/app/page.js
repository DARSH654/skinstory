"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Star, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <main className="w-full bg-white text-zinc-900 pt-12 sm:pt-20 pb-20 px-6 sm:px-12">
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* LEFT COLUMN: Content & Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* Top Badge: Proportionally scaled pill (avatars, text, height, and paddings) */}
          <div className="inline-flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-white border border-zinc-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-3.5 select-none">
            {/* Overlapping user avatars */}
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-[34px] w-[34px] rounded-full ring-2 ring-white object-cover"
                src="/avatar-user.jpg"
                alt="Member"
              />
              <img
                className="inline-block h-[34px] w-[34px] rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces"
                alt="Member"
              />
              <img
                className="inline-block h-[34px] w-[34px] rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces"
                alt="Member"
              />
            </div>
            <span className="text-[13.5px] sm:text-sm font-medium text-zinc-700 tracking-tight flex items-center gap-1">
              <span><strong className="font-semibold text-zinc-950">4,192</strong> on waitlist</span>
              {/* 6.5px dot with black border and minimal gap */}
              <span className="inline-block w-[6.5px] h-[6.5px] rounded-full bg-[#937abd] border border-black shrink-0" />
              <span className="text-zinc-600">500 early members secured</span>
            </span>
          </div>

          {/* Headings: Shifted upwards with reduced gaps */}
          <div className="mb-3.5 space-y-1.5">
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-semibold tracking-tight text-zinc-950 leading-[1.08] font-[family-name:var(--font-outfit)]">
              Meet Skin Story
            </h1>
            <h2 className="text-3xl sm:text-5xl lg:text-[50px] font-normal tracking-tight text-zinc-800 leading-[1.16]">
              {/* Line 1: Stop guessing. See the exact */}
              <span className="block">
                Stop guessing. See the{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 font-medium text-zinc-950">exact</span>
                  <span
                    className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] rounded-[2px] -z-0"
                    aria-hidden="true"
                  />
                </span>
              </span>
              {/* Line 2: insights you've been missing. */}
              <span className="block">
                <span className="relative inline-block">
                  <span className="relative z-10 font-medium text-zinc-950">insights</span>
                  <span
                    className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] rounded-[2px] -z-0"
                    aria-hidden="true"
                  />
                </span>{" "}
                you&apos;ve been missing.
              </span>
            </h2>
          </div>

          {/* Subtitle: Shifted upwards */}
          <p className="text-sm sm:text-base text-zinc-600 max-w-xl mb-3.5 leading-relaxed font-normal">
            We use technology which filters out background noise to the iris by neutralizing the light angle and isolating skin-level data. It extracts pinpoint-accurate insights without the guesswork.
          </p>

          {/* Email Capture / Call To Action Form - Pill Shaped, Off-White/White, White/Soft Shadow */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="w-full max-w-md mb-1.5">
              <div className="flex items-center p-1.5 bg-zinc-50/80 hover:bg-white focus-within:bg-white rounded-full border border-zinc-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-within:border-zinc-300 transition-all">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 min-w-0 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 bg-transparent outline-hidden"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#937abd] rounded-full hover:bg-[#856db0] active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>{t("nav.earlyAccess") || "Get Early Access"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          ) : (
            <div className="w-full max-w-md p-3.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 mb-1.5 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold">
                You’re on the early access waitlist! We will notify you soon.
              </span>
            </div>
          )}

          {/* Microcopy: Tightened gap */}
          <p className="text-xs text-zinc-500 font-medium pl-3">
            Only 108 early member spots remaining.
          </p>
        </div>

        {/* RIGHT COLUMN: Hero Phones Image (5 cols) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
          <img
            src="/hero-phones.webp"
            alt="App Preview"
            className="w-full max-w-[440px] sm:max-w-[480px] lg:max-w-none h-auto object-contain drop-shadow-xl select-none pointer-events-none"
          />
        </div>

      </div>

      {/* 1. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto mt-28 sm:mt-36">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 mb-3 font-[family-name:var(--font-outfit)]">
            How the Tech DSG{" "}
            <span className="relative inline-block whitespace-nowrap underline decoration-[#937abd] decoration-2 underline-offset-8">
              Really Works
            </span>
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base mt-2 font-normal">
            Three simple steps to isolate skin-level metrics without guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 1 */}
          <div className="p-7 sm:p-8 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 hover:border-zinc-300 transition-all">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white border border-zinc-200 text-sm font-bold text-zinc-900 shadow-2xs mb-5">
              01
            </span>
            <h3 className="text-xl font-semibold text-zinc-950 mb-2">Neutralize Angle & Light</h3>
            <p className="text-sm text-zinc-600 leading-relaxed font-normal">
              Filters out glare, shadows, and reflection angles directly around the iris to create an optical baseline.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-7 sm:p-8 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 hover:border-zinc-300 transition-all">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white border border-zinc-200 text-sm font-bold text-zinc-900 shadow-2xs mb-5">
              02
            </span>
            <h3 className="text-xl font-semibold text-zinc-950 mb-2">Isolate Dermal Signals</h3>
            <p className="text-sm text-zinc-600 leading-relaxed font-normal">
              Extracts redness, pore density, and hydration markers while completely stripping out ambient room distortion.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-7 sm:p-8 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 hover:border-zinc-300 transition-all">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white border border-zinc-200 text-sm font-bold text-zinc-900 shadow-2xs mb-5">
              03
            </span>
            <h3 className="text-xl font-semibold text-zinc-950 mb-2">Real Daily Progress</h3>
            <p className="text-sm text-zinc-600 leading-relaxed font-normal">
              Receive verified healing differentials so you know exactly which routine products are working.
            </p>
          </div>
        </div>
      </section>

      {/* 2. TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto mt-28 sm:mt-36">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="fill-[#937abd] text-[#937abd]" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 mb-3 font-[family-name:var(--font-outfit)]">
            Loved by early members
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base font-normal">
            Hear from members tracking measurable skin improvements without clinical guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Testimonial 1 */}
          <div className="p-7 rounded-3xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <p className="text-sm sm:text-[15px] text-zinc-700 leading-relaxed mb-6 font-normal">
              &ldquo;Normal phone photos change depending on what window I stand next to. Skin Story is the first thing that eliminates lighting variables completely.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <img
                src="/avatar-user.jpg"
                alt="Sarah L."
                className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200"
              />
              <div>
                <h4 className="text-sm font-semibold text-zinc-950">Sarah Jenkins</h4>
                <p className="text-xs text-zinc-500">Member #142 • London</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="p-7 rounded-3xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <p className="text-sm sm:text-[15px] text-zinc-700 leading-relaxed mb-6 font-normal">
              &ldquo;I finally discovered my barrier was breaking down from an exfoliant I thought was helping me. The data doesn&apos;t lie.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces"
                alt="Marcus T."
                className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200"
              />
              <div>
                <h4 className="text-sm font-semibold text-zinc-950">Marcus Taylor</h4>
                <p className="text-xs text-zinc-500">Member #089 • New York</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="p-7 rounded-3xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <p className="text-sm sm:text-[15px] text-zinc-700 leading-relaxed mb-6 font-normal">
              &ldquo;The pinpoint accuracy is unreal. You can actually see progress in micro-metrics before it even becomes obvious to the naked eye.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces"
                alt="Elena R."
                className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200"
              />
              <div>
                <h4 className="text-sm font-semibold text-zinc-950">Elena Rostova</h4>
                <p className="text-xs text-zinc-500">Member #215 • Toronto</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE FAQ SECTION */}
      <section className="max-w-3xl mx-auto mt-28 sm:mt-36">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 mb-3 font-[family-name:var(--font-outfit)]">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base font-normal">
            Everything you need to know about Skin Story and early access.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How does light angle neutralization work?",
              highlight: "light angle neutralization",
              a: "Our algorithm reads ambient directional reflections and iris contrast to calculate incident angles, computationally neutralizing shadows, warm tints, and harsh flash highlights to isolate authentic skin pigmentation.",
            },
            {
              q: "Do I need any specialized hardware or scanners?",
              highlight: "specialized hardware",
              a: "No special hardware required. Skin Story operates entirely through your standard smartphone camera using computer vision and calibrated reference processing.",
            },
            {
              q: "Is my personal skin data and photo private?",
              highlight: "skin data and photo private",
              a: "Yes. All facial scans are encrypted end-to-end, processed strictly for your own clinical insights, and never sold to third-party ad networks or cosmetic brands.",
            },
            {
              q: "When will early access members get their invite?",
              highlight: "early access members",
              a: "Early members are invited in rolling batches of 100 based on waitlist registration order. You will receive an exclusive download code directly to your email.",
            },
          ].map((faq, index) => {
            const isExpanded = openFaq === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? "border-[#937abd]/50 bg-purple-50/20 shadow-xs"
                    : "border-zinc-200/90 bg-white hover:border-zinc-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isExpanded ? null : index)}
                  className="w-full py-4 sm:py-5 px-6 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 text-base sm:text-lg cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#937abd]" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-[#937abd]" : ""
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="px-6 pb-5 pt-1 text-sm text-zinc-600 leading-relaxed font-normal border-t border-purple-100/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. MINIMALISTIC FOOTER (At bottom of page flow) */}
      <footer className="w-full border-t border-zinc-200/80 mt-28 sm:mt-36 pt-8 pb-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900">Skin Story</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-zinc-900 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-zinc-900 transition-colors">Terms of Service</a>
            <a
              href="#early-access"
              className="font-semibold text-white bg-[#937abd] px-4 py-2 rounded-full hover:bg-[#856db0] transition-colors shadow-2xs"
            >
              Get Early Access
            </a>
          </div>
        </div>
      </footer>

    </main>
  );
}
