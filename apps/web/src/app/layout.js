import { Outfit } from "next/font/google";
import FloatingNavbar from "@/components/FloatingNavbar";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  metadataBase: new URL("https://getskinstory.com"),
  title: "Skin Story - Stop Guessing. See Real Insights.",
  description: "Skin Story uses AI and clinical-grade scanning to filter background noise and isolate skin-level metrics with pinpoint accuracy.",
  keywords: ["Skin Story", "Skin Story AI", "Skin Story App", "getskinstory", "skincare analysis", "skin health tracker"],
  alternates: {
    canonical: "https://getskinstory.com",
  },
  openGraph: {
    title: "Skin Story - Stop Guessing. See Real Insights.",
    description: "Pinpoint-accurate skin analysis without the guesswork.",
    url: "https://getskinstory.com",
    siteName: "Skin Story",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skin Story - Stop Guessing. See Real Insights.",
    description: "Pinpoint-accurate skin analysis without the guesswork.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className="bg-white dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 antialiased min-h-screen w-full relative selection:bg-[#937abd] selection:text-white transition-colors duration-200">
        <LanguageProvider>
          <ThemeProvider>
            <FloatingNavbar />
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
