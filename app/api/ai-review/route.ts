import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { loadLessonContent } from "@/lib/lessons/loadLesson";

// Fallback prompt if no class-specific prompt is found
const DEFAULT_SYSTEM_PROMPT = `You are a warm, enthusiastic coding coach talking to a kid. Think "favorite science teacher" energy. Keep sentences short and punchy. No jargon.`;

async function getSystemPrompt(classSlug: string): Promise<string> {
  try {
    const mod = await import(`@/content/classes/${classSlug}/ai-prompt`);
    return mod.systemPrompt;
  } catch {
    return DEFAULT_SYSTEM_PROMPT;
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your-openai-api-key") {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 503 }
      );
    }

    const { submissionId } = await request.json();
    if (!submissionId) {
      return NextResponse.json(
        { error: "Missing submissionId" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Fetch submission with lesson info (including class_slug)
    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .select("*, lessons(slug, title, class_slug)")
      .eq("id", submissionId)
      .single();

    if (subError || !submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const lesson = submission.lessons as {
      slug: string;
      title: string;
      class_slug: string;
    };
    const classSlug = lesson.class_slug || "leo";
    const weekData = loadLessonContent(classSlug, lesson.slug);

    // Load class-specific AI prompt
    const systemPrompt = await getSystemPrompt(classSlug);

    const userPayload = `## Lesson: ${lesson.title}

## What the Lesson Teaches
${weekData.lessonSource}

## Exercise Instructions
${weekData.exercisesSource}

## Rubric
${JSON.stringify(weekData.rubric, null, 2)}

## Student Code
\`\`\`python
${submission.code}
\`\`\`

## Test Results
${JSON.stringify(submission.test_results, null, 2)}

## Instructions
Evaluate the student's code against the lesson content and rubric. The lesson and exercises above define what is correct — use them as your ground truth. Respond with ONLY valid JSON in this exact format:
{
  "verdict": "pass|partial|fail",
  "correctness": "short explanation of what is right/wrong",
  "concepts": "what they understood well and what they might have missed",
  "improvements": ["actionable suggestion 1", "actionable suggestion 2"],
  "challenge_question": "one fun question a 10-year-old would find exciting (use concrete examples like games, puzzles, secret messages, light switches — NOT abstract concepts like cryptography or error detection)",
  "common_pitfalls_to_watch": ["pitfall 1", "pitfall 2"]
}`;

    // Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPayload },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "AI review service unavailable" },
        { status: 503 }
      );
    }

    const aiResponse = await response.json();
    const feedback = JSON.parse(
      aiResponse.choices[0].message.content
    );

    // Store feedback on submission
    await supabase
      .from("submissions")
      .update({ ai_feedback: feedback, status: "reviewed" })
      .eq("id", submissionId);

    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
