import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import {
  getLessonSlugs,
  loadLessonContent,
} from "@/lib/lessons/loadLesson";
import { mdxComponents } from "@/lib/lessons/mdxComponents";
import { getClassBySlug, getClassSlugs } from "@/content/classes";
import CourseShell from "@/components/CourseShell";

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

  // Load class-specific syllabus
  const syllabus = await import(
    `@/content/classes/${classSlug}/syllabus`
  );
  const { phases, weeks } = syllabus;

  const mdxOptions = {
    mdxOptions: { remarkPlugins: [remarkGfm] },
  };

  const { content: lessonContent } = await compileMDX({
    source: lessonData.lessonSource,
    components: mdxComponents,
    options: mdxOptions,
  });

  const { content: exercisesContent } = await compileMDX({
    source: lessonData.exercisesSource,
    components: mdxComponents,
    options: mdxOptions,
  });

  return (
    <CourseShell
      classSlug={classSlug}
      lessonSlug={lessonSlug}
      tests={lessonData.tests}
      lessonContent={lessonContent}
      exercisesContent={exercisesContent}
      phases={phases}
      weeks={weeks}
      starterCode={lessonData.starterCode}
      vizConfig={lessonData.vizConfig}
    />
  );
}
