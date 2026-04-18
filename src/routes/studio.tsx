import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Download, Globe, Lock, Loader2, Repeat2, User } from "lucide-react";
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

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; pending?: boolean; image?: ImageRow; error?: string };

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Redirect to /auth if not signed in
  useEffect(() => {
    if (!authLoading && !user) window.location.href = "/auth";
  }, [authLoading, user]);

  // Hydrate prompt from landing CTA / gallery remix
  useEffect(() => {
    const stored = sessionStorage.getItem("visgen:prompt");
    if (stored) {
      setPrompt(stored);
      sessionStorage.removeItem("visgen:prompt");
    }
  }, []);

  // Load history -> seed conversation
  useEffect(() => {
    if (!user) return;
    supabase
      .from("images")
      .select("id, prompt, image_url, is_public, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(20)
      .then(({ data }) => {
        if (!data) return;
        const seeded: ChatMessage[] = [];
        (data as ImageRow[]).forEach((img) => {
          seeded.push({ id: `u-${img.id}`, role: "user", text: img.prompt });
          seeded.push({ id: `a-${img.id}`, role: "assistant", image: img });
        });
        setMessages(seeded);
      });
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleGenerate = async () => {
    const text = prompt.trim();
    if (!text || generating) return;
    if ((profile?.credits ?? 0) <= 0) {
      toast.error("You're out of credits. Upgrade to keep generating.");
      return;
    }

    const uid = crypto.randomUUID();
    const aid = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      { id: uid, role: "user", text },
      { id: aid, role: "assistant", pending: true },
    ]);
    setPrompt("");
    setGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in again");
        return;
      }
      const res = await generateImage({
        data: { prompt: text, width: 1024, height: 1024, isPublic },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        setMessages((m) => m.map((x) => (x.id === aid ? { ...x, pending: false, error: res.error } : x)));
        toast.error(res.error);
        return;
      }
      setMessages((m) =>
        m.map((x) => (x.id === aid ? { id: aid, role: "assistant", image: res.image as ImageRow } : x)),
      );
      await refreshProfile();
    } catch (e) {
      console.error(e);
      setMessages((m) => m.map((x) => (x.id === aid ? { ...x, pending: false, error: "Something went wrong" } : x)));
      toast.error("Something went wrong. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const togglePublic = async (img: ImageRow) => {
    const next = !img.is_public;
    setMessages((m) =>
      m.map((x) => (x.role === "assistant" && x.image?.id === img.id ? { ...x, image: { ...img, is_public: next } } : x)),
    );
    const { error } = await supabase.from("images").update({ is_public: next }).eq("id", img.id);
    if (error) {
      toast.error("Could not update visibility");
    } else {
      toast.success(next ? "Published to feed" : "Made private");
    }
  };

  const remix = (text: string) => {
    setPrompt(text);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-mesh flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col pt-24 pb-4 mx-auto w-full max-w-4xl px-3 sm:px-6">
        {/* Header */}
        <div className="mb-3 sm:mb-4 px-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            <span className="text-gradient">Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Chat with the model. Each prompt costs 1 credit.
          </p>
        </div>

        {/* Chat scroll area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto rounded-2xl glass-strong p-3 sm:p-5 min-h-[50vh]"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">Start a conversation</p>
              <p className="text-xs text-muted-foreground mb-5 max-w-xs">
                Describe what you want to see. Try one of these:
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {TEMPLATES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPrompt(t)}
                    className="text-[10px] sm:text-xs px-2.5 py-1.5 rounded-full glass hover:border-primary/40 transition text-muted-foreground hover:text-foreground"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === "user" ? "order-1" : ""}`}>
                      {msg.role === "user" ? (
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm shadow-glow">
                          {msg.text}
                        </div>
                      ) : msg.pending ? (
                        <div className="rounded-2xl rounded-tl-sm bg-foreground/5 border border-border px-4 py-3 text-xs text-muted-foreground inline-flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          Painting your vision…
                        </div>
                      ) : msg.error ? (
                        <div className="rounded-2xl rounded-tl-sm bg-destructive/10 border border-destructive/30 px-4 py-3 text-xs text-destructive">
                          {msg.error}
                        </div>
                      ) : msg.image ? (
                        <div className="rounded-2xl rounded-tl-sm overflow-hidden border border-border bg-foreground/5 group">
                          <div className="relative aspect-square">
                            <img
                              src={msg.image.image_url}
                              alt={msg.image.prompt}
                              loading="lazy"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 p-2">
                            <Button asChild size="sm" variant="glass" className="text-[10px] h-7 px-2 flex-1">
                              <a href={msg.image.image_url} download target="_blank" rel="noreferrer">
                                <Download className="h-3 w-3" /> Save
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="glass"
                              className="text-[10px] h-7 px-2 flex-1"
                              onClick={() => msg.image && remix(msg.image.prompt)}
                            >
                              <Repeat2 className="h-3 w-3" /> Remix
                            </Button>
                            <Button
                              size="sm"
                              variant="glass"
                              className="text-[10px] h-7 px-2"
                              onClick={() => msg.image && togglePublic(msg.image)}
                              aria-label={msg.image.is_public ? "Make private" : "Publish"}
                            >
                              {msg.image.is_public ? (
                                <Globe className="h-3 w-3 text-primary" />
                              ) : (
                                <Lock className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {msg.role === "user" && (
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-foreground/10 border border-border flex items-center justify-center shrink-0 order-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="mt-3 sm:mt-4 glass-strong rounded-2xl p-2 sm:p-2.5 shadow-elegant">
          <div className="flex items-end gap-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary ml-1.5 mb-2.5 shrink-0" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              rows={1}
              placeholder="Describe an image…"
              className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60 resize-none py-2 max-h-32"
            />
            <Button
              variant="glow"
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="shrink-0 rounded-xl"
              size="sm"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2 mt-2 px-1">
            <button
              onClick={() => setIsPublic((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition"
            >
              {isPublic ? <Globe className="h-3 w-3 text-primary" /> : <Lock className="h-3 w-3" />}
              {isPublic ? "Public" : "Private"}
            </button>
            <span className="text-[11px] text-muted-foreground">
              <span className="text-primary font-medium">{profile?.credits ?? 0}</span> credits
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
