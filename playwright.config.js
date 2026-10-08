import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: true, forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: { command: 'npm start', url: 'http://127.0.0.1:4173/health', reuseExistingServer: !process.env.CI },
});
