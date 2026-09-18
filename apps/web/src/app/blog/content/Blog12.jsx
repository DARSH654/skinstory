import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Blog12() {
  return (
    <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-[17px] leading-[1.75] space-y-7">

              <p>
                Step outside into harsh afternoon sunlight or glance in a car side mirror, and your skin texture can suddenly appear far rougher, bumpier, and more uneven than it looked under soft indoor lighting. While direct overhead sunlight casts hard directional shadows that optically emphasize every pore and closed comedone, there is also an immediate biological driver: acute solar heat and UV radiation rapidly dehydrate the upper stratum corneum. <Link href="/blog/how-does-dehydration-directly-affect-skin-elasticity" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">How does dehydration directly affect skin elasticity?</Link> Solar dehydration flattens corneocyte volume, causing subtle micro-relief ridges to collapse into pronounced texture.
              </p>

              <p>
                Direct sunlight combines intense UV-A/UV-B wavelengths with Infrared (IR) thermal heat. Infrared radiation elevates skin surface temperature above 40°C, increasing immediate transepidermal water evaporation by up to 35% within 15 minutes of outdoor exposure.
              </p>

              {/* Fast Fact Box */}
              <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-md my-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-950 dark:text-white mb-2 font-[family-name:var(--font-outfit)]">
                  CORE PATTERN KEY
                </p>
                <p className="text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  Direct sunlight creates <strong className="text-zinc-950 dark:text-white font-bold">specular highlight amplification</strong>. High oiliness reflects direct sunlight like a micro-mirror, while dry surrounding skin absorbs light, maximizing the visual contrast between smooth skin and raised pores.
                </p>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Optical and Biological Sunlight Texture Mechanisms
              </h2>

              <p>
                The dual optical and cellular processes that make solar texture so noticeable:
              </p>

              <ul className="space-y-4 pl-1 my-6">
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Directional Shadow Casting:</strong> Sunlight at high angles casts elongated micro-shadows beneath tiny bumps, turning 0.1mm micro-comedones into visible dark contours.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">Infrared Hydro-Evaporation:</strong> IR heat evaporates inter-cellular water in the top 3 layers of dead skin, causing flaking micro-edges to curl upward.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-[7px] h-[7px] aspect-square rounded-full bg-[#937abd] border-[1.5px] border-black dark:border-white mt-2.5 shrink-0" />
                  <span>
                    <strong className="text-zinc-950 dark:text-white font-bold">UV-Induced Stratum Corneum Thickening:</strong> Repeated UV exposure triggers protective hyperkeratosis, making the epidermis physically thicker and coarser over 5–7 days.
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Lighting Condition Texture Impact Matrix
              </h2>

              <p>
                Comparing how different light sources reveal facial texture metrics. <Link href="/blog/why-do-pores-look-noticeably-larger-when-skin-is-oily" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Why do pores look noticeably larger when skin is oily?</Link> Sunlight reflects heavily off oxidized sebum in pore canals.
              </p>

              {/* Comparison Table */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                Light Environment vs. Perceived Texture Severity
              </h3>

              <div className="overflow-x-auto my-6 border-[3px] border-zinc-950 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border-b-2 border-zinc-950 dark:border-white">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Lighting Environment</th>
                      <th className="py-3.5 px-4 font-bold">Shadow Contrast Index</th>
                      <th className="py-3.5 px-4 font-bold">Primary Visual Texture Distortion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Direct Outdoor Sunlight</td>
                      <td className="py-3 px-4">Maximum (Hard directional rays)</td>
                      <td className="py-3 px-4">Amplifies pores, flaking edges, &amp; subcutaneous bumps</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Diffuse Outdoor Shade</td>
                      <td className="py-3 px-4">Low (Soft scattered ambient light)</td>
                      <td className="py-3 px-4">True skin texture revealed without artificial optical distortion</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-zinc-950 dark:text-white">Harsh Overhead Indoor Fluorescent</td>
                      <td className="py-3 px-4">High (Vertical down-lighting)</td>
                      <td className="py-3 px-4">Emphasizes under-eye hollows &amp; nasolabial texture lines</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pt-4 font-[family-name:var(--font-outfit)]">
                The 4-Step Solar Texture Smoothing Protocol
              </h2>

              <p>
                Minimize heat-induced solar texture and protect smooth epidermal reflection with these four steps:
              </p>

              <ol className="space-y-4 pl-1 my-6 list-decimal list-inside font-medium text-zinc-900 dark:text-zinc-200">
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Apply high-silica matte broad-spectrum sunscreen:</strong> Mineral sunscreens containing Silica or Zinc Oxide absorb excess sebum, eliminating micro-refractive shiny highlights that draw attention to bumps.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Mist with thermal water during prolonged sun exposure:</strong> Cool facial skin temperature to prevent IR-induced water evaporation and corneal flaking.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Exfoliate weekly with Lactic Acid (AHA):</strong> Lactic acid is a natural humectant AHA that dissolves dead surface micro-edges without stripping deep skin moisture.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-zinc-950 dark:text-white font-bold">Apply Niacinamide before sun exposure:</strong> <Link href="/blog/is-it-bad-to-wash-your-face-in-hot-water-everyday" className="font-semibold text-zinc-950 dark:text-white hover:text-[#937abd] dark:hover:text-[#937abd] transition-colors">Is it bad to wash your face in hot water everyday?</Link> Prevent thermal heat from triggering excess rebound sebum production outdoors.
                </li>
              </ol>

              
              {/* Related Guide Cards */}
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white pt-6 font-[family-name:var(--font-outfit)]">
                Related Pattern Guides
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <Link
                  href="/blog/how-does-dehydration-directly-affect-skin-elasticity"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    How Does Dehydration Directly Affect Skin Elasticity?
                  </p>
                  <ArrowUpRight size={22} className="text-zinc-950 dark:text-white shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  href="/blog/why-do-pores-look-noticeably-larger-when-skin-is-oily"
                  className="p-5 sm:p-6 rounded-2xl border-[3px] border-zinc-950 dark:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-start justify-between gap-3 group"
                >
                  <p className="text-base sm:text-lg font-semibold text-zinc-950 dark:text-white leading-snug">
                    Why Do Pores Look Noticeably Larger When Skin Is Oily?
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
                        Observe
                      </span>
                      <span
                        className="absolute left-[-2px] right-[-2px] bottom-1 h-3 sm:h-3.5 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                        aria-hidden="true"
                      />
                    </span>{" "}
                    your texture patterns.
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mx-auto">
                    Skin Story helps you log texture changes under different lighting conditions.
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
