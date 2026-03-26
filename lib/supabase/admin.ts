import { createClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/config/env";
import type { Database } from "@/lib/db/types";

const env = getServerEnv();

export const supabaseAdmin = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
