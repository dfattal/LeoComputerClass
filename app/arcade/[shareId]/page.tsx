import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { loadLessonContent } from "@/lib/lessons/loadLesson";
import { getClassBySlug } from "@/content/classes";
import { getAccent } from "@/lib/accents";
import ArcadePlayer from "@/components/ArcadePlayer";

interface SharedGame {
  id: string;
  class_slug: string;
  lesson_slug: string;
  title: string | null;
  code: string;
}

// Public route — no auth (allowlisted in lib/supabase/middleware.ts). Always
// server-rendered on demand (a fresh share must be viewable immediately).
export const dynamic = "force-dynamic";

async function loadShare(shareId: string): Promise<SharedGame | null> {
  try {
    const service = await createServiceClient();
    const { data } = await service
      .from("shared_games")
      .select("id, class_slug, lesson_slug, title, code")
      .eq("id", shareId)
      .single();
    return (data as SharedGame) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>;
}): Promise<Metadata> {
  const { shareId } = await params;
  const share = await loadShare(shareId);
  if (!share) return { title: "Game not found" };
  const cls = getClassBySlug(share.class_slug);
  const title = `${share.title ?? "An Arcade Game"} 🎮`;
  const description = `Play this game, made with ${cls?.name ?? "Game Studio"}.`;
  const ogImage = `/og-${share.class_slug}.jpg`;
  return {
    title,
    description,
    openGraph: { title, description, images: [ogImage], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function ArcadePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const share = await loadShare(shareId);
  if (!share) notFound();

  // The js.json preview config lives in the repo with the lesson — load it so we
  // run the saved code exactly like the lesson's live panel did.
  let preview;
  try {
    preview = loadLessonContent(share.class_slug, share.lesson_slug).jsConfig?.preview;
  } catch {
    preview = undefined;
  }
  if (!preview) notFound();

  const cls = getClassBySlug(share.class_slug);
  const accent = getAccent(cls?.accentColor ?? "orange");

  return (
    <ArcadePlayer
      title={share.title ?? "An Arcade Game"}
      code={share.code}
      preview={preview}
      classSlug={share.class_slug}
      className={accent.text}
    />
  );
}
