import { chromium } from 'playwright'

let browser
let context
let page
const requests = []

export async function ensureBrowser() {
  if (!browser) {
    browser = await chromium.launch()
    context = await browser.newContext()
    page = await context.newPage()
    // Record all requests for later assertions
    page.on('request', req => {
      const url = req.url()
      const method = req.method()
      requests.push({ url, method })
    })
  }
  return { browser, context, page }
}

export function getPage() {
  if (!page) throw new Error('Page not initialized. Call ensureBrowser() first.')
  return page
}

export async function shutdownBrowser() {
  await page?.close()
  await context?.close()
  await browser?.close()
  browser = undefined
  context = undefined
  page = undefined
}

export function clearRequests() {
  requests.length = 0
}

export function getRequests() {
  return requests.slice()
}
