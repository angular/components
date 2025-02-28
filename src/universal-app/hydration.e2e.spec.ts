import {browser, by, element, ExpectedConditions} from 'protractor';

// Expect `ngDevMode` to be always set:
declare const ngDevMode: {
  hydratedComponents: number;
  componentsSkippedHydration: number;
};

describe('hydration e2e', () => {
  beforeEach(async () => {
    await browser.waitForAngularEnabled(false);
    await browser.get('/');
    await browser.wait(ExpectedConditions.presenceOf(element(by.css('.render-marker'))), 5000);
  });

  it('should enable hydration', async () => {
    const hydrationState = await getHydrationState();
    const logs = await browser.manage().logs().get('browser');

    expect(hydrationState.hydratedComponents).toBeGreaterThan(0);
    expect(logs.map(log => log.message).filter(msg => msg.includes('NG0500'))).toEqual([]);
  });

  it('should not skip hydration on any components', async () => {
    const hydrationState = await getHydrationState();
    expect(hydrationState.componentsSkippedHydration).toBe(0);
  });
});

/** Gets the hydration state from the current app. */
async function getHydrationState() {
  return browser.executeScript<{
    hydratedComponents: number;
    componentsSkippedHydration: number;
  }>(() => ({
    hydratedComponents: ngDevMode.hydratedComponents,
    componentsSkippedHydration: ngDevMode.componentsSkippedHydration,
  }));
}
