import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";
import HighlightPhrase from "@/components/HighlightPhrase";
import ContactUsCard from "@/components/ContactUsCard";

export const metadata = {
  title: "Refund & Cancellation Policy — Skin Story",
  description: "Skin Story refund and cancellation policy for subscriptions and purchases.",
};

export default function RefundPage() {
  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-4 sm:px-6 lg:px-8 pt-12 pb-4 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-zinc-950 dark:text-white mb-3 font-[family-name:var(--font-outfit)]">
              Refund &amp; Cancellation{" "}
              <HighlightPhrase words={[{ text: "Policy", hasSpace: false }]} />
            </h1>
            <p className="text-base sm:text-lg font-medium text-zinc-500 dark:text-zinc-400">Last updated: September 2026</p>
          </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Pre-Launch Overview</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                Skin Story is currently operating in pre-launch mode. Joining our waitlist is 100% free, and no credit card details or payment commitments are collected at this stage. This Refund &amp; Cancellation Policy defines the commercial terms and refund guidelines that will automatically apply when paid subscription plans and premium features launch on our Application and website.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Subscription Cancellation</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                You may cancel your recurring subscription (weekly, monthly, or annual) at any time through your mobile device app store subscription settings (Apple App Store or Google Play Store) or via your web account billing dashboard for direct online payments.
              </p>
              <p>
                Cancellation takes effect immediately for future billing cycles, and you will retain full access to all paid features until the end of your current active billing period. We do not charge any cancellation fees or penalties. Following cancellation, your skin logs, photo history, and custom routines remain saved in your account unless you request full account deletion.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Refund Terms &amp; Guarantees</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                We offer a 14-day money-back guarantee for initial subscription purchases. If you are not satisfied with Skin Story within 14 days of your initial payment, you may request a full refund of your first subscription payment.
              </p>
              <p>
                After the 14-day initial period, subscription fees are generally non-refundable. Exceptional refund requests (such as billing errors, double charges, or proven technical service outages) will be reviewed on a case-by-case basis. We do not offer partial refunds or pro-rated credits for mid-cycle cancellations.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">App Store &amp; Independent Payment Transactions</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                For subscriptions purchased via the Apple App Store or Google Play Store, refund processing is governed by Apple and Google billing policies. You can request app store refunds directly through Apple&apos;s Report a Problem page or Google Play Order History.
              </p>
              <p>
                For payments processed directly via independent payment infrastructure (Stripe or Razorpay), refunds will be processed directly back to your original payment method within 5–10 business days upon approval by our support team.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">How to Request a Refund</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                To initiate a refund request for direct web or payment gateway transactions, please contact our support team at{" "}
                <a href="mailto:support@getskinstory.com" className="font-semibold text-zinc-800 dark:text-zinc-200 hover:underline hover:underline-offset-2">
                  support@getskinstory.com
                </a>
                {" "}with your registered email address, transaction date, and order receipt ID. Our team will review your request and respond within 3 business days.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Changes to This Policy</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                We may update this Refund &amp; Cancellation Policy from time to time to reflect changes in our pricing model, subscription plans, or legal requirements; any revisions will be published here with an updated revision date, and for any billing questions or assistance, please email us at{" "}
                <a href="mailto:support@getskinstory.com" className="font-semibold text-zinc-800 dark:text-zinc-200 hover:underline hover:underline-offset-2">
                  support@getskinstory.com
                </a>
                .
              </p>
            </div>
          </section>

        </div>
      </div>
    </main>

    <ContactUsCard
      title="Questions about refunds or billing?"
      email="billing@getskinstory.com"
    />

    <div className="px-6 sm:px-12 pb-6 bg-white dark:bg-[#121212] transition-colors duration-200">
      <Footer />
    </div>
    </>
  );
}
