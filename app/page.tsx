import HeroSection from "@/components/Landing/HeroSection";
import LearnAtSpeed from "@/components/Landing/LearnAtSpeed";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import AboutSection from "@/components/Landing/AboutSection";
import TestimonialsSection from "@/components/Landing/TestimonialsSection";
import CTASection from "@/components/Landing/CTASection";
import Footer from "@/components/Landing/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <LearnAtSpeed />
      <FeaturesSection />
      <AboutSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}

// Force rebuild for hydration fix
