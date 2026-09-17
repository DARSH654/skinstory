import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";
import { blogPosts } from "../postsData";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  return {
    title: post ? `${post.title} — Skin Story` : "Blog — Skin Story",
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-6 sm:px-12 pt-16 sm:pt-24 pb-20 sm:pb-28 transition-colors duration-200">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              ← Back to all blogs
            </Link>
          </div>

          {/* Title & Date */}
          <div className="space-y-3 mb-10">
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white leading-tight font-[family-name:var(--font-outfit)]">
              {post ? post.title : "Blog Post"}
            </h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              {post?.date || "April 2025"}
            </p>
          </div>

          {/* Empty Content Placeholder */}
          <div className="min-h-[260px] rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed">
              Article coming soon. Follow for updates.
            </p>
          </div>
        </div>
      </main>
      <div className="px-6 sm:px-12 pb-6 bg-white dark:bg-[#121212] transition-colors duration-200">
        <Footer />
      </div>
    </>
  );
}
