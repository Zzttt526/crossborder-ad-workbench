import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '广告自动化工作台' })).toBeVisible();
});

test('成功场景会跨页更新 Campaign 状态和操作日志', async ({ page }) => {
  await page.getByRole('link', { name: '自动化规则' }).click();
  const ruleRow = page.getByRole('row').filter({ hasText: '美国凌晨低效停投' });
  await ruleRow.getByRole('button', { name: '模拟执行' }).click();
  await expect(page.getByText('自动化任务执行成功')).toBeVisible();
  await page.getByRole('button', { name: '完成' }).click();

  await page.getByRole('link', { name: '广告管理' }).click();
  await expect(page.getByRole('row').filter({ hasText: 'US-Product-A' })).toContainText('已暂停');

  await page.getByRole('link', { name: '操作日志' }).click();
  const newestLog = page.getByRole('row').filter({ hasText: 'US-Product-A' }).first();
  await expect(newestLog).toContainText('模拟任务');
  await expect(newestLog).toContainText('Campaign 已暂停并完成状态验证');
});

test('失败与人工优先场景有稳定可复现的结果', async ({ page }) => {
  await page.getByRole('link', { name: '自动化规则' }).click();

  const failureRule = page.getByRole('row').filter({ hasText: 'Google 低效时段停投' });
  await failureRule.getByRole('button', { name: '模拟执行' }).click();
  await expect(page.getByText('自动关闭失败')).toBeVisible();
  await expect(page.getByText('广告平台接口超时，已完成 3 次重试')).toBeVisible();
  await page.getByRole('button', { name: '完成' }).click();

  const skipRule = page.getByRole('row').filter({ hasText: '人工暂停保护验证' });
  await skipRule.getByRole('button', { name: '模拟执行' }).click();
  await expect(page.getByText('任务已安全跳过')).toBeVisible();
  await expect(page.getByText('检测到 Campaign 由运营人员手动暂停，本次自动开启已跳过')).toBeVisible();
});

test('重置演示数据会恢复三条固定规则', async ({ page }) => {
  await page.getByRole('button', { name: '重置演示' }).click();
  await page.getByRole('button', { name: '确认重置' }).click();
  await expect(page.getByText('演示数据已恢复到初始状态')).toBeVisible();
  await page.getByRole('link', { name: '自动化规则' }).click();
  await expect(page.getByText('规则总数').locator('..')).toContainText('3');
});

test('五个核心页面可访问、无控制台错误且没有页面级横向溢出', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  const pages = [
    { path: '/', heading: '广告自动化工作台', screenshot: 'page-dashboard' },
    { path: '/campaigns', heading: '广告管理', screenshot: 'page-campaigns' },
    { path: '/automation', heading: '自动化规则', screenshot: 'page-automation' },
    { path: '/analytics', heading: '时段效果分析', screenshot: 'page-analytics' },
    { path: '/logs', heading: '操作日志', screenshot: 'page-logs' },
  ];

  await page.setViewportSize({ width: 1366, height: 768 });
  for (const item of pages) {
    await page.goto(item.path);
    await expect(page.getByRole('heading', { name: item.heading }).first()).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `output/playwright/screenshots/${item.screenshot}.png`,
      fullPage: true,
    });
  }

  expect(consoleErrors).toEqual([]);
});

for (const viewport of [
  { width: 1366, height: 768, name: 'dashboard-1366x768' },
  { width: 1920, height: 1080, name: 'dashboard-1920x1080' },
]) {
  test(`Dashboard 在 ${viewport.width}×${viewport.height} 下可用`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await expect(page.getByRole('heading', { name: '凌晨预算正在低回报时段持续消耗' })).toBeVisible();
    await expect(page.getByText('自动化脉冲')).toBeVisible();
    await page.waitForTimeout(1_600);
    await page.screenshot({
      path: `output/playwright/screenshots/${viewport.name}.png`,
      fullPage: true,
    });
  });
}
