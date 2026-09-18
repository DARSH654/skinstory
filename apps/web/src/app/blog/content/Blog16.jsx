import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog16() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">

              <p>
                With average screen time exceeding 7 to 10 hours daily, dermatologists are increasingly investigating the biological impact of High-Energy Visible (HEV) blue light (400–500nm wavelength) emitted by smartphones, laptops, and monitors. While UV light is well known for photo-aging, HEV blue light penetrates deeper into the dermal layer than UV-A or UV-B rays, directly impacting fibroblast mitochondria. <Link href="/blog/how-do-cortisol-spikes-damage-skin-collagen-over-time" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How do cortisol spikes damage skin collagen over time?</Link> HEV light combined with high cortisol creates compounding oxidative stress.
              </p>

              <p>
                HEV blue light induces Reactive Oxygen Species (ROS) generation within dermal cells, triggering intracellular oxidative stress that breaks down collagen matrix structures and stimulates hyper-pigmentation in melanocytes.
              </p>

              {/* Fast Fact Box */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                  CORE PATTERN KEY
                </p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  HEV blue light specifically activates <strong className="text-zinc-950 dark:text-white font-bold">Opsin-3 (OPN3) photoreceptors</strong> in skin melanocytes. OPN3 activation triggers persistent long-lasting hyper-pigmentation (melasma and dark spots) that is more resistant to treatment than UV-induced spots.
                </p>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The Cellular Pathways of HEV Screen Radiation
              </h2>

              <p>
                How blue light exposure affects skin biology across long work hours:
              </p>

              <ul className="space-y-4 pl-1 my-6">
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Mitochondrial ROS Surge:</strong> HEV light targets flavin chromophores in mitochondria, generating free radicals that damage cell membranes and impair ATP energy production.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">MMP-1 Collagenase Activation:</strong> ROS generation upregulates matrix metalloproteinases, degrading structural collagen and accelerating fine line formation around eyes.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Nocturnal Melatonin Suppression:</strong> Evening screen light suppresses skin-level melatonin synthesis, disabling night-time antioxidant repair.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                UV Rays vs. Screen HEV Blue Light
              </h2>

              <p>
                Comparing solar radiation and electronic screen exposure. <Link href="/blog/can-lack-of-sleep-lead-to-dull-skin-and-dark-circles" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Can lack of sleep lead to dull skin and dark circles?</Link> Late night screen use damages skin through both blue light and sleep loss.
              </p>

              {/* Comparison Table */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Ultraviolet (UV) vs. High-Energy Visible (HEV) Blue Light
              </h3>

              <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Wavelength Spectrum</th>
                      <th className="py-3.5 px-4 font-bold">Penetration Depth</th>
                      <th className="py-3.5 px-4 font-bold">Primary Skin Pathology</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">UV-B (280–315 nm)</td>
                      <td className="py-3 px-4">Epidermis only (Shallow)</td>
                      <td className="py-3 px-4">Sunburn, direct DNA thymine dimers, surface skin cancer risk</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">UV-A (315–400 nm)</td>
                      <td className="py-3 px-4">Upper Dermis</td>
                      <td className="py-3 px-4">Photo-aging, solar elastosis, immediate tanning</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">HEV Blue Light (400–500 nm)</td>
                      <td className="py-3 px-4">Deep Dermis &amp; Subcutis (Deepest)</td>
                      <td className="py-3 px-4">Persistent OPN3 pigment spots, mitochondrial ROS, fibroblast damage</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The 4-Step Digital Defense Protocol
              </h2>

              <p>
                Protect skin cells from screen-induced HEV oxidative damage with these four targeted steps:
              </p>

              <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Apply Iron Oxide mineral sunscreens daily:</strong> Chemical SPF filters do not block HEV light; tinted mineral sunscreens containing Iron Oxides provide physical HEV light blockage.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Layer topical Licochalcone A and Niacinamide:</strong> Potent antioxidants neutralize blue-light-induced ROS before mitochondrial cell membrane damage occurs.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Enable warm Night Shift display modes:</strong> Shift screen color temperature to 2700K to reduce blue light emission by up to 70% during work hours.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Maintain a 45cm physical distance from screens:</strong> <Link href="/blog/why-does-skin-texture-look-worse-in-direct-sunlight" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why does skin texture look worse in direct sunlight?</Link> HEV light intensity drops exponentially with physical distance.
                </li>
              </ol>

              
              {/* Related Guide Cards */}
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
                  href="/blog/why-does-skin-texture-look-worse-in-direct-sunlight"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    Why Does Skin Texture Look Worse in Direct Sunlight?
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
                        Discover
                      </span>
                      <span
                        className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                        aria-hidden="true"
                      />
                    </span>{" "}
                    your environmental factors.
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
                    Skin Story helps you observe daily screen habits alongside skin appearance.
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
  );
}
