import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Gallery } from "@/components/site/Gallery";
import { Features } from "@/components/site/Features";
import { Pricing } from "@/components/site/Pricing";
import { CTASection } from "@/components/site/CTASection";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VisGen — Create stunning images with just a prompt" },
      {
        name: "description",
        content:
          "VisGen is the AI image generation studio for creators. Turn ideas into high-quality visuals in seconds — no design skills required.",
      },
      { property: "og:title", content: "VisGen — AI image generation, redefined" },
      {
        property: "og:description",
        content: "Premium AI image studio. Type a prompt, get stunning visuals in seconds.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      <main>
        <Hero />
        <Gallery />
        <Features />
        <Pricing />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
