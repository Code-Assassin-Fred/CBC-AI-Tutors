import HeroSection from "@/components/Landing/HeroSection";
import Fields from "@/components/Landing/Fields";
import Footer from "@/components/Landing/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <Fields />
      <Footer />
    </main>
  );
}
