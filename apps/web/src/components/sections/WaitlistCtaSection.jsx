"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function WaitlistCtaSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("https://getskinstory.com?ref=4193");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="early-access" className="max-w-2xl mx-auto mt-20 sm:mt-28 relative z-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-3 font-[family-name:var(--font-outfit)]">
          Claim your spot. See your place in line.
        </h2>
        <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-normal">
          Early access rolls out in rolling batches. Once the remaining 108 spots in this cohort are claimed, the waitlist closes until public launch.
        </p>
      </div>

      {/* Dynamic Position Card with Integrated Live Counter - White card with dark text */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-zinc-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-center space-y-6">
        {/* Live Progress Bar Header */}
        <div className="bg-zinc-50/80 rounded-2xl p-5 border border-zinc-200/70 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-zinc-950">4,192 people already waiting</span>
            <span className="text-xs font-semibold text-[#937abd]">108 spots left</span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-2.5 mb-2 overflow-hidden">
            <div
              className="bg-[#937abd] h-2.5 rounded-full transition-all duration-1000"
              style={{ width: "78.4%" }}
            />
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">
            Cohort #1 closes permanently once 500 early member spots are secured.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
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
            <p className="text-xs text-zinc-400 font-medium pl-2">
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
                  onClick={handleCopy}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 transition-all cursor-pointer shrink-0"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
