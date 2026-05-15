"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Trash2, 
  Download, 
  Globe, 
  Lock, 
  MoreVertical, 
  Repeat2, 
  Loader2, 
  Check, 
  Copy, 
  Play, 
  Plus, 
  LayoutGrid, 
  Heart,
  ImagePlus,
  Upload,
  XCircle,
  Wand2,
  Zap,
  ArrowUp,
  Crown,
  Palette,
  ChevronDown,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  getUserImages,
  toggleImagePublic,
  generateImage,
  deleteImage,
  toggleLikeImage,
  getCloudinarySignature,
} from "@/app/actions";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ImagePreviewModal } from "@/components/ui/ImagePreviewModal";
import { BackgroundCanvas } from "@/components/ui/BackgroundCanvas";

type GeneratedImage = {
  _id: string;
  prompt: string;
  imageUrl: string;
  isPublic: boolean;
  likes: string[];
  createdAt?: string;
};

const SUGGESTIONS = [
  "Cyberpunk samurai standing in neon rain, cinematic 4K bokeh",
  "Surreal floating island covered in bioluminescent forest at night",
  "Minimal product shot of a chrome perfume bottle on a pastel gradient",
  "Portrait of an astronaut lost in a magenta nebula, editorial lighting",
  "Vaporwave city at dusk with a retro grid horizon and purple sky",
  "Iridescent glass orb resting on volcanic black sand at low tide",
  "Anime sunset over Tokyo rooftops, ultra detailed watercolour style",
  "Macro shot of a glowing jellyfish drifting in pitch-black deep ocean",
  "Brutalist concrete temple at golden hour, wrapped in morning fog",
  "Abstract liquid metal sculpture under dramatic studio lighting",
  "Neon samurai standing in a rainy cyberpunk Tokyo alleyway",
  "Steampunk mechanical owl perched on a brass clockwork telescope",
  "A cozy glass cabin glowing in a dense bioluminescent forest",
  "Ethereal underwater temple illuminated by a school of glowing fish",
];

type Tab = "all" | "public" | "private" | "liked";

export default function StudioPage() {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [likedImages, setLikedImages] = useState<GeneratedImage[]>([]);
  const [activeIdx, setActiveIdx] = useState<string | null>(null);
  const [remixOf, setRemixOf] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<{ src: string; prompt: string } | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const PER_PAGE = 20;
  const [isHeaderStuck, setIsHeaderStuck] = useState(false);
  const [imageRefs, setImageRefs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const newestRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [genMessageIdx, setGenMessageIdx] = useState(0);

  const GEN_MESSAGES = [
    "Thinking...",
    "Painting your vision...",
    "Adding details...",
    "Polishing pixels...",
    "Almost there...",
  ];

  // Rotate generation messages
  useEffect(() => {
    let interval: any;
    if (generating) {
      interval = setInterval(() => {
        setGenMessageIdx((prev) => (prev + 1) % GEN_MESSAGES.length);
      }, 4500);
    } else {
      setGenMessageIdx(0);
    }
    return () => clearInterval(interval);
  }, [generating]);

  // Auth gate
  useEffect(() => {
    if (!authLoading && !user) window.location.href = "/auth";
  }, [authLoading, user]);

  // Hydrate prompt from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("visgen:prompt");
    if (stored) {
      setPrompt(stored);
      sessionStorage.removeItem("visgen:prompt");
    }
    const remixSrc = sessionStorage.getItem("visgen:remix_of");
    if (remixSrc) {
      setRemixOf(remixSrc);
      sessionStorage.removeItem("visgen:remix_of");
    }
  }, []);

  const creationsHeaderRef = useRef<HTMLDivElement>(null);

  // Navbar replacement scroll logic
  useEffect(() => {
    const handleScroll = () => {
      if (!creationsHeaderRef.current) return;
      
      // Measure the actual position of the header
      // We check if it has reached its "sticky" position (top-5 = 20px)
      const rect = creationsHeaderRef.current.getBoundingClientRect();
      const stuck = rect.top <= 24; // Slight buffer for smooth transition
      
      setIsHeaderStuck(stuck);
      
      if (stuck) {
        document.body.classList.add("hide-navbar");
      } else {
        document.body.classList.remove("hide-navbar");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("hide-navbar");
    };
  }, []);

  // Load user's images
  useEffect(() => {
    if (!user) return;
    setLoadingImages(true);
    getUserImages()
      .then((data: any[]) => setImages([...data]))
      .finally(() => setLoadingImages(false));
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB)");
      return;
    }

    if (imageRefs.length >= 2) {
      toast.error("Maximum 2 reference images allowed");
      return;
    }

    setUploading(true);
    try {
      // Get secure signature from server
      const { signature, timestamp, apiKey, cloudName } = await getCloudinarySignature();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey!);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", "visgen-references");

      // Upload directly to Cloudinary from client (bypasses Vercel payload limits)
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload to Cloudinary failed");
      
      const result = await uploadRes.json();
      if (result.secure_url) {
        setImageRefs(prev => [...prev, result.secure_url]);
        toast.success("Image reference added!");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Image upload failed. Try a smaller file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const generatedImage = await generateImage(prompt, imageRefs.length > 0 ? imageRefs : undefined, isPublic);
      setImages((prev) => [generatedImage, ...prev]);
      refreshProfile();
      setPrompt("");
      setRemixOf(null);
      setImageRefs([]);
      toast.success(remixOf ? "Remix created" : "Image created");
      setTimeout(
        () => newestRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        80
      );
    } catch (err: any) {
      toast.error(err.message || "Something went wrong generating your image.");
    } finally {
      setGenerating(false);
    }
  };

  const togglePublicFn = async (img: GeneratedImage) => {
    const next = !img.isPublic;
    setImages((p) => p.map((i) => (i._id === img._id ? { ...i, isPublic: next } : i)));
    try {
      await toggleImagePublic(img._id, next);
      toast.success(next ? "Published to feed" : "Made private");
    } catch {
      toast.error("Could not update visibility");
      setImages((p) => p.map((i) => (i._id === img._id ? { ...i, isPublic: !next } : i)));
    }
  };

  const remove = async (img: GeneratedImage) => {
    setImages((p) => p.filter((i) => i._id !== img._id));
    try {
      await deleteImage(img._id);
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const remix = (img: GeneratedImage) => {
    setPrompt(img.prompt);
    setRemixOf(img._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const filtered = useMemo(() => {
    let list = images;
    if (tab === "public") list = images.filter((i) => i.isPublic);
    else if (tab === "private") list = images.filter((i) => !i.isPublic);
    else if (tab === "liked") list = images.filter((i) => i.likes?.includes((user as any)?.id));
    return list;
  }, [tab, images, user]);

  const paged = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  // Reset pagination on tab change
  useEffect(() => {
    setVisibleCount(PER_PAGE);
  }, [tab]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex justify-between items-center"><Skeleton className="h-10 w-32 rounded-full" /><div className="flex gap-4"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /></div></div>
          <div className="space-y-4 items-center flex flex-col"><Skeleton className="h-10 w-64" /><Skeleton className="h-4 w-48" /></div>
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><Skeleton className="aspect-square rounded-2xl" /><Skeleton className="aspect-square rounded-2xl" /><Skeleton className="aspect-square rounded-2xl" /><Skeleton className="aspect-square rounded-2xl" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative">
      <BackgroundCanvas />
      <Navbar />

      <main className="pt-24 sm:pt-28 pb-16">

        {/* Hero heading */}
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-center"
        >
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-display">
            What will you <span className="text-gradient">create</span> today?
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            Describe your vision in detail. <span className="hidden sm:inline">Press Generate to start.</span>
          </p>
        </motion.div>

        {/* Prompt composer */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group mt-5 sm:mt-6"
        >
          {/* Soft outer glow */}
          <div
            className="absolute -inset-[2px] rounded-3xl opacity-50 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--accent), var(--primary-glow))",
              filter: "blur(18px)",
            }}
          />
          <div className="relative rounded-3xl border border-border/60 bg-background/90 backdrop-blur-2xl overflow-hidden shadow-elegant">
            {/* Remix info */}
            <div className="px-4 pt-3 flex flex-wrap gap-2">
              {remixOf && (
                <div className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary-glow">
                  <Repeat2 className="h-3 w-3" /> Remixing source
                  <button onClick={() => setRemixOf(null)} className="hover:text-foreground"><Plus className="h-3 w-3 rotate-45" /></button>
                </div>
              )}
            </div>

            <div className="px-4 sm:px-5 pt-4 pb-3">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="A cyberpunk samurai under neon rain, cinematic 4k…"
                className="w-full bg-transparent outline-none text-base sm:text-lg placeholder:text-muted-foreground/40 resize-none leading-relaxed font-display"
              />
            </div>

            {/* Bottom action row */}
            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-t border-border/40">
              <div className="flex flex-wrap items-center gap-1.5 min-w-0 overflow-x-auto">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || generating || imageRefs.length >= 2}
                  >
                    {uploading ? <span className="text-[10px] animate-pulse">...</span> : <ImagePlus className="h-4 w-4" />}
                  </Button>

                {/* Reference Thumbnails */}
                {imageRefs.map((ref, idx) => (
                  <div key={idx} className="relative group/thumb h-14 w-14 rounded-xl overflow-hidden border border-border/60 shrink-0 bg-background/40">
                    <img src={ref} alt="" className="h-full w-full object-cover" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageRefs(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors z-20"
                    >
                      <XCircle className="h-4 w-4 text-rose-500 fill-rose-500/10" />
                    </button>
                    <div className="absolute inset-0 bg-black/10 group-hover/thumb:bg-transparent transition-all pointer-events-none" />
                  </div>
                ))}

                <button
                  onClick={() => setIsPublic((v) => !v)}
                  className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full border transition ${
                    isPublic
                      ? "bg-primary/15 border-primary/40 text-primary-glow"
                      : "bg-surface/40 border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {isPublic ? "Public" : "Private"}
                </button>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground px-1.5">
                  <Zap className="h-3 w-3" /> 1 credit
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] bg-accent/5 border border-accent/20 text-accent/80 px-2.5 py-1.5 rounded-full opacity-60">
                  <Play className="h-3 w-3" /> Video <span className="hidden lg:inline text-[8px] uppercase tracking-tighter opacity-70">Coming Soon</span>
                </span>
              </div>
              <Button
                variant="glow"
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="shrink-0 rounded-full px-4 sm:px-5"
                size="sm"
              >
                {generating ? (
                  <div className="flex items-center gap-2">
                    <BrandLogo size={14} className="animate-pulse" />
                    <span className="animate-pulse text-[11px] font-medium">Processing...</span>
                  </div>
                ) : (
                  <>
                    <span>Generate</span>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Suggestions — auto-scrolling marquee */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Wand2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              Inspiration
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
          </div>
          <div
            className="relative overflow-hidden flex w-full -mx-4 sm:-mx-6"
            style={{ maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)" }}
          >
            <div className="flex w-max animate-marquee gap-2 sm:gap-3 py-1 items-center pl-4 sm:pl-6">
              {[...SUGGESTIONS, ...SUGGESTIONS].map((s, i) => (
                <button
                  key={`${s}-${i}`}
                  onClick={() => setPrompt(s)}
                  className="shrink-0 inline-flex items-center text-xs px-3.5 py-2 rounded-full border border-border/50 bg-surface/30 backdrop-blur text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        </div>{/* end max-w-5xl prompt zone */}

        {/* === Your Creations - wider breakout section === */}
        <div className="mt-10 sm:mt-14" ref={newestRef} style={{ scrollMarginTop: "100px" }}>

          {/* Sticky header – replaces navbar when stuck */}
          <div 
            ref={creationsHeaderRef}
            className="sticky top-5 z-50 transition-all duration-300 ease-in-out"
          >
            <div className="relative mx-auto max-w-6xl px-4">
              <div className={`flex items-center justify-between gap-3 rounded-full border border-white/[0.1] bg-surface/50 backdrop-blur-2xl px-3 py-2 transition-shadow duration-300 ${
                isHeaderStuck 
                  ? "shadow-[0_20px_80px_-15px_oklch(0_0_0/0.9)] border-white/[0.15]" 
                  : "shadow-[0_8px_40px_-10px_oklch(0_0_0/0.8)]"
              }`}>

                {/* Left: sparkle icon + title + count */}
                <div className="flex items-center gap-2.5 pl-1">
                  <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Palette className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="leading-none">
                    <span className="text-sm font-bold tracking-tight text-gradient font-display">Your Creations</span>
                    <span className="hidden sm:inline text-[10px] font-semibold  text-muted-foreground ml-2">
                      ({filtered.length}) {filtered.length === 1 ? "image" : "images"}
                    </span>
                  </div>  
                </div>

                {/* Right: filter tabs pill-within-pill */}
                <div className="inline-flex items-center gap-0.5 p-1 rounded-full bg-surface/40 border border-border/40 overflow-x-auto no-scrollbar">
                  <TabBtn active={tab === "all"} onClick={() => setTab("all")}>All</TabBtn>
                  <TabBtn active={tab === "public"} onClick={() => setTab("public")}>
                    <Globe className="h-3 w-3 shrink-0" /><span className="hidden sm:inline">Public</span>
                  </TabBtn>
                  <TabBtn active={tab === "private"} onClick={() => setTab("private")}>
                    <Lock className="h-3 w-3 shrink-0" /><span className="hidden sm:inline">Private</span>
                  </TabBtn>
                  <TabBtn active={tab === "liked"} onClick={() => setTab("liked")}>
                    <Heart className="h-3 w-3 shrink-0" /><span className="hidden sm:inline">Liked</span>
                  </TabBtn>
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-5">
            {tab === "liked" ? (
              <LikedGrid
                loading={false}
                images={filtered}
                userId={(user as any)?.id || ""}
                onRemix={(pr, id) => {
                  setPrompt(pr);
                  setRemixOf(id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ) : loadingImages ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-2xl" />
                ))}
              </div>
            ) : filtered.length === 0 && !generating ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                <AnimatePresence initial={false}>
                  {generating && (
                    <motion.div
                      layout
                      key="generating-placeholder"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="aspect-square rounded-2xl glass-strong border border-primary/30 relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 shadow-glow-soft"
                    >
                      {/* Scanning Line Animation */}
                      <div className="absolute inset-x-0 h-[2px] bg-primary/40 shadow-[0_0_15px_var(--primary)] z-20 animate-scan pointer-events-none" />
                      
                      <div className="absolute inset-0 z-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-50" />
                      
                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse-soft" />
                          <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-surface/40 border border-primary/30 flex items-center justify-center shadow-inner backdrop-blur-xl">
                            <BrandLogo size={24} className="animate-pulse" />
                          </div>
                        </div>
                        
                        <div className="text-center space-y-2">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-primary-glow animate-pulse">
                              {GEN_MESSAGES[genMessageIdx]}
                            </span>
                          </div>
                          <p className="hidden sm:block text-[9px] text-muted-foreground/60 max-w-[120px] leading-relaxed mx-auto">
                            Fine-tuning every pixel for your masterpiece
                          </p>
                        </div>
                      </div>

                      {/* Corner accents */}
                      <div className="absolute top-3 left-3 h-2 w-2 border-t border-l border-primary/40 rounded-tl-sm" />
                      <div className="absolute top-3 right-3 h-2 w-2 border-t border-r border-primary/40 rounded-tr-sm" />
                      <div className="absolute bottom-3 left-3 h-2 w-2 border-b border-l border-primary/40 rounded-bl-sm" />
                      <div className="absolute bottom-3 right-3 h-2 w-2 border-b border-r border-primary/40 rounded-br-sm" />
                    </motion.div>
                  )}
                  {paged.map((img) => (
                    <ImageCard
                      key={img._id}
                      img={img}
                      active={activeIdx === img._id}
                      userId={(user as any)?.id || ""}
                      onTap={() => setPreviewItem({ src: img.imageUrl, prompt: img.prompt })}
                      onTogglePublic={() => togglePublicFn(img)}
                      onRemove={() => remove(img)}
                      onRemix={() => remix(img)}
                      onLike={async () => {
                        const userId = (user as any)?.id || "";
                        const alreadyLiked = img.likes?.includes(userId);
                        setImages((prev) =>
                          prev.map((x) =>
                            x._id === img._id
                              ? {
                                  ...x,
                                  likes: alreadyLiked
                                    ? x.likes.filter((l) => l !== userId)
                                    : [...(x.likes || []), userId],
                                }
                              : x
                          )
                        );
                        try {
                          await toggleLikeImage(img._id);
                        } catch {
                          toast.error("Could not update likes");
                        }
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination / Load More */}
            {filtered.length > visibleCount && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="glass"
                  onClick={() => setVisibleCount((prev) => prev + PER_PAGE)}
                  className="rounded-full px-6 gap-2"
                >
                  Load More <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Footer />
      </div>

      <ImagePreviewModal 
        isOpen={!!previewItem} 
        onClose={() => setPreviewItem(null)} 
        imageUrl={previewItem?.src || ""} 
        prompt={previewItem?.prompt || ""} 
        onRemix={(pr) => { setPrompt(pr); setPreviewItem(null); }}
      />
    </div>
  );
}

/* === Sub-components =========================================== */

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors z-10 ${
        active ? "text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {active && (
        <motion.div
          layoutId="studio-tabs"
          className="absolute inset-0 bg-primary rounded-full -z-10 shadow-glow"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {children}
    </button>
  );
}

const PLAN_CAPS: Record<string, number> = {
  free: 15,
  pro: 100,
  premium: 250,
};

function CreditDashboard({
  name,
  plan,
  avatarUrl,
  initial,
  credits,
}: {
  name: string;
  plan: string;
  avatarUrl: string | null;
  initial: string;
  credits: number;
}) {
  const cap = PLAN_CAPS[plan] ?? 10;
  const pct = Math.min(100, Math.max(0, (credits / cap) * 100));
  const low = credits <= Math.max(2, Math.floor(cap * 0.15));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface/40 backdrop-blur-xl px-3 py-2.5 sm:px-4 sm:py-3 mb-5"
    >
      <div className="absolute -top-16 -right-10 h-32 w-32 bg-primary/15 blur-[70px] rounded-full pointer-events-none" />

      <div className="relative flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-8 w-8 rounded-xl object-cover border border-primary/40"
            />
          ) : (
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
              {initial}
            </div>
          )}
        </div>

        {/* Name + plan */}
        <div className="hidden sm:flex flex-col min-w-0 mr-1">
          <span className="text-xs font-semibold truncate leading-tight">{name}</span>
          <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider text-muted-foreground capitalize">
            <Crown className="h-2 w-2 text-primary/70" /> {plan}
          </span>
        </div>

        {/* Inline credit meter */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-baseline gap-1">
              <Zap className={`h-3 w-3 ${low ? "text-destructive" : "text-primary"}`} />
              <span
                className={`text-sm font-bold tabular-nums ${
                  low ? "text-destructive" : "text-foreground"
                }`}
              >
                {credits}
              </span>
              <span className="text-[10px] text-muted-foreground">/ {cap}</span>
            </div>
            {low && (
              <span className="text-[9px] uppercase tracking-wider font-semibold text-destructive">
                Low
              </span>
            )}
          </div>
          <div className="relative h-1.5 rounded-full bg-surface/70 border border-border/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`absolute inset-y-0 left-0 rounded-full ${
                low
                  ? "bg-gradient-to-r from-destructive/80 to-destructive"
                  : "bg-gradient-to-r from-primary via-primary-glow to-accent"
              }`}
              style={{
                boxShadow: low ? undefined : "0 0 12px -2px var(--primary)",
              }}
            />
          </div>
        </div>

        {plan !== "studio" && (
          <a
            href="/#pricing"
            className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary-glow hover:bg-primary/20 transition shrink-0"
          >
            <Crown className="h-3 w-3" /> Upgrade
          </a>
        )}
      </div>
    </motion.div>
  );
}

function ImageCard({
  img,
  active,
  userId,
  onTap,
  onTogglePublic,
  onRemove,
  onRemix,
  onLike,
}: {
  img: GeneratedImage;
  active: boolean;
  userId: string;
  onTap: () => void;
  onTogglePublic: () => void;
  onRemove: () => void;
  onRemix: () => void;
  onLike: () => void;
}) {
  const liked = img.likes?.includes(userId);
  const likeCount = img.likes?.length ?? 0;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(img.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VISGEN-${img._id}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download image");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onTap}
      className="group relative aspect-square rounded-2xl overflow-hidden glass cursor-pointer"
    >
      <img
        src={img.imageUrl}
        alt={img.prompt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Visibility badge - top left */}
      <div className="absolute top-2 left-2 z-10">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/70 backdrop-blur-md border border-border/60 text-[10px]">
          {img.isPublic ? (
            <>
              <Globe className="h-2.5 w-2.5 text-primary" /> Public
            </>
          ) : (
            <>
              <Lock className="h-2.5 w-2.5" /> Private
            </>
          )}
        </span>
      </div>

      {/* Like badge top right - interactive, only for public images */}
      {img.isPublic && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-md border border-border/60 hover:bg-background/90 hover:scale-105 active:scale-95 transition text-[10px]"
          >
            <Heart
              className={`h-3 w-3 transition-colors ${liked ? "fill-rose-400 text-rose-400" : "text-foreground"}`}
            />
            <span className="font-medium text-foreground">{likeCount}</span>
          </button>
        </div>
      )}

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent transition-opacity ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      {/* Action bar */}
      <div
        className={`absolute inset-x-0 bottom-0 p-2.5 transition ${
          active
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
        }`}
      >
        <p className="text-[10px] sm:text-[11px] text-foreground/90 line-clamp-2 mb-2">
          {img.prompt}
        </p>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="glass"
            className="text-[10px] h-7 px-2 flex-1"
            onClick={handleDownload}
            aria-label="Download"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="glass"
            className="text-[10px] h-7 px-2 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onRemix();
            }}
            aria-label="Remix"
          >
            <Repeat2 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="glass"
            className="text-[10px] h-7 px-2"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePublic();
            }}
            aria-label={img.isPublic ? "Make private" : "Publish"}
          >
            {img.isPublic ? (
              <Globe className="h-3 w-3 text-primary" />
            ) : (
              <Lock className="h-3 w-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="glass"
            className="text-[10px] h-7 px-2"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Delete"
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function LikedGrid({
  loading,
  images,
  onRemix,
  userId,
}: {
  loading: boolean;
  images: GeneratedImage[];
  onRemix: (prompt: string, sourceId: string) => void;
  userId: string;
}) {
  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }
  if (images.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <div className="h-12 w-12 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
          <Heart className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-medium mb-1">No favorites yet</p>
        <p className="text-xs text-muted-foreground mb-5">
          Tap the heart on any image in the community feed.
        </p>
        <Button asChild variant="glow" size="sm" className="rounded-full">
          <Link href="/feed">Browse Community</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {images.map((img) => (
        <motion.div
          key={img._id}
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group relative aspect-square rounded-2xl overflow-hidden glass"
        >
          <img
            src={img.imageUrl}
            alt={img.prompt}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition" />
          <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5">
            <p className="text-[10px] text-foreground/90 line-clamp-1 mb-1.5">{img.prompt}</p>
            <Button
              size="sm"
              variant="glass"
              className="text-[10px] h-7 w-full"
              onClick={() => onRemix(img.prompt, img._id)}
            >
              <Repeat2 className="h-3 w-3" /> Remix
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-2xl p-10 text-center">
      <div className="h-12 w-12 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
        <ImageIcon className="h-5 w-5 text-primary" />
      </div>
      <p className="text-sm font-medium mb-1">No images yet</p>
      <p className="text-xs text-muted-foreground">
        Type a prompt above to create your first masterpiece.
      </p>
    </div>
  );
}
