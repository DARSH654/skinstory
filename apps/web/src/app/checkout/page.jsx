"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Gift, Lock } from "lucide-react";
import RazorpayCheckoutButton from "@/components/RazorpayCheckoutButton";
import Logo from "@/components/Logo";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Default offer amount: 499 INR in paise = 49900 paise (or Rs. 499 / $4.99 offer)
  const amountInPaise = 49900;
  const currency = "INR";
  const displayPrice = "₹499";

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} />
          <span>Back to Skin Story</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-lg">
          <Logo size={22} color="currentColor" />
          <span>Skin Story</span>
        </Link>
      </div>

      {/* Main Checkout Area */}
      <div className="max-w-4xl w-full mx-auto my-8 flex-1">
        {!paymentSuccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Offer Details & Value props */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f1ecf7] dark:bg-[#2e2340] border border-[#d6cbe8] dark:border-[#5f4982] text-[#6d4f9e] dark:text-[#c4b3e3] text-xs font-semibold">
                  <Sparkles size={14} />
                  <span>Pre-Launch Member Exclusive</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  Claim Your Early Access Pass
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Lock in lifetime founder benefits and unlock up to 6 months of premium AI facial insights.
                </p>
              </div>

              {/* Offer Features Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  What is included
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <Gift className="w-5 h-5 text-[#937abd] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-950 dark:text-white font-medium">Digital Scratch Card:</strong> Sent immediately to your email, unlocking 1 to 6 months of full premium access upon launch.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-[#937abd] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-950 dark:text-white font-medium">Priority Queue:</strong> Guaranteed spot in Cohort #1 before general public release.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-[#937abd] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-950 dark:text-white font-medium">Founder Pricing Lock:</strong> Grandfathered access rate protected from future subscription price hikes.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Guarantees */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>14-Day Money-Back Guarantee:</strong> If Skin Story doesn&apos;t meet your expectations upon launch, contact support@getskinstory.com for an immediate full refund.
                </span>
              </div>
            </div>

            {/* Right Column: Checkout Form & Payment Button */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-semibold text-zinc-950 dark:text-white">Order Summary</h2>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Pre-Launch Early Pass</span>
                  <span className="font-semibold text-zinc-950 dark:text-white">{displayPrice}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-xs text-zinc-500">
                  <span>Digital Scratch Card</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-base font-semibold">
                  <span>Total Due</span>
                  <span className="text-zinc-950 dark:text-white">{displayPrice}</span>
                </div>
              </div>

              {/* Customer Info Form */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:border-black dark:focus:border-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Where should we send your scratch card?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:border-black dark:focus:border-white outline-hidden"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">Your scratch card code will be sent here.</p>
                </div>
              </div>

              {/* Razorpay Standard Checkout Button */}
              <div className="pt-2">
                <RazorpayCheckoutButton
                  amount={amountInPaise}
                  currency={currency}
                  userEmail={email}
                  userName={name}
                  buttonText={`Pay ${displayPrice} with Razorpay`}
                  disabled={!email.trim() || !email.includes("@")}
                  onSuccess={(result) => {
                    setPaymentSuccess(result);
                  }}
                  onError={(err) => {
                    console.error("Payment error in checkout page:", err);
                  }}
                />
              </div>

              {/* Trust & Compliance Badge */}
              <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-zinc-400">
                <Lock size={12} />
                <span>256-Bit SSL Encrypted • Powered by Razorpay</span>
              </div>
            </div>

          </div>
        ) : (
          /* Order Confirmed State */
          <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-6 shadow-md">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-zinc-950 dark:text-white">
                Payment Successful!
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Welcome to Skin Story! Your pre-launch order is confirmed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment ID:</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-white">{paymentSuccess.payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Order ID:</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-white">{paymentSuccess.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Delivered to:</span>
                <span className="font-medium text-zinc-900 dark:text-white">{email}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#f7f4fb] dark:bg-[#271d36] border border-[#e1d8ee] dark:border-[#4d3a66] text-xs text-zinc-700 dark:text-zinc-300">
              <p>
                Check your inbox at <strong>{email}</strong> for your digital scratch card link and founder access details.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-[#937abd] hover:bg-[#856db0] transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="max-w-4xl w-full mx-auto pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
        Skin Story • Questions? Reach us at support@getskinstory.com
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
