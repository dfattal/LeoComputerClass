import type { createServiceClient } from "@/lib/supabase/server";

/**
 * Resolve a lesson by class + lesson slug, falling back to slug-only for
 * backward compat. Shared by the submit and draft routes so the lookup logic
 * stays in one place.
 */
export async function resolveLessonId(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  classSlug: string | null,
  lessonSlug: string
) {
  if (classSlug) {
    const { data } = await serviceClient
      .from("lessons")
      .select("id")
      .eq("class_slug", classSlug)
      .eq("slug", lessonSlug)
      .single();
    if (data) return data;
  }
  // Fallback: slug-only lookup (backward compat for old clients)
  const { data } = await serviceClient
    .from("lessons")
    .select("id")
    .eq("slug", lessonSlug)
    .single();
  return data;
}

/**
 * Like {@link resolveLessonId}, but if the lesson row doesn't exist yet, create
 * it from the published syllabus and return it. Used by the WRITE paths (submit,
 * draft-save) so a freshly-shipped lesson is usable immediately — without waiting
 * for someone to load `/dashboard` (which is the only other place that syncs the
 * `lessons` table). Read paths keep using `resolveLessonId` and degrade to null.
 */
export async function ensureLessonId(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  classSlug: string | null,
  lessonSlug: string
) {
  const existing = await resolveLessonId(serviceClient, classSlug, lessonSlug);
  if (existing) return existing;

  // Only self-heal when we know the class (new clients always send it). Look the
  // lesson up in the class's syllabus and require it to be a *published* week —
  // never fabricate a row for an unknown/unpublished slug.
  if (!classSlug) return null;
  let week: { week: number; slug: string; title: string; status: string } | undefined;
  try {
    const mod = await import(`@/content/classes/${classSlug}/syllabus`);
    week = (mod.weeks as typeof week[] | undefined)?.find(
      (w) => w?.slug === lessonSlug && w?.status === "published"
    );
  } catch {
    return null; // no such class / no syllabus
  }
  if (!week) return null;

  await serviceClient.from("lessons").upsert(
    {
      class_slug: classSlug,
      week_number: week.week,
      slug: lessonSlug,
      title: week.title,
    },
    { onConflict: "class_slug,slug" }
  );

  return resolveLessonId(serviceClient, classSlug, lessonSlug);
}
