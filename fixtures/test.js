import { test as base, expect } from '@playwright/test';
import { TaskPage } from '../pages/task-page.js';
import { randomUUID } from 'node:crypto';
export const test = base.extend({
  taskPage: async ({ page }, use) => { await use(new TaskPage(page)); },
  seededTask: async ({ request }, use) => {
    const title = `Garden ${randomUUID()}`;
    const headers = { Authorization: 'Bearer local-lab-token' };
    const response = await request.post('/tasks', { headers, data: { title } });
    expect(response.status()).toBe(201);
    const task = await response.json();
    try { await use(task); }
    finally {
      const cleanup = await request.delete(`/tasks/${task.id}`, { headers });
      expect([204, 404]).toContain(cleanup.status());
    }
  },
});
export { expect };
