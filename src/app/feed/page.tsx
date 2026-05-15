"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Repeat2, Loader2, Globe, Download, Heart, Copy, Check } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { toast } from "sonner";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { getPublicImages, toggleLikeImage } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { ImagePreviewModal } from "@/components/ui/ImagePreviewModal";
import { BackgroundCanvas } from "@/components/ui/BackgroundCanvas";

export default function FeedPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<{ src: string; prompt: string } | null>(null);

  useEffect(() => {
    getPublicImages().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const remix = (prompt: string) => {
    sessionStorage.setItem("visgen:prompt", prompt);
    window.location.href = user ? "/studio" : "/auth";
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundCanvas />
      <Navbar />
      <main className="pt-28 sm:pt-32 pb-16 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[10px] sm:text-xs text-primary-glow mb-4">
            <Globe className="h-3 w-3" />Community
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">What the world is <span className="text-gradient">painting</span></h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground px-2">Public creations from every VISGEN user. Tap Remix to build on any prompt.</p>
        </div>
        {loading ? (
          <div className="columns-2 md:columns-3 xl:columns-4 gap-3 sm:gap-4">
            {[...Array(12)].map((_, i) => (
              <Skeleton
                key={i}
                className="mb-4 rounded-2xl w-full"
                style={{ height: `${[280, 380, 320, 420][i % 4]}px` }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <div className="h-12 w-12 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4"><BrandLogo size={20} /></div>
            <p className="text-sm font-medium mb-1">Nothing here yet</p>
            <p className="text-xs text-muted-foreground mb-5">Be the first to publish to the community.</p>
            <Button asChild variant="glow" size="sm" className="rounded-full"><Link href={user ? "/studio" : "/auth"}>Open Studio</Link></Button>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 xl:columns-4 gap-3 sm:gap-4 [column-fill:_balance]">
            {items.map((it, i) => (
              <FeedCard key={it._id} item={it} index={i} onRemix={remix} currentUser={user} onPreview={(src, pr) => setPreviewItem({ src, prompt: pr })} />
            ))}
          </div>
        )}

        <ImagePreviewModal 
          isOpen={!!previewItem} 
          onClose={() => setPreviewItem(null)} 
          imageUrl={previewItem?.src || ""} 
          prompt={previewItem?.prompt || ""} 
          onRemix={remix}
        />
      </main>
      <Footer />
    </div>
  );
}

function FeedCard({ item, index, onRemix, currentUser, onPreview }: { item: any; index: number; onRemix: (prompt: string) => void; currentUser: any; onPreview: (src: string, pr: string) => void }) {
  const [active, setActive] = useState(false);
  const [likes, setLikes] = useState<string[]>(item.likes || []);
  const [copied, setCopied] = useState(false);
  const initial = ("U").charAt(0);
  
  const hasLiked = currentUser ? likes.includes(currentUser.id) : false;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      window.location.href = "/auth";
      return;
    }
    
    // Optimistic UI update
    setLikes(hasLiked ? likes.filter(id => id !== currentUser.id) : [...likes, currentUser.id]);
    
    try {
      await toggleLikeImage(item._id);
    } catch {
      // Revert if failed
      setLikes(hasLiked ? [...likes, currentUser.id] : likes.filter(id => id !== currentUser.id));
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.figure initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.4) }} 
      onClick={() => onPreview(item.imageUrl, item.prompt)} 
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)} 
      className="relative mb-3 sm:mb-4 break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer glass"
    >
      <img src={item.imageUrl} alt={item.prompt} loading="lazy" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
      <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
      
      {/* Heart floating top right - always visible */}
      <div className="absolute top-2 right-2 transition-opacity duration-300 z-10 opacity-100">
        <button onClick={handleLike} className="flex items-center gap-1.5 p-1.5 sm:px-2 rounded-full bg-background/60 backdrop-blur-md border border-border/40 hover:bg-background/80 hover:scale-105 active:scale-95 transition">
          <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${hasLiked ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
          {likes.length > 0 && <span className="text-[10px] font-medium pr-1 text-foreground/80">{likes.length}</span>}
        </button>
      </div>

      <figcaption className={`absolute inset-x-0 bottom-0 p-2.5 sm:p-3 transition-all duration-300 z-10 ${active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"}`}>
        <div className="flex items-center gap-1.5 mb-2">
          {item.user?.avatarUrl ? (
            <img src={item.user.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover border border-primary/40" />
          ) : (
            <div className="h-5 w-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[9px] font-bold text-primary">
              {(item.user?.displayName || item.user?.email || "A").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-[10px] text-foreground/80 truncate">{item.user?.displayName || item.user?.email || "Anonymous"}</span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-foreground/90 line-clamp-2 mb-2">{item.prompt}</p>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="glow" className="text-[10px] h-7 px-2.5 flex-1" onClick={(e) => { e.stopPropagation(); onRemix(item.prompt); }}><Repeat2 className="h-3 w-3" /> Remix</Button>
          <Button size="sm" variant="glass" className="text-[10px] h-7 px-2" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button 
            size="sm" 
            variant="glass" 
            className="text-[10px] h-7 px-2" 
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const res = await fetch(item.imageUrl);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `VISGEN-${item._id}.jpg`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Download started!");
              } catch {
                toast.error("Download failed");
              }
            }}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </figcaption>
    </motion.figure>
  );
}
