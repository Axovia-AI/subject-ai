import { Given, When, Then, Before, setDefaultTimeout } from '@cucumber/cucumber'
import { ensureBrowser, getPage, clearRequests, getRequests } from './support/browser.js'

setDefaultTimeout(60_000)

Before(async () => {
  await ensureBrowser()
  clearRequests()
})

Given('I mock POST {string} to return {int} with JSON {string}', async function (path, status, jsonString) {
  const page = getPage()
  // parse JSON provided inline in feature
  let payload
  try { payload = JSON.parse(jsonString) } catch { payload = {} }
  const pattern = `**${path}`
  await page.route(pattern, async (route, request) => {
    if (request.method() !== 'POST') return route.continue()
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    })
  })
})

When('I navigate to {string}', async function (pathname) {
  const base = process.env.E2E_BASE_URL || 'http://localhost:4173'
  await getPage().goto(base + pathname)
})

When('I click the {string} button', async function (name) {
  await getPage().getByRole('button', { name, exact: false }).first().click()
})

Then('a request should have been made to {string}', async function (path) {
  const calls = getRequests()
  const hit = calls.find(r => r.url.includes(path))
  if (!hit) throw new Error(`No request matched path: ${path}. Seen: ${calls.map(c => c.url).join(', ')}`)
})
