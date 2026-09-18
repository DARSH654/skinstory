import React from "react";

export default function ContactUsCard({
  title = "Having any doubts?",
  subtitle = "Our support team is real humans who actually care. Reach out and we'll figure it out together.",
  email = "support@getskinstory.com",
}) {
  return (
    <div className="px-6 sm:px-12 bg-white dark:bg-[#121212] transition-colors duration-200">
      <div className="max-w-3xl mx-auto py-10">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-8 py-12 text-center shadow-sm">
          <h3 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white mb-3 font-[family-name:var(--font-outfit)]">
            {title}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
            {subtitle}
          </p>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium text-sm px-6 py-3 rounded-full hover:opacity-80 transition-opacity"
          >
            Email {email}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
