import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { loadWeekContent } from "@/lib/lessons/loadLesson";

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

    // Fetch submission with lesson info
    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .select("*, lessons(slug, title)")
      .eq("id", submissionId)
      .single();

    if (subError || !submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const lesson = submission.lessons as { slug: string; title: string };
    const weekData = loadWeekContent(lesson.slug);

    // Build the AI prompt
    const systemPrompt = `You are a rigorous computer architecture instructor evaluating a student learning digital logic and CPU fundamentals. Be encouraging but precise.`;

    const userPayload = `
## Lesson: ${lesson.title}

## Rubric
${JSON.stringify(weekData.rubric, null, 2)}

## Student Code
\`\`\`python
${submission.code}
\`\`\`

## Test Results
${JSON.stringify(submission.test_results, null, 2)}

## Instructions
Evaluate the student's code. Respond with ONLY valid JSON in this exact format:
{
  "verdict": "pass|partial|fail",
  "correctness": "short explanation",
  "concepts": "what they understood / missed",
  "improvements": ["actionable change 1", "actionable change 2"],
  "challenge_question": "one deeper question",
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
