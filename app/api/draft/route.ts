import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { resolveLessonId, ensureLessonId } from "@/lib/lessons/resolveLessonId";

// GET /api/draft?classSlug=...&lessonSlug=... — return the student's auto-saved
// draft for a lesson (the in-progress, unsubmitted code). Degrades to
// { draft: null } on any miss so the editor falls back to localStorage/starter.
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
    const lessonSlug =
      searchParams.get("lessonSlug") || searchParams.get("weekSlug");
    if (!lessonSlug) {
      return NextResponse.json({ error: "Missing lessonSlug" }, { status: 400 });
    }

    const serviceClient = await createServiceClient();
    const lesson = await resolveLessonId(serviceClient, classSlug, lessonSlug);
    if (!lesson) {
      return NextResponse.json({ draft: null });
    }

    const { data: draft } = await serviceClient
      .from("drafts")
      .select("code, updated_at")
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id)
      .single();

    return NextResponse.json({ draft: draft || null });
  } catch {
    return NextResponse.json({ draft: null });
  }
}

// PUT /api/draft — upsert the student's draft for a lesson. Called on a debounce
// as the student types, so it must be cheap and idempotent (one row per
// user+lesson via the unique constraint).
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const classSlug: string | null = body.classSlug ?? null;
    const lessonSlug: string = body.lessonSlug ?? body.weekSlug;
    const code: string = body.code ?? "";

    if (!lessonSlug) {
      return NextResponse.json({ error: "Missing lessonSlug" }, { status: 400 });
    }
    // Never persist a blank draft over real work.
    if (!code.trim()) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const serviceClient = await createServiceClient();
    // Write path: create the lesson row from the syllabus if it isn't synced yet,
    // so auto-save works the first time a student opens a brand-new lesson.
    const lesson = await ensureLessonId(serviceClient, classSlug, lessonSlug);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const updatedAt = new Date().toISOString();
    const { error: upsertError } = await serviceClient.from("drafts").upsert(
      {
        user_id: user.id,
        lesson_id: lesson.id,
        code,
        updated_at: updatedAt,
      },
      { onConflict: "user_id,lesson_id" }
    );

    if (upsertError) {
      console.error("Draft upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to save draft" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, updated_at: updatedAt });
  } catch (err) {
    console.error("Draft route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
