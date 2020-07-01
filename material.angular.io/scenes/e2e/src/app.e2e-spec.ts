import {AppPage} from './app.po';
import {screenshot} from '../screenshot';

describe('screenshot scenes for each component', () => {
  // These tests simply serve as a convenient way to take snapshots of different pages,
  // they are not actually testing anything
  let page: AppPage;

  const components = [
      'badge',
      'bottom-sheet',
      'button',
      'button-toggle',
      'checkbox',
      'chips',
      'datepicker',
      'divider',
      'input',
      'menu',
      'paginator',
      'progress-bar',
      'progress-spinner',
      'radio',
      'ripple',
      'slide-toggle',
      'slider',
      'stepper',
  ];

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
