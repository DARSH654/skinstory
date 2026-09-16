import Link from "next/link";

export const metadata = {
  title: "Cookie Policy — Skin Story",
  description: "How Skin Story uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-10 transition-colors">
          ← Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
          Cookie Policy
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10">Last updated: September 2026</p>
        <div className="space-y-8 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">

          <section>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white mb-2">What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and function correctly.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white mb-2">How We Use Cookies</h2>
            <p>Skin Story uses only <strong>essential cookies</strong> — the minimum required to keep the site functional. We do not use advertising cookies, tracking cookies, or any third-party analytics cookies that share your data with advertisers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white mb-2">Types of Cookies We Use</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Session cookies</strong> — Temporary cookies deleted when you close your browser. Used to keep you logged in during a session.</li>
              <li><strong>Preference cookies</strong> — Store your theme preference (Light / Dark / System) so it persists across visits.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white mb-2">Third-Party Cookies</h2>
            <p>We do not allow third-party advertising or analytics cookies on our site. Any infrastructure services we use are contractually prohibited from using your data for their own purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white mb-2">Managing Cookies</h2>
            <p>You can control cookies through your browser settings. Disabling essential cookies may affect the functionality of the site. Most browsers allow you to refuse or delete cookies — refer to your browser{"'"}s help documentation for instructions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white mb-2">Changes to This Policy</h2>
            <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white mb-2">Contact</h2>
            <p>Questions about cookies? Email us at <a href="mailto:privacy@getskinstory.com" className="text-[#937abd] hover:underline">privacy@getskinstory.com</a>.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
