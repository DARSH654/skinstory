import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      text: "First time in 3 years something actually explained why my chin always breaks out. It wasn't my moisturizer—it was sleep debt spike.",
      name: "Priya K.",
      meta: "Oily & Acne-Prone • Mumbai",
      avatarBg: "bg-purple-100 dark:bg-[#937abd]/20 text-[#937abd]",
      avatarLetter: "P",
    },
    {
      text: "I logged for 5 days and it connected my stress to my forehead. My dermatologist never did that in our 15-minute consultations.",
      name: "Aarav M.",
      meta: "Combination Skin • Bangalore",
      avatarBg: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
      avatarLetter: "A",
    },
    {
      text: "Finally something that doesn't just tell me to drink more water. It detected an active barrier tear 3 days before it started flaking.",
      name: "Sneha D.",
      meta: "Sensitive Barrier • Delhi",
      avatarBg: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
      avatarLetter: "S",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto mt-28 sm:mt-36">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
        <div className="flex items-center justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} className="fill-[#937abd] text-[#937abd]" />
          ))}
        </div>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-3 font-[family-name:var(--font-outfit)]">
          Early testers are already finding their triggers.
        </h2>
        <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base font-normal">
          Hear from members who uncovered the actual patterns behind their chronic breakouts.
        </p>
      </div>

      {/* 3 Outcome-Driven Testimonials (Horizontal Scroll on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4 text-left">
        {testimonials.map((item, idx) => (
          <div
            key={idx}
            className="p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-[#937abd] text-[#937abd]" />
                ))}
              </div>
              <p className="text-sm sm:text-[15px] text-zinc-800 dark:text-zinc-200 leading-relaxed mb-6 font-normal">
                &ldquo;{item.text}&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <div
                className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm ${item.avatarBg}`}
              >
                {item.avatarLetter}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">{item.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.meta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
