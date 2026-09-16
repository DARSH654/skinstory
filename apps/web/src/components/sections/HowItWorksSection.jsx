export default function HowItWorksSection() {
  return (
    <section className="max-w-6xl mx-auto mt-20 sm:mt-28">
      <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white mb-3 font-[family-name:var(--font-outfit)]">
          Your face remembers everything your life does.
        </h2>
        <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-normal">
          Stress on Monday shows up on your chin by Wednesday. Bad sleep Tuesday appears as dullness Thursday. Our engine connects your daily life to your skin&apos;s response and names the exact pattern you never noticed. One scan plus your daily inputs equals your first real answer.
        </p>
      </div>

      {/* 3 Step Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-14">
        <div className="p-7 rounded-3xl bg-zinc-50/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 text-left">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-950 dark:text-white shadow-2xs mb-4">
            01
          </span>
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white mb-1">Scan your face</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            AI reads your zones in seconds, eliminating lighting variations and reflections.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-zinc-50/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 text-left">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-950 dark:text-white shadow-2xs mb-4">
            02
          </span>
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white mb-1">Log your day</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Sleep, stress, diet — three quick taps in under 10 seconds.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-zinc-50/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 text-left">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-950 dark:text-white shadow-2xs mb-4">
            03
          </span>
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white mb-1">Get your insight</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            We connect your life to your skin and name the exact cause behind every change.
          </p>
        </div>
      </div>
    </section>
  );
}
