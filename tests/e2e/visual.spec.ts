import { expect, test } from '@playwright/test'

test('操作台載入、debug 安全且沒有橫向溢出', async ({ page }, testInfo) => {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/')
  await expect(page.getByTestId('broker-status')).toHaveText('已連線', { timeout: 20_000 })
  await expect(page.getByRole('heading', { name: 'IoT 現場監控與控制中心' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '即時感測與現場控制' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '兩端必須使用同一份正式合約' })).toBeVisible()
  await expect(page.getByRole('link', { name: '開啟完整板端程式' })).toHaveAttribute(
    'href',
    /device\/03_futurelite_full_console\.py$/,
  )
  await expect(page.getByRole('link', { name: '開啟伴虎更新提示' })).toHaveAttribute(
    'href',
    /docs\/PANGHU_FINAL_SYNC_PROMPT\.md$/,
  )
  await expect(page.getByRole('heading', { name: 'Soil 原始數值' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'LED 雙向控制' })).toBeVisible()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)

  await expect.poll(async () => page.evaluate(() => window.__TOOL_DEBUG__)).not.toBeNull()
  const debug = await page.evaluate(() => window.__TOOL_DEBUG__)
  expect(debug).toMatchObject({ route: '/', commandStatus: 'idle' })
  expect(debug?.channelCounts).toBeTruthy()
  expect(JSON.stringify(debug)).not.toMatch(/password|token|api.?key|provider|proxy|prompt/i)

  await page.screenshot({
    path: `verification/${testInfo.project.name}-dashboard.png`,
    fullPage: true,
  })

  expect(consoleErrors).toEqual([])
  expect(pageErrors).toEqual([])
})

test('手動斷線及重新連線控制可操作', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '手動斷線' }).click()
  await expect(page.getByTestId('broker-status')).toHaveText('已斷線')
  await page.getByRole('button', { name: '重新連線' }).click()
  await expect(page.getByTestId('broker-status')).toHaveText(/連線中|重連中|已連線/)
})
