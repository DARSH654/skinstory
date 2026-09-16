import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Refund & Cancellation Policy — Skin Story",
  description: "Skin Story refund and cancellation policy for subscriptions and purchases.",
};

export default function RefundPage() {
  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-2 sm:px-4 lg:px-6 pt-6 pb-16 sm:pb-24 transition-colors duration-200">
        <div className="w-full">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">Refund &amp; Cancellation Policy</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">Last updated: September 2026</p>

        <div className="space-y-10 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">Current Status — Pre-Launch</h2>
            <p>Skin Story is currently in pre-launch. The waitlist is completely free to join. No payment is required and no charges are made at this stage. This Refund &amp; Cancellation Policy will become fully active when we launch paid plans.</p>
            <p className="mt-3">This page is published in advance so you understand our commitment before we go paid.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">1. Cancellation</h2>
            <p>When paid plans launch:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>You may cancel your subscription at any time from within the app (Account → Subscription → Cancel) or by contacting us at <a href="mailto:support@getskinstory.com" className="text-[#937abd] hover:underline">support@getskinstory.com</a>.</li>
              <li>Cancellation takes effect at the end of your current billing cycle. You retain full access to the paid features until the end of the paid period.</li>
              <li>We do not charge cancellation fees.</li>
              <li>After cancellation, your account reverts to the free tier (if available). Your skin data and history are preserved unless you also request account deletion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">2. Refunds — General Policy</h2>
            <p>We offer a straightforward refund policy:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>14-day money-back guarantee:</strong> If you are not satisfied with Skin Story within 14 days of your first paid charge, contact us and we will issue a full refund — no questions asked.</li>
              <li><strong>After 14 days:</strong> Refunds are evaluated on a case-by-case basis. We will consider refund requests where the service was materially non-functional or where there was a billing error on our part.</li>
              <li><strong>Partial refunds:</strong> We do not offer partial refunds for unused portions of a subscription period (e.g., if you cancel mid-month).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">3. In-App Purchases (App Store / Google Play)</h2>
            <p>If you purchase a Skin Story subscription through the Apple App Store or Google Play, the refund is handled by Apple or Google respectively under their own refund policies:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Apple App Store:</strong> Request a refund at <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener noreferrer" className="text-[#937abd] hover:underline">reportaproblem.apple.com</a>.</li>
              <li><strong>Google Play:</strong> Request a refund through the Google Play app or at <a href="https://play.google.com/store/account/orderhistory" target="_blank" rel="noopener noreferrer" className="text-[#937abd] hover:underline">Google Play Order History</a>.</li>
            </ul>
            <p className="mt-3">We are unable to directly process refunds for purchases made through these platforms. However, if you have an issue, contact us first and we will do our best to assist or advocate on your behalf.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">4. Founding Member / Early Access Pricing</h2>
            <p>Early members who join the waitlist and receive special founding-member pricing lock in their price for as long as they remain subscribed. If a founding member cancels and later re-subscribes, the founding-member price is not guaranteed to be available again.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">5. How to Request a Refund</h2>
            <p>To request a refund, email us at <a href="mailto:support@getskinstory.com" className="text-[#937abd] hover:underline">support@getskinstory.com</a> with:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>The email address associated with your account.</li>
              <li>The date of the charge and the amount.</li>
              <li>A brief reason for the refund request (optional but helpful).</li>
            </ul>
            <p className="mt-3">We will respond within 3 business days. Approved refunds are processed within 5–10 business days depending on your payment method and bank.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white mb-3">6. Changes to This Policy</h2>
            <p>We may update this policy as we evolve our pricing and subscription model. Material changes will be communicated via email to active subscribers. The date at the top of this page reflects the most recent revision.</p>
          </section>

        </div>
      </div>
    </main>
    <div className="px-6 sm:px-12 pb-6 bg-white dark:bg-[#121212] transition-colors duration-200">
      <Footer />
    </div>
    </>
  );
}
