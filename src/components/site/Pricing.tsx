import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try VisGen with no commitment.",
    features: ["10 credits / month", "Standard quality", "Public gallery access", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For creators who ship daily.",
    features: ["500 credits / month", "HD exports", "Private generations", "Priority queue", "Remix history"],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Premium",
    price: "$29",
    period: "/month",
    description: "Unlimited creative power.",
    features: ["2,000 credits / month", "4K exports", "Style training", "API access", "Priority support"],
    cta: "Go Premium",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="absolute inset-x-0 top-1/2 h-96 -translate-y-1/2 bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Simple, <span className="text-gradient">credit-based</span> pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade when you need more horsepower.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-3xl p-7 ${
                t.highlight
                  ? "glass-strong border-primary/40 shadow-[0_0_60px_-20px_var(--primary)]"
                  : "glass"
              }`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  Most popular
                </div>
              )}
              <h3 className="text-xl font-semibold">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>
              <Button
                asChild
                variant={t.highlight ? "glow" : "outline"}
                className="w-full mt-6"
              >
                <Link to="/auth">{t.cta}</Link>
              </Button>
              <ul className="mt-7 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
