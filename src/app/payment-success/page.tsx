"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Zap, Crown, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";

const PLAN_META: Record<string, { credits: number; label: string; icon: typeof Zap; color: string }> = {
  pro: {
    credits: 100,
    label: "Pro",
    icon: Zap,
    color: "text-primary",
  },
  premium: {
    credits: 250,
    label: "Premium",
    icon: Crown,
    color: "text-accent",
  },
};

import { Suspense } from "react";

function PaymentSuccessContent() {
  const { refreshProfile, profile } = useAuth();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "pro";
  const meta = PLAN_META[plan] ?? PLAN_META.pro;
  const Icon = meta.icon;

  const [refreshed, setRefreshed] = useState(false);
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    // Refresh session to pick up new credits from DB
    const refresh = async () => {
      setRefreshing(true);
      try {
        // Small delay to allow webhook to process
        await new Promise((r) => setTimeout(r, 2500));
        await refreshProfile();
      } finally {
        setRefreshing(false);
        setRefreshed(true);
      }
    };
    refresh();
  }, [refreshProfile]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 glass-strong rounded-3xl p-10 sm:p-14 max-w-md w-full text-center shadow-elegant border border-primary/20"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <BrandLogo size={32} />
        </div>

        {/* Animated check */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
          className="flex justify-center mb-5"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <CheckCircle2 className="relative h-16 w-16 text-primary" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight mb-2">
          Payment <span className="text-gradient">Successful!</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Welcome to <span className="text-foreground font-semibold">{meta.label}</span>. Your credits are being added.
        </p>

        {/* Credit badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-7 mx-auto inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-primary/10 border border-primary/30"
        >
          <Icon className={`h-5 w-5 ${meta.color}`} />
          <div className="text-left">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Credits Added</div>
            <div className="text-2xl font-bold tabular-nums text-foreground">+{meta.credits}</div>
          </div>
        </motion.div>

        {/* Status */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {refreshing ? (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Syncing your account…</span>
            </div>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Account updated!</span>
            </>
          )}
        </div>

        {/* Current credits (after refresh) */}
        {refreshed && profile && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-xs text-muted-foreground"
          >
            Your balance: <span className="text-foreground font-semibold">{profile.credits} credits</span>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Button variant="glow" className="w-full rounded-full gap-2" asChild>
            <Link href="/studio">
              Start Creating <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Link
            href="/"
            className="block mt-3 text-xs text-muted-foreground hover:text-foreground transition"
          >
            Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
