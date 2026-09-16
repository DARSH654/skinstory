"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export const translations = {
  // Western / English
  "en-US": { nav: { features: "Features", routine: "Routine", science: "Science", stories: "Stories", earlyAccess: "Get Early Access" } },
  "en-CA": { nav: { features: "Features", routine: "Routine", science: "Science", stories: "Stories", earlyAccess: "Get Early Access" } },
  "en-GB": { nav: { features: "Features", routine: "Routine", science: "Science", stories: "Stories", earlyAccess: "Get Early Access" } },
  "en-AU": { nav: { features: "Features", routine: "Routine", science: "Science", stories: "Stories", earlyAccess: "Get Early Access" } },
  "en-NZ": { nav: { features: "Features", routine: "Routine", science: "Science", stories: "Stories", earlyAccess: "Get Early Access" } },
  "en-IE": { nav: { features: "Features", routine: "Routine", science: "Science", stories: "Stories", earlyAccess: "Get Early Access" } },

  // Western / European
  "fr-FR": { nav: { features: "Fonctionnalités", routine: "Routine", science: "Science", stories: "Témoignages", earlyAccess: "Accès Anticipé" } },
  "fr-CA": { nav: { features: "Fonctionnalités", routine: "Routine", science: "Science", stories: "Témoignages", earlyAccess: "Accès Anticipé" } },
  "de-DE": { nav: { features: "Funktionen", routine: "Routine", science: "Wissenschaft", stories: "Erfolgsgeschichten", earlyAccess: "Frühzeitiger Zugang" } },
  "de-AT": { nav: { features: "Funktionen", routine: "Routine", science: "Wissenschaft", stories: "Erfolgsgeschichten", earlyAccess: "Frühzeitiger Zugang" } },
  "de-CH": { nav: { features: "Funktionen", routine: "Routine", science: "Wissenschaft", stories: "Erfolgsgeschichten", earlyAccess: "Frühzeitiger Zugang" } },
  "es-ES": { nav: { features: "Características", routine: "Rutina", science: "Ciencia", stories: "Historias", earlyAccess: "Acceso Anticipado" } },
  "es-MX": { nav: { features: "Características", routine: "Rutina", science: "Ciencia", stories: "Historias", earlyAccess: "Acceso Anticipado" } },
  "it-IT": { nav: { features: "Funzionalità", routine: "Routine", science: "Scienza", stories: "Storie", earlyAccess: "Accesso Anticipato" } },
  "pt-PT": { nav: { features: "Funcionalidades", routine: "Rotina", science: "Ciência", stories: "Histórias", earlyAccess: "Acesso Antecipado" } },
  "pt-BR": { nav: { features: "Recursos", routine: "Rotina", science: "Ciência", stories: "Histórias", earlyAccess: "Acesso Antecipado" } },
  "nl-NL": { nav: { features: "Kenmerken", routine: "Routine", science: "Wetenschap", stories: "Verhalen", earlyAccess: "Vroegtijdige Toegang" } },
  "nl-BE": { nav: { features: "Kenmerken", routine: "Routine", science: "Wetenschap", stories: "Verhalen", earlyAccess: "Vroegtijdige Toegang" } },
  "sv-SE": { nav: { features: "Funktioner", routine: "Rutin", science: "Vetenskap", stories: "Berättelser", earlyAccess: "Få Tidig Tillgång" } },
  "no-NO": { nav: { features: "Funksjoner", routine: "Rutine", science: "Vitenskap", stories: "Historier", earlyAccess: "Få Tidlig Tilgang" } },
  "da-DK": { nav: { features: "Funktioner", routine: "Rutine", science: "Videnskab", stories: "Historier", earlyAccess: "Få Tidlig Adgang" } },
  "fi-FI": { nav: { features: "Ominaisuudet", routine: "Rutiini", science: "Tiede", stories: "Tarinat", earlyAccess: "Hanki Ennakko" } },
  "pl-PL": { nav: { features: "Funkcje", routine: "Rutyna", science: "Nauka", stories: "Historie", earlyAccess: "Wczesny Dostęp" } },
  "cs-CZ": { nav: { features: "Funkce", routine: "Rutina", science: "Věda", stories: "Příběhy", earlyAccess: "Získat Včasný Přístup" } },
  "el-GR": { nav: { features: "Χαρακτηριστικά", routine: "Ρουτίνα", science: "Επιστήμη", stories: "Ιστορίες", earlyAccess: "Πρώιμη Πρόσβαση" } },
  "tr-TR": { nav: { features: "Özellikler", routine: "Rutin", science: "Bilim", stories: "Hikayeler", earlyAccess: "Erken Erişim Al" } },

  // High-Paying Asian & Middle Eastern Markets
  "ja-JP": { nav: { features: "機能", routine: "ルーティン", science: "サイエンス", stories: "ストーリー", earlyAccess: "早期アクセスを入手" } },
  "ko-KR": { nav: { features: "기능", routine: "루틴", science: "과학", stories: "스토리", earlyAccess: "얼리 액세스 신청" } },
  "zh-SG": { nav: { features: "特色功能", routine: "护肤程序", science: "科学解析", stories: "用户故事", earlyAccess: "抢先体验" } },
  "zh-HK": { nav: { features: "特點", routine: "日常保養", science: "科學實證", stories: "真實故事", earlyAccess: "搶先體驗" } },
  "zh-TW": { nav: { features: "特色", routine: "護膚程序", science: "肌膚科學", stories: "真實心聲", earlyAccess: "搶先體驗" } },
  "ar-AE": { nav: { features: "المميزات", routine: "الروتين", science: "العلوم", stories: "القصص", earlyAccess: "الحصول على وصول مبكر" } },
  "ar-SA": { nav: { features: "المميزات", routine: "الروتين", science: "العلوم", stories: "القصص", earlyAccess: "الحصول على وصول مبكر" } },
  "he-IL": { nav: { features: "מאפيدים", routine: "שגרה", science: "מדע", stories: "סיפורים", earlyAccess: "קבלת גישה מוקדמת" } },
  "hi-IN": { nav: { features: "विशेषताएं", routine: "दिनचर्या", science: "विज्ञान", stories: "कहानियां", earlyAccess: "अर्ली एक्सेस पाएं" } },
};

// Map browser language prefixes to supported country codes
const BROWSER_LOCALE_MAP = {
  nl: "nl-NL",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-BR",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-SG",
  ar: "ar-AE",
  he: "he-IL",
  hi: "hi-IN",
  sv: "sv-SE",
  no: "no-NO",
  da: "da-DK",
  fi: "fi-FI",
  pl: "pl-PL",
  cs: "cs-CZ",
  el: "el-GR",
  tr: "tr-TR",
};

const LanguageContext = createContext({
  locale: "en-US",
  setLocale: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState("en-US");

  useEffect(() => {
    // 1. If already saved in localStorage, update on client mount
    try {
      const saved = localStorage.getItem("skinstory_locale");
      if (saved && translations[saved]) {
        setLocale(saved);
        return;
      }
    } catch (e) {}

    // 2. Automatic Geo / IP detection (works with VPNs)
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const country = data.country_code; // e.g. "NL", "DE", "FR", "US"
        const countryMatch = Object.keys(translations).find((key) =>
          key.endsWith(`-${country}`)
        );
        if (countryMatch) {
          setLocale(countryMatch);
          return;
        }
      })
      .catch(() => {
        // 3. Fallback to Browser language if IP fetch is blocked
        if (typeof navigator !== "undefined" && navigator.language) {
          const navLang = navigator.language;
          if (translations[navLang]) {
            setLocale(navLang);
          } else {
            const prefix = navLang.split("-")[0].toLowerCase();
            if (BROWSER_LOCALE_MAP[prefix]) {
              setLocale(BROWSER_LOCALE_MAP[prefix]);
            }
          }
        }
      });
  }, []);

  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem("skinstory_locale", newLocale);
  };

  const t = (path) => {
    const keys = path.split(".");
    let current = translations[locale] || translations["en-US"];
    for (const key of keys) {
      if (!current || current[key] === undefined) {
        let fallback = translations["en-US"];
        for (const fbKey of keys) {
          if (!fallback || fallback[fbKey] === undefined) return path;
          fallback = fallback[fbKey];
        }
        return fallback;
      }
      current = current[key];
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
