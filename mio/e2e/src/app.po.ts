import {browser, by, element} from 'protractor';

export class MaterialDocsAppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getTitleText() {
    return element(by.css('app-homepage header .docs-header-headline .mat-h1'))
      .getText() as Promise<string>;
  }
}
