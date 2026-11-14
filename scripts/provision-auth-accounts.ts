import { loadEnvConfig } from "@next/env";
import { createClient, type User } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sharedPassword = process.env.ADMIN_SHARED_INITIAL_PASSWORD;

if (!url || !serviceKey) throw new Error("Configure Supabase URL and service-role secret in .env.local.");
if (!sharedPassword || sharedPassword.length < 8) {
  throw new Error("Set ADMIN_SHARED_INITIAL_PASSWORD to the existing admin password in .env.local.");
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listUsers(): Promise<User[]> {
  const users: User[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) return users;
  }
}

async function main() {
  const { data: initialProfiles, error: profileError } = await supabase
    .from("profiles")
    .select("id,username,full_name,role")
    .order("username");
  if (profileError) throw profileError;

  const byUsername = new Map(initialProfiles.map((profile) => [profile.username, profile]));
  const primaryAdmin = byUsername.get("admin");
  const teacher = byUsername.get("gv01");
  if (!primaryAdmin || primaryAdmin.role !== "admin") throw new Error("The existing admin profile was not found.");
  if (!teacher || teacher.role !== "teacher") throw new Error("The GV01 teacher profile was not found.");

  let authUsers = await listUsers();
  const authById = new Map(authUsers.map((user) => [user.id, user]));

  for (const suffix of [1, 2, 3]) {
    const username = `admin${suffix}`;
    const existing = byUsername.get(username);
    if (existing) {
      const user = authById.get(existing.id);
      if (user?.app_metadata?.eduht_bootstrap_admin !== true) {
        throw new Error(`Refusing to overwrite an existing non-bootstrap account: ${username}`);
      }
      const { error: metadataError } = await supabase.auth.admin.updateUserById(existing.id, {
        app_metadata: { ...user.app_metadata, role: "admin", must_change_password: false },
      });
      if (metadataError) throw new Error(`Could not sync admin auth role for ${username}: ${metadataError.message}`);
      if (existing.role !== "admin") {
        const { error: profileRoleError } = await supabase.from("profiles").update({
          role: "admin",
          is_active: true,
          must_change_password: false,
        }).eq("id", existing.id);
        if (profileRoleError) throw new Error(`Could not sync admin profile role for ${username}: ${profileRoleError.message}`);
      }
      continue;
    }

    const email = `${username}@example.invalid`;
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: sharedPassword,
      email_confirm: true,
      app_metadata: {
        role: "admin",
        must_change_password: false,
        eduht_bootstrap_admin: true,
      },
      user_metadata: {
        username,
        full_name: `Quản trị viên ${suffix}`,
        role: "admin",
        must_change_password: false,
      },
    });
    if (error || !data.user) throw new Error(`Could not create ${username}: ${error?.message ?? "missing user"}`);

    const { error: metadataError } = await supabase.auth.admin.updateUserById(data.user.id, {
      app_metadata: {
        ...data.user.app_metadata,
        role: "admin",
        must_change_password: false,
        eduht_bootstrap_admin: true,
      },
    });
    if (metadataError) throw new Error(`Could not sync admin auth role for ${username}: ${metadataError.message}`);
    const { error: profileRoleError } = await supabase.from("profiles").update({
      role: "admin",
      is_active: true,
      must_change_password: false,
    }).eq("id", data.user.id);
    if (profileRoleError) throw new Error(`Could not sync admin profile role for ${username}: ${profileRoleError.message}`);
  }

  const { data: profiles, error: refreshedProfileError } = await supabase
    .from("profiles")
    .select("id,username,role")
    .order("username");
  if (refreshedProfileError) throw refreshedProfileError;
  authUsers = await listUsers();
  const usersById = new Map(authUsers.map((user) => [user.id, user]));
  let updated = 0;

  for (const profile of profiles) {
    const user = usersById.get(profile.id);
    if (!user) throw new Error(`Auth account missing for profile ${profile.username}`);
    if (profile.username === "admin" && profile.role === "admin") {
      if (user.email?.toLowerCase() !== "mhuy7125@mail.com") {
        const { error } = await supabase.auth.admin.updateUserById(profile.id, {
          email: "mhuy7125@mail.com",
          email_confirm: true,
        });
        if (error) throw new Error(`Could not update primary admin contact email: ${error.message}`);
        updated += 1;
      }
      continue;
    }
    if (profile.username === "gv01" && profile.role === "teacher") {
      if (user.email?.toLowerCase() !== "yuri456732@gmail.com") {
        const { error } = await supabase.auth.admin.updateUserById(profile.id, {
          email: "yuri456732@gmail.com",
          email_confirm: true,
        });
        if (error) throw new Error(`Could not update GV01 contact email: ${error.message}`);
        updated += 1;
      }
      continue;
    }

    const placeholderEmail = `${profile.username}@example.invalid`;
    if (user.email?.toLowerCase() !== placeholderEmail) {
      const { error } = await supabase.auth.admin.updateUserById(profile.id, {
        email: placeholderEmail,
        email_confirm: true,
      });
      if (error) throw new Error(`Could not set placeholder email for ${profile.username}: ${error.message}`);
      updated += 1;
    }
  }

  console.log(`Provisioning complete. Admin accounts ensured: admin, admin1, admin2, admin3. Account contact emails updated: ${updated}. Password values were not printed.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Account provisioning failed.");
  process.exitCode = 1;
});