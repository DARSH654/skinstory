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

          <section id="pre-launch">
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">About Pre-Launch Orders</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                Joining the Skin Story waitlist is 100% free. There is no charge or credit card required to sign up, and we will notify you as soon as the Application officially launches.
              </p>
              <p>
                During our pre-launch period, waitlist members have the exclusive opportunity to secure a{" "}
                <Link href="/pre-launch-offer" className="font-semibold text-zinc-800 dark:text-zinc-200 hover:underline hover:underline-offset-2">
                  Pre-Launch Offer
                </Link>
                . For a one-time pre-order payment of $4.99, users receive an email containing a digital scratch card that unlocks a unique referral code for up to 6 months of premium access upon application launch.
              </p>
              <p>
                Pre-launch pre-orders are eligible for a full refund within 14 days of purchase, provided the digital scratch card sent to your email has not been scratched or revealed.
              </p>
            </div>
          </section>

          <section id="subscriptions">
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">In-App Purchases &amp; Subscriptions</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                When Skin Story officially launches, we will offer standard recurring subscription plans on a weekly, monthly, and annual basis. In-app purchases and subscriptions made via the Apple App Store or Google Play Store are processed through their respective billing infrastructure and governed by store refund standards.
              </p>
              <p>
                Direct web purchases processed via independent payment infrastructure (Stripe and Razorpay) also carry a 14-day money-back guarantee. Please note that this 14-day refund guarantee is strictly limited to one time per user account to prevent abuse.
              </p>
            </div>
          </section>

          <section id="cancellation">
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Subscription Cancellation Guidelines</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                You may cancel your subscription at any time directly through your mobile app store account settings or web billing dashboard. There are zero cancellation fees or penalty charges.
              </p>
              <p>
                Upon cancellation, your subscription will not renew, but you will retain full access to all paid features until the end of your current active billing period.
              </p>
            </div>
          </section>

          <section id="non-refundable">
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Non-Refundable Circumstances &amp; Digital Card Redemption</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                When you complete a pre-launch pre-order, a digital scratch card is delivered directly to your verified email address. The moment you open and scratch or reveal the digital card in your email, our system registers the code as revealed, and the promotional offer is deemed fully claimed and consumed. Once a digital scratch card has been revealed or its referral code redeemed inside the Application, the purchase is strictly non-refundable.
              </p>
              <p>
                Additionally, if an account is suspended or permanently banned due to severe Terms of Service violations—such as reverse engineering, unauthorized data scraping, harvesting third-party information, or creating chaos and abuse within the Skin Story community—the user forfeits all refund rights, and no refund will be issued under any circumstances.
              </p>
            </div>
          </section>

          <section id="request-refund">
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">How to Request a Refund</h2>
            <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <p>
                To request a refund for an unredeemed pre-launch pre-order or direct web purchase within the 14-day window, please email our billing team at{" "}
                <a href="mailto:billing@getskinstory.com" className="font-semibold text-zinc-800 dark:text-zinc-200 hover:underline hover:underline-offset-2">
                  billing@getskinstory.com
                </a>
                {" "}with your account email address and purchase transaction receipt. Approved refunds will be processed back to your original payment method within 5–10 business days.
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
