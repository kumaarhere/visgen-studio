import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function Hero() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const go = () => {
    if (prompt.trim()) {
      sessionStorage.setItem("visgen:prompt", prompt.trim());
    }
    navigate({ to: user ? "/studio" : "/auth" });
  };

  return (
    <section className="relative pt-36 pb-24 sm:pt-44 sm:pb-32 overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground mb-6"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Powered by next-gen diffusion models
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
        >
          Create stunning images
          <br />
          with <span className="text-gradient">just a prompt</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Turn your ideas into high-quality visuals in seconds. No design skills, no
          waiting — just imagination on demand.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 max-w-2xl mx-auto"
        >
          <div className="glass-strong rounded-2xl p-2 flex items-center gap-2 shadow-elegant focus-within:border-primary/40 transition">
            <Sparkles className="h-5 w-5 text-primary ml-3 shrink-0" />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
              placeholder="A neon-lit Tokyo street at midnight, cinematic..."
              className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground/60 py-2"
            />
            <Button variant="glow" size="default" onClick={go}>
              Generate
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Free 10 credits to start. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
