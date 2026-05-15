"use client";

import { motion } from "motion/react";
import { Zap, Palette, Download, Lock } from "lucide-react";
import featureSpeed from "@/assets/feature-speed.png";
import g6 from "@/assets/gallery-6.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g2 from "@/assets/gallery-2.jpg";

const features = [
  {
    icon: Zap,
    title: "Lightning-fast generation",
    body: "Type what you imagine, hit enter, and watch AI bring it to life in seconds. The future of creative speed is here.",
    image: featureSpeed,
    className: "md:col-span-2 lg:col-span-2 lg:row-span-2",
  },
  {
    icon: Palette,
    title: "Multiple styles & control",
    body: "Pick a style and fine-tune details like color, lighting, and composition.",
    image: g6,
    className: "md:col-span-1 lg:col-span-1",
  },
  {
    icon: Download,
    title: "High-resolution exports",
    body: "Download in high quality for print, web, or social media.",
    image: g5,
    className: "md:col-span-1 lg:col-span-1",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "Your generations stay yours. Toggle public when you want to share with the community.",
    image: g2,
    className: "md:col-span-2 lg:col-span-3",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-3">Why VISGEN</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Built for <span className="text-gradient">visual creators</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[280px] gap-4 lg:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-3xl overflow-hidden group border border-border/40 hover:border-primary/50 transition-colors bg-surface/80 backdrop-blur-md ${f.className}`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={(f.image as any).src ?? (f.image as unknown as string)} 
                  alt={f.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-40 group-hover:opacity-60" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent pointer-events-none" />
              </div>
              
              {/* Content */}
              <div className="relative p-6 sm:p-8 h-full flex flex-col justify-end">
                <div className="w-11 h-11 rounded-2xl bg-background/40 backdrop-blur-md border border-border/50 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:border-primary/30 transition shadow-card">
                  <f.icon className="h-5 w-5 text-primary-glow" />
                </div>
                <h3 className="font-semibold text-xl sm:text-2xl mb-2 text-foreground tracking-tight">{f.title}</h3>
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-md">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
