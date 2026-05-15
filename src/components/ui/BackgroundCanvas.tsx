"use client";

import dynamic from "next/dynamic";

// Lazy-load so it doesn't block SSR
const LineWaves = dynamic(() => import("@/components/ui/LineWaves"), { ssr: false });

export function BackgroundCanvas() {
  return (
    <div className="fixed inset-0 z-[-2] pointer-events-none opacity-[0.25]" aria-hidden="true">
      <LineWaves
        speed={0.08}
        innerLineCount={25}
        outerLineCount={25}
        warpIntensity={0.5}
        rotation={-30}
        edgeFadeWidth={0.28}
        colorCycleSpeed={0.25}
        brightness={0.07}
        color1="#3b82f6"
        color2="#8b5cf6"
        color3="#ffffff"
        enableMouseInteraction={false}
        mouseInfluence={0}
      />
    </div>
  );
}
