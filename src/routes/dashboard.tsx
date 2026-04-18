import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Image as ImageIcon, Globe, Lock, Loader2, Plus, Crown, Trash2, Repeat2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — VisGen" },
      { name: "description", content: "Manage your VisGen profile, credits, and creations." },
    ],
  }),
  component: DashboardPage,
});

interface ImageRow {
  id: string;
  prompt: string;
  image_url: string;
  is_public: boolean;
  created_at: string;
}

function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [images, setImages] = useState<ImageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) window.location.href = "/auth";
  }, [authLoading, user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("images")
      .select("id, prompt, image_url, is_public, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setImages(data as ImageRow[]);
        setLoading(false);
      });
  }, [user]);

  const togglePublic = async (img: ImageRow) => {
    const next = !img.is_public;
    setImages((p) => p.map((i) => (i.id === img.id ? { ...i, is_public: next } : i)));
    const { error } = await supabase.from("images").update({ is_public: next }).eq("id", img.id);
    if (error) {
      toast.error("Could not update visibility");
      setImages((p) => p.map((i) => (i.id === img.id ? { ...i, is_public: !next } : i)));
    } else {
      toast.success(next ? "Published" : "Made private");
    }
  };

  const remove = async (img: ImageRow) => {
    setImages((p) => p.filter((i) => i.id !== img.id));
    const { error } = await supabase.from("images").delete().eq("id", img.id);
    if (error) {
      toast.error("Delete failed");
    } else {
      toast.success("Deleted");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const publicCount = images.filter((i) => i.is_public).length;
  const initial = (profile?.display_name || profile?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Navbar />
      <main className="pt-28 sm:pt-32 pb-16 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-5 sm:p-7"
        >
          <div className="flex items-start gap-4 sm:gap-5 flex-wrap">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full" />
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-primary/40"
                />
              ) : (
                <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center text-xl sm:text-2xl font-bold text-primary">
                  {initial}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                {profile?.display_name || "Welcome back"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{profile?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary-glow capitalize">
                <Crown className="h-3 w-3" />
                {profile?.plan ?? "free"} plan
              </div>
            </div>

            <Button asChild variant="glow" size="sm" className="rounded-full shrink-0">
              <Link to="/studio">
                <Plus className="h-4 w-4" /> New
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-5 sm:mt-6">
            <Stat icon={<Sparkles className="h-4 w-4 text-primary" />} label="Credits" value={profile?.credits ?? 0} />
            <Stat icon={<ImageIcon className="h-4 w-4 text-primary" />} label="Images" value={images.length} />
            <Stat icon={<Globe className="h-4 w-4 text-primary" />} label="Public" value={publicCount} />
          </div>
        </motion.div>

        {/* Gallery */}
        <div className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Your creations</h2>
            <span className="text-xs text-muted-foreground">{images.length} total</span>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : images.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <div className="h-12 w-12 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">No images yet</p>
              <p className="text-xs text-muted-foreground mb-5">Generate your first masterpiece in the Studio.</p>
              <Button asChild variant="glow" size="sm" className="rounded-full">
                <Link to="/studio">Open Studio</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden glass"
                >
                  <img
                    src={img.image_url}
                    alt={img.prompt}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition" />
                  <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5">
                    <p className="text-[10px] text-foreground/90 line-clamp-1 mb-1.5">{img.prompt}</p>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="glass"
                        className="text-[10px] h-7 px-2 flex-1"
                        onClick={() => togglePublic(img)}
                      >
                        {img.is_public ? <Globe className="h-3 w-3 text-primary" /> : <Lock className="h-3 w-3" />}
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="glass"
                        className="text-[10px] h-7 px-2 flex-1"
                      >
                        <Link
                          to="/studio"
                          onClick={() => sessionStorage.setItem("visgen:prompt", img.prompt)}
                        >
                          <Repeat2 className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="glass"
                        className="text-[10px] h-7 px-2"
                        onClick={() => remove(img)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-foreground/5 border border-border px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className="text-lg sm:text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
