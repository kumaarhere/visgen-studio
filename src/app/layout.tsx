import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import { AuthProvider } from "@/lib/auth-context";
import { BackgroundCanvas } from "@/components/ui/BackgroundCanvas";
import "./globals.css";

export const metadata: Metadata = {
  title: "VISGEN — AI image generation studio",
  description: "Create stunning AI images from prompts. Premium image generation studio.",
  authors: [{ name: "VISGEN" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </head>
      <body suppressHydrationWarning className="min-h-screen selection:bg-primary/30">
        {/* Subtle noise + gradient overlay on top of the waves (if present) */}
        <div className="fixed inset-0 z-[-1] pointer-events-none noise">
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.86_0.28_142/0.03),transparent_50%)]" />
        </div>

        <NextAuthProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
