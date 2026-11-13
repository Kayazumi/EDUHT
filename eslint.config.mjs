// [OPS] Cấu hình ESLint · tài liệu mục 8.3
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  // 1. Cấm import @/server/supabase/admin ở mọi nơi ngoại trừ 3 tệp cho phép
  {
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "src/server/actions/users.ts",
      "src/app/api/cron/keepalive/route.ts",
      "src/app/api/export/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/supabase/admin", "@/server/supabase/admin.ts"],
              message: "Chỉ được import @/server/supabase/admin tại users.ts, keepalive route và export route.",
            },
          ],
        },
      ],
    },
  },
  // 2. src/components/** và src/hooks/**: cấm import @/server/** trừ @/server/actions/*
  {
    files: ["src/components/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/supabase/admin", "@/server/supabase/admin.ts"],
              message: "Chỉ được import @/server/supabase/admin tại users.ts, keepalive route và export route.",
            },
            {
              group: ["@/server/!(actions)/**"],
              message: "Components và hooks không được import từ server ngoại trừ actions.",
            },
          ],
        },
      ],
    },
  },
  // 3. src/shared/**: cấm import @/server/**, @/components/**, @/hooks/**, @/app/**
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/server",
                "@/server/**",
                "@/components",
                "@/components/**",
                "@/hooks",
                "@/hooks/**",
                "@/app",
                "@/app/**",
              ],
              message: "src/shared là tầng thấp nhất, không được import từ server, components, hooks hoặc app.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
