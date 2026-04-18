import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Repeat2, Loader2, Sparkles, User, Globe, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Community Feed — VisGen" },
      { name: "description", content: "Browse public AI images from the VisGen community. Remix any prompt." },
      { property: "og:title", content: "Community Feed — VisGen" },
      { property: "og:description", content: "Browse public AI images from the VisGen community. Remix any prompt." },
    ],
  }),
  component: FeedPage,
  errorComponent: ({ error }) => {
    const router = useRouter();
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-sm text-muted-foreground mb-4">Could not load feed: {error.message}</p>
        <Button variant="glow" size="sm" onClick={() => router.invalidate()}>Retry</Button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <Link to="/" className="text-sm text-primary hover:underline">Go home</Link>
    </div>
  ),
});

const PAGE_SIZE = 18;

interface FeedItem {
  id: string;
  prompt: string;
  image_url: string;
  created_at: string;
  user_id: string;
  creator_name: string | null;
  creator_avatar: string | null;
}

function FeedPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(
    async (pageIdx: number) => {
      if (loading || done) return;
      setLoading(true);
      setError(null);

      const from = pageIdx * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // 1. Fetch public images (RLS already permits this)
      const { data: imgs, error: imgErr } = await supabase
        .from("images")
        .select("id, prompt, image_url, created_at, user_id")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (imgErr) {
        setError(imgErr.message);
        setLoading(false);
        return;
      }
      if (!imgs || imgs.length === 0) {
        setDone(true);
        setLoading(false);
        return;
      }

      // 2. Fetch creator profiles
      const userIds = Array.from(new Set(imgs.map((i) => i.user_id)));
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      const profMap = new Map(
        (profs ?? []).map((p) => [p.id, { name: p.display_name, avatar: p.avatar_url }]),
      );

      const merged: FeedItem[] = imgs.map((i) => ({
        id: i.id,
        prompt: i.prompt,
        image_url: i.image_url,
        created_at: i.created_at,
        user_id: i.user_id,
        creator_name: profMap.get(i.user_id)?.name ?? null,
        creator_avatar: profMap.get(i.user_id)?.avatar ?? null,
      }));

      setItems((prev) => {
        // Dedupe by id in case of overlap
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...merged.filter((m) => !seen.has(m.id))];
      });
      if (imgs.length < PAGE_SIZE) setDone(true);
      setLoading(false);
    },
    [loading, done],
  );

  // First load
  useEffect(() => {
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (done) return;
    const node = sentinelRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          const next = page + 1;
          setPage(next);
          loadPage(next);
        }
      },
      { rootMargin: "400px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [page, loading, done, loadPage]);

  const remix = (prompt: string) => {
    sessionStorage.setItem("visgen:prompt", prompt);
    window.location.href = user ? "/studio" : "/auth";
  };

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Navbar />
      <main className="pt-28 sm:pt-32 pb-16 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[10px] sm:text-xs text-primary-glow mb-4">
            <Globe className="h-3 w-3" />
            Community Feed
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            What the world is <span className="text-gradient">painting</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground px-2">
            Public creations from every VisGen user. Tap Remix to build on any prompt.
          </p>
        </div>

        {/* Grid */}
        {error ? (
          <div className="py-20 text-center">
            <p className="text-sm text-destructive mb-3">{error}</p>
            <Button size="sm" variant="glow" onClick={() => loadPage(0)}>Try again</Button>
          </div>
        ) : items.length === 0 && !loading ? (
          <div className="py-20 text-center">
            <div className="h-12 w-12 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium mb-1">Nothing here yet</p>
            <p className="text-xs text-muted-foreground mb-5">Be the first to publish to the community.</p>
            <Button asChild variant="glow" size="sm" className="rounded-full">
              <Link to={user ? "/studio" : "/auth"}>Open Studio</Link>
            </Button>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 [column-fill:_balance]">
            {items.map((it, i) => (
              <FeedCard key={it.id} item={it} index={i} onRemix={remix} />
            ))}
          </div>
        )}

        {/* Sentinel + loader */}
        <div ref={sentinelRef} className="h-12 mt-8 flex items-center justify-center">
          {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {done && items.length > 0 && (
            <p className="text-xs text-muted-foreground">You've reached the end ✨</p>
          )}
        </div>
      </main>
    </div>
  );
}

function FeedCard({
  item,
  index,
  onRemix,
}: {
  item: FeedItem;
  index: number;
  onRemix: (prompt: string) => void;
}) {
  const [active, setActive] = useState(false);
  const initial = (item.creator_name || "U").charAt(0).toUpperCase();

  return (
    <motion.figure
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.4) }}
      onClick={() => setActive((a) => !a)}
      onMouseLeave={() => setActive(false)}
      className="relative mb-3 sm:mb-4 break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer glass"
    >
      <img
        src={item.image_url}
        alt={item.prompt}
        loading="lazy"
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      <figcaption
        className={`absolute inset-x-0 bottom-0 p-2.5 sm:p-3 transition-all duration-300 ${
          active
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
        }`}
      >
        {/* Creator */}
        <div className="flex items-center gap-1.5 mb-2">
          {item.creator_avatar ? (
            <img src={item.creator_avatar} alt="" className="h-5 w-5 rounded-full object-cover border border-border" />
          ) : (
            <div className="h-5 w-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[9px] font-bold text-primary">
              {initial}
            </div>
          )}
          <span className="text-[10px] text-foreground/80 truncate">
            {item.creator_name || "Anonymous"}
          </span>
        </div>

        <p className="text-[10px] sm:text-[11px] text-foreground/90 line-clamp-2 mb-2">{item.prompt}</p>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="glow"
            className="text-[10px] h-7 px-2.5 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onRemix(item.prompt);
            }}
          >
            <Repeat2 className="h-3 w-3" /> Remix
          </Button>
          <Button asChild size="sm" variant="glass" className="text-[10px] h-7 px-2">
            <a
              href={item.image_url}
              download
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </figcaption>
    </motion.figure>
  );
}

// Avoid unused imports lint
void User;
