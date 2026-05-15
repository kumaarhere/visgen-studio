"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, Loader2, Zap, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Razorpay Payment Link base URLs
const PAYMENT_LINKS: Record<string, string> = {
  pro: "https://rzp.io/rzp/pb9unsb",
  premium: "https://rzp.io/rzp/nrqjkE5",
};

const tiers = [
  {
    id: "free",
    name: "Free",
    price: "0",
    period: "forever",
    description: "Try VISGEN with no commitment.",
    badge: null,
    features: [
      "15 credits / month",
      "Auto-reset every 30 days",
      "Standard quality",
      "Public gallery access",
      "Community support",
    ],
    cta: "Start free",
    highlight: false,
    icon: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "149",
    period: "/month",
    description: "For creators who ship daily.",
    badge: "Most Popular",
    features: [
      "100 credits on purchase",
      "HD exports",
      "Private generations",
      "Priority queue",
      "Remix history",
    ],
    cta: "Go Pro",
    highlight: true,
    icon: Zap,
  },
  {
    id: "premium",
    name: "Premium",
    price: "299",
    period: "/month",
    description: "Unlimited creative power.",
    badge: null,
    features: [
      "250 credits on purchase",
      "4K exports",
      "Style training",
      "API access",
      "Priority support",
    ],
    cta: "Go Premium",
    highlight: false,
    icon: Crown,
  },
];

export function Pricing() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePlanClick = (tierId: string) => {
    // Free tier — redirect to auth/studio
    if (tierId === "free") {
      router.push(user ? "/studio" : "/auth");
      return;
    }

    // Not logged in — send to auth first
    if (!user) {
      toast.info("Sign in first to upgrade your plan.");
      router.push("/auth");
      return;
    }

    const baseLink = PAYMENT_LINKS[tierId];
    if (!baseLink) return;

    setLoading(tierId);

    // Append userId, plan, and email as notes so the webhook can identify the user
    const userId = (user as any).id || "";
    const email = user?.email || "";

    const params = new URLSearchParams({
      "notes[userId]": userId,
      "notes[plan]": tierId,
      "prefill[email]": email,
    });

    const paymentUrl = `${baseLink}?${params.toString()}`;

    // Open in same tab so the user comes back to the app
    window.location.href = paymentUrl;
  };

  return (
    <section id="pricing" className="relative py-16 sm:py-20">
      {/* Ambient glow */}
      <div className="absolute inset-x-0 top-1/2 h-96 -translate-y-1/2 bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs uppercase tracking-[0.18em] text-primary/80 font-semibold">Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight font-display">
            Simple, <span className="text-gradient">credit-based</span> pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade when you need more power.
            Paid credits never expire &middot; Free credits reset monthly.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {tiers.map((t, i) => {
            const Icon = t.icon;
            const isCurrentPlan = profile?.plan === t.id ||
              (t.id === "premium" && profile?.plan === "premium");

            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative rounded-3xl p-7 flex flex-col ${
                  t.highlight
                    ? "glass-strong border-primary/40 shadow-[0_0_60px_-20px_var(--primary)]"
                    : "glass"
                }`}
              >
                {/* Badge */}
                {t.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center gap-1 whitespace-nowrap">
                    {Icon && <Icon className="h-2.5 w-2.5" />} {t.badge}
                  </div>
                )}

                {/* Plan name & desc */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {Icon && (
                      <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold font-display">{t.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{t.description}</p>

                  {/* Price */}
                  <div className="mt-5 flex items-baseline gap-0.5">
                    <span className="text-sm font-semibold text-muted-foreground self-start mt-1.5 mr-0.5">₹</span>
                    <span className="text-4xl font-bold tracking-tight">{t.price}</span>
                    <span className="text-sm text-muted-foreground ml-0.5">{t.period}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  variant={t.highlight ? "glow" : "outline"}
                  className="w-full mt-6"
                  onClick={() => handlePlanClick(t.id)}
                  disabled={loading === t.id || isCurrentPlan}
                  id={`pricing-cta-${t.id}`}
                >
                  {loading === t.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Redirecting…
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5" /> Current Plan
                    </>
                  ) : (
                    t.cta
                  )}
                </Button>

                {/* Features */}
                <ul className="mt-7 space-y-3 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="text-center mt-10 space-y-2">
          <p className="text-xs text-muted-foreground">
            Payments secured by{" "}
            <span className="text-foreground/70 font-medium">Razorpay</span>.
            {" "}Credits are added automatically after payment.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Free plan credits reset every 30 days automatically.
          </p>
        </div>
      </div>
    </section>
  );
}
