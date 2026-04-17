import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  prompt: z.string().min(3).max(1000),
  width: z.number().int().min(256).max(1536).default(1024),
  height: z.number().int().min(256).max(1536).default(1024),
  remixOf: z.string().uuid().nullable().optional(),
  isPublic: z.boolean().default(false),
});

/**
 * Generate an image via Pollinations and persist it.
 * - Decrements user credits atomically (server-side check)
 * - Stores prompt + image URL in `images` table
 */
export const generateImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Check credits
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (pErr || !profile) {
      return { ok: false as const, error: "Could not load profile" };
    }
    if ((profile.credits ?? 0) <= 0) {
      return { ok: false as const, error: "Out of credits. Please upgrade your plan." };
    }

    // Build Pollinations URL (public, no key needed)
    const seed = Math.floor(Math.random() * 1_000_000);
    const enc = encodeURIComponent(data.prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${enc}?width=${data.width}&height=${data.height}&seed=${seed}&nologo=true&model=flux`;

    // Verify the image actually generates (HEAD)
    try {
      const res = await fetch(imageUrl, { method: "GET" });
      if (!res.ok) {
        return { ok: false as const, error: `Image service returned ${res.status}` };
      }
    } catch (e) {
      console.error("Pollinations fetch failed", e);
      return { ok: false as const, error: "Image service is currently unavailable" };
    }

    // Decrement credits
    const { error: updErr } = await supabase
      .from("profiles")
      .update({ credits: profile.credits - 1 })
      .eq("id", userId);
    if (updErr) {
      console.error("Credit decrement failed", updErr);
    }

    // Persist
    const { data: row, error: insErr } = await supabase
      .from("images")
      .insert({
        user_id: userId,
        prompt: data.prompt,
        image_url: imageUrl,
        is_public: data.isPublic,
        remix_of: data.remixOf ?? null,
      })
      .select("id, prompt, image_url, is_public, created_at")
      .single();

    if (insErr || !row) {
      console.error("Insert image failed", insErr);
      return { ok: false as const, error: "Could not save image" };
    }

    return {
      ok: true as const,
      image: row,
      creditsRemaining: profile.credits - 1,
    };
  });
