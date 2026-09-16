"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { AppStoreButton, GooglePlayButton } from "@/components/base/buttons/app-store-buttons";

export default function Footer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme : "system";

  return (
    <footer className="w-full mt-10 sm:mt-12 relative z-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-zinc-900 border-[3px] border-zinc-950 dark:border-white rounded-[32px] sm:rounded-[44px] px-6 sm:px-10 pt-5 sm:pt-6 pb-4 sm:pb-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-5 border-b border-zinc-200/70 dark:border-zinc-800">
          
          {/* Left Column: Brand Logo + App Store Badges */}
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
            {/* Logo row: Logo + Name + Icon-only theme toggle (mobile only, on same line) */}
            <div className="flex items-center justify-between lg:justify-start gap-2 sm:gap-3 w-full">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Skin Story Two-Square Logo */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 relative inline-block shrink-0">
                  <div className="absolute top-0 right-0 bg-zinc-950 dark:bg-white w-[20px] h-[20px] sm:w-[25px] sm:h-[25px]" />
                  <div className="absolute bottom-0 left-0 bg-zinc-950 dark:bg-white w-[13px] h-[13px] sm:w-[16px] sm:h-[16px]" />
                </div>
                <span className="text-xl min-[360px]:text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-950 dark:text-white font-[family-name:var(--font-outfit)] whitespace-nowrap">
                  Skin Story
                </span>
              </div>

              {/* Icon-only theme toggle — mobile only */}
              <div className="flex lg:hidden items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 sm:p-1 gap-0.5 sm:gap-1 border border-zinc-200/60 dark:border-zinc-700 shrink-0">
                {[
                  { key: "light", icon: <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> },
                  { key: "system", icon: <Monitor className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> },
                  { key: "dark", icon: <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> },
                ].map(({ key, icon }) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    aria-label={key}
                    title={key}
                    className={`flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full transition-all duration-150 ${
                      currentTheme === key
                        ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Official Mobile Store Buttons */}
            <div className="pt-4 sm:pt-5">
              <span className="text-xs min-[360px]:text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-2">
                Coming soon to
              </span>
              <div className="flex flex-nowrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                <GooglePlayButton />
                <AppStoreButton />
              </div>
            </div>
          </div>

          {/* Right Column: Link Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-8 sm:pl-4">
            
            {/* Legal Links */}
            <div className="space-y-3.5 flex flex-col items-center lg:items-start text-left">
              <div className="w-fit text-left">
                <h4 className="text-base sm:text-[15px] font-semibold text-zinc-950 dark:text-white tracking-tight font-[family-name:var(--font-outfit)] relative inline-block text-left mb-3.5">
                  <span className="relative z-10">Legal</span>
                  <span
                    className="absolute left-[-2px] right-[-2px] bottom-0 h-2 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                    aria-hidden="true"
                  />
                </h4>
                <ul className="space-y-2.5 text-sm sm:text-[13.5px] text-zinc-700 dark:text-zinc-300 font-medium text-left">
                  <li><a href="/privacy-policy" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms-of-service" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="/refund-cancellation" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Refund &amp; Cancellation</a></li>
                  <li><a href="/data-deletion" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Data Deletion</a></li>
                </ul>
              </div>
            </div>

            {/* Company Links */}
            <div className="space-y-3.5 flex flex-col items-center lg:items-start text-left">
              <div className="w-fit text-left">
                <h4 className="text-base sm:text-[15px] font-semibold text-zinc-950 dark:text-white tracking-tight font-[family-name:var(--font-outfit)] relative inline-block text-left mb-3.5">
                  <span className="relative z-10">Company</span>
                  <span
                    className="absolute left-[-2px] right-[-2px] bottom-0 h-2 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                    aria-hidden="true"
                  />
                </h4>
                <ul className="space-y-2.5 text-sm sm:text-[13.5px] text-zinc-700 dark:text-zinc-300 font-medium text-left">
                  <li><a href="/faq" className="hover:text-zinc-950 dark:hover:text-white transition-colors">FAQ</a></li>
                  <li><a href="/contact-us" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="/blog" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#early-access" className="hover:text-zinc-950 dark:hover:text-white transition-colors font-semibold">Join Waitlist</a></li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar: Copyright + Theme toggle */}
        <div className="pt-3.5 flex flex-col lg:flex-row items-center justify-between gap-2 text-xs min-[360px]:text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium">
          <p className="text-center lg:text-left break-words">© {new Date().getFullYear()} Skin Story. All rights reserved.</p>

          {/* Full text theme toggle — visible only on desktop (lg+) */}
          <div className="hidden lg:flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 gap-0.5 border border-zinc-200/60 dark:border-zinc-700">
            {[
              { key: "light", icon: <Sun size={13} />, label: "Light" },
              { key: "system", icon: <Monitor size={13} />, label: "System" },
              { key: "dark", icon: <Moon size={13} />, label: "Dark" },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                aria-label={label}
                title={label}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                  currentTheme === key
                    ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
