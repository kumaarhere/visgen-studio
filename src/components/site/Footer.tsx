import Link from "next/link";
import logo from "@/assets/visgen-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex flex-col items-center sm:items-start gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/50 blur-md rounded-full group-hover:bg-primary/70 transition" />
                <img
                  src={(logo as any).src ?? (logo as unknown as string)}
                  alt="VISGEN"
                  className="relative h-8 w-8"
                />
              </div>
              <span className="font-display font-bold tracking-[0.12em] uppercase text-sm">
                VISGEN
              </span>
            </Link>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wide">
              AI-driven visuals for modern creators.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-5 text-xs text-muted-foreground">
            <a href="/#features" className="hover:text-foreground transition">Features</a>
            <a href="/#pricing"  className="hover:text-foreground transition">Pricing</a>
            <a href="/#gallery"  className="hover:text-foreground transition">Gallery</a>
            <Link href="/feed"   className="hover:text-foreground transition">Community</Link>
          </nav>

          <div className="flex flex-col items-center sm:items-end text-[11px] text-muted-foreground leading-relaxed">
            <p>
              VISGEN © 2026 &nbsp;•&nbsp; Engineered by {" "}
              <a
                href="https://kumaarkandugula.online/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline underline-offset-2"
              >
                KMR
              </a>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
