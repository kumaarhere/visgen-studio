import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

const slides = [g1, g2, g3, g4, g5, g6, g1, g2];
const STEP = 360 / slides.length;

export function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rotation, setRotation] = useState(-3 * STEP);
  const [mounted, setMounted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; rot: number } | null>(null);
  const autoplayPaused = useRef(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => {
      if (!autoplayPaused.current) {
        setRotation((r) => r - STEP);
      }
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const go = () => navigate({ to: user ? "/studio" : "/auth" });

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    autoplayPaused.current = true;
    dragStart.current = { x: e.clientX, rot: rotation };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    setRotation(dragStart.current.rot + dx * 0.35);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    // Snap to nearest slide
    setRotation((r) => Math.round(r / STEP) * STEP);
    dragStart.current = null;
    setDragging(false);
    setTimeout(() => {
      autoplayPaused.current = false;
    }, 2000);
  };

  // Determine which slide is closest to "front"
  const activeIndex = ((Math.round(-rotation / STEP) % slides.length) + slides.length) % slides.length;

  return (
    <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-mesh pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight"
        >
          Create Stunning Images
          <br />
          with <span className="text-gradient">Just a Prompt</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto"
        >
          Turn your ideas into high-quality visuals in seconds, no design skills needed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex justify-center"
        >
          <Button variant="glow" size="lg" onClick={go} className="rounded-full">
            Generate image
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* 3D Curved Carousel — drag/swipe enabled */}
      <div className="relative mt-14 sm:mt-20">
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[80%] h-40 bg-primary/40 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-10 w-[40%] h-20 bg-primary/60 blur-[60px] rounded-full pointer-events-none" />

        <div
          className="carousel-3d relative h-[380px] sm:h-[460px] mx-auto max-w-7xl select-none touch-none"
          style={{ cursor: dragging ? "grabbing" : "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="carousel-3d-track absolute inset-0 flex items-center justify-center"
            style={{
              transform: mounted ? `translateZ(-600px) rotateY(${rotation}deg)` : undefined,
              transition: dragging ? "none" : undefined,
            }}
          >
            {slides.map((src, i) => {
              const angle = STEP * i;
              const isActive = i === activeIndex;
              return (
                <div
                  key={i}
                  className="carousel-card absolute w-[180px] h-[260px] sm:w-[240px] sm:h-[340px] rounded-2xl overflow-hidden border border-border pointer-events-none"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(420px)`,
                    boxShadow: isActive
                      ? "0 0 60px oklch(0.86 0.28 142 / 0.6), 0 0 120px oklch(0.86 0.28 142 / 0.3)"
                      : "0 20px 40px -10px rgba(0,0,0,0.6)",
                  }}
                >
                  <img
                    src={src}
                    alt={`AI generated artwork ${i + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading={i < 4 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Drag to rotate · Swipe on mobile
        </p>

        <div className="relative mx-auto max-w-5xl px-6 mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            {
              t: "Lightning-Fast Generation",
              d: "Type what you imagine, hit enter, and watch AI bring it to life in moments.",
            },
            {
              t: "Multiple Styles & Customization",
              d: "Pick a style and fine-tune details like color, lighting, and mood.",
            },
            {
              t: "High-Resolution Downloads",
              d: "Export your creations in high-quality resolution for print, web, or social.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <h3 className="text-sm font-semibold text-foreground">{f.t}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                {f.d}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
