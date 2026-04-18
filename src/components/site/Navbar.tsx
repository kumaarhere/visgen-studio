import { Link } from "@tanstack/react-router";
import { LogOut, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import logo from "@/assets/visgen-logo.png";

export function Navbar() {
  const { user, profile, signOut, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-4 mt-5">
        <div className="relative flex items-center justify-between rounded-full border border-border/60 bg-background/70 backdrop-blur-xl px-3 py-2 shadow-[0_8px_40px_-8px_oklch(0_0_0/0.6)]">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 pl-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/50 blur-md rounded-full group-hover:bg-primary/70 transition" />
              <img src={logo} alt="VisGen" className="relative h-7 w-7" />
            </div>
            <span className="font-display font-bold text-base tracking-tight">VisGen</span>
          </Link>

          {/* Center pill nav */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 text-sm">
            <a href="/#features" className="px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition">Features</a>
            <a href="/#gallery" className="px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition">Gallery</a>
            <a href="/#pricing" className="px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition">Pricing</a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {loading ? null : user ? (
              <>
                {profile && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary-glow">
                    <Sparkles className="h-3 w-3" />
                    {profile.credits}
                  </span>
                )}
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild variant="glow" size="sm" className="rounded-full">
                  <Link to="/studio">Studio</Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sign out" className="rounded-full hidden sm:inline-flex">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild variant="glow" size="sm" className="rounded-full">
                  <Link to="/auth">Get started</Link>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-2 rounded-2xl border border-border/60 bg-background/90 backdrop-blur-xl p-2 animate-fade-in">
            <a href="/#features" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm hover:bg-foreground/5">Features</a>
            <a href="/#gallery" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm hover:bg-foreground/5">Gallery</a>
            <a href="/#pricing" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm hover:bg-foreground/5">Pricing</a>
            {user && (
              <>
                <div className="h-px bg-border/60 my-1" />
                <Link to="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm hover:bg-foreground/5">Dashboard</Link>
                <button
                  onClick={() => { setOpen(false); signOut(); }}
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
  );
}
