import type { User } from "@supabase/supabase-js";
import type { TestEntry } from "./loadLesson";

export interface StudentName {
  firstName: string;
  lastName: string;
}

/** Extract first/last name from Supabase user metadata (Google OAuth). */
export function getStudentName(user: User | null): StudentName {
  if (!user) return { firstName: "Alex", lastName: "Smith" };

  const meta = user.user_metadata ?? {};
  const fullName: string | undefined = meta.full_name || meta.name;

  if (!fullName) {
    const emailLocal = user.email?.split("@")[0] ?? "Alex";
    return { firstName: emailLocal, lastName: "Smith" };
  }

  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : parts[0],
  };
}

/** Replace personalization tokens in any string. */
export function personalizeText(
  text: string,
  name: StudentName,
): string {
  return text
    .replace(/\{\{FIRST_NAME\}\}/g, name.firstName)
    .replace(/\{\{LAST_NAME\}\}/g, name.lastName)
    .replace(
      /\{\{FIRST_INITIAL\}\}/g,
      name.firstName[0]?.toUpperCase() ?? "A",
    )
    .replace(
      /\{\{LAST_INITIAL\}\}/g,
      name.lastName[0]?.toUpperCase() ?? "S",
    );
}

/** Deep-replace personalization tokens inside tests. */
export function personalizeTests(
  tests: TestEntry[],
  name: StudentName,
): TestEntry[] {
  return JSON.parse(personalizeText(JSON.stringify(tests), name));
}
