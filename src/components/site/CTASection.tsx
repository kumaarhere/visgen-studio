"use client";

import { motion } from "motion/react";
import { ArrowRight, Wand2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import logo from "@/assets/visgen-logo.png";

const SUGGESTIONS = [
  "Neon samurai standing in a rainy cyberpunk Tokyo alleyway",
  "A glowing crystal island floating above clouds at sunset",
  "Cyberpunk arctic fox with holographic fur and neon eyes",
  "Surreal mirror dunes desert reflecting a purple galaxy sky",
  "Steampunk mechanical owl perched on a brass telescope",
  "A cozy glass cabin glowing in a dense bioluminescent forest",
  "Futuristic racing car drifting on a neon-lit rain-slicked track",
  "Ethereal underwater temple illuminated by glowing jellyfish"
];

export function CTASection() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const go = (text?: string) => {
    const value = (text ?? prompt).trim();
    if (value) sessionStorage.setItem("visgen:prompt", value);
    router.push(user ? "/studio" : "/auth");
  };

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Aurora backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] lg:w-[800px] aspect-square bg-primary/20 blur-[100px] sm:blur-[160px] rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[200px] sm:w-[300px] aspect-square bg-primary/30 blur-[80px] sm:blur-[100px] rounded-full animate-float-slow" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[10px] sm:text-xs text-primary-glow mb-5 sm:mb-6"
        >
          <Wand2 className="h-3 w-3" />
          <span>Start free · No card required</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
        >
          Ready to create
          <br />
          <span className="text-gradient">your masterpiece?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 sm:mt-5 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2"
        >
          Type a prompt. Watch it come alive. Share it with the world.
        </motion.p>

        {/* Prompt input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 sm:mt-10 max-w-2xl mx-auto"
        >
          <div className="relative group">
            {/* Glow ring */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-primary-glow to-primary rounded-2xl opacity-60 blur-md group-focus-within:opacity-100 transition" />

            {/* Mobile: stacked. Desktop: inline */}
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 rounded-2xl bg-background border border-border p-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img src={(logo as any).src ?? (logo as unknown as string)} alt="VISGEN" className="h-8 w-8 sm:h-8 sm:w-8 ml-2 sm:ml-3 shrink-0" />
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && go()}
                  placeholder="A neon dragon over Tokyo..."
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground/60 py-2.5 pr-2"
                  suppressHydrationWarning={true}
                />
              </div>
              <Button
                variant="glow"
                onClick={() => go()}
                className="rounded-xl w-full sm:w-auto shrink-0"
              >
                Generate <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Suggestion chips */}
          <div 
            className="mt-6 sm:mt-8 relative overflow-hidden flex w-full"
            style={{ maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" }}
          >
            <div className="flex w-max animate-marquee gap-2 sm:gap-3 py-1 items-center">
              {[...SUGGESTIONS, ...SUGGESTIONS].map((s, i) => (
                <button
                  key={`${s}-${i}`}
                  onClick={() => {
                    setPrompt(s);
                    go(s);
                  }}
                  className="whitespace-nowrap text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border bg-background/40 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition"
                  suppressHydrationWarning={true}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
