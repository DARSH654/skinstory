import FloatingNavbar from "@/components/FloatingNavbar";
import HeroSection from "@/components/sections/HeroSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import FaqSection from "@/components/sections/FaqSection";
import WaitlistCtaSection from "@/components/sections/WaitlistCtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <FloatingNavbar />
      <main className="w-full relative overflow-hidden text-zinc-900 dark:text-zinc-100 bg-white dark:bg-[#121212] pt-12 sm:pt-20 pb-4 sm:pb-6 px-6 sm:px-12 transition-colors duration-200">
        <HeroSection />
        <HowItWorksSection />
        <ComparisonSection />
        <FaqSection />
        <WaitlistCtaSection />
        <Footer />
      </main>
    </>
  );
}
