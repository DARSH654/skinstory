"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { AppStoreButton, GooglePlayButton } from "@/components/base/buttons/app-store-buttons";

export default function Footer() {
  const { theme, setTheme } = useTheme();

  return (
    <footer className="w-full mt-10 sm:mt-12 relative z-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-zinc-900 border-[3px] border-zinc-950 dark:border-white rounded-[32px] sm:rounded-[44px] px-6 sm:px-10 pt-5 sm:pt-6 pb-4 sm:pb-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-5 border-b border-zinc-200/70 dark:border-zinc-800">
          
          {/* Left Column: Authentic Brand Logo & Official Store Badges */}
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              {/* Official Skin Story Two-Square Logo Component */}
              <div className="w-10 h-10 relative inline-block shrink-0">
                <div className="absolute top-0 right-0 bg-zinc-950 dark:bg-white w-[25px] h-[25px]" />
                <div className="absolute bottom-0 left-0 bg-zinc-950 dark:bg-white w-[16px] h-[16px]" />
              </div>
              <span className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-950 dark:text-white font-[family-name:var(--font-outfit)]">
                Skin Story
              </span>
            </div>

            {/* Official Mobile Store Buttons */}
            <div className="pt-5">
              <span className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-[5px]">
                Coming soon to
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <GooglePlayButton />
                <AppStoreButton />
              </div>
            </div>
          </div>

          {/* Right Column: Clean Link Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-8 text-left sm:pl-10">
            
            {/* Legal Links */}
            <div className="space-y-3.5">
              <h4 className="text-[15px] font-semibold text-zinc-950 dark:text-white tracking-tight font-[family-name:var(--font-outfit)] relative inline-block">
                <span className="relative z-10">Legal</span>
                <span
                  className="absolute left-[-2px] right-[-2px] bottom-0 h-2 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                  aria-hidden="true"
                />
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-[13.5px] text-zinc-700 dark:text-zinc-300 font-medium">
                <li><a href="#privacy" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#biometric" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Biometric Data Policy</a></li>
                <li><a href="#security" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Security &amp; Encryption</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-3.5">
              <h4 className="text-[15px] font-semibold text-zinc-950 dark:text-white tracking-tight font-[family-name:var(--font-outfit)] relative inline-block">
                <span className="relative z-10">Company</span>
                <span
                  className="absolute left-[-2px] right-[-2px] bottom-0 h-2 bg-[#d6cbe8] dark:bg-[#5f4982] rounded-[2px] -z-0"
                  aria-hidden="true"
                />
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-[13.5px] text-zinc-700 dark:text-zinc-300 font-medium">
                <li><a href="#faq" className="hover:text-zinc-950 dark:hover:text-white transition-colors">FAQ</a></li>
                <li><a href="mailto:support@getskinstory.com" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#press" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Press &amp; Media</a></li>
                <li><a href="#early-access" className="hover:text-zinc-950 dark:hover:text-white transition-colors font-semibold">Join Waitlist</a></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar: Copyright left + Theme toggle right */}
        <div className="pt-3.5 flex items-center justify-between text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium">
          <p>© {new Date().getFullYear()} Skin Story. All rights reserved.</p>

          {/* 3-way theme toggle: Light / System / Dark */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 gap-0.5 border border-zinc-200/60 dark:border-zinc-700">
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
                  theme === key
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
