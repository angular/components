import {AppPage} from './app.po';
import {screenshot} from '../screenshot';

describe('screenshot scenes for each component', () => {
  // These tests simply serve as a convenient way to take snapshots of different pages,
  // they are not actually testing anything
  let page: AppPage;

  const components = [
    'autocomplete',
    'badge',
    'bottom-sheet',
    'button',
    'button-toggle',
    'checkbox',
    'chips',
    'datepicker',
    'divider',
    'expansion',
    'grid-list',
    'input',
    'menu',
    'paginator',
    'progress-bar',
    'progress-spinner',
    'radio',
    'ripple',
    'select',
    'slide-toggle',
    'slider',
    'stepper',
    'snack-bar',
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
