import HeroSection from "@/components/HeroSection";
import Fields from "@/components/Fields";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <Fields />
      <Footer />
    </main>
  );
}
