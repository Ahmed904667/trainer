import { execFileSync } from "node:child_process";
if (process.env.DATABASE_URL || process.env.DIRECT_URL)
  execFileSync("node_modules/.bin/prisma", ["migrate", "deploy"], {
    stdio: "inherit",
  });
