import { test, expect } from '../fixtures/test.js';
import { randomUUID } from 'node:crypto';

test('create a task and retain it after reload @smoke', async ({ taskPage, request }) => {
  const title = `Plant ${randomUUID()}`;
  let id;
  try {
    await taskPage.open();
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
    if (id) await request.delete(`/tasks/${id}`, { headers: { Authorization: 'Bearer local-lab-token' } });
  }
});

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

test('remove a task and verify it stays removed', async ({ taskPage, seededTask, request }) => {
  await taskPage.open();
  await taskPage.remove(seededTask.title);
  await expect(taskPage.row(seededTask.title)).toHaveCount(0);
  await taskPage.page.reload();
  await expect(taskPage.row(seededTask.title)).toHaveCount(0);
  const response = await request.get(`/tasks/${seededTask.id}`, { headers: { Authorization: 'Bearer local-lab-token' } });
  expect(response.status()).toBe(404);
});

for (const title of ['', '   ']) {
  test(`reject blank input ${JSON.stringify(title)}`, async ({ taskPage }) => {
    await taskPage.open();
    await taskPage.addTask(title);
    await expect(taskPage.error).toHaveText('Enter a task title.');
    await expect(taskPage.title).toBeFocused();
  });
}

test('reject a title over the boundary', async ({ taskPage }) => {
  await taskPage.open();
  await taskPage.addTask('x'.repeat(121));
  await expect(taskPage.error).toHaveText('Use 120 characters or fewer.');
});

test('show a useful error when the API cannot save', async ({ taskPage }) => {
  await taskPage.page.route('**/tasks', route => route.request().method() === 'POST'
    ? route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Unavailable"}' }) : route.continue());
  await taskPage.open();
  await taskPage.addTask('Keep this draft');
  await expect(taskPage.error).toHaveText('Task could not be saved. Try again.');
  await expect(taskPage.title).toHaveValue('Keep this draft');
  await expect(taskPage.row('Keep this draft')).toHaveCount(0);
});

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
