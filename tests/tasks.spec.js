import { test, expect } from '../fixtures/test.js';
import { randomUUID } from 'node:crypto';

// Exercise creation through the UI; the reload checks server state, not only a DOM update.
test('create a task and retain it after reload @smoke', async ({ taskPage, request }) => {
  const title = `Plant ${randomUUID()}`;
  let id;
  try {
    await taskPage.open();
    // Register the response listener before clicking so a fast response cannot be missed.
    const saved = taskPage.page.waitForResponse(r => r.url().endsWith('/tasks') && r.request().method() === 'POST');
    await taskPage.addTask(title);
    const response = await saved;
    expect(response.status()).toBe(201);
    id = (await response.json()).id;
    await expect(taskPage.row(title)).toBeVisible();
    await expect(taskPage.status).toHaveText('Task added.');
    await taskPage.page.reload();
    await expect(taskPage.row(title)).toBeVisible();
  } finally {
    // Remove only this test's task, even when an assertion fails.
    if (id) await request.delete(`/tasks/${id}`, { headers: { Authorization: 'Bearer local-lab-token' } });
  }
});

// API fixtures keep setup short while the UI still performs the behavior being checked.
test('complete and reopen an API-seeded task @smoke', async ({ taskPage, seededTask }) => {
  await taskPage.open();
  const checkbox = taskPage.checkbox(seededTask.title);
  await checkbox.check();
  await expect(taskPage.status).toHaveText('Task completed.');
  await taskPage.page.reload();
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  await expect(taskPage.status).toHaveText('Task reopened.');
  await taskPage.page.reload();
  await expect(checkbox).not.toBeChecked();
});

// Verify absence in both the refreshed UI and the API to catch optimistic-only removal.
test('remove a task and verify it stays removed', async ({ taskPage, seededTask, request }) => {
  await taskPage.open();
  await taskPage.remove(seededTask.title);
  await expect(taskPage.row(seededTask.title)).toHaveCount(0);
  await taskPage.page.reload();
  await expect(taskPage.row(seededTask.title)).toHaveCount(0);
  const response = await request.get(`/tasks/${seededTask.id}`, { headers: { Authorization: 'Bearer local-lab-token' } });
  expect(response.status()).toBe(404);
});

// Blank and whitespace-only strings are distinct inputs with the same validation rule.
for (const title of ['', '   ']) {
  test(`reject blank input ${JSON.stringify(title)}`, async ({ taskPage }) => {
    await taskPage.open();
    await taskPage.addTask(title);
    await expect(taskPage.error).toHaveText('Enter a task title.');
    await expect(taskPage.title).toBeFocused();
  });
}

// One character beyond the 120-character limit tests the rejection boundary.
test('reject a title over the boundary', async ({ taskPage }) => {
  await taskPage.open();
  await taskPage.addTask('x'.repeat(121));
  await expect(taskPage.error).toHaveText('Use 120 characters or fewer.');
});

test('show a useful error when the API cannot save', async ({ taskPage }) => {
  // Fail only POST requests; GET requests still load the page normally.
  await taskPage.page.route('**/tasks', route => route.request().method() === 'POST'
    ? route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Unavailable"}' }) : route.continue());
  await taskPage.open();
  await taskPage.addTask('Keep this draft');
  await expect(taskPage.error).toHaveText('Task could not be saved. Try again.');
  await expect(taskPage.title).toHaveValue('Keep this draft');
  await expect(taskPage.row('Keep this draft')).toHaveCount(0);
});

// Enter submits the form; returning focus lets someone keep working from the keyboard.
test('submit from the keyboard', async ({ taskPage, request }) => {
  const title = `Keyboard ${randomUUID()}`;
  let id;
  try {
    await taskPage.open();
    await taskPage.title.click();
    await taskPage.title.fill(title);
    const saved = taskPage.page.waitForResponse(r => r.url().endsWith('/tasks') && r.request().method() === 'POST');
    await taskPage.title.press('Enter');
    const response = await saved;
    expect(response.status()).toBe(201);
    id = (await response.json()).id;
    await expect(taskPage.row(title)).toBeVisible();
    await expect(taskPage.title).toBeFocused();
  } finally {
    if (id) await request.delete(`/tasks/${id}`, { headers: { Authorization: 'Bearer local-lab-token' } });
  }
});
