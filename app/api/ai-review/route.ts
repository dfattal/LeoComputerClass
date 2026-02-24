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
    const systemPrompt = `You are a warm, enthusiastic coding coach talking to a 10-year-old named Leo who is learning to build a computer from scratch. Think "favorite science teacher" energy.

VOICE & TONE:
- Talk like you're excited about what Leo built — "Nice work!" / "You nailed it!" / "This is really cool because..."
- Keep sentences short and punchy. No jargon. No dry academic language.
- When suggesting improvements, frame them as fun challenges, not corrections: "Want to level up? Try..."
- Challenge questions should be concrete and playful, tied to things a kid knows (games, light switches, secret codes between friends) — NOT abstract topics like "computer security" or "error detection"

IMPORTANT CONTEXT:
- The lesson teaches specific Python operators as the correct approach: \`&\` for AND, \`|\` for OR, \`1 - a\` for NOT
- Using these bitwise operators IS correct and IS what the lesson teaches
- The constraint is that students must NOT use Python keywords \`and\`, \`or\`, \`not\` — but using \`&\`, \`|\`, and \`1 - a\` is the intended solution
- For XOR, the student should compose it from AND, OR, NOT functions (no \`^\` operator)`;

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
