import { Given, Then, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber'
import { ensureBrowser, shutdownBrowser, getPage } from './support/browser.js'

setDefaultTimeout(60_000)

BeforeAll(async () => {
  await ensureBrowser()
})

AfterAll(async () => {
  await shutdownBrowser()
})

Given('I open the app', async function () {
  const base = process.env.E2E_BASE_URL || 'http://localhost:4173'
  await getPage().goto(base + '/')
})

Then('I should see text {string}', async function (text) {
  const locator = getPage().getByText(text, { exact: false })
  await locator.first().waitFor({ state: 'visible' })
})
