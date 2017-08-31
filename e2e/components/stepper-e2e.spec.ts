import {
  browser, by, element, ElementFinder, ExpectedConditions
} from 'protractor';
import {expectFocusOn, expectToExist} from '../util/asserts';
import {pressKeys} from '../util/actions';
import {Key} from 'selenium-webdriver';
import {screenshot} from '../screenshot';

fdescribe('stepper', () => {
  beforeEach(() => browser.get('/stepper'));

  it('should render a stepper', () => {
    expectToExist('md-horizontal-stepper');
    screenshot('md-horizontal-stepper');
  });

  describe('basic behavior', () => {
    it('should change steps correctly when stepper button is clicked', async () => {
      let previousButton = element.all(by.buttonText('Back'));
      let nextButton = element.all(by.buttonText('Next'));

      expect(element(by.css('md-step-header[aria-selected="true"]')).getText()).toBe('1\nStep one');

      screenshot('start');
      nextButton.get(0).click();

      expect(element(by.css('md-step-header[aria-selected="true"]')).getText()).toBe('2\nStep two');

      await browser.wait(ExpectedConditions.not(
          ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));
      screenshot('click next');

      previousButton.get(0).click();

      expect(element(by.css('md-step-header[aria-selected="true"]')).getText()).toBe('1\nStep one');

      await browser.wait(ExpectedConditions.not(
          ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));
      screenshot('click back');
    });

    it('should change focus with keyboard interaction', () => {
      let stepHeaders = element.all(by.css('md-step-header'));
      stepHeaders.get(0).click();

      expectFocusOn(stepHeaders.get(0));

      pressKeys(Key.RIGHT);
      expectFocusOn(stepHeaders.get(1));

      pressKeys(Key.RIGHT);
      expectFocusOn(stepHeaders.get(2));

      pressKeys(Key.RIGHT);
      expectFocusOn(stepHeaders.get(0));

      pressKeys(Key.LEFT);
      expectFocusOn(stepHeaders.get(2));

      pressKeys(Key.SPACE, Key.ENTER);
      expectFocusOn(stepHeaders.get(2));
    });
  });

  describe('linear stepper', () => {
    let linearButton: ElementFinder;

    beforeEach(() => {
      linearButton = element(by.id('toggle-linear'));
      linearButton.click();
    });

    it('should not move to next step when stepper button is clicked', () => {
      let nextButton = element.all(by.buttonText('Next'));
      nextButton.get(0).click();

      expect(element(by.css('md-step-header[aria-selected="true"]')).getText()).toBe('1\nStep one');
    });
  });
});
