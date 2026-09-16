import HeroSection from "@/components/sections/HeroSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FaqSection from "@/components/sections/FaqSection";
import WaitlistCtaSection from "@/components/sections/WaitlistCtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="w-full relative overflow-hidden text-zinc-900 dark:text-zinc-100 bg-white dark:bg-[#121212] pt-12 sm:pt-20 pb-4 sm:pb-6 px-6 sm:px-12 transition-colors duration-200">
      {/* Lavender bottom gradient overlay */}
      <div
        className="absolute inset-x-0 bottom-0 h-[650px] pointer-events-none -z-0 block dark:hidden"
        style={{
          background: "linear-gradient(to top, #dcd0eb 0%, #ede5f5 25%, #f5f0fa 55%, #fcfafc 80%, rgba(255, 255, 255, 0) 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[650px] pointer-events-none -z-0 hidden dark:block"
        style={{
          background: "linear-gradient(to top, rgba(147, 122, 189, 0.22) 0%, rgba(147, 122, 189, 0.12) 30%, rgba(18, 18, 18, 0.6) 65%, rgba(18, 18, 18, 0) 100%)",
        }}
        aria-hidden="true"
      />

      <HeroSection />
      <HowItWorksSection />
      <ComparisonSection />
      <TestimonialsSection />
      <FaqSection />
      <WaitlistCtaSection />
      <Footer />
    </main>
  );
}
