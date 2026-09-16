import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Blog — Skin Story",
  description: "Skin insights, science, and stories from the Skin Story team.",
};

const posts = [
  {
    slug: "why-consistency-beats-products",
    tag: "Skin Science",
    date: "September 2026",
    title: "Why Consistency Beats Products Every Time",
    excerpt:
      "Most people cycle through new serums and moisturisers hoping for a breakthrough. But the data tells a different story — the single biggest predictor of skin improvement is consistency, not what's in your routine.",
    readTime: "4 min read",
  },
  {
    slug: "what-your-skin-is-telling-you",
    tag: "Insights",
    date: "September 2026",
    title: "What Your Skin Is Actually Telling You",
    excerpt:
      "Skin is a mirror. Breakouts, dullness, and dryness aren't random — they're signals. We break down the most common patterns our AI identifies and what lifestyle factors they tend to map to.",
    readTime: "6 min read",
  },
];

export default function BlogPage() {
  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-4 sm:px-6 lg:px-8 pt-8 pb-20 sm:pb-28 transition-colors duration-200">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#937abd] mb-3">
              Skin Story Blog
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mb-3 font-[family-name:var(--font-outfit)]">
              Skin insights, science &amp; stories.
            </h1>
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
              No product placements. No affiliate links. Just honest writing about skin health, habits, and what the data actually shows.
            </p>
          </div>

          {/* Coming soon banner */}
          <div className="mb-10 rounded-2xl border border-[#d6cbe8] dark:border-[#5f4982] bg-[#f9f7fd] dark:bg-[#1e1728] px-5 py-4 flex items-center gap-3">
            <span className="text-[#937abd] text-lg">✦</span>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold text-zinc-950 dark:text-white">More articles coming soon.</span>{" "}
              We publish when we have something worth saying — not on a schedule.
            </p>
          </div>

          {/* Post list */}
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-6 hover:border-[#937abd] dark:hover:border-[#937abd] transition-colors duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#937abd]">
                    {post.tag}
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-600 text-xs">·</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{post.date}</span>
                  <span className="text-zinc-300 dark:text-zinc-600 text-xs">·</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{post.readTime}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)] group-hover:text-[#937abd] transition-colors duration-200">
                  {post.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#937abd]">
                  Read article <span aria-hidden="true">→</span>
                </span>
              </article>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="mt-14 pt-8 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

        </div>
      </main>
      <div className="px-6 sm:px-12 pb-6 bg-white dark:bg-[#121212] transition-colors duration-200">
        <Footer />
      </div>
    </>
  );
}
