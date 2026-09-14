import { Outfit } from "next/font/google";
import FloatingNavbar from "@/components/FloatingNavbar";
import { LanguageProvider } from "@/context/LanguageContext";
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
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="bg-white text-zinc-900 antialiased min-h-screen w-full relative selection:bg-[#937abd] selection:text-white">
        <LanguageProvider>
          <FloatingNavbar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
