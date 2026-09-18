"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { AppStoreButton, GooglePlayButton } from "@/components/base/buttons/app-store-buttons";
import {
  FlagUS,
  FlagCA,
  FlagGB,
  FlagAU,
  FlagNZ,
  FlagIE,
  FlagFR,
  FlagDE,
  FlagAT,
  FlagCH,
  FlagES,
  FlagIT,
  FlagPT,
  FlagNL,
  FlagBE,
  FlagSE,
  FlagNO,
  FlagDK,
  FlagFI,
  FlagPL,
  FlagCZ,
  FlagGR,
  FlagTR,
  FlagJP,
  FlagKR,
  FlagSG,
  FlagHK,
  FlagTW,
  FlagAE,
  FlagSA,
  FlagIL,
  FlagIN,
  FlagBR,
  FlagMX,
} from "./FlagIcons";
import { useLanguage } from "@/context/LanguageContext";

const COUNTRIES = [
  // Page 1: Distinct Regional English & Major Western Europe (12)
  { code: "en-US", name: "United States", lang: "English (US)", Flag: FlagUS },
  { code: "en-CA", name: "Canada", lang: "English (CA)", Flag: FlagCA },
  { code: "en-GB", name: "United Kingdom", lang: "English (UK)", Flag: FlagGB },
  { code: "en-AU", name: "Australia", lang: "English (AU)", Flag: FlagAU },
  { code: "en-NZ", name: "New Zealand", lang: "English (NZ)", Flag: FlagNZ },
  { code: "en-IE", name: "Ireland", lang: "English (IE)", Flag: FlagIE },
  { code: "fr-FR", name: "France", lang: "Français", Flag: FlagFR },
  { code: "de-DE", name: "Deutschland", lang: "Deutsch", Flag: FlagDE },
  { code: "es-ES", name: "España", lang: "Español", Flag: FlagES },
  { code: "it-IT", name: "Italia", lang: "Italiano", Flag: FlagIT },
  { code: "nl-NL", name: "Nederland", lang: "Nederlands", Flag: FlagNL },
  { code: "de-CH", name: "Schweiz", lang: "Deutsch/FR", Flag: FlagCH },

  // Page 2: Nordic, Central/Southern Europe & Americas (12)
  { code: "sv-SE", name: "Sverige", lang: "Svenska", Flag: FlagSE },
  { code: "no-NO", name: "Norge", lang: "Norsk", Flag: FlagNO },
  { code: "da-DK", name: "Danmark", lang: "Dansk", Flag: FlagDK },
  { code: "fi-FI", name: "Suomi", lang: "Suomi", Flag: FlagFI },
  { code: "de-AT", name: "Österreich", lang: "Deutsch", Flag: FlagAT },
  { code: "nl-BE", name: "Belgique", lang: "NL/FR", Flag: FlagBE },
  { code: "pt-PT", name: "Portugal", lang: "Português", Flag: FlagPT },
  { code: "pl-PL", name: "Polska", lang: "Polski", Flag: FlagPL },
  { code: "cs-CZ", name: "Česko", lang: "Čeština", Flag: FlagCZ },
  { code: "el-GR", name: "Ελλάδα", lang: "Ελληνικά", Flag: FlagGR },
  { code: "es-MX", name: "México", lang: "Español", Flag: FlagMX },
  { code: "pt-BR", name: "Brasil", lang: "Português", Flag: FlagBR },

  // Page 3: Top Asian & Middle Eastern High-PPP Hubs (10)
  { code: "ja-JP", name: "日本", lang: "日本語", Flag: FlagJP },
  { code: "ko-KR", name: "대한민국", lang: "한국어", Flag: FlagKR },
  { code: "zh-SG", name: "Singapore", lang: "English (SG)", Flag: FlagSG },
  { code: "zh-HK", name: "Hong Kong", lang: "繁體中文", Flag: FlagHK },
  { code: "zh-TW", name: "Taiwan", lang: "繁體中文", Flag: FlagTW },
  { code: "ar-AE", name: "UAE", lang: "العربية", Flag: FlagAE },
  { code: "ar-SA", name: "Saudi Arabia", lang: "العربية", Flag: FlagSA },
  { code: "he-IL", name: "Israel", lang: "עברית", Flag: FlagIL },
  { code: "tr-TR", name: "Türkiye", lang: "Türkçe", Flag: FlagTR },
  { code: "hi-IN", name: "India", lang: "हिन्दी / English", Flag: FlagIN },
];

const ITEMS_PER_PAGE = 12;

export default function FloatingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const dropdownRef = useRef(null);
  const { locale, setLocale, t } = useLanguage();

  const [mounted, setMounted] = useState(false);

  const totalPages = Math.ceil(COUNTRIES.length / ITEMS_PER_PAGE);
  const selectedCountry = COUNTRIES.find((c) => c.code === locale) || COUNTRIES[0];
  const DisplayCountry = mounted ? selectedCountry : COUNTRIES[0];
  const CurrentFlag = DisplayCountry.Flag;

  const currentCountries = COUNTRIES.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white dark:bg-[#121212] transition-colors duration-200 relative z-50">
      <nav className="w-full px-4 lg:px-6 pt-3.5 pb-2 flex items-center justify-between gap-3">

        {/* LEFT: Logo + Language Picker (always together) */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Logo size={28} color="currentColor" className="text-zinc-950 dark:text-white shrink-0" />
            <span className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white font-[family-name:var(--font-outfit)] whitespace-nowrap">
              Skin Story
            </span>
          </Link>

          {/* Language Selector Pill — right next to Skin Story */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100/80 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 rounded-full transition-all border border-zinc-200/80 dark:border-zinc-700 select-none cursor-pointer"
            >
              <CurrentFlag className="w-4 h-3 shrink-0" />
              <span className="tracking-tight font-medium whitespace-nowrap hidden sm:inline">{DisplayCountry.name}</span>
              <ChevronDown
                size={13}
                className={`text-zinc-500 dark:text-zinc-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="fixed sm:absolute top-[58px] sm:top-full inset-x-3 sm:inset-x-auto sm:left-0 mt-0 sm:mt-2.5 mx-auto sm:mx-0 w-auto sm:w-[470px] max-w-[470px] p-3.5 bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_25px_60px_-10px_rgba(0,0,0,0.2),0_10px_25px_-5px_rgba(0,0,0,0.08)] border border-zinc-200 dark:border-zinc-800 z-50"
                >
                  <div className="px-1.5 pb-2 mb-1.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Select Region & Language
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => { setDirection(-1); setCurrentPage((p) => Math.max(0, p - 1)); }}
                        disabled={currentPage === 0}
                        aria-label="Previous Page"
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer border border-zinc-200/80 dark:border-zinc-700"
                      >
                        <ChevronLeft size={12} className="text-zinc-700 dark:text-zinc-300" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDirection(1); setCurrentPage((p) => Math.min(totalPages - 1, p + 1)); }}
                        disabled={currentPage >= totalPages - 1}
                        aria-label="Next Page"
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer border border-zinc-200/80 dark:border-zinc-700"
                      >
                        <ChevronRight size={12} className="text-zinc-700 dark:text-zinc-300" />
                      </button>
                    </div>
                  </div>
                  <div className="relative w-full overflow-hidden touch-pan-y min-h-[160px]">
                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                      <motion.div 
                        key={currentPage}
                        custom={direction}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.15}
                        onDragEnd={(_, info) => {
                          const swipeThreshold = 15;
                          if (info.offset.x < -swipeThreshold && currentPage < totalPages - 1) {
                            setDirection(1);
                            setCurrentPage((p) => p + 1);
                          } else if (info.offset.x > swipeThreshold && currentPage > 0) {
                            setDirection(-1);
                            setCurrentPage((p) => p - 1);
                          }
                        }}
                        initial={(dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 })}
                        animate={{ opacity: 1, x: 0 }}
                        exit={(dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80 })}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="grid grid-cols-3 gap-1 cursor-grab active:cursor-grabbing select-none"
                      >
                        {currentCountries.map((country) => {
                          const FlagComponent = country.Flag;
                          const isSelected = selectedCountry.code === country.code;
                          return (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => { setLocale(country.code); setIsOpen(false); }}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer select-none ${
                                isSelected
                                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold border border-zinc-300 dark:border-zinc-600 shadow-xs"
                                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white border border-transparent"
                              }`}
                            >
                              <FlagComponent className="w-3.5 h-2.5 shrink-0 pointer-events-none" />
                              <div className="flex flex-col min-w-0 pointer-events-none">
                                <span className="text-[11px] font-semibold leading-tight truncate text-zinc-900 dark:text-zinc-100">{country.name}</span>
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-tight truncate">{country.lang}</span>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CENTER: Navigation Links — desktop */}
        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
          <Link
            href="/faq"
            className="px-3.5 py-1.5 text-base lg:text-lg font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all whitespace-nowrap"
          >
            FAQ
          </Link>
          <Link
            href="/press"
            className="px-3.5 py-1.5 text-base lg:text-lg font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all whitespace-nowrap"
          >
            Press
          </Link>
          <a
            href="mailto:support@getskinstory.com"
            className="px-3.5 py-1.5 text-base lg:text-lg font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all whitespace-nowrap"
          >
            Support
          </a>
          <Link
            href="/blog"
            className="px-3.5 py-1.5 text-base lg:text-lg font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all whitespace-nowrap"
          >
            Blog
          </Link>
        </div>

        {/* RIGHT: Store buttons on desktop | Hamburger on mobile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Store buttons: desktop only */}
          <div className="hidden lg:flex items-center gap-2">
            <AppStoreButton />
            <GooglePlayButton />
          </div>

          {/* Hamburger: mobile only */}
          <button
            className="lg:hidden flex items-center justify-center p-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </nav>

      {/* Mobile Slide-down Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#121212]"
          >
            <div className="px-6 py-6 flex flex-col items-center gap-2">
              <Link href="/faq" className="w-full text-center text-lg font-medium text-zinc-900 dark:text-white py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                FAQ
              </Link>
              <Link href="/press" className="w-full text-center text-lg font-medium text-zinc-900 dark:text-white py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Press
              </Link>
              <a href="mailto:support@getskinstory.com" className="w-full text-center text-lg font-medium text-zinc-900 dark:text-white py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Support
              </a>
              <Link href="/blog" className="w-full text-center text-lg font-medium text-zinc-900 dark:text-white py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Blog
              </Link>
              <div className="flex flex-wrap items-center gap-3 pt-2 w-full justify-center">
                <AppStoreButton />
                <GooglePlayButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}