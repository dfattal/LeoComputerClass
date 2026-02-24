import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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
    const weekSlug = searchParams.get("weekSlug");
    if (!weekSlug) {
      return NextResponse.json({ error: "Missing weekSlug" }, { status: 400 });
    }

    const serviceClient = await createServiceClient();

    // Resolve lesson
    const { data: lesson } = await serviceClient
      .from("lessons")
      .select("id")
      .eq("slug", weekSlug)
      .single();

    if (!lesson) {
      return NextResponse.json({ submission: null });
    }

    // Fetch latest submission for this user + lesson
    const { data: submission } = await serviceClient
      .from("submissions")
      .select("id, ai_feedback, instructor_feedback, status, test_results")
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ submission: submission || null });
  } catch {
    return NextResponse.json({ submission: null });
  }
}

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

    const serviceClient = await createServiceClient();

    // Resolve lesson by slug
    const { data: lesson, error: lessonError } = await serviceClient
      .from("lessons")
      .select("id")
      .eq("slug", weekSlug)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Delete any existing submissions for this user + lesson (keep only latest)
    await serviceClient
      .from("submissions")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id);

    // Insert new submission
    const { data: submission, error: submitError } = await serviceClient
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
      console.error("Submission insert error:", submitError);
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
      await serviceClient.from("lesson_progress").upsert(
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
  } catch (err) {
    console.error("Submit route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify instructor role
    const serviceClient = await createServiceClient();
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "instructor") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { submissionId, instructorFeedback } = await request.json();
    if (!submissionId) {
      return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    }

    const { error: updateError } = await serviceClient
      .from("submissions")
      .update({ instructor_feedback: instructorFeedback })
      .eq("id", submissionId);

    if (updateError) {
      console.error("Feedback update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
