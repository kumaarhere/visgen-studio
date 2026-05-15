"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Download, Repeat2, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { toast } from "sonner";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt: string;
  onRemix?: (prompt: string) => void;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  prompt,
  onRemix,
}: ImagePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Prompt copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/90 backdrop-blur-md cursor-zoom-out"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl max-h-full overflow-hidden rounded-3xl bg-surface/40 border border-border/50 shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button (Mobile) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/60 backdrop-blur-md border border-border/40 text-foreground hover:bg-background/80 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image Area */}
            <div className="relative flex-1 bg-black/20 flex items-center justify-center overflow-hidden min-h-[300px]">
              <img
                src={imageUrl}
                alt={prompt}
                className="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain shadow-2xl"
              />
            </div>

            {/* Sidebar / Info Area */}
            <div className="w-full md:w-[320px] p-6 sm:p-8 flex flex-col justify-between bg-surface/20 backdrop-blur-xl border-t md:border-t-0 md:border-l border-border/40">
              <div>
                <div className="flex items-center justify-between mb-6 hidden md:flex">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-primary/80">Image Detail</span>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <h3 className="text-sm font-semibold text-foreground/70 mb-3">Prompt</h3>
                <div className="p-4 rounded-2xl bg-background/40 border border-border/40 mb-6 max-h-[220px] md:max-h-[400px] overflow-y-auto no-scrollbar flex flex-col justify-start">
                  <p className="text-sm leading-relaxed text-foreground/90 italic text-left">
                    "{prompt}"
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="glass" className="w-full rounded-xl" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-primary mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button 
                    variant="glass" 
                    className="w-full rounded-xl"
                    onClick={async () => {
                      try {
                        const res = await fetch(imageUrl);
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `VISGEN-${Date.now()}.jpg`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("Download started!");
                      } catch {
                        toast.error("Download failed. Please try again.");
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
                
                {onRemix && (
                  <Button variant="glow" className="w-full rounded-xl" onClick={() => onRemix(prompt)}>
                    <Repeat2 className="h-4 w-4 mr-2" />
                    Remix this prompt
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
