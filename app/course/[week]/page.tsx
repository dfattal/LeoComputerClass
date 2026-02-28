import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { getWeekSlugs, loadWeekContent } from "@/lib/lessons/loadLesson";
import { mdxComponents } from "@/lib/lessons/mdxComponents";
import CourseShell from "@/components/CourseShell";

export function generateStaticParams() {
  return getWeekSlugs().map((week) => ({ week }));
}

export default async function WeekPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  const slugs = getWeekSlugs();
  if (!slugs.includes(week)) notFound();

  const weekData = loadWeekContent(week);

  const mdxOptions = {
    mdxOptions: { remarkPlugins: [remarkGfm] },
  };

  const { content: lessonContent } = await compileMDX({
    source: weekData.lessonSource,
    components: mdxComponents,
    options: mdxOptions,
  });

  const { content: exercisesContent } = await compileMDX({
    source: weekData.exercisesSource,
    components: mdxComponents,
    options: mdxOptions,
  });

  return (
    <CourseShell
      weekSlug={week}
      tests={weekData.tests}
      lessonContent={lessonContent}
      exercisesContent={exercisesContent}
      currentWeek={week}
    />
  );
}
