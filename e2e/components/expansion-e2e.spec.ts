import {browser, by, element} from 'protractor';
import {screenshot} from '../screenshot';

describe('expansion', () => {

  beforeEach(() => browser.get('/expansion'));

  it('should show an expansion panel', async () => {
    expect(element(by.css('.mat-expansion-panel'))).toBeDefined();
    screenshot();
  });

  it('should hide contents of the expansion panel on click', async () => {
    const panelHeader = element.all(by.css('.mat-expansion-panel-header')).get(0);
    const panelContent = element.all(by.css('.mat-expansion-panel-content')).get(0);

    expect(await panelContent.isDisplayed()).toBe(false);

    panelHeader.click();

    expect(await panelContent.isDisplayed()).toBe(true);
  });
});

