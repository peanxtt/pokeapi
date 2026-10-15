import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:3004",
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "phone", use: { viewport: { width: 390, height: 850 } } },
    { name: "small-phone", use: { viewport: { width: 320, height: 760 } } },
    {
      name: "night-phone",
      use: {
        viewport: { width: 390, height: 850 },
        colorScheme: "dark",
        reducedMotion: "reduce",
      },
    },
  ],
  webServer: {
    command: "node node_modules/next/dist/bin/next start -p 3004",
    url: "http://localhost:3004",
    reuseExistingServer: !process.env.CI,
  },
});
