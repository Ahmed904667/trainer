import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";
export default defineConfig([
  ...next,
  ...ts,
  globalIgnores([
    ".next/**",
    "lib/generated/**",
    "public/sw.js",
    "next-env.d.ts",
    "test-results/**",
  ]),
]);
