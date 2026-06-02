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
