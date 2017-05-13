import {browser, by, element, Key} from 'protractor';
import {pressKeys} from '../../util/actions';


describe('autocomplete', () => {
  describe('searching elements', () => {
    beforeEach(() => browser.get('/autocomplete'));

    it('should show options when user types', () => {
      let input = element(by.id('search-input'));
      input.sendKeys('Ala');
      element(by.className('mat-autocomplete-panel')).all(by.className('search-item'))
        .count()
        .then((size: number) => {
          expect(size).toBe(2);
        });
    });

    it('should update options on more specific search', () => {
      let input = element(by.id('search-input'));
      input.sendKeys('Alabama');
      element(by.className('mat-autocomplete-panel')).all(by.className('search-item'))
        .count()
        .then((size: number) => {
          expect(size).toBe(1);
        });
    });
  });

  describe('complete search', () => {
    beforeEach(() => browser.get('/autocomplete'));

    it('should complete input on enter', () => {
      let input = element(by.id('search-input'));
      input.sendKeys('Alabam');
      pressKeys(Key.DOWN, Key.ENTER);
      expect(input.getAttribute('value')).toBe('Alabama');
    });
  });

  describe('complete visualization', () => {
    beforeEach(() => browser.get('/autocomplete'));

    it('should have selected class', () => {
      let input = element(by.id('search-input'));
      input.sendKeys('Ala');
      pressKeys(Key.DOWN);
      element(by.className('mat-autocomplete-panel')).all(by.className('mat-active'))
          .count()
          .then((size: number) => {
            expect(size).toBe(1);
          });
    });
  });
});
