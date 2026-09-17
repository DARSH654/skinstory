import HighlightPhrase from "@/components/HighlightPhrase";

export default function HowItWorksSection() {
  return (
    <section className="max-w-5xl mx-auto mt-14 sm:mt-20 px-4 sm:px-8 flex flex-col items-center gap-6 sm:gap-8">

      {/* ── Quote Card ── */}
      <div className="w-full relative rounded-3xl bg-white dark:bg-zinc-950 border-[3px] border-zinc-950 dark:border-white shadow-2xl p-8 sm:p-12">
        <p className="text-2xl sm:text-3xl md:text-[2rem] lg:text-[2.2rem] font-normal tracking-tight text-zinc-800 dark:text-zinc-200 leading-[1.65] text-balance">
          {/* Opening Quote Icon */}
          <span className="inline-block align-top mr-2.5 sm:mr-3 -translate-y-1 select-none text-zinc-950 dark:text-white" aria-hidden="true">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 inline-block fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
            </svg>
          </span>
          Your chin broke out because of{" "}
          <HighlightPhrase
            words={[
              { text: "3", hasSpace: true },
              { text: "consecutive", hasSpace: true },
              { text: "high-stress", hasSpace: true },
              { text: "days.", hasSpace: false },
            ]}
          />{" "}
          This has happened{" "}
          <HighlightPhrase
            words={[
              { text: "4", hasSpace: true },
              { text: "times", hasSpace: true },
              { text: "in", hasSpace: true },
              { text: "the", hasSpace: true },
              { text: "last", hasSpace: true },
              { text: "6", hasSpace: true },
              { text: "weeks.", hasSpace: false },
            ]}
          />{" "}
          Same pattern. Same zone. Every time.
          {/* Closing Quote Icon */}
          <span className="inline-block align-top ml-2.5 sm:ml-3 translate-y-1 select-none text-zinc-950 dark:text-white" aria-hidden="true">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 inline-block fill-current rotate-180"
              viewBox="0 0 24 24"
            >
              <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
            </svg>
          </span>
        </p>
      </div>

      {/* ── Tagline — below the card ── */}
      <p className="text-center text-3xl sm:text-5xl lg:text-[54px] font-normal tracking-tight text-zinc-800 dark:text-zinc-200 leading-[1.08] font-[family-name:var(--font-outfit)]">
        This is what{" "}
        <HighlightPhrase
          words={[
            { text: "knowing", hasSpace: true },
            { text: "your", hasSpace: true },
            { text: "skin", hasSpace: false },
          ]}
        />{" "}
        actually looks like.
      </p>

    </section>
  );
}
