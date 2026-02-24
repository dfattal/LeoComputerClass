import { createClient } from "@/lib/supabase/server";

export default async function UserBadge() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const avatarUrl: string | undefined = meta.avatar_url || meta.picture;
  const fullName: string | undefined = meta.full_name || meta.name;
  const firstName = fullName?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";

  return (
    <div className="flex items-center gap-2.5">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="h-7 w-7 rounded-full ring-2 ring-indigo-400/30"
        />
      ) : (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/30 text-xs font-bold text-indigo-200">
          {firstName[0].toUpperCase()}
        </div>
      )}
      <span className="text-sm text-indigo-200/80">
        Welcome, <span className="font-medium text-indigo-100">{firstName}</span>
      </span>
    </div>
  );
}
