import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSubmissions from "@/components/AdminSubmissions";

export default async function AdminPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === "your-supabase-url") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold">Admin Panel</h1>
        <p className="text-zinc-500">
          Connect Supabase to enable the admin panel. Add your credentials to{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
            .env.local
          </code>
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check instructor role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "instructor") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
        <p className="text-zinc-500">Only instructors can access this page.</p>
      </div>
    );
  }

  // Fetch all submissions with lesson and profile info
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, lessons(slug, title), profiles(display_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Panel</h1>
      <AdminSubmissions submissions={submissions || []} />
    </div>
  );
}
