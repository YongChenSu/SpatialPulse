import { expect, test } from '@playwright/test'

test('renders the Cesium campus without stopping the render loop', async ({ page }, testInfo) => {
  const runtimeErrors: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.stack ?? error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('response', (response) => {
    const contentType = response.headers()['content-type'] ?? ''
    if (!response.ok() || (contentType.includes('text/html') && !response.url().endsWith('/gis'))) {
      runtimeErrors.push(`Unexpected response ${response.status()} ${contentType}: ${response.url()}`)
    }
  })

  await page.goto('/gis')
  await expect(page.locator('.campus-map canvas')).toBeVisible()
  await expect(page.getByRole('button', { name: '營運深色圖' })).toHaveClass(/active/)
  await expect(page.getByText('OPERATIONS MAP · CARTO / OSM')).toBeVisible()
  await page.waitForTimeout(3_000)
  await page.getByRole('button', { name: '正射影像' }).click()
  await page.waitForTimeout(2_000)

  const errorPanel = page.locator('.cesium-widget-errorPanel')
  if (await errorPanel.isVisible()) {
    runtimeErrors.push(await errorPanel.innerText())
  }
  await testInfo.attach('runtime-errors', { body: runtimeErrors.join('\n\n') || 'none', contentType: 'text/plain' })

  expect(runtimeErrors).toEqual([])
  await expect(errorPanel).toBeHidden()
})
