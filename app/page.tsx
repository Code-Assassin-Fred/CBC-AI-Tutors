import HeroSection from "@/components/Landing/HeroSection";
import LearnAtSpeed from "@/components/Landing/LearnAtSpeed";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import PricingSection from "@/components/Landing/PricingSection";
import VisionSection from "@/components/Landing/VisionSection";
import ReviewsSection from "@/components/Landing/ReviewsSection";
import ContactSection from "@/components/Landing/ContactSection";
import Footer from "@/components/Landing/Footer";
import ScrollSpy from "@/components/Landing/ScrollSpy";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <ScrollSpy />
      <HeroSection />
      <LearnAtSpeed />
      <FeaturesSection />
      <PricingSection />
      <VisionSection />
      <ReviewsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}

// Force rebuild for hydration fix
