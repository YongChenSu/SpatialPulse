import { expect, test } from '@playwright/test'

test('keeps A1 and Chonghong Cloud as independent digital twins', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.stack ?? error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })

  await page.goto('/buildings/chonghong-cloud/twin')
  await expect(page.getByRole('heading', { name: '長虹雲端科技大樓', level: 1 })).toBeVisible()
  await expect(page.getByText('潭美街 533–539 號 · 110使字84')).toBeVisible()
  await expect(page.getByRole('button', { name: '全棟建築 34' })).toBeVisible()
  await expect(page.getByText('PUBLIC PROFILE · CONCEPT MODEL · SIMULATED OPERATIONS')).toBeVisible()
  await expect(page.locator('.scene canvas')).toBeVisible()
  await expect(page.getByRole('heading', { name: '全棟需量趨勢' })).toBeVisible()

  await page.getByRole('link', { name: 'A1 孿生' }).click()
  await expect(page).toHaveURL('/buildings/a1/twin')
  await expect(page.getByRole('heading', { name: '台北 A1 數據中心', level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: '全棟建築 4' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '即時用電趨勢' })).toBeVisible()

  expect(runtimeErrors).toEqual([])
})
