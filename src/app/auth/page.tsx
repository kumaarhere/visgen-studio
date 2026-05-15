"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Eye,
  EyeOff,
  ImageIcon,
  Wand2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "@/assets/visgen-logo.png";
import { Skeleton } from "@/components/ui/skeleton";
import { BackgroundCanvas } from "@/components/ui/BackgroundCanvas";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

/* ─── Stat items ──────────────────────────────────────────────── */
const STATS = [
  { value: "50K+", label: "Images created" },
  { value: "4.9★", label: "User rating" },
  { value: "15", label: "Free credits/mo" },
];

/* ─── Feature bullets ─────────────────────────────────────────── */
const FEATURES = [
  { icon: Sparkles, text: "Ultra-fast AI generation" },
  { icon: Zap, text: "15 free credits every month" },
  { icon: ShieldCheck, text: "Commercial rights included" },
];

/* ─── Gallery grid config ─────────────────────────────────────── */
const GALLERY = [g1, g2, g3, g4, g5, g6];

export default function AuthPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { status } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user || status === "authenticated") router.push("/studio");
  }, [user, status, router]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/studio",
      });
      if (result?.error) {
        toast.error(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
      } else {
        toast.success(
          mode === "signup" ? "Account created! Welcome to VISGEN." : "Welcome back!"
        );
        router.push("/studio");
      }
    } catch {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      await signIn("google", { callbackUrl: "/studio" });
    } catch {
      toast.error("Google sign-in failed");
      setBusy(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-background">
        <div className="hidden lg:flex relative w-[55%] xl:w-[60%] flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-6 w-32" /></div>
          <div className="space-y-6">
            <Skeleton className="h-4 w-24" /><Skeleton className="h-16 w-full max-w-md" /><Skeleton className="h-20 w-full max-w-sm" />
            <div className="grid grid-cols-3 gap-4 max-w-xl"><Skeleton className="col-span-2 aspect-video rounded-2xl" /><Skeleton className="aspect-square rounded-2xl" /></div>
          </div>
          <div className="flex gap-12"><Skeleton className="h-10 w-20" /><Skeleton className="h-10 w-20" /><Skeleton className="h-10 w-20" /></div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-[420px] space-y-8">
            <div className="flex gap-2"><Skeleton className="h-10 flex-1 rounded-xl" /><Skeleton className="h-10 flex-1 rounded-xl" /></div>
            <div className="space-y-4 text-center items-center flex flex-col"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64" /></div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="space-y-6"><div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-12 w-full rounded-xl" /></div><div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-12 w-full rounded-xl" /></div></div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto relative flex flex-col items-center">
      {/* Background layers for linewave visibility */}
      <div className="fixed inset-0 bg-background z-[-3]" />
      <BackgroundCanvas />
      <div className="fixed inset-0 bg-background/20 backdrop-blur-[1px] pointer-events-none z-[-1]" />

      {/* Top Navigation / Logo */}
      <header className="w-full max-w-[1440px] px-8 py-6 flex justify-start relative z-10 shrink-0">
        <Link href="/" className="flex items-center gap-3 group/logo">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/40 blur-md rounded-full group-hover/logo:bg-primary/60 transition" />
            <img
              src={(logo as any).src ?? (logo as unknown as string)}
              alt="VISGEN"
              className="relative h-8 w-8"
            />
          </div>
          <span className="font-display font-bold text-lg tracking-[0.15em] uppercase">
            VISGEN
          </span>
        </Link>
      </header>

      <main className="flex-1 w-full max-w-7xl px-6 py-12 flex flex-col items-center justify-center relative z-10">
        
        {/* Rearranged Content: A single large integrated container */}
        <div className="w-full max-w-5xl flex flex-col items-center gap-6">
          
          {/* Header area */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-1"
          >
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-primary/80">
              Future of Visual Creation
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              {mode === "signin" ? "Sign in to " : "Create your "}<span className="text-gradient">{mode === "signin" ? "VISGEN" : "Account"}</span>
            </h1>
          </motion.div>

          {/* Integrated Split Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-4xl grid lg:grid-cols-2 rounded-[32px] overflow-hidden border border-white/[0.08] glass-strong shadow-2xl relative"
          >
            {/* Glow effect for the whole card */}
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

            {/* Left: Branding & Visuals (Integrated) */}
            <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 relative overflow-hidden">
              {/* Background showcase */}
              <div className="absolute inset-0 z-0 opacity-40">
                <div className="grid grid-cols-2 gap-3 p-6 rotate-12 scale-125">
                  {GALLERY.slice(0, 4).map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg">
                      <img src={(img as any).src ?? (img as unknown as string)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/20 to-background/60" />
              </div>

              <div className="relative z-10 space-y-5">
                <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold leading-tight">
                  Where imagination<br />meets <span className="text-gradient italic">intelligence</span>.
                </h2>
                <p className="text-muted-foreground/80 text-xs leading-relaxed max-w-xs">
                  Join thousands of creators using VISGEN's cutting-edge AI to turn
                  ideas into stunning visual art — in seconds.
                </p>
              </div>

              {/* Stats inside the left panel */}
              <div className="relative z-10 grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                {STATS.slice(0, 2).map((s, i) => (
                  <div key={i}>
                    <div className="text-lg font-bold text-gradient">{s.value}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: The Auth Form */}
            <div className="p-6 sm:p-10 bg-background/20 backdrop-blur-md">
              <div className="w-full max-w-[320px] mx-auto">
                {/* Mode toggle */}
                <div className="flex p-1 rounded-xl bg-surface/40 border border-white/[0.06] mb-6 gap-1">
                  {(["signin", "signup"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                        mode === m
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "signin" ? "Sign In" : "Sign Up"}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="mb-6"
                  >
                    <p className="text-muted-foreground text-xs">
                      {mode === "signin" ? "Welcome back! Please sign in." : "Start creating with 15 free credits."}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Google Button */}
                <Button
                  variant="glass"
                  className="w-full h-10 gap-3 border-white/10 hover:border-white/20"
                  onClick={handleGoogle}
                  disabled={busy}
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.27 9.764A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.03 3.114Z" />
                    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
                    <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
                    <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.236L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
                  </svg>
                  <span className="font-medium text-xs">Google</span>
                </Button>

                <div className="relative my-5 flex items-center gap-3">
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/10" />
                  <span className="shrink-0 text-[9px] font-bold tracking-[0.3em] uppercase text-muted-foreground/40">
                    OR
                  </span>
                  <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/10" />
                </div>

                <form onSubmit={handleEmail} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30" />
                      <input
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/60 transition-all outline-none text-xs placeholder:text-muted-foreground/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30" />
                      <input
                        type={showPw ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 pl-10 pr-11 rounded-xl bg-white/[0.03] border border-white/10 focus:border-primary/60 transition-all outline-none text-xs placeholder:text-muted-foreground/30"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground">
                        {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" variant="glow" className="w-full h-10 mt-1 rounded-xl font-bold text-xs group" disabled={busy}>
                    {busy ? <span className="animate-pulse">Processing...</span> : <>{mode === "signin" ? "Sign In" : "Create Account"} <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" /></>}
                  </Button>
                </form>

                <p className="text-center mt-5 text-[10px] text-muted-foreground">
                  {mode === "signin" ? "No account?" : "Have an account?"}{" "}
                  <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-bold hover:underline">
                    {mode === "signin" ? "Join now" : "Log in"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Simplified Footer for no-scroll */}
      <footer className="w-full px-6 py-4 flex justify-center items-center text-[9px] text-muted-foreground/30 uppercase tracking-[0.2em] font-bold relative z-10 shrink-0">
        <p>© 2026 VISGEN STUDIO • ALL RIGHTS RESERVED</p>
      </footer>
    </div>
  );
}
