# Playwright automation framework

[![Playwright tests](https://github.com/ikoiv/playwright-automation-framework/actions/workflows/tests.yml/badge.svg)](https://github.com/ikoiv/playwright-automation-framework/actions/workflows/tests.yml)

A small testing garden. I wanted a place to explore automation patterns without relying on a public demo site's uptime or shared accounts, so this lab includes its own tiny task app.

## Try it

Requires Node.js 22 or newer.

```bash
npm ci
npx playwright install --with-deps
npm test
npm run report
```

For a shorter run: `npm run test:smoke`. For interactive exploration: `npm start`, then open `http://127.0.0.1:4173`. The demo stores tasks in memory, so restarting the server clears them.

## What's here

| Location | Purpose |
| --- | --- |
| `demo/` | Local application and API with synthetic task data |
| `pages/task-page.js` | UI interactions and semantic locators |
| `fixtures/test.js` | API seed data with unique names and cleanup |
| `tests/tasks.spec.js` | User workflows, boundaries, keyboard input, and a simulated outage |
| `playwright.config.js` | Chromium, Firefox, WebKit, and failure evidence |
| `.github/workflows/tests.yml` | CI run with downloadable HTML, JUnit, traces, screenshots, and video |

## Scenarios and design choices

- Create, complete, reopen, and remove tasks; reload to check server state.
- Reject empty, whitespace-only, and overlength titles.
- Preserve the draft when a save fails.
- Submit from the keyboard and check focus returns to the input.

Page objects contain interactions; assertions stay in tests. API setup skips repetitive UI creation where creation is not the behavior under test. Unique task names and per-test cleanup allow parallel execution without a global reset endpoint. Tests use Playwright's web-first assertions instead of sleeps.

CI retries once to collect useful evidence; a retry is a reason to investigate, not proof of reliability. Download `playwright-results` from an Actions run and open its HTML report. The badge above reflects the actual CI state.

## Limits and next experiments

This is a focused learning lab, not a production app or a full framework. The fixed local bearer token is intentionally visible demo data. Persistence is process-local; there is no real identity provider. Keyboard checks cover selected interactions, not a WCAG audit. Next experiments: mobile viewports, automated accessibility checks, and richer response contracts.

MIT licensed. No employer code or customer data.
