import { expect, test } from '@playwright/test'

test('renders the Cesium city scene without stopping the render loop', async ({ page }, testInfo) => {
  test.setTimeout(60_000)
  const runtimeErrors: string[] = []
  const forbiddenTileRequests: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.stack ?? error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('response', (response) => {
    const contentType = response.headers()['content-type'] ?? ''
    const url = new URL(response.url())
    const isApplicationResponse = url.origin === 'http://127.0.0.1:5173'
    if (!response.ok() || (isApplicationResponse && contentType.includes('text/html') && url.pathname !== '/gis')) {
      runtimeErrors.push(`Unexpected response ${response.status()} ${contentType}: ${response.url()}`)
    }
  })
  page.on('request', (request) => {
    if (request.url().includes('basemaps.cartocdn.com')) forbiddenTileRequests.push(request.url())
  })

  await page.goto('/gis')
  await expect(page.locator('.city-scene canvas')).toBeVisible()
  await expect(page.getByRole('checkbox', { name: /3D 建築/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: '地理位置圖' })).toHaveClass(/active/)
  await expect(page.getByText('REAL-WORLD GIS · NLSC EMAP16')).toBeVisible()
  await expect(page.locator('.gis-commandbar__status b')).toContainText('街廓尺度')
  await expect(page.getByRole('checkbox', { name: /臺北官方建物/ })).toBeChecked()
  await expect(page.getByText('臺北市官方 I3S 已載入')).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: '正射影像' }).click()
  await page.waitForTimeout(2_000)
  await expect(page.getByText('REAL-WORLD GIS · NLSC PHOTO2')).toBeVisible()

  const errorPanel = page.locator('.cesium-widget-errorPanel')
  if (await errorPanel.isVisible()) {
    runtimeErrors.push(await errorPanel.innerText())
  }
  await testInfo.attach('runtime-errors', { body: runtimeErrors.join('\n\n') || 'none', contentType: 'text/plain' })

  expect(runtimeErrors).toEqual([])
  expect(forbiddenTileRequests).toEqual([])
  await expect(errorPanel).toBeHidden()
})
