import { createNextDescribe } from 'e2e-utils'
import { check, retry } from 'next-test-utils'
import { join } from 'path'

createNextDescribe(
  'custom-app-server-action-redirect',
  {
    files: join(__dirname, 'custom-server'),
    skipDeployment: true,
    startCommand: 'node server.js',
    dependencies: {
      'get-port': '5.1.1',
    },
  },
  ({ next }) => {
    it('redirects with basepath properly when server action handler uses `redirect`', async () => {
      const browser = await next.browser('/base')
      const getCount = async () => browser.elementByCss('#current-count').text()

      // Increase count to track if the page reloaded
      await browser.elementByCss('#increase-count').click().click()
      await retry(async () => {
        expect(await getCount()).toBe('Count: 2')
      })

      await browser.elementById('submit-server-action-redirect').click()

      expect(await browser.waitForElementByCss('#another').text()).toBe(
        'Another Page'
      )
      expect(await browser.url()).toBe(
        `http://localhost:${next.appPort}/base/another`
      )

      // Count should still be 2 as the browser should not have reloaded the page.
      expect(await getCount()).toBe('Count: 2')
    })

    it('redirects with proper cookies set from both redirect response and post respose', async () => {
      const browser = await next.browser('/base')

      await browser.elementById('submit-server-action-redirect').click()

      expect(await browser.waitForElementByCss('#another').text()).toBe(
        'Another Page'
      )
      expect(await browser.url()).toBe(
        `http://localhost:${next.appPort}/base/another`
      )
      await check(
        () => browser.eval('document.cookie'),
        /custom-server-test-cookie/
      )
      await check(
        () => browser.eval('document.cookie'),
        /custom-server-action-test-cookie/
      )
    })
  }
)
