import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { loadLessonContent } from "@/lib/lessons/loadLesson";
import { getStudentName } from "@/lib/lessons/personalize";
import { getClassBySlug } from "@/content/classes";

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

    // Load the class-specific AI prompt and personalize it with the student's
    // Google login name (same source as the {{FIRST_NAME}} lesson tokens).
    let basePrompt = await getSystemPrompt(classSlug);

    // The class prompts are written addressing a default student name — the
    // registry `studentName` (e.g. "Leo") — sprinkled throughout the text. If a
    // *different* student is logged in (a sibling, a parent testing), that
    // hardcoded name overpowers a one-line "your student is named X" note and the
    // coach greets the wrong kid. So rewrite the default name to the actual
    // logged-in first name everywhere it appears. (No-op when they match, when
    // the name is unknown, or for name-agnostic prompts like Pixel Wizards.)
    const defaultName = getClassBySlug(classSlug)?.studentName;
    let firstName: string | undefined;
    try {
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(submission.user_id);
      if (user) firstName = getStudentName(user).firstName || undefined;
    } catch {
      // No name available — fall back to the default baked into the prompt.
    }
    if (defaultName && firstName && firstName !== defaultName) {
      const escaped = defaultName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      basePrompt = basePrompt.replace(
        new RegExp(`\\b${escaped}\\b`, "g"),
        firstName
      );
    }
    let systemPrompt = firstName
      ? `The student you are coaching is named ${firstName}. Greet them by their first name and use it naturally now and then.\n\n${basePrompt}`
      : basePrompt;

    // A "reflection" lesson has no Python and no tests — the student re-explains
    // a core idea in their own words and we assess understanding (formatively).
    // It reuses the same submission row (`code` holds the prose) and the same
    // output JSON schema, so AIFeedback renders it unchanged — only the prompt
    // and what we judge differ.
    const reflection = weekData.reflectionConfig;

    const userPayload = reflection
      ? `## Lesson: ${lesson.title}

## What the Lesson Teaches (the ground truth)
${weekData.lessonSource}

## The Question the Student Was Asked
${reflection.question}

## Key Ideas a Strong Answer Should Convey
${reflection.lookFor.map((p) => `- ${p}`).join("\n")}
${reflection.exemplar ? `\n## Model Answer (for your reference only — do NOT expect this exact wording)\n${reflection.exemplar}` : ""}

## The Student's Answer (in their own words)
${submission.code}

## Instructions
The student wrote a short explanation in their OWN words. Your job is to judge whether they genuinely UNDERSTAND the core idea — NOT their spelling, grammar, handwriting, or exact wording. A correct idea explained simply or with a kid's own analogy is a full pass. They are 10 years old.
- "pass" = they clearly grasp the core idea (they may phrase it loosely or miss a minor detail).
- "partial" = they're on the right track but a key piece is missing or muddled.
- "fail" = a core misconception, or they didn't really engage with the idea.
Be warm, specific, and encouraging — even a "fail" should feel like a friendly nudge to think again, never a put-down. Point to the exact idea they nailed and the one to revisit. If they're close, tell them which single piece would complete it.
Respond with ONLY valid JSON in this exact format:
{
  "verdict": "pass|partial|fail",
  "correctness": "warmly tell them whether they got the core idea, and name the specific idea they nailed or are missing",
  "concepts": "what they clearly understood, and the one idea to revisit if any",
  "improvements": ["one concrete thing to add or rethink to make the explanation complete", "another if helpful"],
  "challenge_question": "one fun, concrete question that nudges them to think a little deeper about this same idea (everyday examples a 10-year-old loves — NOT abstract jargon)",
  "common_pitfalls_to_watch": ["a common mix-up people have about this idea", "another if helpful"]
}`
      : `## Lesson: ${lesson.title}

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
Evaluate the student's code against the lesson content and rubric. The lesson and exercises above define what is correct — use them as your ground truth.
IMPORTANT: Judge the code by what it actually DOES, not by leftover comments like "# Your code here". If a function has a valid return statement or working logic, it IS implemented — even if placeholder comments remain or there are blank lines. Trust the test results as ground truth for whether the code works.
Respond with ONLY valid JSON in this exact format:
{
  "verdict": "pass|partial|fail",
  "correctness": "short explanation of what is right/wrong",
  "concepts": "what they understood well and what they might have missed",
  "improvements": ["actionable suggestion 1", "actionable suggestion 2"],
  "challenge_question": "one fun question a 10-year-old would find exciting (use concrete examples like games, puzzles, secret messages, light switches — NOT abstract concepts like cryptography or error detection)",
  "common_pitfalls_to_watch": ["pitfall 1", "pitfall 2"]
}`;

    // For reflection lessons, steer the class voice toward assessing understanding
    // of a written explanation rather than grading code.
    if (reflection) {
      systemPrompt = `${systemPrompt}\n\nFor THIS task, the student is not writing code — they wrote a short explanation of an idea in their own words. Assess whether they truly understand it. Never grade spelling, grammar, or wording. Reward a correct idea explained in a kid's own way. Stay warm and encouraging.`;
    }

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
