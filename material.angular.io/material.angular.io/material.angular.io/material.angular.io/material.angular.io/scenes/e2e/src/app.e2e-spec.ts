import {AppPage} from './app.po';
import {screenshot} from '../screenshot';

describe('screenshot scenes for each component', () => {
  // These tests simply serve as a convenient way to take snapshots of different pages,
  // they are not actually testing anything
  let page: AppPage;

  const components = ['input',
                      'ripple',
                      'slider',
                      'button-toggle',
                      'slide-toggle',
                      'divider',
                      'progress-spinner',
                      'button',
                      'datepicker',
                      'checkbox',
                      'chips',
                      'progress-bar',
                      'stepper',
                      'radio',
                      'menu',
                      'badge',
                      'paginator'];
  beforeEach(() => {
    page = new AppPage();
  });

  for (const comp of components) {
    it(`screenshot for ${comp} scene`, async () => {
      await page.navigateTo(comp);
      await screenshot(comp);
    });
  }
});
