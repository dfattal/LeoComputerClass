import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const { weekSlug, code, stdout, stderr, testResults } = body;

    if (!weekSlug || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Resolve lesson by slug
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("id")
      .eq("slug", weekSlug)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Insert submission
    const { data: submission, error: submitError } = await supabase
      .from("submissions")
      .insert({
        user_id: user.id,
        lesson_id: lesson.id,
        code,
        stdout: stdout || "",
        stderr: stderr || "",
        test_results: testResults || [],
        status: "submitted",
      })
      .select("id")
      .single();

    if (submitError) {
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      );
    }

    // Auto-update progress if all tests pass
    if (
      Array.isArray(testResults) &&
      testResults.length > 0 &&
      testResults.every((r: { passed: boolean }) => r.passed)
    ) {
      await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lesson.id,
          is_complete: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
      );
    }

    return NextResponse.json({ submissionId: submission.id });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
