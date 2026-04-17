import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Download, Globe, Lock, Loader2, Repeat2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { generateImage } from "@/server/generate.functions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio — VisGen" },
      { name: "description", content: "Generate AI images from prompts in the VisGen Studio." },
    ],
  }),
  component: StudioPage,
});

interface ImageRow {
  id: string;
  prompt: string;
  image_url: string;
  is_public: boolean;
  created_at: string;
}

const TEMPLATES = [
  "Cyberpunk samurai under neon rain, cinematic 4k",
  "Surreal floating island with bioluminescent forest",
  "Minimal product shot of a chrome bottle on pastel gradient",
  "Portrait of an astronaut, magenta nebula, editorial lighting",
];

function StudioPage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<ImageRow[]>([]);

  // Redirect to /auth if not signed in (client-side, fast UX)
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/auth";
    }
  }, [authLoading, user]);

  // Hydrate prompt from landing CTA
  useEffect(() => {
    const stored = sessionStorage.getItem("visgen:prompt");
    if (stored) {
      setPrompt(stored);
      sessionStorage.removeItem("visgen:prompt");
    }
  }, []);

  // Load history
  useEffect(() => {
    if (!user) return;
    supabase
      .from("images")
      .select("id, prompt, image_url, is_public, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(24)
      .then(({ data }) => {
        if (data) setImages(data as ImageRow[]);
      });
  }, [user]);

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    if ((profile?.credits ?? 0) <= 0) {
      toast.error("You're out of credits. Upgrade to keep generating.");
      return;
    }
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in again");
        return;
      }
      const res = await generateImage({
        data: { prompt: prompt.trim(), width: 1024, height: 1024, isPublic },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setImages((prev) => [res.image as ImageRow, ...prev]);
      setPrompt("");
      await refreshProfile();
      toast.success("Image generated!");
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const togglePublic = async (img: ImageRow) => {
    const next = !img.is_public;
    setImages((p) => p.map((i) => (i.id === img.id ? { ...i, is_public: next } : i)));
    const { error } = await supabase.from("images").update({ is_public: next }).eq("id", img.id);
    if (error) {
      toast.error("Could not update visibility");
      setImages((p) => p.map((i) => (i.id === img.id ? { ...i, is_public: !next } : i)));
    } else {
      toast.success(next ? "Published to feed" : "Made private");
    }
  };

  const remix = (img: ImageRow) => {
    setPrompt(img.prompt);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Navbar />
      <main className="pt-32 pb-24 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-gradient">Studio</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Describe what you want to see. Be specific for best results.
          </p>
        </div>

        {/* Prompt input */}
        <div className="glass-strong rounded-2xl p-3 sm:p-4 shadow-elegant">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary ml-1.5 shrink-0" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              rows={2}
              placeholder="A cinematic portrait of..."
              className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground/60 resize-none py-2"
            />
            <Button
              variant="glow"
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="shrink-0"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {generating ? "Generating" : "Generate"}
            </Button>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3 mt-3 px-1">
            <button
              onClick={() => setIsPublic((v) => !v)}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition"
            >
              {isPublic ? <Globe className="h-3.5 w-3.5 text-primary" /> : <Lock className="h-3.5 w-3.5" />}
              {isPublic ? "Public to community" : "Private"}
            </button>
            <span className="text-xs text-muted-foreground">
              <span className="text-primary font-medium">{profile?.credits ?? 0}</span> credits remaining
            </span>
          </div>
        </div>

        {/* Templates */}
        <div className="mt-5 flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t}
              onClick={() => setPrompt(t)}
              className="text-xs px-3 py-1.5 rounded-full glass hover:border-primary/40 transition text-muted-foreground hover:text-foreground"
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-12">
          {images.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              Your generations will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="group relative aspect-square rounded-2xl overflow-hidden glass"
                  >
                    <img
                      src={img.image_url}
                      alt={img.prompt}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition" />
                    <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
                      <p className="text-[11px] text-foreground/90 line-clamp-2 mb-2">{img.prompt}</p>
                      <div className="flex items-center gap-1.5">
                        <Button
                          asChild
                          size="sm"
                          variant="glass"
                          className="text-[10px] h-7 px-2"
                        >
                          <a href={img.image_url} download target="_blank" rel="noreferrer">
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="glass"
                          className="text-[10px] h-7 px-2"
                          onClick={() => remix(img)}
                        >
                          <Repeat2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="glass"
                          className="text-[10px] h-7 px-2"
                          onClick={() => togglePublic(img)}
                        >
                          {img.is_public ? <Globe className="h-3 w-3 text-primary" /> : <Lock className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
