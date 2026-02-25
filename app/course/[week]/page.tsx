import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { getWeekSlugs, loadWeekContent } from "@/lib/lessons/loadLesson";
import { mdxComponents } from "@/lib/lessons/mdxComponents";
import LessonSidebar from "@/components/LessonSidebar";
import ContentPanel from "@/components/ContentPanel";
import SplitLayout from "@/components/SplitLayout";
import CodeWorkspace from "@/components/CodeWorkspace";

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
    <>
      <LessonSidebar currentWeek={week} />
      <SplitLayout
        leftPanel={
          <ContentPanel
            lessonContent={lessonContent}
            exercisesContent={exercisesContent}
          />
        }
        rightPanel={
          <CodeWorkspace weekSlug={week} tests={weekData.tests} />
        }
      />
    </>
  );
}
