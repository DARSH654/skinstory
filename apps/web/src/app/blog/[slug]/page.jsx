import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
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
    description: post ? `In-depth clinical guide on ${post.title.toLowerCase()}` : "Skin Story Blog",
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  const isFirstBlog = slug === "why-does-stress-cause-breakouts-on-your-chin";
  const isSecondBlog = slug === "can-lack-of-sleep-lead-to-dull-skin-and-dark-circles";
  const isThirdBlog = slug === "does-sugar-really-cause-hormonal-acne-spikes";

  const heroImage = isSecondBlog
    ? "/blog-sleep-skin.jpg"
    : isThirdBlog
    ? "/blog-sugar-food.jpg"
    : "/blog-stress-chin.jpg";

  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-white dark:bg-[#121212] px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-4 sm:pb-6 transition-colors duration-200">
        <article className="max-w-[760px] mx-auto">
          {/* 1. Title (Big, bold, question format like Cal AI) */}
          <h1 className="text-3xl sm:text-4xl md:text-[2.65rem] font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.18] font-[family-name:var(--font-outfit)] mb-3">
            {post ? post.title : "Why Does Stress Cause Breakouts on Your Chin?"}
          </h1>

          {/* 2. Date row with Hero Pill Dot — larger date, dot moved rightwards closer */}
          <div className="flex items-center gap-1 mb-8">
            <span
              className="inline-block w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white shrink-0"
              aria-hidden="true"
            />
            <span className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white tracking-tight ml-0.5">
              {post ? post.date : "4/27/2026"}
            </span>
          </div>

          {/* 3. Hero Featured Image */}
          <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden mb-10 shadow-sm border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
            <img
              src={heroImage}
              alt={post ? post.title : "Clinical skin analysis"}
              className="w-full h-full object-cover"
            />
          </div>

          {isFirstBlog ? (
            /* 4. First Blog Body: Punchy, scannable, tables, lists, interlinking */
            <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">
              
              <p>
                Almost everyone who experiences acute stress notices breakouts in the exact same spot: the lower jawline and chin. While commercial skincare brands often blame surface dirt or dirty phone screens, the clinical reality is deeply biochemical. <Link href="/blog/why-do-breakouts-keep-happening-in-the-exact-same-spot" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why do breakouts keep happening in the exact same spot?</Link> The answer lies in localized hormonal sensitivity rather than surface hygiene.
              </p>

              <p>
                When chronic pressure mounts, your adrenal glands release surges of <strong className="font-semibold text-zinc-950 dark:text-white">systemic cortisol</strong>. Cortisol interacts directly with androgen receptors densely packed along the lower third of your face, triggering rapid sebum hyper-secretion and follicular occlusion. When paired with high glycemic foods, this reaction accelerates even further. <Link href="/blog/how-does-high-glycemic-food-affect-sebum-production" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How does high glycemic food affect sebum production?</Link> It spikes circulating insulin-like growth factor 1 (IGF-1), creating a compounding storm with cortisol.
              </p>

              {/* Fast Fact Box - 3px solid black border */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                  CORE PATTERN KEY
                </p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  Stress-induced chin breakouts typically appear <strong className="text-zinc-950 dark:text-white font-bold">48 to 72 hours</strong> after the acute emotional or physical trigger, not immediately on the day of stress. Tracking this latency window is the key to preventing recurring clusters.
                </p>
              </div>

              {/* Image 2: Clinical Diagram */}
              <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden my-10 shadow-sm border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                <img
                  src="/blog-stress-diagram.jpg"
                  alt="Clinical analysis of cellular cortisol and skin barrier pathways"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The Cortisol-to-Sebum Cascade
              </h2>

              <p>
                Your chin and jawline feature the highest concentration of androgen-sensitive sebaceous glands on the human body. Understanding this biological loop requires examining what happens at the cellular level:
              </p>

              {/* Bulleted Insights List with matching styled dots (primary color inside, black/white border) */}
              <ul className="space-y-4 pl-1 my-6">
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Adrenal activation:</strong> Elevated corticotropin-releasing hormone (CRH) signals local sebocytes to produce stickier, squalene-heavy sebum that solidifies rapidly inside pores.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Follicular hypoxia:</strong> Solidified oil traps oxygen-intolerant <em>C. acnes</em> colonies deep inside follicle pockets, shielding them from topical washes.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Delayed inflammatory response:</strong> Neutrophils and pro-inflammatory cytokines surge toward the follicle 48 hours later, producing deep, throbbing cystic nodules instead of minor surface pustules.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Why Sleep Loss Multiplies the Damage
              </h2>

              <p>
                High stress is rarely isolated; it almost always coincides with reduced restorative deep sleep. <Link href="/blog/can-lack-of-sleep-lead-to-dull-skin-and-dark-circles" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Can lack of sleep lead to dull skin and dark circles?</Link> During Stage 3 non-REM sleep, human growth hormone (HGH) accelerates skin cellular turnover and epidermal barrier repair. When sleep drops below 6 hours, night-time cortisol remains elevated, impairing cellular recovery while doubling sebum viscosity.
              </p>

              <p>
                Furthermore, chronic sleep disruption compromises your skin barrier moisture retention. <Link href="/blog/how-long-does-it-take-to-repair-a-damaged-skin-barrier" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How long does it take to repair a damaged skin barrier?</Link> If you aggressively apply harsh exfoliating acids during a stress breakout, you compound cellular dehydration and lengthen recovery from days to weeks.
              </p>

              {/* Comparative Matrix Table */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Stress Acne vs. Hormonal &amp; Barrier Acne
              </h3>

              <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Feature</th>
                      <th className="py-3.5 px-4 font-bold">Stress Breakout</th>
                      <th className="py-3.5 px-4 font-bold">Barrier Damage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Primary Zone</td>
                      <td className="py-3 px-4">Chin &amp; Lower Jawline</td>
                      <td className="py-3 px-4">Cheeks &amp; Forehead</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Nodule Depth</td>
                      <td className="py-3 px-4">Deep, cystic, non-poppable</td>
                      <td className="py-3 px-4">Superficial red rash pustules</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Latency Window</td>
                      <td className="py-3 px-4">48 to 72 hours post-stress</td>
                      <td className="py-3 px-4">Immediate stinging after actives</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Primary Catalyst</td>
                      <td className="py-3 px-4">Adrenal cortisol &amp; CRH surges</td>
                      <td className="py-3 px-4">Over-cleansing &amp; strong AHA/BHAs</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Resolution Time</td>
                      <td className="py-3 px-4">5–8 days post-calm</td>
                      <td className="py-3 px-4">2–4 weeks of barrier repair</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Image 3: Calming Skincare Routine */}
              <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden my-10 shadow-sm border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                <img
                  src="/blog-skincare-routine.jpg"
                  alt="Minimal restorative skincare essentials on stone surface"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Clinical Steps to Interrupt the Flare-Up
              </h2>

              <p>
                Treating a stress breakout requires calming systemic inflammation rather than scrubbing pore surfaces with aggressive cleansers. Dermatologists recommend a four-stage protocol:
              </p>

              <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Halt all exfoliating acids immediately:</strong> Temporarily pause glycolic acid, salicylic acid, and prescription retinoids while chin nodules remain inflamed and red.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Apply localized cold compresses:</strong> 5 minutes of targeted icing twice daily constricts dilated capillaries and blunts the inflammatory prostaglandin surge.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Reinforce with ceramide-dense hydration:</strong> Use low-irritant lipid formulas containing ceramides NP/AP to prevent transepidermal water loss.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Target fast relief without popping:</strong> <Link href="/blog/what-is-the-fastest-way-to-calm-an-inflamed-under-skin-pimple" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">What is the fastest way to calm an inflamed under-skin pimple?</Link> Hydrocolloid micro-dart patches deliver soothing actives directly into the nodule without breaking surface skin.
                </li>
              </ol>

              {/* Interlinked Related Articles - Exactly 2 cards with diagonal arrows */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
                Related Pattern Guides
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <Link
                  href="/blog/can-lack-of-sleep-lead-to-dull-skin-and-dark-circles"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    Can Lack of Sleep Lead to Dull Skin and Dark Circles?
                  </p>
                  <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  href="/blog/how-long-does-it-take-to-repair-a-damaged-skin-barrier"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    How Long Does It Take to Repair a Damaged Skin Barrier?
                  </p>
                  <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              {/* Bottom In-App CTA — Seamless (no divider/spacer line), matched to homepage CTA style and spacing */}
              <div className="mt-14 sm:mt-20 text-center flex flex-col items-center justify-center gap-6">
                <div className="max-w-2xl mx-auto space-y-3">
                  <h2 className="text-3xl sm:text-5xl lg:text-[48px] font-normal tracking-tight text-zinc-800 dark:text-zinc-200 leading-[1.14] font-[family-name:var(--font-outfit)]">
                    <span className="relative inline-block whitespace-nowrap">
                      <span className="relative z-10 font-medium text-zinc-950 dark:text-white">
                        Stop guessing
                      </span>
                      <span
                        className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                        aria-hidden="true"
                      />
                    </span>{" "}
                    what triggered your skin.
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
                    Skin Story isolates your facial lighting and tracks exactly how stress correlates to chin flare-ups with clinical-grade clarity.
                  </p>
                </div>

                {/* Email Form — Exactly matching homepage WaitlistCtaSection styling */}
                <div className="w-full max-w-md mx-auto pt-1">
                  <form
                    action="/#early-access"
                    className="space-y-3"
                  >
                    <div className="flex items-center p-1.5 bg-zinc-50/90 dark:bg-zinc-900 rounded-full border border-zinc-300 dark:border-zinc-700 focus-within:border-[3px] focus-within:border-black dark:focus-within:border-white shadow-[0_2px_14px_rgba(0,0,0,0.04)] transition-all">
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        className="flex-1 min-w-0 px-4 py-2.5 text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-transparent outline-hidden text-left"
                      />
                      <button
                        type="submit"
                        className="px-5 sm:px-6 py-2.5 text-sm sm:text-base font-semibold text-white bg-[#937abd] hover:bg-[#856db0] rounded-full transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <span>Join Waitlist</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          ) : isSecondBlog ? (
            /* 4. Blog 2 Body: Can Lack of Sleep Lead to Dull Skin and Dark Circles? */
            <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">

              <p>
                Everyone has experienced the morning-after effect of a terrible night's sleep: a pale, sunken complexion, visible puffiness under the eyes, and a dull, lifeless texture that no moisturiser seems to fix. But this is not simply cosmetic. The cellular mechanisms behind sleep deprivation and skin deterioration are deeply physiological. <Link href="/blog/why-does-stress-cause-breakouts-on-your-chin" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why does stress cause breakouts on your chin?</Link> Stress and sleep share the same hormonal highway: elevated cortisol overnight is the direct bridge between a restless night and a reactive complexion the next morning.
              </p>

              <p>
                Dermatological research confirms that sleep deprivation measurably degrades perceived skin health across four dimensions: radiance, evenness of tone, barrier integrity, and fine-line depth. What most people miss is how rapidly these changes accumulate. Two consecutive nights below six hours of sleep is clinically sufficient to produce visible transepidermal water loss (TEWL) increases of up to 30%, measurable under laboratory conditions.
              </p>

              {/* Fast Fact Box */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                  CORE PATTERN KEY
                </p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  During Stage 3 non-REM deep sleep, your pituitary gland releases the highest daily surge of <strong className="text-zinc-950 dark:text-white font-bold">human growth hormone (HGH)</strong>. This is the primary driver of overnight epidermal cellular renewal and collagen synthesis. Cutting sleep short cuts this repair window entirely — no supplement replaces it.
                </p>
              </div>

              {/* Image 2 */}
              <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden my-10 shadow-sm border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                <img
                  src="/blog-sleep-dark-circles.jpg"
                  alt="Sleep deprivation and cortisol impact on skin barrier diagram"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The HGH Window and Why It Cannot Be Hacked
              </h2>

              <p>
                Human growth hormone is not released on demand. Its secretion is tightly gated to slow-wave sleep (SWS) — specifically the 90-minute deep sleep phases that occur primarily in the first half of the night. When you cut sleep short or fragment it with late-night screen exposure, you crush the SWS duration and the HGH release that comes with it.
              </p>

              <ul className="space-y-4 pl-1 my-6">
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Collagen synthesis halts:</strong> HGH directly stimulates fibroblasts in the dermis to produce Type I and Type III collagen. No HGH surge means no overnight collagen rebuild, accelerating the thinning of skin over years.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Epidermal cell turnover slows:</strong> Keratinocyte proliferation in the basal layer relies on nocturnal HGH. Sluggish turnover means dead skin accumulates on the surface, creating visible dullness, texture, and uneven tone.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Barrier lipid replenishment fails:</strong> Ceramide and fatty acid synthesis in the stratum corneum is upregulated during HGH-rich deep sleep. Poor sleep measurably reduces barrier lipid density, increasing sensitivity to environmental irritants.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Melatonin antioxidant effect is lost:</strong> Melatonin, secreted in darkness, is a potent free-radical scavenger that neutralises oxidative stress from UV and pollution sustained during the day. Disrupted sleep timing suppresses melatonin output and leaves oxidative damage unrepaired.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Dark Circles: The Periorbital Vascular Mechanism
              </h2>

              <p>
                Dark circles are widely misunderstood. They are not primarily a pigmentation issue — they are a <strong className="font-semibold text-zinc-950 dark:text-white">vascular and structural</strong> problem amplified by poor sleep. Under sleep deprivation, cortisol keeps small capillaries and venules in a dilated, leaky state overnight. Blood pools in the fragile periorbital tissue — the thinnest skin on the face — creating the characteristic blue-purple discolouration visible through translucent skin.
              </p>

              <p>
                Simultaneously, fluid redistribution during lying-down sleep is disrupted when sleep is shallow or fragmented. <Link href="/blog/how-long-does-it-take-to-repair-a-damaged-skin-barrier" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How long does it take to repair a damaged skin barrier?</Link> The connective tissue scaffolding beneath the eye loses hydration rapidly under sleep stress, compressing the delicate matrix and making the under-eye hollows appear deeper and more shadowed — an effect no eye cream fully reverses without addressing sleep quality at the root.
              </p>

              {/* Comparison Table */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Good Sleep vs. Poor Sleep: Measurable Skin Outcomes
              </h3>

              <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Skin Metric</th>
                      <th className="py-3.5 px-4 font-bold">7–9 hrs Quality Sleep</th>
                      <th className="py-3.5 px-4 font-bold">Under 6 hrs Sleep</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">HGH Secretion</td>
                      <td className="py-3 px-4">Full nocturnal surge (70–80% of daily output)</td>
                      <td className="py-3 px-4">Suppressed — SWS window compressed or absent</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Cortisol at 2am</td>
                      <td className="py-3 px-4">At nadir — lowest point of the day</td>
                      <td className="py-3 px-4">Elevated — disrupts cellular repair signalling</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">TEWL (Barrier Loss)</td>
                      <td className="py-3 px-4">Normal — barrier lipids replenished overnight</td>
                      <td className="py-3 px-4">Up to 30% higher — increased sensitivity &amp; dryness</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Periorbital Vessels</td>
                      <td className="py-3 px-4">Constricted — fluid redistributed normally</td>
                      <td className="py-3 px-4">Dilated &amp; pooled — visible dark circles by morning</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Skin Radiance Score</td>
                      <td className="py-3 px-4">High — dead cell turnover complete</td>
                      <td className="py-3 px-4">Low — surface debris accumulated, dull texture</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Collagen Synthesis</td>
                      <td className="py-3 px-4">Active — fibroblast stimulation overnight</td>
                      <td className="py-3 px-4">Reduced — fine-line depth increases over weeks</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Image 3 */}
              <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden my-10 shadow-sm border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                <img
                  src="/blog-sleep-skin.jpg"
                  alt="Restorative evening skincare products for sleep-deprived skin"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The Clinical Sleep-to-Skin Recovery Protocol
              </h2>

              <p>
                Addressing sleep-related skin damage requires both improving sleep architecture and supporting the skin barrier during vulnerable periods. Topical products alone cannot compensate for systemic HGH deficiency caused by chronic short sleep.
              </p>

              <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Protect the nocturnal melatonin window:</strong> Eliminate all screens emitting blue light after 9pm. Blue light at 480nm wavelength directly suppresses melatonin secretion by the pineal gland. Even 30 minutes of exposure delays melatonin onset by up to 90 minutes, compressing SWS significantly.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Apply an occlusive barrier emollient before sleep:</strong> Petrolatum-based or ceramide-dense overnight masks create a physical barrier that reduces overnight TEWL by up to 50%, compensating partially for reduced ceramide synthesis caused by poor sleep quality.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Use a chilled eye compress on waking:</strong> 3 minutes of a cool compress (not ice-cold) over the periorbital zone causes rapid vasoconstriction of dilated capillaries, visibly reducing dark circle intensity and puffiness within minutes.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Track your sleep-skin latency pattern:</strong> <Link href="/blog/why-does-stress-cause-breakouts-on-your-chin" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Just as stress breakouts appear 48–72 hours after the trigger</Link>, dull skin from poor sleep peaks 24–36 hours after the deprived night, not immediately — making pattern tracking essential to connect the real cause with the visible outcome.
                </li>
              </ol>

              {/* Related Guide Cards */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
                Related Pattern Guides
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <Link
                  href="/blog/why-does-stress-cause-breakouts-on-your-chin"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    Why Does Stress Cause Breakouts on Your Chin?
                  </p>
                  <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  href="/blog/how-long-does-it-take-to-repair-a-damaged-skin-barrier"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    How Long Does It Take to Repair a Damaged Skin Barrier?
                  </p>
                  <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              {/* Bottom CTA */}
              <div className="mt-14 sm:mt-20 text-center flex flex-col items-center justify-center gap-6">
                <div className="max-w-2xl mx-auto space-y-3">
                  <h2 className="text-3xl sm:text-5xl lg:text-[48px] font-normal tracking-tight text-zinc-800 dark:text-zinc-200 leading-[1.14] font-[family-name:var(--font-outfit)]">
                    <span className="relative inline-block whitespace-nowrap">
                      <span className="relative z-10 font-medium text-zinc-950 dark:text-white">
                        Stop guessing
                      </span>
                      <span
                        className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                        aria-hidden="true"
                      />
                    </span>{" "}
                    what your sleep is doing to your skin.
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
                    Skin Story correlates your sleep patterns to skin radiance and dark circle severity with clinical-grade facial analysis — every single morning.
                  </p>
                </div>

                <div className="w-full max-w-md mx-auto pt-1">
                  <form action="/#early-access" className="space-y-3">
                    <div className="flex items-center p-1.5 bg-zinc-50/90 dark:bg-zinc-900 rounded-full border border-zinc-300 dark:border-zinc-700 focus-within:border-[3px] focus-within:border-black dark:focus-within:border-white shadow-[0_2px_14px_rgba(0,0,0,0.04)] transition-all">
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        className="flex-1 min-w-0 px-4 py-2.5 text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-transparent outline-hidden text-left"
                      />
                      <button
                        type="submit"
                        className="px-5 sm:px-6 py-2.5 text-sm sm:text-base font-semibold text-white bg-[#937abd] hover:bg-[#856db0] rounded-full transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <span>Join Waitlist</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          ) : isThirdBlog ? (
            /* 4. Blog 3 Body: Does Sugar Really Cause Hormonal Acne Spikes? */
            <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">

              <p>
                The relationship between dietary sugar and acne is one of the most contested topics in dermatology — and one of the most consequential for the millions of adults experiencing persistent hormonal breakouts despite consistent skincare routines. The question is not simply whether sugar is bad for skin; it is about <em>which</em> sugars, at <em>what doses</em>, through <em>which biological pathways</em>, trigger the hormonal cascade that produces inflammatory acne. <Link href="/blog/why-does-stress-cause-breakouts-on-your-chin" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Just as stress-induced cortisol drives chin breakouts</Link>, elevated post-meal insulin creates its own hormonal domino effect — and the two pathways compound each other in significant ways.
              </p>

              <p>
                Population studies from Papua New Guinea and Paraguay documented near-zero acne prevalence in communities eating exclusively low-glycemic, whole-food diets — a rate that changed dramatically within one generation of adopting Western high-sugar food patterns. This is not anecdotal. It is a longitudinal signal that metabolic factors, specifically insulin and its downstream effects on androgens, are primary drivers of acne pathogenesis for a significant percentage of sufferers. <Link href="/blog/can-lack-of-sleep-lead-to-dull-skin-and-dark-circles" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Can lack of sleep lead to dull skin and dark circles?</Link> Sleep deprivation further amplifies this: insulin sensitivity drops measurably after even two nights of short sleep, meaning the same sugary meal produces a higher insulin spike in a sleep-deprived person.
              </p>

              {/* Fast Fact Box */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                  CORE PATTERN KEY
                </p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  High-glycemic meals spike <strong className="text-zinc-950 dark:text-white font-bold">IGF-1 (insulin-like growth factor 1)</strong> within 30 minutes of consumption. IGF-1 directly activates androgen receptors in sebaceous glands, triggering accelerated sebum production. The breakout appears 3–5 days later — making the dietary trigger nearly impossible to identify without systematic tracking.
                </p>
              </div>

              {/* Image 2 */}
              <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden my-10 shadow-sm border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                <img
                  src="/blog-acne-jawline.jpg"
                  alt="Hormonal acne pattern on jawline and chin linked to dietary sugar"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The IGF-1 and Insulin-Androgen Mechanism
              </h2>

              <p>
                When you consume high-glycemic carbohydrates — white bread, sugary drinks, refined cereals, sweetened yoghurts — blood glucose spikes rapidly. The pancreas responds by releasing a large bolus of insulin. Simultaneously, IGF-1 levels rise in parallel. Together, insulin and IGF-1 signal the liver and peripheral tissues in ways that directly and indirectly drive acne:
              </p>

              <ul className="space-y-4 pl-1 my-6">
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">IGF-1 activates sebaceous androgen receptors:</strong> IGF-1 binds to receptors on sebocytes (oil-producing cells) and keratinocytes, directly upregulating sebum production and accelerating the follicular hyperkeratinisation that plugs pores.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Insulin suppresses SHBG production:</strong> Sex hormone-binding globulin (SHBG) is a carrier protein that binds and deactivates free androgens like testosterone and dihydrotestosterone (DHT) in the bloodstream. High chronic insulin levels suppress hepatic SHBG synthesis, leaving more free androgens circulating and available to activate sebaceous glands.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">mTORC1 pathway activation accelerates proliferation:</strong> IGF-1 triggers the mTORC1 intracellular signalling pathway, which promotes rapid sebocyte and keratinocyte proliferation — increasing the volume of sticky sebum produced and accelerating pore blockage.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Advanced glycation end-products (AGEs) form:</strong> Chronically high blood sugar glycates skin proteins — particularly collagen and elastin — producing AGEs that make sebum stiffer, more viscous, and more prone to oxidation inside the follicle. Oxidised squalene in sebum is a primary trigger of the inflammatory acne cascade.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Gut microbiome disruption alters skin immunity:</strong> High sugar intake selectively feeds inflammatory bacterial strains in the gut while starving beneficial short-chain fatty acid producers. This systemic dysbiosis weakens skin immune tolerance and exacerbates the inflammatory response to <em>C. acnes</em> colonisation.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Glycemic Index vs. Glycemic Load: The Numbers That Actually Matter
              </h2>

              <p>
                Glycemic Index (GI) measures how fast a food raises blood glucose relative to pure glucose. But Glycemic Load (GL) is the clinically relevant figure — it accounts for both GI and serving size. A small amount of a high-GI food may produce a lower GL than a large serving of a moderate-GI food. For acne management, total daily glycemic load matters far more than avoiding individual high-GI foods.
              </p>

              {/* Comparison Table */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Low vs. High Glycemic Load: Foods and Skin Impact
              </h3>

              <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Food Category</th>
                      <th className="py-3.5 px-4 font-bold">Glycemic Load</th>
                      <th className="py-3.5 px-4 font-bold">Skin Effect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">White bread, white rice, bagels</td>
                      <td className="py-3 px-4">High (GL 20+)</td>
                      <td className="py-3 px-4">Rapid IGF-1 &amp; insulin spike — high acne risk</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Sugary drinks, fruit juice, energy drinks</td>
                      <td className="py-3 px-4">Very High</td>
                      <td className="py-3 px-4">Fastest spike — no fibre to slow absorption</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Whole oats, quinoa, legumes</td>
                      <td className="py-3 px-4">Low–Medium (GL 5–12)</td>
                      <td className="py-3 px-4">Slow glucose release — stable insulin, lower IGF-1</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Non-starchy vegetables, leafy greens</td>
                      <td className="py-3 px-4">Very Low (GL &lt;5)</td>
                      <td className="py-3 px-4">Anti-inflammatory — zinc, antioxidants support skin repair</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Fatty fish, eggs, nuts, seeds</td>
                      <td className="py-3 px-4">Negligible GL</td>
                      <td className="py-3 px-4">Omega-3s reduce sebum oxidation and follicular inflammation</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Dark chocolate (85%+), berries</td>
                      <td className="py-3 px-4">Low</td>
                      <td className="py-3 px-4">Flavonoids reduce systemic inflammation — moderate intake beneficial</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Image 3 */}
              <div className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden my-10 shadow-sm border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                <img
                  src="/blog-glycemic-food.jpg"
                  alt="Glycemic load chart and insulin-androgen pathway diagram"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The 4-Step Dietary Protocol for Hormonal Acne Control
              </h2>

              <p>
                Eliminating sugar entirely is neither realistic nor necessary. The goal is to reduce the cumulative daily glycemic load to a range that keeps IGF-1 and insulin at levels below the threshold that activates hormonal sebum overproduction. Dermatologists and nutritional scientists currently recommend a daily GL below 70 as a therapeutic target for acne-prone individuals.
              </p>

              <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Replace refined carbohydrates with low-GL whole grains:</strong> Swap white bread, white rice, and breakfast cereals for whole grain rye, steel-cut oats, quinoa, and barley. These create a slower, flatter glucose and insulin response. The fibre content also feeds beneficial gut bacteria that modulate skin immune tolerance.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Eliminate liquid sugar entirely as the first step:</strong> Fruit juice, sweetened coffee drinks, energy drinks, and soft drinks deliver glucose with zero fibre buffering — the fastest route to maximum insulin spike. Replacing these with water, sparkling water, or unsweetened herbal teas produces the fastest measurable improvement in breakout frequency.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Pair every carbohydrate with protein and fat:</strong> Eating carbohydrates with protein (e.g. eggs, chicken, fish) and healthy fat (e.g. avocado, olive oil, nuts) significantly blunts the glycemic response by slowing gastric emptying. A meal of white rice alone spikes glucose far harder than the same rice eaten with salmon and vegetables.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Track your dietary triggers over a 5-day lag window:</strong> Because IGF-1-triggered sebum overproduction takes 3–5 days to manifest as a visible breakout, connecting diet to skin outcomes requires systematic tracking rather than daily inspection. <Link href="/blog/can-lack-of-sleep-lead-to-dull-skin-and-dark-circles" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Sleep deprivation compounds this window further</Link> — the combination of a high-GL meal and a poor night's sleep produces significantly worse outcomes than either factor alone.
                </li>
              </ol>

              {/* Related Guide Cards */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
                Related Pattern Guides
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <Link
                  href="/blog/why-does-stress-cause-breakouts-on-your-chin"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    Why Does Stress Cause Breakouts on Your Chin?
                  </p>
                  <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  href="/blog/can-dairy-trigger-cystic-acne-on-your-jawline"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    Can Dairy Trigger Cystic Acne on Your Jawline?
                  </p>
                  <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              {/* Bottom CTA */}
              <div className="mt-14 sm:mt-20 text-center flex flex-col items-center justify-center gap-6">
                <div className="max-w-2xl mx-auto space-y-3">
                  <h2 className="text-3xl sm:text-5xl lg:text-[48px] font-normal tracking-tight text-zinc-800 dark:text-zinc-200 leading-[1.14] font-[family-name:var(--font-outfit)]">
                    <span className="relative inline-block whitespace-nowrap">
                      <span className="relative z-10 font-medium text-zinc-950 dark:text-white">
                        Stop guessing
                      </span>
                      <span
                        className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                        aria-hidden="true"
                      />
                    </span>{" "}
                    what your diet is doing to your skin.
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
                    Skin Story correlates your meals to hormonal breakout patterns with clinical-grade facial analysis — so you finally see the 5-day lag your skincare routine has been missing.
                  </p>
                </div>

                <div className="w-full max-w-md mx-auto pt-1">
                  <form action="/#early-access" className="space-y-3">
                    <div className="flex items-center p-1.5 bg-zinc-50/90 dark:bg-zinc-900 rounded-full border border-zinc-300 dark:border-zinc-700 focus-within:border-[3px] focus-within:border-black dark:focus-within:border-white shadow-[0_2px_14px_rgba(0,0,0,0.04)] transition-all">
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        className="flex-1 min-w-0 px-4 py-2.5 text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-transparent outline-hidden text-left"
                      />
                      <button
                        type="submit"
                        className="px-5 sm:px-6 py-2.5 text-sm sm:text-base font-semibold text-white bg-[#937abd] hover:bg-[#856db0] rounded-full transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <span>Join Waitlist</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          ) : (
            /* Fallback for blogs 4–40 */
            <div className="min-h-[220px] rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-8 flex flex-col items-center justify-center text-center">
              <p className="text-zinc-500 dark:text-zinc-400 text-base">
                Article content in publication. Follow for updates.
              </p>
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
