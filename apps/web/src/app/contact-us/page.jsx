import Link from "next/link";

export const metadata = {
  title: "Contact Us — Skin Story",
  description: "Get in touch with the Skin Story team.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-16 sm:py-24">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-10 transition-colors">
          ← Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
          Contact Us
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-10 text-sm leading-relaxed">
          We are a small team and we read every message. Expect a reply within 48 hours.
        </p>
        <div className="space-y-4">
          {[
            { label: "General", desc: "Questions, feedback, and everything else.", email: "hello@getskinstory.com" },
            { label: "Support", desc: "Help with your account, waitlist, or the app.", email: "support@getskinstory.com" },
            { label: "Privacy & Legal", desc: "Data requests, deletions, and legal enquiries.", email: "privacy@getskinstory.com" },
            { label: "Press & Media", desc: "Interviews, features, and partnerships.", email: "press@getskinstory.com" },
          ].map(({ label, desc, email }) => (
            <div key={label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">{label}</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">{desc}</p>
              <a href={`mailto:${email}`} className="text-[#937abd] font-medium hover:underline text-sm">{email}</a>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-8 text-center">
          {"Have a quick question? "}<Link href="/faq" className="text-[#937abd] hover:underline">Check the FAQ</Link>{" first."}
        </p>
      </div>
    </main>
  );
}
