"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { LogOut, Menu, X, Zap, Crown, Settings, ChevronDown, LayoutGrid, Globe, CreditCard, Palette, ListMinus } from "lucide-react";
import logo from "@/assets/visgen-logo.png";

const PLAN_CAPS: Record<string, number> = {
  free: 15,
  pro: 100,
  premium: 250,
};

export function Navbar() {
  const { user, profile, signOut, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [imgError, setImgError] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (pathname !== "/") return;
    
    // Check if we need to scroll from a previous page navigation
    const target = sessionStorage.getItem("visgen:scroll_target");
    if (target) {
      sessionStorage.removeItem("visgen:scroll_target");
      setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -60% 0px" }
    );

    const featuresEl = document.getElementById("features");
    const pricingEl = document.getElementById("pricing");
    
    if (featuresEl) observer.observe(featuresEl);
    if (pricingEl) observer.observe(pricingEl);

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    setImgError(false);
  }, [profile?.avatar_url]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const cap = PLAN_CAPS[profile?.plan ?? "free"] ?? 10;
  const credits = profile?.credits ?? 0;
  const pct = Math.min(100, Math.max(0, (credits / cap) * 100));
  const low = credits <= Math.max(2, Math.floor(cap * 0.15));
  const initial = (profile?.display_name || profile?.email || "U").charAt(0).toUpperCase();

  return (
    <>
      {/* Top blur curtain — content vanishing effect */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] z-40 pointer-events-none navbar-blur-curtain"
        style={{
          height: "120px",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
        }}
      />

    <header className="fixed top-0 inset-x-0 z-[100]" ref={mobileNavRef}>
      <div className="mx-auto max-w-6xl px-4 mt-5">
        <div className="relative flex items-center justify-between rounded-full border border-border/60 bg-background/70 backdrop-blur-xl px-3 py-2 shadow-[0_8px_40px_-8px_oklch(0_0_0/0.6)]">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 pl-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/50 blur-md rounded-full group-hover:bg-primary/70 transition" />
              <img
                src={(logo as any).src ?? logo as unknown as string}
                alt="VISGEN"
                className="relative h-9 w-9 sm:h-10 sm:w-10"
              />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl tracking-[0.12em] uppercase">
              VISGEN
            </span>
          </Link>

          {/* Center pill nav */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 text-sm bg-surface/40 border border-primary/20 p-1.5 rounded-full border-border/40 shadow-sm" onMouseLeave={() => setHoveredPath(null)}>
            {[
              { name: "Features", path: "/", targetId: "features", icon: LayoutGrid },
              { name: "Community", path: "/feed", icon: Globe },
              { name: "Pricing", path: "/", targetId: "pricing", icon: CreditCard }
            ].map((link) => {
              const Icon = link.icon;
              const isActive = link.targetId 
                ? (pathname === "/" && activeSection === link.targetId)
                : pathname === link.path;
              
              const hrefKey = link.targetId || link.path;
              
              return (
                <Link
                  key={hrefKey}
                  href={link.path}
                  onClick={(e) => {
                    if (link.targetId) {
                      if (pathname === "/") {
                        e.preventDefault();
                        document.getElementById(link.targetId)?.scrollIntoView({ behavior: "smooth" });
                      } else {
                        sessionStorage.setItem("visgen:scroll_target", link.targetId);
                      }
                    }
                  }}
                  onMouseEnter={() => setHoveredPath(hrefKey)}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full transition-colors z-10 ${
                    isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {hoveredPath === link.path && !isActive && (
                    <motion.div
                      layoutId="navbar-hover"
                      className="absolute inset-0 bg-foreground/5 rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {loading ? null : user ? (
              <>
                <Button asChild variant="glow" size="sm" className="rounded-full hidden  sm:inline-flex">
                  <Link href="/studio">Studio <Palette className="h-4 w-4" /></Link>
                </Button>

                {/* Avatar dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="Account"
                    className="flex items-center gap-1.5 pl-0.5 pr-2.5 py-0.5 rounded-full border border-border/60 bg-surface/40 hover:border-border/80 hover:bg-surface/70 transition"
                  >
                    <div className="h-8 w-8 rounded-full border border-border/60 bg-background/60 flex items-center justify-center text-xs font-bold text-foreground overflow-hidden shrink-0">
                      {profile?.avatar_url && !imgError ? (
                        <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" onError={() => setImgError(true)} />
                      ) : (
                        initial
                      )}
                    </div>
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-72 z-[100] rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_oklch(0_0_0/0.7)] p-3 animate-fade-in">
                      {/* Header */}
                      <div className="flex items-center gap-2.5 px-1 py-1">
                        <div className="h-9 w-9 rounded-xl border border-border/60 bg-background/60 flex items-center justify-center text-xs font-bold text-foreground overflow-hidden shrink-0">
                          {profile?.avatar_url && !imgError ? (
                            <img
                              src={profile.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={() => setImgError(true)}
                            />
                          ) : (
                            initial
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">
                            {profile?.display_name || profile?.email || "Account"}
                          </p>
                          <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground capitalize">
                            <Crown className="h-2.5 w-2.5 text-primary/70" />{" "}
                            {profile?.plan ?? "free"} plan
                          </p>
                        </div>
                      </div>

                      {/* Credit meter */}
                      <div className="mt-3 rounded-xl border border-border/50 bg-surface/40 px-3 py-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            <Zap
                              className={`h-3 w-3 ${low ? "text-destructive" : "text-primary"}`}
                            />{" "}
                            Credits
                          </span>
                          <span
                            className={`text-xs font-bold tabular-nums ${
                              low ? "text-destructive" : "text-foreground"
                            }`}
                          >
                            {credits}{" "}
                            <span className="text-muted-foreground font-normal">/ {cap}</span>
                          </span>
                        </div>
                        <div className="relative h-1.5 rounded-full bg-background/60 border border-border/50 overflow-hidden">
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ${
                              low
                                ? "bg-gradient-to-r from-destructive/80 to-destructive"
                                : "bg-gradient-to-r from-primary via-primary-glow to-accent"
                            }`}
                            style={{
                              width: `${pct}%`,
                              boxShadow: low ? undefined : "0 0 10px -2px var(--primary)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Upgrade */}
                      {(profile?.plan ?? "free") !== "premium" && (
                        <Button
                          asChild
                          variant="glow"
                          size="sm"
                          className="w-full mt-3 rounded-xl"
                          onClick={() => setMenuOpen(false)}
                        >
                          <a href="/#pricing">
                            <Crown className="h-3.5 w-3.5" /> Upgrade to Pro
                          </a>
                        </Button>
                      )}

                      <div className="h-px bg-border/60 my-2" />
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button asChild variant="glow" size="sm" className="rounded-full font-display">
                  <Link href="/auth" className="flex items-center justify-center gap-2">
                    Get started
                    <Palette className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full h-9 w-9 border border-border/60 bg-surface/40 hover:bg-foreground/5"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <ListMinus className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-2 rounded-2xl border border-border/60 bg-background/90 backdrop-blur-xl p-2 animate-fade-in">
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                } else {
                  sessionStorage.setItem("visgen:scroll_target", "features");
                }
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm hover:bg-foreground/5"
            >
              <LayoutGrid className="h-4 w-4" /> Features
            </Link>
            <Link
              href="/feed"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm hover:bg-foreground/5"
            >
              <Globe className="h-4 w-4" /> Community
            </Link>
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                } else {
                  sessionStorage.setItem("visgen:scroll_target", "pricing");
                }
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm hover:bg-foreground/5"
            >
              <CreditCard className="h-4 w-4" /> Pricing
            </Link>
            {user && (
              <>
                <div className="h-px bg-primary/60  my-1" />
                <Link
                  href="/studio"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm hover:bg-foreground/5"
                >
                  <Palette className="h-4 w-4" /> Studio
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-foreground/5"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
    </>
  );
}
