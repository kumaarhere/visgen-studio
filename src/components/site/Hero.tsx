"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
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

const positions = [
  "center",
  "right1",
  "right2",
  "right3",
  "back",
  "left3",
  "left2",
  "left1",
];

const variants = {
  center: { x: "0%", scale: 1, zIndex: 10, rotateY: 0, opacity: 1, filter: "blur(0px)" },
  right1: { x: "85%", scale: 0.8, zIndex: 8, rotateY: -15, opacity: 0.85, filter: "blur(0px)" },
  right2: { x: "150%", scale: 0.6, zIndex: 6, rotateY: -25, opacity: 0.6, filter: "blur(2px)" },
  right3: { x: "190%", scale: 0.4, zIndex: 4, rotateY: -35, opacity: 0, filter: "blur(4px)" },
  back: { x: "0%", scale: 0.3, zIndex: 2, rotateY: 0, opacity: 0, filter: "blur(4px)" },
  left3: { x: "-190%", scale: 0.4, zIndex: 4, rotateY: 35, opacity: 0, filter: "blur(4px)" },
  left2: { x: "-150%", scale: 0.6, zIndex: 6, rotateY: 25, opacity: 0.6, filter: "blur(2px)" },
  left1: { x: "-85%", scale: 0.8, zIndex: 8, rotateY: 15, opacity: 0.85, filter: "blur(0px)" },
};

export function Hero() {
  const router = useRouter();
  const { user } = useAuth();
  const [indexes, setIndexes] = useState([0, 1, 2, 3, 4, 5, 6, 7]);
  const [dragging, setDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const responsiveVariants = {
    center: { x: "0%", scale: 1, zIndex: 10, rotateY: 0, opacity: 1, filter: "blur(0px)" },
    right1: { x: isMobile ? "50%" : "85%", scale: 0.8, zIndex: 8, rotateY: -15, opacity: 0.85, filter: "blur(0px)" },
    right2: { x: isMobile ? "90%" : "150%", scale: 0.6, zIndex: 6, rotateY: -25, opacity: 0.6, filter: "blur(2px)" },
    right3: { x: isMobile ? "120%" : "190%", scale: 0.4, zIndex: 4, rotateY: -35, opacity: 0, filter: "blur(4px)" },
    back: { x: "0%", scale: 0.3, zIndex: 2, rotateY: 0, opacity: 0, filter: "blur(4px)" },
    left3: { x: isMobile ? "-120%" : "-190%", scale: 0.4, zIndex: 4, rotateY: 35, opacity: 0, filter: "blur(4px)" },
    left2: { x: isMobile ? "-90%" : "-150%", scale: 0.6, zIndex: 6, rotateY: 25, opacity: 0.6, filter: "blur(2px)" },
    left1: { x: isMobile ? "-50%" : "-85%", scale: 0.8, zIndex: 8, rotateY: 15, opacity: 0.85, filter: "blur(0px)" },
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (!dragging) {
        setIndexes((prev) => prev.map((p) => (p - 1 + 8) % 8));
      }
    }, 3500);
    return () => clearInterval(id);
  }, [dragging]);

  const go = () => router.push(user ? "/studio" : "/auth");

  return (
    <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 overflow-hidden">
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

      {/* 3D Coverflow Carousel */}
      <div 
        className="relative mt-14 sm:mt-20 py-10" 
        style={{ perspective: "1200px" }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[80%] h-40 bg-primary/40 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-10 w-[40%] h-20 bg-primary/60 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative h-[280px] sm:h-[420px] flex items-center justify-center max-w-7xl mx-auto touch-none">
          {slides.map((src, i) => {
            const posIndex = indexes[i];
            const posName = positions[posIndex];
            return (
              <motion.div
                key={i}
                variants={responsiveVariants}
                animate={posName}
                initial={false}
                transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                onPanStart={() => setDragging(true)}
                onPanEnd={(e, info) => {
                  setDragging(false);
                  if (info.offset.x > 50) {
                    setIndexes((prev) => prev.map((p) => (p + 1) % 8)); // Slide right
                  } else if (info.offset.x < -50) {
                    setIndexes((prev) => prev.map((p) => (p - 1 + 8) % 8)); // Slide left
                  }
                }}
                className="absolute w-[200px] h-[280px] sm:w-[300px] sm:h-[420px] rounded-2xl overflow-hidden glass border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing"
              >
                <img
                  src={(src as any).src ?? (src as unknown as string)}
                  alt={`AI generated artwork ${i + 1}`}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                  loading={i < 4 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
