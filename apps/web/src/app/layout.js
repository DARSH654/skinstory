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
  title: "Skin Story - Get Real Insights",
  description: "Personalized skincare routine and progress tracking.",
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
