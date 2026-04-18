import { motion } from "motion/react";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const SUGGESTIONS = [
  "Neon samurai in rainy Tokyo alley",
  "Floating crystal island at sunset",
  "Cyberpunk fox, holographic fur",
  "Surreal desert with mirror dunes",
];

export function CTASection() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const go = (text?: string) => {
    const value = (text ?? prompt).trim();
    if (value) sessionStorage.setItem("visgen:prompt", value);
    navigate({ to: user ? "/studio" : "/auth" });
  };

  return (
    <section className="relative py-24 sm:py-36 overflow-hidden">
      {/* Aurora backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[160px] rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-primary/30 blur-[100px] rounded-full animate-float-slow" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs text-primary-glow mb-6"
        >
          <Wand2 className="h-3 w-3" />
          Start free · No card required
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl font-bold tracking-tight"
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
          className="mt-5 text-muted-foreground max-w-xl mx-auto"
        >
          Type a prompt. Watch it come alive. Share it with the world.
        </motion.p>

        {/* Prompt input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 max-w-2xl mx-auto"
        >
          <div className="relative group">
            {/* Glow ring */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-primary-glow to-primary rounded-2xl opacity-60 blur-md group-focus-within:opacity-100 transition" />
            <div className="relative flex items-center gap-2 rounded-2xl bg-background border border-border p-2">
              <Sparkles className="h-5 w-5 text-primary ml-3 shrink-0" />
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
                placeholder="A neon dragon soaring over Tokyo..."
                className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground/60 py-2.5"
              />
              <Button variant="glow" onClick={() => go()} className="rounded-xl">
                Generate <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Suggestion chips */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setPrompt(s);
                  go(s);
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-background/40 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
