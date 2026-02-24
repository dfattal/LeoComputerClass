import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import UserBadge from "./UserBadge";
import SignOutButton from "./SignOutButton";

export default async function HeaderAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-md bg-indigo-500/20 px-4 py-1.5 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-500/30 hover:text-indigo-100"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <UserBadge />
      <SignOutButton />
      <div className="h-5 w-px bg-indigo-700/50" />
      <Link
        href="/dashboard"
        className="rounded-md px-3 py-1.5 text-sm text-indigo-200/70 transition-colors hover:bg-indigo-800/40 hover:text-indigo-100"
      >
        Dashboard
      </Link>
      <Link
        href="/admin"
        className="rounded-md px-3 py-1.5 text-sm text-indigo-200/70 transition-colors hover:bg-indigo-800/40 hover:text-indigo-100"
      >
        Admin
      </Link>
    </div>
  );
}
