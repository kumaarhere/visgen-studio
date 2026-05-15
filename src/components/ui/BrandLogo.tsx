import visgenLogo from "@/assets/visgen-logo.png";

/**
 * BrandLogo — drop-in replacement for Sparkles icon.
 * Accepts the same size/class conventions as Lucide icons.
 */
export function BrandLogo({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <img
      src={visgenLogo.src}
      alt="VISGEN"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}
