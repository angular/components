import {browser, by, element, Key} from 'protractor';
import {
  expectToExist,
  expectFocusOn,
  pressKeys,
  clickElementAtPoint,
  waitForElement,
  asyncSpec,
} from '../../util/index';


describe('dialog', () => {
  beforeEach(() => browser.get('/dialog'));

  it('should open a dialog', () => {
    element(by.id('default')).click();
    expectToExist('md-dialog-container');
  });

  it('should open a template dialog', () => {
    expectToExist('.my-template-dialog', false);
    element(by.id('template')).click();
    expectToExist('.my-template-dialog');
  });

  it('should close by clicking on the backdrop', asyncSpec(async() => {
    element(by.id('default')).click();

    await waitForDialog();
    clickOnBackrop();
    expectToExist('md-dialog-container', false);
  }));

  it('should close by pressing escape', asyncSpec(async () => {
    element(by.id('default')).click();

    await waitForDialog();
    pressKeys(Key.ESCAPE);
    expectToExist('md-dialog-container', false);
  }));

  it('should close by pressing escape when the first tabbable element has lost focus',
    asyncSpec(async () => {
      element(by.id('default')).click();

      await waitForDialog();
      clickElementAtPoint('md-dialog-container', { x: 0, y: 0 });
      pressKeys(Key.ESCAPE);
      expectToExist('md-dialog-container', false);
    }));

  it('should close by clicking on the "close" button', asyncSpec(async () => {
    element(by.id('default')).click();

    await waitForDialog();
    element(by.id('close')).click();
    expectToExist('md-dialog-container', false);
  }));

  it('should focus the first focusable element', asyncSpec(async () => {
    element(by.id('default')).click();

    await waitForDialog();
    expectFocusOn('md-dialog-container input');
  }));

  it('should restore focus to the element that opened the dialog', asyncSpec(async () => {
    let openButton = element(by.id('default'));

    openButton.click();

    await waitForDialog();
    clickOnBackrop();
    expectFocusOn(openButton);
  }));

  it('should prevent tabbing out of the dialog', asyncSpec(async () => {
    element(by.id('default')).click();

    await waitForDialog();
    pressKeys(Key.TAB, Key.TAB, Key.TAB);
    expectFocusOn('#close');
  }));

  it('should be able to prevent closing by clicking on the backdrop', asyncSpec(async () => {
    element(by.id('disabled')).click();

    await waitForDialog();
    clickOnBackrop();
    expectToExist('md-dialog-container');
  }));

  it('should be able to prevent closing by pressing escape', asyncSpec(async () => {
    element(by.id('disabled')).click();

    await waitForDialog();
    pressKeys(Key.ESCAPE);
    expectToExist('md-dialog-container');
  }));

  function waitForDialog() {
    return waitForElement('md-dialog-container');
  }

  function clickOnBackrop() {
    clickElementAtPoint('.cdk-overlay-backdrop', { x: 0, y: 0 });
  }
});
