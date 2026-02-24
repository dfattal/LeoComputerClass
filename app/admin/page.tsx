import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import AdminSubmissions from "@/components/AdminSubmissions";

export default async function AdminPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === "your-supabase-url") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold">Admin Panel</h1>
        <p className="text-stone-500">
          Connect Supabase to enable the admin panel. Add your credentials to{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 dark:bg-stone-800">
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

  // Use service client (bypasses RLS) for admin checks
  const serviceClient = await createServiceClient();

  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "instructor") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
        <p className="text-stone-500">Only instructors can access this page.</p>
      </div>
    );
  }

  // Fetch all submissions with lesson and profile info
  const { data: submissions } = await serviceClient
    .from("submissions")
    .select("*, lessons(slug, title), profiles(display_name)")
    .order("created_at", { ascending: false });

  // Fetch all users via admin API for display names and avatars
  const { data: usersData } = await serviceClient.auth.admin.listUsers();
  const users = usersData?.users ?? [];

  // Build a lookup map: user_id -> { name, email, avatar }
  const userMap: Record<string, { name: string; email: string; avatar?: string }> = {};
  for (const u of users) {
    const meta = u.user_metadata ?? {};
    const fullName = meta.full_name || meta.name || "";
    const email = u.email ?? "";
    userMap[u.id] = {
      name: fullName || email.split("@")[0],
      email,
      avatar: meta.avatar_url || meta.picture,
    };
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Panel</h1>
      <AdminSubmissions submissions={submissions || []} userMap={userMap} />
    </div>
  );
}
