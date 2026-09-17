import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";
import HighlightPhrase from "@/components/HighlightPhrase";
import { blogPosts } from "./postsData";

export const metadata = {
  title: "Our Blog — Skin Story",
  description: "Follow for updates on skin health, habits, and clinical-grade patterns.",
};

export default function BlogPage() {
  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-6 sm:px-12 pt-16 sm:pt-24 pb-20 sm:pb-28 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">

          {/* Top Header */}
          <div className="text-center mb-16 sm:mb-20">
            <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-zinc-800 dark:text-zinc-200 mb-3 font-[family-name:var(--font-outfit)]">
              Our{" "}
              <HighlightPhrase
                words={[
                  { text: "Blog", hasSpace: false }
                ]}
              />
            </h1>
            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 font-normal">
              follow for updates
            </p>
          </div>

          {/* Blog Question Links List - No divider spacers, direct spacing like Cal AI */}
          <div className="flex flex-col space-y-9 sm:space-y-10">
            {blogPosts.map((post) => (
              <article key={post.slug} className="text-left">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block space-y-1 w-fit"
                >
                  <h2 className="text-xl sm:text-[1.45rem] font-semibold text-zinc-900 dark:text-zinc-100 group-hover:underline decoration-zinc-900 dark:decoration-white underline-offset-4 transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-[13px] sm:text-sm text-zinc-400 dark:text-zinc-500 font-normal group-hover:underline decoration-zinc-400 dark:decoration-zinc-500 underline-offset-2">
                    {post.date}
                  </p>
                </Link>
              </article>
            ))}
          </div>

        </div>
      </main>
      <div className="px-6 sm:px-12 pb-6 bg-white dark:bg-[#121212] transition-colors duration-200">
        <Footer />
      </div>
    </>
  );
}
