// [CHUNG] Supabase client cho trình duyệt · tài liệu mục 7.11
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/shared/config/public-env";
import type { Database } from "@/shared/types/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
