import {browser} from 'protractor';

export class AppPage {
  async navigateTo(component: string): Promise<unknown> {
    return browser.get(browser.baseUrl + '/' + component);
  }
}
