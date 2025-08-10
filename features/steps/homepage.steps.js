import { Given, Then, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium } from 'playwright'

setDefaultTimeout(60_000)

let browser
let context
let page

BeforeAll(async () => {
  browser = await chromium.launch()
  context = await browser.newContext()
  page = await context.newPage()
})

AfterAll(async () => {
  await page?.close()
  await context?.close()
  await browser?.close()
})

Given('I open the app', async function () {
  const base = process.env.E2E_BASE_URL || 'http://localhost:4173'
  await page.goto(base + '/')
})

Then('I should see text {string}', async function (text) {
  const locator = page.getByText(text, { exact: false })
  await locator.first().waitFor({ state: 'visible' })
})
