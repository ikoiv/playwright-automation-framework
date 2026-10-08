export class TaskPage {
  constructor(page) {
    this.page = page;
    this.title = page.getByRole('textbox', { name: 'New task' });
    this.add = page.getByRole('button', { name: 'Add task', exact: true });
    this.error = page.getByRole('alert');
    this.status = page.getByRole('status');
  }
  async open() { await this.page.goto('/'); }
  async addTask(title) { await this.title.fill(title); await this.add.click(); }
  row(title) { return this.page.getByRole('listitem').filter({ has: this.page.getByRole('checkbox', { name: title, exact: true }) }); }
  checkbox(title) { return this.page.getByRole('checkbox', { name: title, exact: true }); }
  async remove(title) { await this.page.getByRole('button', { name: `Remove ${title}`, exact: true }).click(); }
}
