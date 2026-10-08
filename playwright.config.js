import { defineConfig, devices } from '@playwright/test';
// This configuration runs the bundled Task Garden demo. A puzzle site needs its own tests/page object.
export default defineConfig({
  // Parallel tests use unique data. forbidOnly stops a committed test.only from hiding coverage in CI.
  testDir: './tests', fullyParallel: true, forbidOnly: !!process.env.CI,
  // A CI retry helps diagnose transient failures; investigate flaky outcomes rather than ignoring them.
  retries: process.env.CI ? 1 : 0, workers: process.env.CI ? 2 : undefined,
  // Human-readable HTML and machine-readable JUnit make the same run useful in different tools.
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
  // Retain failure evidence without filling successful runs with screenshots and videos.
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure' },
  // Run identical behaviors on three browser engines to expose compatibility differences.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  // Wait for readiness before testing; reuse a developer server locally, but start fresh in CI.
  webServer: { command: 'npm start', url: 'http://127.0.0.1:4173/health', reuseExistingServer: !process.env.CI },
});
