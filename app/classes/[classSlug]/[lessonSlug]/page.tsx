import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { notFound } from "next/navigation";
import {
  getLessonSlugs,
  loadLessonContent,
} from "@/lib/lessons/loadLesson";
import { mdxComponents } from "@/lib/lessons/mdxComponents";
import { getClassBySlug, getClassSlugs } from "@/content/classes";
import CourseShell from "@/components/CourseShell";
import { createClient } from "@/lib/supabase/server";
import {
  getStudentName,
  personalizeText,
  personalizeTests,
} from "@/lib/lessons/personalize";

export function generateStaticParams() {
  const params: { classSlug: string; lessonSlug: string }[] = [];
  for (const classSlug of getClassSlugs()) {
    const cls = getClassBySlug(classSlug);
    if (cls?.comingSoon) continue;
    for (const lessonSlug of getLessonSlugs(classSlug)) {
      params.push({ classSlug, lessonSlug });
    }
  }
  return params;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ classSlug: string; lessonSlug: string }>;
}) {
  const { classSlug, lessonSlug } = await params;

  const classDef = getClassBySlug(classSlug);
  if (!classDef || classDef.comingSoon) notFound();

  const slugs = getLessonSlugs(classSlug);
  if (!slugs.includes(lessonSlug)) notFound();

  const lessonData = loadLessonContent(classSlug, lessonSlug);

  // Get authenticated user's name for content personalization
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const studentName = getStudentName(user);

  // Personalize content with the student's actual name
  const lessonSource = personalizeText(
    lessonData.lessonSource,
    studentName,
  );
  const exercisesSource = personalizeText(
    lessonData.exercisesSource,
    studentName,
  );
  const tests = personalizeTests(lessonData.tests, studentName);
  const starterCode = lessonData.starterCode
    ? personalizeText(lessonData.starterCode, studentName)
    : undefined;

  // Only the question + guidance reach the browser. `lookFor` and `exemplar`
  // (the model answer) are grader-only — they stay on the server so a curious
  // kid can't view-source the answer; the AI route reads reflection.json fresh.
  const reflectionConfig = lessonData.reflectionConfig
    ? {
        question: personalizeText(
          lessonData.reflectionConfig.question,
          studentName,
        ),
        guidance: lessonData.reflectionConfig.guidance
          ? personalizeText(lessonData.reflectionConfig.guidance, studentName)
          : undefined,
      }
    : undefined;

  // Load class-specific syllabus
  const syllabus = await import(
    `@/content/classes/${classSlug}/syllabus`
  );
  const { phases, weeks } = syllabus;

  const mdxOptions = {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [rehypeKatex],
    },
  };

  const { content: lessonContent } = await compileMDX({
    source: lessonSource,
    components: mdxComponents,
    options: mdxOptions,
  });

  const { content: exercisesContent } = await compileMDX({
    source: exercisesSource,
    components: mdxComponents,
    options: mdxOptions,
  });

  return (
    <CourseShell
      classSlug={classSlug}
      lessonSlug={lessonSlug}
      tests={tests}
      lessonContent={lessonContent}
      exercisesContent={exercisesContent}
      phases={phases}
      weeks={weeks}
      starterCode={starterCode}
      vizConfig={lessonData.vizConfig}
      reflectionConfig={reflectionConfig}
      latexConfig={lessonData.latexConfig}
    />
  );
}
