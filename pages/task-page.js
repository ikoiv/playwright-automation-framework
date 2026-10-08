// Keep UI actions here and expected outcomes in the tests that use this page object.
export class TaskPage {
  constructor(page) {
    this.page = page;
    // Accessible roles/names describe the UI contract without depending on CSS layout.
    this.title = page.getByRole('textbox', { name: 'New task' });
    this.add = page.getByRole('button', { name: 'Add task', exact: true });
    this.error = page.getByRole('alert');
    this.status = page.getByRole('status');
  }
  async open() { await this.page.goto('/'); }
  async addTask(title) { await this.title.fill(title); await this.add.click(); }
  // Scope a row by its exact checkbox name so parallel tests can share the task list.
  row(title) { return this.page.getByRole('listitem').filter({ has: this.page.getByRole('checkbox', { name: title, exact: true }) }); }
  checkbox(title) { return this.page.getByRole('checkbox', { name: title, exact: true }); }
  async remove(title) { await this.page.getByRole('button', { name: `Remove ${title}`, exact: true }).click(); }
}
