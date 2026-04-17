import { Link } from "@tanstack/react-router";
import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, profile, signOut, loading } = useAuth();

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-4">
        <div className="glass-strong rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 blur-md rounded-full group-hover:bg-primary/60 transition" />
              <Sparkles className="relative h-5 w-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">VisGen</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="/#features" className="hover:text-foreground transition">Features</a>
            <a href="/#pricing" className="hover:text-foreground transition">Pricing</a>
            <a href="/#gallery" className="hover:text-foreground transition">Gallery</a>
          </nav>

          <div className="flex items-center gap-2">
            {loading ? null : user ? (
              <>
                {profile && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-glow">
                    <Sparkles className="h-3 w-3" />
                    {profile.credits} credits
                  </span>
                )}
                <Button asChild variant="glow" size="sm">
                  <Link to="/studio">Studio</Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild variant="glow" size="sm">
                  <Link to="/auth">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
