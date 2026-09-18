import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";
import { blogPosts } from "../postsData";
import { articleRegistry } from "../content/articleRegistry";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  return {
    title: post ? `${post.title} — Skin Story` : "Blog — Skin Story",
    description: post ? `In-depth clinical guide on ${post.title.toLowerCase()}` : "Skin Story Blog",
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  const ArticleComponent = articleRegistry[slug];

  const isFirstBlog = slug === "why-does-stress-cause-breakouts-on-your-chin";
  const isSecondBlog = slug === "can-lack-of-sleep-lead-to-dull-skin-and-dark-circles";
  const isThirdBlog = slug === "does-sugar-really-cause-hormonal-acne-spikes";
  const showHeroImage = isFirstBlog || isSecondBlog || isThirdBlog;

  const heroImage = isSecondBlog
    ? "/blog-sleep-skin.jpg"
    : isThirdBlog
    ? "/blog-sugar-skin.jpg"
    : "/blog-stress-chin.jpg";

  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-4 sm:pb-6 transition-colors duration-200">
        <article className="max-w-[760px] mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-[2.65rem] font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.18] font-[family-name:var(--font-outfit)] mb-3">
            {post ? post.title : "Clinical Skin Analysis Article"}
          </h1>
          <div className="flex items-center gap-1 mb-8">
            <span className="inline-block w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white shrink-0" aria-hidden="true" />
            <span className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white tracking-tight ml-0.5">
              {post ? post.date : "4/27/2026"}
            </span>
          </div>

          {showHeroImage && (
            <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden mb-10 shadow-sm border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              <img src={heroImage} alt={post ? post.title : "Clinical skin analysis"} className="w-full h-full object-cover" />
            </div>
          )}

          {ArticleComponent ? (
            <ArticleComponent />
          ) : (
            <div className="min-h-[220px] rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-8 flex flex-col items-center justify-center text-center">
              <p className="text-zinc-500 dark:text-zinc-400 text-base">Article content in publication. Follow for updates.</p>
            </div>
          )}
        </article>
      </main>
      <div className="px-6 sm:px-12 pb-6 bg-white dark:bg-[#121212] transition-colors duration-200">
        <Footer />
      </div>
    </>
  );
}
