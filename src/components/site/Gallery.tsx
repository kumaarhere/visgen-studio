import { motion } from "motion/react";
import { Repeat2 } from "lucide-react";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import { Button } from "@/components/ui/button";

const items = [
  { src: g1, prompt: "Portrait with iridescent magenta visor, cinematic", aspect: "aspect-[3/4]" },
  { src: g2, prompt: "Floating crystal castle over a magenta nebula", aspect: "aspect-[3/4]" },
  { src: g3, prompt: "Cyberpunk Tokyo street in the rain at night", aspect: "aspect-[4/3]" },
  { src: g4, prompt: "Liquid chrome flowing on black, magenta highlights", aspect: "aspect-square" },
  { src: g5, prompt: "Astronaut floating in pink nebula", aspect: "aspect-[3/4]" },
  { src: g6, prompt: "Bioluminescent jungle, magenta blossoms", aspect: "aspect-[4/3]" },
];

export function Gallery() {
  return (
    <section id="gallery" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-3">Community</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Made by humans, <span className="text-gradient">painted by AI</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Browse what creators are building. Click Remix to make it your own.
          </p>
        </div>

        <div className="columns-2 lg:columns-3 gap-4 sm:gap-5 [column-fill:_balance]">
          {items.map((it, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`relative mb-4 sm:mb-5 break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer ${it.aspect}`}
            >
              <img
                src={it.src}
                alt={it.prompt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <p className="text-xs text-foreground/90 line-clamp-2 mb-2">{it.prompt}</p>
                <Button size="sm" variant="glass" className="text-xs">
                  <Repeat2 className="h-3 w-3" /> Remix
                </Button>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
