"use client";

import { motion } from "motion/react";
import { Repeat2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import g7 from "@/assets/feature-speed.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { ImagePreviewModal } from "@/components/ui/ImagePreviewModal";

const items = [
  { src: g1, prompt: "Portrait with iridescent magenta visor, cinematic", aspect: "aspect-[3/4]" },
  { src: g2, prompt: "Floating crystal castle over a magenta nebula", aspect: "aspect-[3/4]" },
  { src: g3, prompt: "Cyberpunk Tokyo street in the rain at night", aspect: "aspect-[4/3]" },
  { src: g4, prompt: "Liquid chrome flowing on black, magenta highlights", aspect: "aspect-square" },
  { src: g5, prompt: "Astronaut floating in pink nebula", aspect: "aspect-[3/4]" },
  { src: g6, prompt: "Bioluminescent jungle, magenta blossoms", aspect: "aspect-[4/3]" },
  { src: g7, prompt: "Lightning fast abstract 3D speed visualization, glowing neon", aspect: "aspect-square" },
];

export function Gallery() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [previewItem, setPreviewItem] = useState<{ src: string; prompt: string } | null>(null);

  const remix = (prompt: string) => {
    sessionStorage.setItem("visgen:prompt", prompt);
    router.push(user ? "/studio" : "/auth");
  };

  const handleCopy = (e: React.MouseEvent, prompt: string, idx: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    setCopiedIdx(idx);
    toast.success("Prompt copied!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <section id="gallery" className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-primary/80 mb-3">Community</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Made by humans, <span className="text-gradient">painted by AI</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground px-2">
            Tap or hover an image, then hit Remix to make it your own.
          </p>
        </div>

        <div className="columns-2 lg:columns-3 gap-3 sm:gap-5 [column-fill:_balance]">
          {items.map((it, i) => {
            const isActive = activeIdx === i;
            return (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                onClick={() => setPreviewItem({ src: (it.src as any).src ?? (it.src as unknown as string), prompt: it.prompt })}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                className={`relative mb-3 sm:mb-5 break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer ${it.aspect}`}
              >
                <img
                  src={(it.src as any).src ?? (it.src as unknown as string)}
                  alt={it.prompt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay: hover (desktop) OR active state (mobile tap) */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent transition-opacity duration-500 ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
                <figcaption
                  className={`absolute inset-x-0 bottom-0 p-2.5 sm:p-4 transition-all duration-500 ${
                    isActive
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  }`}
                >
                  <p className="text-[10px] sm:text-xs text-foreground/90 line-clamp-2 mb-1.5 sm:mb-2">{it.prompt}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="glow"
                      className="text-[10px] sm:text-xs h-7 sm:h-8 flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        remix(it.prompt);
                      }}
                    >
                      <Repeat2 className="h-3 w-3" /> Remix
                    </Button>
                    <Button
                      size="sm"
                      variant="glass"
                      className="text-[10px] sm:text-xs h-7 sm:h-8 px-2.5"
                      onClick={(e) => handleCopy(e, it.prompt, i)}
                    >
                      {copiedIdx === i ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>

        <ImagePreviewModal 
          isOpen={!!previewItem} 
          onClose={() => setPreviewItem(null)} 
          imageUrl={previewItem?.src || ""} 
          prompt={previewItem?.prompt || ""} 
          onRemix={remix}
        />
      </div>
    </section>
  );
}
