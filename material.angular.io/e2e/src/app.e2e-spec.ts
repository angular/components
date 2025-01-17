import {MaterialDocsAppPage} from './app.po';
import {browser, logging} from 'protractor';

describe('Material Docs App', () => {
  let page: MaterialDocsAppPage;

  beforeEach(() => {
    page = new MaterialDocsAppPage();
  });

  it('should display welcome message', async () => {
    await page.navigateTo();
    expect(await page.getTitleText()).toEqual('Angular Material');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
