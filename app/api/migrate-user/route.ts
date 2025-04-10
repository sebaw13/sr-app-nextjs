import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const { id, email } = user;

  // Check if profile already exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (profile) {
    return NextResponse.json({ message: "Profile already exists" });
  }

  // Fetch legacy user
  const { data: legacyUser } = await supabase
    .from("up_users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!legacyUser) {
    return NextResponse.json({ error: "Legacy user not found" }, { status: 404 });
  }

  // Insert into profiles
  const { error: insertError } = await supabase.from("profiles").insert({
    id,
    username: legacyUser.username,
    name: legacyUser.name,
    vorname: legacyUser.vorname,
    nlz: legacyUser.nlz,
    save_view: legacyUser.save_view,
    notifications: legacyUser.notifications,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Optional: cleanup
  await supabase.from("up_users").delete().eq("email", email);

  return NextResponse.json({ message: "Profile created" });
}
