import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Gallery } from "@/components/site/Gallery";
import { Features } from "@/components/site/Features";
import { Pricing } from "@/components/site/Pricing";
import { FAQ } from "@/components/site/FAQ";
import { CTASection } from "@/components/site/CTASection";
import { Footer } from "@/components/site/Footer";
import { BackgroundCanvas } from "@/components/ui/BackgroundCanvas";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <BackgroundCanvas />
      <Navbar />
      <main>
        <Hero />
        <Gallery />
        <Features />
        <Pricing />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
