// [BE] Supabase client quyền Admin (service_role) · tài liệu mục 7.11
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/shared/config/public-env";
import { serverEnv } from "@/server/env";
import type { Database } from "@/shared/types/database.types";

export function createAdminClient() {
  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
