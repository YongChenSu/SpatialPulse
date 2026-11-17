import { expect, test } from '@playwright/test'

test('renders the Cesium city scene without stopping the render loop', async ({ page }, testInfo) => {
  test.setTimeout(60_000)
  const runtimeErrors: string[] = []
  const upstreamWarnings: string[] = []
  const forbiddenTileRequests: string[] = []
  const cadastralI3sRequests: string[] = []
  const contextI3sRequests: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.stack ?? error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) {
      runtimeErrors.push(message.text())
    }
  })
  page.on('response', (response) => {
    const contentType = response.headers()['content-type'] ?? ''
    const url = new URL(response.url())
    const isApplicationResponse = url.origin === 'http://127.0.0.1:5173'
    const isMissingNlscTexture = response.status() === 406
      && url.hostname === 'i3s.nlsc.gov.tw'
      && url.pathname.includes('/textures/')
    if (isMissingNlscTexture) {
      upstreamWarnings.push(`Optional upstream texture is unavailable: ${response.url()}`)
      return
    }
    if (!response.ok() || (isApplicationResponse && contentType.includes('text/html') && url.pathname !== '/gis')) {
      runtimeErrors.push(`Unexpected response ${response.status()} ${contentType}: ${response.url()}`)
    }
  })
  page.on('request', (request) => {
    if (request.url().includes('basemaps.cartocdn.com')) forbiddenTileRequests.push(request.url())
    if (request.url().includes('127.0.0.1:4174') || request.url().includes('CB_2025_20250825')) {
      cadastralI3sRequests.push(request.url())
    }
    if (request.url().includes('127.0.0.1:4175') || request.url().includes('i3s.nlsc.gov.tw/building/i3s/SceneServer/layers/30')) {
      contextI3sRequests.push(request.url())
    }
  })

  await page.goto('/gis')
  await expect(page.locator('.city-scene canvas')).toBeVisible()
  await expect(page.getByRole('checkbox', { name: /3D 建築/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: '地理位置圖' })).toHaveClass(/active/)
  await expect(page.getByText('REAL-WORLD GIS · NLSC EMAP16')).toBeVisible()
  await expect(page.locator('.gis-commandbar__status b')).toContainText('街廓尺度')
  await expect(page.getByRole('checkbox', { name: /全市背景建物/ })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: /2025 產權建物/ })).toBeChecked()
  await expect(page.getByText('2025 產權建物 I3S 已載入')).toBeVisible({ timeout: 30_000 })
  await expect.poll(() => cadastralI3sRequests.length).toBeGreaterThan(0)
  await expect.poll(() => contextI3sRequests.length).toBeGreaterThan(0)
  await page.getByRole('button', { name: '正射影像' }).click()
  await page.waitForTimeout(2_000)
  await expect(page.getByText('REAL-WORLD GIS · NLSC PHOTO2')).toBeVisible()

  const errorPanel = page.locator('.cesium-widget-errorPanel')
  if (await errorPanel.isVisible()) {
    runtimeErrors.push(await errorPanel.innerText())
  }
  await testInfo.attach('runtime-errors', { body: runtimeErrors.join('\n\n') || 'none', contentType: 'text/plain' })
  await testInfo.attach('upstream-warnings', { body: upstreamWarnings.join('\n') || 'none', contentType: 'text/plain' })

  expect(runtimeErrors).toEqual([])
  expect(forbiddenTileRequests).toEqual([])
  await expect(errorPanel).toBeHidden()
})
