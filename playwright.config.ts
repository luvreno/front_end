import { defineConfig, devices } from '@playwright/test';

const widths = [375, 768, 1280] as const;
const engines = [
  { name: 'chromium', use: devices['Desktop Chrome'] },
  { name: 'firefox', use: devices['Desktop Firefox'] },
  { name: 'webkit', use: devices['Desktop Safari'] },
];

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://127.0.0.1:4280',
    trace: 'retain-on-failure',
  },
  projects: engines.flatMap((e) =>
    widths.map((w) => ({
      name: `${e.name}-${w}`,
      use: { ...e.use, viewport: { width: w, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
    })),
  ),
  webServer: [
    {
      // build with public test keys (npm run build:e2e)
      command: 'node node_modules/vite/bin/vite.js preview --outDir dist-e2e --host 127.0.0.1 --port 4280 --strictPort',
      url: 'http://127.0.0.1:4280',
      reuseExistingServer: true,
    },
    {
      // the production build exactly as it will be uploaded
      command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4281 --strictPort',
      url: 'http://127.0.0.1:4281',
      reuseExistingServer: true,
    },
  ],
});
