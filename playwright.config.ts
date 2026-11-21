import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  timeout: 60000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3219",
    viewport: { width: 375, height: 812 },
    browserName: process.env.PLAYWRIGHT_WEBKIT === "1" ? "webkit" : "chromium",
    channel:
      process.env.PLAYWRIGHT_WEBKIT === "1"
        ? undefined
        : process.env.PLAYWRIGHT_CHROME_CHANNEL || undefined,
  },
});
