import HeroSection from "@/components/Landing/HeroSection";
import LearnAtSpeed from "@/components/Landing/LearnAtSpeed";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import PricingSection from "@/components/Landing/PricingSection";
import VisionSection from "@/components/Landing/VisionSection";
import TestimonialsSection from "@/components/Landing/TestimonialsSection";
import CTASection from "@/components/Landing/CTASection";
import Footer from "@/components/Landing/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <LearnAtSpeed />
      <FeaturesSection />
      <PricingSection />
      <VisionSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}

// Force rebuild for hydration fix
