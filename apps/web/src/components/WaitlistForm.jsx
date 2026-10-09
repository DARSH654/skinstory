"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function WaitlistForm({
  source = "waitlist",
  placeholder = "Enter your email address",
  buttonText = "Join Waitlist",
  showShield = false,
  className = "",
  inputClassName = "",
  buttonClassName = "",
  center = false,
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || cooldown > 0 || loading) return;

    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from("waitlist")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existing) {
        setIsAlreadyJoined(true);
      } else {
        await supabase
          .from("waitlist")
          .insert([{ email: cleanEmail, source }]);
        setIsAlreadyJoined(false);
      }

      setSubmittedEmail(cleanEmail);
      setCooldown(59);

      // Instant redirect to pre-launch offer page passing email as query param
      router.push(`/pre-launch-offer${cleanEmail ? `?email=${encodeURIComponent(cleanEmail)}` : ""}`);
    } catch (err) {
      console.error("Waitlist submit error:", err);
    }
    setLoading(false);
  };

  if (submittedEmail) {
    return (
      <div
        className={`w-full p-3.5 rounded-full bg-[#f7f4fb] dark:bg-[#231a30] border border-[#d6cbe8] dark:border-[#5f4982] text-[#533c7a] dark:text-[#d6cbe8] flex items-center gap-3 shadow-xs ${
          center ? "justify-center" : "justify-center lg:justify-start"
        }`}
      >
        <CheckCircle2 className="w-5 h-5 text-[#937abd] dark:text-[#c4b3e3] shrink-0" />
        <span className="text-sm font-semibold">
          {isAlreadyJoined
            ? "You are already on the waitlist! We will notify you when it launches."
            : "You are on the waitlist! We will notify you when it launches."}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex items-center p-1.5 bg-zinc-50/90 dark:bg-zinc-900 rounded-full border border-zinc-300 dark:border-zinc-700 focus-within:border-[3px] focus-within:border-black dark:focus-within:border-white shadow-[0_2px_14px_rgba(0,0,0,0.04)] overflow-hidden transition-all">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={loading || cooldown > 0}
          className={`flex-1 min-w-0 px-4 py-2.5 text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-transparent outline-hidden text-left ${inputClassName}`}
        />
        <button
          type="submit"
          disabled={cooldown > 0 || loading}
          className={`px-5 sm:px-6 py-2.5 text-sm sm:text-base font-semibold text-white bg-[#937abd] hover:bg-[#856db0] rounded-full transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-75 disabled:cursor-not-allowed ${buttonClassName}`}
        >
          <span>
            {cooldown > 0
              ? `Wait ${cooldown}s`
              : loading
              ? "Joining..."
              : buttonText}
          </span>
          {!loading && cooldown === 0 && <ArrowRight size={16} />}
        </button>
      </div>

      {showShield && (
        <div
          className={`flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-3 ${
            center ? "justify-center" : "justify-center lg:justify-start"
          }`}
        >
          <ShieldCheck size={14} className="text-[#937abd] shrink-0" />
          <span>Free for waitlist cohort. Zero spam or sponsored product bias.</span>
        </div>
      )}
    </form>
  );
}
