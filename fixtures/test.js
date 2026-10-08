import { test as base, expect } from '@playwright/test';
import { TaskPage } from '../pages/task-page.js';
import { randomUUID } from 'node:crypto';
// Fixtures provide reusable setup and teardown around each test, not a shared global reset.
export const test = base.extend({
  taskPage: async ({ page }, use) => { await use(new TaskPage(page)); },
  seededTask: async ({ request }, use) => {
    // Unique names prevent another worker or browser from selecting this task accidentally.
    const title = `Garden ${randomUUID()}`;
    const headers = { Authorization: 'Bearer local-lab-token' };
    // Seed through the API when task creation itself is not the behavior under test.
    const response = await request.post('/tasks', { headers, data: { title } });
    expect(response.status()).toBe(201);
    const task = await response.json();
    try { await use(task); }
    finally {
      // A deletion test may already remove its seed; both 204 and 404 mean cleanup is complete.
      const cleanup = await request.delete(`/tasks/${task.id}`, { headers });
      expect([204, 404]).toContain(cleanup.status());
    }
  },
});
export { expect };
