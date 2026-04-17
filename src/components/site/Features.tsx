import { motion } from "motion/react";
import { Zap, Palette, Download, Lock } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning-fast generation",
    body: "Type what you imagine, hit enter, and watch AI bring it to life in seconds.",
  },
  {
    icon: Palette,
    title: "Multiple styles & control",
    body: "Pick a style and fine-tune details like color, lighting, mood, and composition.",
  },
  {
    icon: Download,
    title: "High-resolution exports",
    body: "Download in high quality for print, web, or social media — no watermarks on Pro.",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "Your generations stay yours. Toggle public when you want to share with the community.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-3">Why VisGen</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Built for <span className="text-gradient">visual creators</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass rounded-2xl p-6 hover:border-primary/30 transition group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/25 transition">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
