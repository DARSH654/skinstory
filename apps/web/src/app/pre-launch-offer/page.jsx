"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeDollarSign, Gift, ArrowUpRight } from "lucide-react";
import HighlightPhrase from "@/components/HighlightPhrase";
import Logo from "@/components/Logo";

function MoneyBackHandIcon({ size = 22, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Curved return arrow */}
      <path d="M9 13.5A5.5 5.5 0 1 1 14.5 19" />
      <path d="M11.5 11l-3 2.5 3 2.5" />
      {/* Dollar coin center */}
      <circle cx="14.5" cy="13.5" r="3" />
      <path d="M14.5 12v3" />
      <path d="M13.7 12.7h1.6" />
      <path d="M13.7 14.3h1.6" />
      {/* Hand holding underneath */}
      <path d="M4 19l4.5-4.5a2 2 0 0 1 2.8 0L14 17h5a2 2 0 0 1 2 2v.5a2 2 0 0 1-2 2H8l-4-2.5z" />
      <path d="M3 17.5l3.5 3" />
    </svg>
  );
}

const benefits = [
  {
    icon: BadgeDollarSign,
    title: "Value Worth Upto $50",
    description:
      "Every digital card unlocks a gift code, which gives you premium access to the Skin Story app worth up to $50.",
  },
  {
    icon: Gift,
    title: "Unlock 6 Months Premium Access",
    description:
      "You can get up to 6 months of premium access to the Skin Story app at one-tenth of its launch price.",
  },
  {
    icon: MoneyBackHandIcon,
    title: "7-Day Money Back Guarantee",
    description:
      "If you contact us within 7 days of purchase of the pre-launch digital card, we will refund every cent. No question ever asked.",
    hasTnc: true,
  },
];

function PreLaunchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const handleClaim = () => {
    router.push(`/checkout${email ? `?email=${encodeURIComponent(email)}` : ""}`);
  };

  const [cardOut, setCardOut] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] transition-colors duration-200">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-4 pb-10 flex flex-col gap-8">

        {/* ── TOP: Title + Subtitle — centered ── */}
        <div className="w-full text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight text-zinc-950 dark:text-white leading-[1.08] font-[family-name:var(--font-outfit)] mb-4">
            Get the{" "}
            <HighlightPhrase words={[{ text: "Rewards", hasSpace: false }]} />{" "}
            Before Everyone Else.
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Only waitlist members get access to this deal. Secure your digital scratch card now and unlock up to 6 months of premium access when Skin Story officially launches.
          </p>
        </div>

        {/* ── BOTTOM: Two columns — vertically centered ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LEFT: Three Benefit Cards */}
          <div className="flex flex-col gap-3">
            {benefits.map(({ icon: Icon, title, description, hasTnc }, i) => (
              <div
                key={i}
                className="w-full bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white rounded-2xl px-6 py-5 flex items-center gap-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150 cursor-default select-none relative"
              >
                {hasTnc && (
                  <span className="absolute top-[11px] right-5 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                    T&amp;C applied
                  </span>
                )}
                <div className="shrink-0 w-11 h-11 rounded-xl bg-[#937abd]/15 dark:bg-[#937abd]/20 flex items-center justify-center">
                  <Icon size={22} className="text-[#937abd] dark:text-[#c4b3e3]" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-zinc-950 dark:text-white mb-1 leading-snug">
                    {title}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Card Holder with tucked card and claim button - centered with left boxes */}
          <div className="flex flex-col items-center justify-center w-full my-auto">
            {/* Tap-to-close overlay: mobile/tablet only, shown when card is out */}
            {cardOut && (
              <div
                className="fixed inset-0 z-40 lg:hidden"
                onClick={() => setCardOut(false)}
              />
            )}
            {/* Outer Backing Piece - interactive group container for hover animation */}
            <div className="group/holder relative z-50 w-full max-w-[460px] sm:max-w-[490px] h-[280px] sm:h-[295px] rounded-[38px] sm:rounded-[42px] bg-[#141d13] dark:bg-[#f0f7ef] shadow-[0_24px_60px_rgba(0,0,0,0.4)] flex flex-col justify-end items-center p-2 sm:p-2.5 cursor-pointer" onClick={() => setCardOut(prev => !prev)}>
              
              {/* The Card - resting tucked inside initially, slides smoothly out on hover */}
              <div
                className={`absolute inset-x-6 sm:inset-x-8 rounded-2xl overflow-hidden shadow-xl z-0 flex flex-col justify-between transition-all duration-500 ease-out top-0 ${cardOut ? "-translate-y-7" : "translate-y-6"} lg:translate-y-6 lg:group-hover/holder:-translate-y-7`}
                style={{
                  background: "linear-gradient(135deg, #d6cbe8 0%, #bca6df 45%, #937abd 100%)",
                  aspectRatio: "2.3 / 1",
                }}
              >
                {/* Subtle sheen */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.25) 0%, transparent 60%)" }}
                />

                {/* Visible top bar of card: Left-aligned Gift + YOUR DIGITAL CARD, Top-Right T&C applied, Center-aligned Scratch text */}
                <div className="w-full pt-3 px-5 z-10 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/25 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-sm">
                        <Gift size={18} className="text-white drop-shadow-sm" />
                      </div>
                      <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white font-[family-name:var(--font-outfit)] drop-shadow-md">
                        Your Digital Card
                      </span>
                    </div>

                    {/* Top right: Expires at launch pill */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#937abd]/25 text-[10px] font-medium text-white/80 tracking-wide backdrop-blur-sm">
                      Expires at launch.
                    </span>
                  </div>

                  {/* Below line: Scratch to unlock your code - centrally aligned */}
                  <p className="text-[11px] sm:text-xs font-semibold tracking-wide text-white/95 font-[family-name:var(--font-outfit)] text-center drop-shadow-sm mt-0.5">
                    Scratch to unlock your code
                  </p>
                </div>

                {/* Blurred mystery section below it */}
                <div className="relative w-full h-8 mt-0.5 mx-auto overflow-hidden">
                  {/* Mystery placeholder behind blur */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-xs font-bold text-white/40 tracking-[0.3em] select-none">
                    •••• •••• ••••
                  </div>
                  {/* Frosted Glass Blur Overlay */}
                  <div className="absolute inset-0 backdrop-blur-md bg-white/20 border-t border-white/25" />
                </div>
              </div>

              {/* Front Pocket Layer with matching convex curved contour - horizontal */}
              <div className="relative z-10 w-full h-[85%] flex flex-col justify-end">
                <svg
                  className="absolute inset-0 w-full h-full drop-shadow-[0_-4px_16px_rgba(0,0,0,0.4)] dark:drop-shadow-none pointer-events-none"
                  viewBox="0 0 460 260"
                  fill="none"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 0 32 
                       L 55 32 
                       C 70 32, 82 24, 94 14 
                       C 104 6, 118 4, 140 4 
                       L 320 4 
                       C 342 4, 356 6, 366 14 
                       C 378 24, 390 32, 405 32 
                       L 460 32 
                       L 460 220 
                       C 460 245, 430 260, 396 260 
                       L 64 260 
                       C 30 260, 0 245, 0 220 
                       Z"
                    className="fill-[#141d13] dark:fill-[#f0f7ef]"
                  />
                </svg>

                {/* Pocket Content Layer */}
                <div className="relative z-20 w-full h-full flex flex-col justify-between pt-2 pb-5 px-6">
                  {/* Top section of front pocket: Skin Story logo centered in the raised tab */}
                  <div className="relative w-full flex items-center justify-center pt-2">
                    {/* Skin Story logo center-aligned in the upper gap */}
                    <div className="flex items-center gap-2">
                      <span className="dark:hidden"><Logo size={20} color="white" /></span>
                      <span className="hidden dark:inline-block"><Logo size={20} color="#18181b" /></span>
                      <span className="text-sm sm:text-base font-bold text-white dark:text-zinc-900 tracking-wide font-[family-name:var(--font-outfit)] drop-shadow-sm">
                        Skin Story
                      </span>
                    </div>
                  </div>

                  {/* Middle: Waitlist Exclusive label */}
                  <div className="flex items-center justify-center flex-1">
                    <p className="text-2xl sm:text-3xl font-semibold text-white dark:text-zinc-900 font-[family-name:var(--font-outfit)] tracking-tight uppercase">
                      &ldquo;WAITLIST EXCLUSIVE&rdquo;
                    </p>
                  </div>

                  {/* Bottom: Claim your offer button */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleClaim}
                      className="w-full py-3.5 px-4 rounded-xl bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-sm tracking-wide transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      <span>Claim your offer</span>
                      <ArrowUpRight size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreLaunchOfferPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-400">Loading offer...</div>}>
      <PreLaunchContent />
    </Suspense>
  );
}



