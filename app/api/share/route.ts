import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStudentName } from "@/lib/lessons/personalize";

// A short, URL-safe, unguessable share id.
function makeShareId() {
  return globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

// GET /api/share?classSlug=...&lessonSlug=... — return THIS student's existing
// share for a lesson (so the UI can show "already published" + the link), or null.
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classSlug = searchParams.get("classSlug");
    const lessonSlug = searchParams.get("lessonSlug");
    if (!classSlug || !lessonSlug) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const service = await createServiceClient();
    const { data } = await service
      .from("shared_games")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .eq("class_slug", classSlug)
      .eq("lesson_slug", lessonSlug)
      .single();

    return NextResponse.json({ share: data || null });
  } catch {
    return NextResponse.json({ share: null });
  }
}

// POST /api/share — publish (or re-publish) the student's game to a stable public
// URL. One share per (user, class, lesson): re-publishing updates the code in
// place and keeps the SAME link, so a URL already sent to friends never breaks.
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const classSlug: string = body.classSlug;
    const lessonSlug: string = body.lessonSlug;
    const code: string = body.code ?? "";
    if (!classSlug || !lessonSlug) {
      return NextResponse.json({ error: "Missing classSlug/lessonSlug" }, { status: 400 });
    }
    if (!code.trim()) {
      return NextResponse.json({ error: "Nothing to publish yet — write some code first." }, { status: 400 });
    }

    const title: string =
      (typeof body.title === "string" && body.title.trim()) ||
      `${getStudentName(user).firstName}'s Game`;

    const service = await createServiceClient();

    // Keep the link stable: reuse the existing row's id if this student already
    // published this lesson, otherwise mint a new id.
    const { data: existing } = await service
      .from("shared_games")
      .select("id")
      .eq("user_id", user.id)
      .eq("class_slug", classSlug)
      .eq("lesson_slug", lessonSlug)
      .single();

    const id = existing?.id ?? makeShareId();
    const now = new Date().toISOString();

    const { error } = await service.from("shared_games").upsert(
      {
        id,
        user_id: user.id,
        class_slug: classSlug,
        lesson_slug: lessonSlug,
        title,
        code,
        updated_at: now,
        ...(existing ? {} : { created_at: now }),
      },
      { onConflict: "user_id,class_slug,lesson_slug" }
    );

    if (error) {
      console.error("Share upsert error:", error);
      return NextResponse.json({ error: "Couldn't publish your game." }, { status: 500 });
    }

    return NextResponse.json({ id, path: `/arcade/${id}`, title });
  } catch (err) {
    console.error("Share route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
