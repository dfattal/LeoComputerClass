import { redirect } from "next/navigation";
import { getWeekSlugs } from "@/lib/lessons/loadLesson";

export function generateStaticParams() {
  return getWeekSlugs().map((week) => ({ week }));
}

export default async function OldWeekPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  redirect(`/classes/leo/${week}`);
}
