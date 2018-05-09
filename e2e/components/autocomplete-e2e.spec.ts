import {browser, by, element} from 'protractor';
import {screenshot} from '../screenshot';
import {expectToExist} from '../util/index';


describe('autocomplete', () => {
  const autocompletePanelSelector = '.mat-autocomplete-panel';
  let page: AutocompletePage;

  beforeEach(() => page = new AutocompletePage());

  it('should open the panel when the input is focused', async () => {
    expectToExist(autocompletePanelSelector, false);
    page.autocompleteInput().click();

    expectToExist(autocompletePanelSelector);
    expect(await page.autocompletePanel().getText()).toEqual('One\nTwo\nThree\nFour');
    screenshot();
  });

  it('should close the panel when an option is clicked', async () => {
    page.autocompleteInput().click();
    page.option('One').click();

    expectToExist(autocompletePanelSelector, false);
    screenshot();
  });

  it('should set the selected option text to the input', async () => {
    page.autocompleteInput().click();
    page.option('One').click();

    expect(await page.getInputText()).toEqual('One');
  });

  it('should trigger filtering with proper key', async () => {
    page.autocompleteInput().sendKeys('T');

    expect(await page.autocompletePanel().getText()).toEqual('Two\nThree');
    screenshot();
  });
});

class AutocompletePage {
  constructor() {
    browser.get('/autocomplete');
  }
  autocompleteInput() {
    return element(by.id('autocomplete-input'));
  }
  autocompletePanel() {
    return element(by.css('.mat-autocomplete-panel'));
  }
  option(text: string) {
    return element(by.cssContainingText('mat-option', text));
  }
  getInputText() {
    return this.autocompleteInput().getAttribute('value');
  }
}
