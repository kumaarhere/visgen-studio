import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function CTASection() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const go = () => {
    if (prompt.trim()) sessionStorage.setItem("visgen:prompt", prompt.trim());
    navigate({ to: user ? "/studio" : "/auth" });
  };

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl glass-strong p-10 sm:p-16 text-center noise"
        >
          <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/30 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Your next idea,
              <br />
              <span className="text-gradient">one prompt away</span>
            </h2>
            <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
              Join thousands of creators turning thoughts into visuals. Free to start.
            </p>

            <div className="mt-10 max-w-xl mx-auto">
              <div className="glass rounded-2xl p-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary ml-3 shrink-0" />
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && go()}
                  placeholder="Describe your vision..."
                  className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground/60 py-2"
                />
                <Button variant="glow" onClick={go}>
                  Generate <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
