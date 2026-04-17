import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-12">
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-display font-bold">VisGen</span>
          <span className="text-xs text-muted-foreground ml-1">© 2026</span>
        </Link>
        <nav className="flex items-center gap-6 text-xs text-muted-foreground">
          <a href="/#features" className="hover:text-foreground transition">Features</a>
          <a href="/#pricing" className="hover:text-foreground transition">Pricing</a>
          <a href="/#gallery" className="hover:text-foreground transition">Gallery</a>
          <span>Made with imagination</span>
        </nav>
      </div>
    </footer>
  );
}
