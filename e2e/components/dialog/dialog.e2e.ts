import {browser, by, element, Key} from 'protractor';
import {E2EUtils} from '../../utils.e2e';

describe('dialog', () => {
  const utils = new E2EUtils();

  beforeEach(() => browser.get('/dialog'));

  it('should open a dialog', () => {
    element(by.id('default')).click();
    utils.expectToExist('md-dialog-container');
  });

  it('should close by clicking on the backdrop', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      clickOnBackrop();
      utils.expectToExist('md-dialog-container', false);
    });
  });

  it('should close by pressing escape', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      utils.pressKeys(Key.ESCAPE);
      utils.expectToExist('md-dialog-container', false);
    });
  });

  it('should close by clicking on the "close" button', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      element(by.id('close')).click();
      utils.expectToExist('md-dialog-container', false);
    });
  });

  it('should focus the first focusable element', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      utils.expectFocusOn('md-dialog-container input');
    });
  });

  it('should restore focus to the element that opened the dialog', () => {
    let openButton = element(by.id('default'));

    openButton.click();

    waitForDialog().then(() => {
      clickOnBackrop();
      utils.expectFocusOn(openButton);
    });
  });

  it('should prevent tabbing out of the dialog', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      let tab = Key.TAB;

      utils.pressKeys(tab, tab, tab);
      utils.expectFocusOn('#close');
    });
  });

  it('should be able to prevent closing by clicking on the backdrop', () => {
    element(by.id('disabled')).click();

    waitForDialog().then(() => {
      clickOnBackrop();
      utils.expectToExist('md-dialog-container');
    });
  });

  it('should be able to prevent closing by pressing escape', () => {
    element(by.id('disabled')).click();

    waitForDialog().then(() => {
      utils.pressKeys(Key.ESCAPE);
      utils.expectToExist('md-dialog-container');
    });
  });

  function waitForDialog() {
    return utils.waitForElement('md-dialog-container');
  }

  function clickOnBackrop() {
    utils.clickElementAtPoint('.md-overlay-backdrop', { x: 0, y: 0 });
  }
});
