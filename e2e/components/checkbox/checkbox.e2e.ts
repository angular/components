import {browser, by, element, Key} from 'protractor';
import {screenshot} from '../../screenshot';

describe('checkbox', function () {

  describe('check behavior', function () {

    beforeEach(function() {
      browser.get('/checkbox');
    });

    it('should be checked when clicked, and be unchecked when clicked again', () => {
      let testName =
        'checkbox should be checked when clicked, and be unchecked when clicked again';
      let checkboxEl = element(by.id('test-checkbox'));
      let inputEl = element(by.css('input[id=input-test-checkbox]'));

      screenshot(testName);
      checkboxEl.click();
      inputEl.getAttribute('checked').then((value: string) => {
        expect(value).toBeTruthy('Expect checkbox "checked" property to be true');
      });
      screenshot(testName + ' checked');

      checkboxEl.click();
      inputEl.getAttribute('checked').then((value: string) => {
        expect(value).toBeFalsy('Expect checkbox "checked" property to be false');
      });
      screenshot(testName + ' unchecked');
    });

    it('should toggle the checkbox when pressing space', () => {
      let testName = 'checkbox should toggle the checkbox when pressing space';
      let inputEl = element(by.css('input[id=input-test-checkbox]'));

      inputEl.getAttribute('checked').then((value: string) => {
        expect(value).toBeFalsy('Expect checkbox "checked" property to be false');
        screenshot(testName);
      });

      inputEl.sendKeys(Key.SPACE);

      inputEl.getAttribute('checked').then((value: string) => {
        expect(value).toBeTruthy('Expect checkbox "checked" property to be true');
        screenshot(testName + ' pressed space');
      });
    });

  });
});
