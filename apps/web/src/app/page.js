"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Star, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { AppStoreButton, GooglePlayButton } from "@/components/base/buttons/app-store-buttons";

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
    <main className="w-full bg-white text-zinc-900 pt-12 sm:pt-20 pb-0 px-6 sm:px-12">
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

      {/* ========================================================================= */}
      {/* SECTION 1: IDENTITY LOCK (The Mirror Moment) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* SECTION 1: THE REALITY CHECK (Mirror vs. The Scan) */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto mt-28 sm:mt-36">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="px-3.5 py-1 rounded-full bg-[#937abd]/10 text-[#7a60a3] text-xs font-semibold tracking-wider uppercase">
            The Reality Check
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 mt-3 mb-3 font-[family-name:var(--font-outfit)]">
            Stop diagnosing yourself in flattering lighting.
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-normal">
            Your bathroom mirror reflects ambient room glare and hides sub-surface stress until it explodes into a breakout. Skin Story strips away optical distortion to show you what is actually happening.
          </p>
        </div>

        {/* Side-by-Side Comparison: Mirror Illusion vs. Clinical AI Scan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* Left: The Bathroom Mirror (Subjective / Flawed) */}
          <div className="p-7 sm:p-9 rounded-[32px] bg-zinc-50 border border-zinc-200/90 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  What You See in the Mirror
                </span>
                <span className="px-2.5 py-1 rounded-md bg-zinc-200/70 text-zinc-600 text-[11px] font-semibold">
                  Subjective
                </span>
              </div>

              <div className="aspect-[4/3] rounded-2xl bg-zinc-200/80 overflow-hidden relative mb-6 flex items-center justify-center border border-zinc-300/60">
                <img
                  src="/avatar-user.jpg"
                  alt="Mirror Reflection"
                  className="w-full h-full object-cover filter contrast-90 brightness-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                  <p className="text-white text-xs font-medium">
                    Warm fluorescent bathroom light • Looks clear to the naked eye
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-600">
                  <span className="text-zinc-400 font-bold">•</span>
                  <span><strong>Visual illusion:</strong> Glare masks sub-surface erythema (redness).</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-600">
                  <span className="text-zinc-400 font-bold">•</span>
                  <span><strong>The mistake:</strong> You assume your skin is fine and apply heavy actives.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-600">
                  <span className="text-zinc-400 font-bold">•</span>
                  <span><strong>The outcome:</strong> Sudden flare-up 48 hours later with zero warning.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-200/80 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Diagnosis: Pure Guesswork
            </div>
          </div>

          {/* Right: The Skin Story Scan (Objective / Truth) */}
          <div className="p-7 sm:p-9 rounded-[32px] bg-zinc-950 text-white flex flex-col justify-between text-left shadow-xl relative overflow-hidden border border-zinc-800">
            {/* Subtle glow accent */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#937abd]/20 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#d6cbe8]">
                  What Skin Story Analyzes in 3s
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#937abd]/30 text-[#e6ddf5] text-[11px] font-semibold border border-[#937abd]/40">
                  Optical Truth
                </span>
              </div>

              <div className="aspect-[4/3] rounded-2xl bg-zinc-900 overflow-hidden relative mb-6 border border-zinc-800 flex items-center justify-center">
                <img
                  src="/avatar-user.jpg"
                  alt="Dermal Scan Analysis"
                  className="w-full h-full object-cover filter grayscale contrast-125 opacity-80"
                />
                {/* Visual AI Scan Overlay Highlights */}
                <div className="absolute inset-0 bg-[#937abd]/10 mix-blend-color-dodge" />
                <div className="absolute top-1/4 left-1/3 w-16 h-16 rounded-full border border-rose-400/80 bg-rose-500/20 animate-pulse flex items-center justify-center">
                  <span className="text-[10px] font-bold text-rose-200 bg-black/80 px-1.5 py-0.5 rounded">
                    Tear Detected
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-zinc-950/90 backdrop-blur-md rounded-xl p-3 border border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Hydration Stress: -18%</span>
                  <span className="text-rose-400 font-bold">Barrier Alert</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                  <span className="text-[#937abd] font-bold">✓</span>
                  <span><strong>Neutralized lighting:</strong> Eliminates angles to reveal hidden dermal stress.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                  <span className="text-[#937abd] font-bold">✓</span>
                  <span><strong>Early warning:</strong> Flags micro-barrier breakdown 48h before it peels.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                  <span className="text-[#937abd] font-bold">✓</span>
                  <span><strong>Precision action:</strong> Tells you exactly which active ingredient to pause today.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 text-xs font-semibold text-[#d6cbe8] uppercase tracking-wider flex items-center justify-between">
              <span>Diagnosis: Clinical Certainty</span>
              <a href="#early-access" className="text-white hover:underline text-xs capitalize flex items-center gap-1">
                See Yours <ArrowRight size={12} />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1B: THE BROKEN FEEDBACK LOOP */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto mt-28 sm:mt-36">
        <div className="p-8 sm:p-14 rounded-[36px] sm:rounded-[44px] bg-gradient-to-br from-zinc-50 via-white to-purple-50/40 border border-zinc-200/90 shadow-xs text-left">
          <div className="max-w-2xl mb-10">
            <span className="px-3.5 py-1 rounded-full bg-[#937abd]/10 text-[#7a60a3] text-xs font-semibold tracking-wider uppercase">
              The Fundamental Flaw
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950 mt-3 mb-3 font-[family-name:var(--font-outfit)]">
              Your skin isn&apos;t unpredictable. Your feedback loop is broken.
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-normal">
              When you take an aspirin, your headache stops in 30 minutes. When you spend ₹3,000 on a retinol or peptide serum, you wait 6 weeks with zero confirmation if it is repairing or quietly inflaming your cells.
            </p>
          </div>

          {/* Timeline Visual: Broken Guesswork vs. Daily Skin Story Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* The Old Broken Loop */}
            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                  The Broken Loop (What Everyone Does)
                </h3>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-zinc-600">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-400 shrink-0">Day 01</span>
                  <span>Buy trending \$45 serum recommended on Instagram.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-400 shrink-0">Day 14</span>
                  <span>Skin looks slightly red. Is it purging or barrier damage? You have no way to know.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-400 shrink-0">Day 28</span>
                  <span>Full breakout. Abandon bottle, waste ₹3,000, and repeat the cycle.</span>
                </div>
              </div>
            </div>

            {/* The Skin Story Daily Verification Loop */}
            <div className="p-6 rounded-2xl bg-purple-50/40 border border-[#937abd]/40 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#937abd]" />
                <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
                  The Skin Story Loop (Continuous Verification)
                </h3>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-zinc-700">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#937abd] font-bold shrink-0">Day 01</span>
                  <span>Take 3s scan to establish optical baseline and log serum.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#937abd] font-bold shrink-0">Day 04</span>
                  <span>AI alerts: micro-redness index up +14%. Prompt: &ldquo;Buffer with moisturizer.&rdquo;</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#937abd] font-bold shrink-0">Day 14</span>
                  <span>Smooth healing confirmed with objective score: +22% barrier recovery verified.</span>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs sm:text-sm font-medium text-zinc-700">
              Never waste money on the wrong bottle again.
            </p>
            <a
              href="#early-access"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#937abd] rounded-full hover:bg-[#856db0] transition-all shadow-xs shrink-0"
            >
              <span>Lock Early Access</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: VALIDATING FRUSTRATION (Why Nothing Has Worked) */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto mt-28 sm:mt-36">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 mb-3 font-[family-name:var(--font-outfit)]">
            You&apos;ve already tried everything. That&apos;s the problem.
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-normal">
            Products fix symptoms. Dermatologists give generic protocols. Google contradicts itself every tab. None of them told you WHY your specific skin reacted. Because none of them were watching your life while watching your skin. We are.
          </p>
        </div>

        {/* 3 Visual Cost Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="p-7 rounded-3xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-left flex flex-col justify-between">
            <span className="text-3xl mb-4">💸</span>
            <div>
              <h3 className="text-lg font-semibold text-zinc-950 mb-1.5">
                ₹40,000+ Spent Yearly
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Average spent on viral creams, serums, and half-empty bottles collecting dust on bathroom counters.
              </p>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-left flex flex-col justify-between">
            <span className="text-3xl mb-4">📱</span>
            <div>
              <h3 className="text-lg font-semibold text-zinc-950 mb-1.5">
                Countless Hours Lost
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Spiraling through Reddit threads, YouTube reviews, and TikTok skincare hacks with zero scientific consensus.
              </p>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-left flex flex-col justify-between">
            <span className="text-3xl mb-4">😤</span>
            <div>
              <h3 className="text-lg font-semibold text-zinc-950 mb-1.5">
                Still Zero Clear Answers
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Waking up to sudden redness or flaking with no clue if it was diet, stress, sleep, or that new niacinamide.
              </p>
            </div>
          </div>
        </div>

        {/* Powerful Statement with Breathing Room */}
        <div className="mt-10 sm:mt-14 max-w-2xl mx-auto text-center px-4">
          <p className="text-base sm:text-lg italic text-zinc-700 font-medium leading-relaxed">
            &ldquo;None of it told you the one thing you actually needed to know: why your specific skin reacts the way it does.&rdquo;
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: THE MECHANISM & HOW IT WORKS */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto mt-28 sm:mt-36">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 mb-3 font-[family-name:var(--font-outfit)]">
            Your face remembers everything your life does.
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-normal">
            Stress on Monday shows up on your chin by Wednesday. Bad sleep Tuesday appears as dullness Thursday. Our engine connects your daily life to your skin&apos;s response and names the exact pattern you never noticed. One scan plus your daily inputs equals your first real answer.
          </p>
        </div>

        {/* 3 Step Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-14">
          <div className="p-7 rounded-3xl bg-zinc-50/90 border border-zinc-200/80 text-left">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-zinc-200 text-sm font-bold text-zinc-950 shadow-2xs mb-4">
              01
            </span>
            <h3 className="text-lg font-semibold text-zinc-950 mb-1">Scan your face</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              AI reads your zones in seconds, eliminating lighting variations and reflections.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-zinc-50/90 border border-zinc-200/80 text-left">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-zinc-200 text-sm font-bold text-zinc-950 shadow-2xs mb-4">
              02
            </span>
            <h3 className="text-lg font-semibold text-zinc-950 mb-1">Log your day</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Sleep, stress, diet — three quick taps in under 10 seconds.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-zinc-50/90 border border-zinc-200/80 text-left">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-zinc-200 text-sm font-bold text-zinc-950 shadow-2xs mb-4">
              03
            </span>
            <h3 className="text-lg font-semibold text-zinc-950 mb-1">Get your insight</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              We connect your life to your skin and name the exact cause behind every change.
            </p>
          </div>
        </div>

        {/* App Insight Preview & Direct Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="lg:col-span-5 flex justify-center">
            <img
              src="/hero-phones.webp"
              alt="Skin Story Real Insight Screen"
              className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-contain drop-shadow-2xl"
            />
          </div>

          <div className="lg:col-span-7 text-left space-y-6">
            <span className="px-3.5 py-1 rounded-full bg-[#937abd]/20 border border-[#937abd]/40 text-[#d6cbe8] text-xs font-semibold tracking-wide uppercase">
              The Fundamental Difference
            </span>
            <h3 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
              Why generic beauty apps fail you.
            </h3>

            {/* 2 Column Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Other Apps
                </p>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Arbitrary score. Generic advice. Automated affiliate sales pitching you more products you don&apos;t need.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#937abd]/20 border border-[#937abd]/50">
                <p className="text-xs font-semibold text-[#d6cbe8] uppercase tracking-wider mb-2">
                  Skin Story
                </p>
                <p className="text-sm text-white font-medium leading-relaxed">
                  Exact Score + Trigger + Root Cause + Action. 100% personalized to your specific biology.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="#early-access"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-950 bg-white rounded-full hover:bg-zinc-100 transition-all shadow-md cursor-pointer"
              >
                <span>Claim Your Spot</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: SOCIAL PROOF & LIVE PROGRESS */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto mt-28 sm:mt-36">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="fill-[#937abd] text-[#937abd]" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 mb-3 font-[family-name:var(--font-outfit)]">
            Early testers are already finding their triggers.
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base font-normal">
            Hear from members who uncovered the actual patterns behind their chronic breakouts.
          </p>
        </div>

        {/* 3 Outcome-Driven Testimonials (Horizontal Scroll on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4 text-left">
          <div className="p-7 rounded-3xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-[#937abd] text-[#937abd]" />
                ))}
              </div>
              <p className="text-sm sm:text-[15px] text-zinc-800 leading-relaxed mb-6 font-normal">
                &ldquo;First time in 3 years something actually explained why my chin always breaks out. It wasn&apos;t my moisturizer—it was sleep debt spike.&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-zinc-100 pt-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-[#937abd] font-bold flex items-center justify-center text-sm">
                P
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-950">Priya K.</h4>
                <p className="text-xs text-zinc-500">Oily & Acne-Prone • Mumbai</p>
              </div>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-[#937abd] text-[#937abd]" />
                ))}
              </div>
              <p className="text-sm sm:text-[15px] text-zinc-800 leading-relaxed mb-6 font-normal">
                &ldquo;I logged for 5 days and it connected my stress to my forehead. My dermatologist never did that in our 15-minute consultations.&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-zinc-100 pt-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                A
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-950">Aarav M.</h4>
                <p className="text-xs text-zinc-500">Combination Skin • Bangalore</p>
              </div>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-zinc-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-[#937abd] text-[#937abd]" />
                ))}
              </div>
              <p className="text-sm sm:text-[15px] text-zinc-800 leading-relaxed mb-6 font-normal">
                &ldquo;Finally something that doesn&apos;t just tell me to drink more water. It detected an active barrier tear 3 days before it started flaking.&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-zinc-100 pt-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-sm">
                S
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-950">Sneha D.</h4>
                <p className="text-xs text-zinc-500">Sensitive Barrier • Delhi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Waitlist Counter & Visual Progress Bar */}
        <div className="mt-12 p-8 rounded-3xl bg-zinc-50/80 border border-zinc-200/90 max-w-xl mx-auto text-center">
          <p className="text-2xl sm:text-3xl font-bold text-zinc-950 mb-2">
            4,192 people already waiting
          </p>
          <p className="text-xs sm:text-sm text-zinc-500 mb-5 font-medium">
            Cohort #1 early access closes once 500 spots are secured.
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-200 rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="bg-[#937abd] h-3 rounded-full transition-all duration-1000"
              style={{ width: "78.4%" }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 mb-6 px-1">
            <span>392 claimed</span>
            <span className="text-[#937abd]">108 spots left</span>
          </div>

          <a
            href="#early-access"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-[#937abd] rounded-full hover:bg-[#856db0] transition-all shadow-[0_2px_8px_rgba(147,122,189,0.25)]"
          >
            <span>Secure Your Early Spot</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: THE POSITION MECHANIC & VIRAL LOOP */}
      {/* ========================================================================= */}
      <section id="early-access" className="max-w-2xl mx-auto mt-28 sm:mt-36">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 mb-3 font-[family-name:var(--font-outfit)]">
            Claim your spot. See your place in line.
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-normal">
            Early access rolls out in rolling batches. Once the remaining 108 spots in this cohort are claimed, the waitlist closes until public launch.
          </p>
        </div>

        {/* Dynamic Position Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-zinc-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-center">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your best email address"
                  className="flex-1 px-5 py-3.5 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 bg-zinc-50 rounded-full border border-zinc-200 focus:bg-white focus:border-[#937abd] outline-hidden transition-all"
                />
                <button
                  type="submit"
                  className="px-7 py-3.5 text-sm sm:text-base font-semibold text-white bg-[#937abd] rounded-full hover:bg-[#856db0] active:scale-[0.98] transition-all shadow-md cursor-pointer shrink-0"
                >
                  Join Waitlist
                </button>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                No spam. No product recommendations. Just your access code when beta opens.
              </p>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-50 text-[#937abd] mb-2">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#937abd] bg-[#937abd]/10 px-3 py-1 rounded-full">
                  Spot Reserved
                </span>
                <h3 className="text-3xl font-extrabold text-zinc-950 mt-3 mb-1">
                  You&apos;re #4,193 in line
                </h3>
                <p className="text-sm text-zinc-600">
                  We sent confirmation details to <strong className="text-zinc-900">{email}</strong>.
                </p>
              </div>

              {/* Viral Referral Loop Box */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/90 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">Want to get invited sooner?</span>
                  <span className="text-xs font-semibold text-[#937abd]">+10 spots per friend</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Move up 10 spots for every friend who joins using your personal invite link.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://getskinstory.com?ref=4193`}
                    className="flex-1 px-3 py-2 text-xs text-zinc-600 bg-white border border-zinc-200 rounded-lg outline-hidden select-all"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText("https://getskinstory.com?ref=4193")}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 transition-all cursor-pointer shrink-0"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: FAQ ACCORDION (Ordered by User Friction) */}
      {/* ========================================================================= */}
      <section className="max-w-3xl mx-auto mt-28 sm:mt-36">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 mb-3 font-[family-name:var(--font-outfit)]">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base font-normal">
            Everything you need to know about early access and how Skin Story works.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Is early access free?",
              a: "Yes, early access is 100% free for all accepted members in this cohort. You will also receive locked-in founding member perks when public features release.",
            },
            {
              q: "Are you going to sell me products or routines?",
              a: "No. We don't sell skincare, serums, or creams. We are an unbiased diagnostic tool designed to help you understand which products you already own are helping or hurting your skin.",
            },
            {
              q: "Do I need special lighting or camera gear?",
              a: "Not at all. Skin Story works directly on your smartphone camera. Our AI model computationally neutralizes room lighting, flash, and shadow angles to give you a true optical baseline.",
            },
            {
              q: "When do I get my invite code?",
              a: "Invites are dispatched in rolling batches of 100. As soon as your spot comes up in line, your exclusive download link and activation code will be delivered directly to your inbox.",
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

      {/* ========================================================================= */}
      {/* 7. CAL-AI STYLE CURVED CONTAINER FOOTER (Pixel-Perfect Detailing) */}
      {/* ========================================================================= */}
      <footer className="w-full mt-20 sm:mt-24 mb-0 pb-3">
        <div className="max-w-7xl mx-auto bg-[#faf9f6] border border-zinc-200/80 rounded-[32px] sm:rounded-[44px] p-6 sm:p-10 pb-4 sm:pb-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-5 border-b border-zinc-200/70">
            
            {/* Left Column: Authentic Brand Logo & Official Store Badges */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <div className="flex items-center gap-3">
                {/* Official Skin Story Two-Square Logo Component */}
                <div className="w-7 h-7 relative inline-block shrink-0">
                  <div className="absolute top-0 right-0 bg-zinc-950 w-[17px] h-[17px]" />
                  <div className="absolute bottom-0 left-0 bg-zinc-950 w-[11px] h-[11px]" />
                </div>
                <span className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-950 font-[family-name:var(--font-outfit)]">
                  Skin Story
                </span>
              </div>

              {/* Official Mobile Store Buttons */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  Coming Soon
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <GooglePlayButton />
                  <AppStoreButton />
                </div>
              </div>
            </div>

            {/* Right Column: Clean Link Grid */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-8 text-left sm:pl-10">
              
              {/* Legal Links */}
              <div className="space-y-3.5">
                <h4 className="text-sm font-semibold text-zinc-950 tracking-tight font-[family-name:var(--font-outfit)]">
                  Legal
                </h4>
                <ul className="space-y-2 text-xs sm:text-[13.5px] text-zinc-600 font-normal">
                  <li><a href="#privacy" className="hover:text-zinc-950 transition-colors">Privacy Policy</a></li>
                  <li><a href="#terms" className="hover:text-zinc-950 transition-colors">Terms of Service</a></li>
                  <li><a href="#biometric" className="hover:text-zinc-950 transition-colors">Biometric Data Policy</a></li>
                  <li><a href="#security" className="hover:text-zinc-950 transition-colors">Security & Encryption</a></li>
                </ul>
              </div>

              {/* Company Links */}
              <div className="space-y-3.5">
                <h4 className="text-sm font-semibold text-zinc-950 tracking-tight font-[family-name:var(--font-outfit)]">
                  Company
                </h4>
                <ul className="space-y-2 text-xs sm:text-[13.5px] text-zinc-600 font-normal">
                  <li><a href="#faq" className="hover:text-zinc-950 transition-colors">FAQ</a></li>
                  <li><a href="mailto:support@getskinstory.com" className="hover:text-zinc-950 transition-colors">Contact Us</a></li>
                  <li><a href="#press" className="hover:text-zinc-950 transition-colors">Press & Media</a></li>
                  <li><a href="#early-access" className="hover:text-zinc-950 transition-colors font-semibold text-[#937abd]">Join Waitlist</a></li>
                </ul>
              </div>

            </div>
          </div>

          {/* Bottom Bar: Copyright (Compact padding) */}
          <div className="pt-3.5 flex items-center text-sm sm:text-base text-zinc-600 font-medium">
            <p>© {new Date().getFullYear()} Skin Story. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
