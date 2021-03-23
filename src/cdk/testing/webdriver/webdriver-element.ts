/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  _getTextWithExcludedElements,
  ElementDimensions,
  EventData,
  ModifierKeys,
  TestElement,
  TestKey,
  TextOptions
} from '@angular/cdk/testing';
import {Button, By, Key, WebElement} from 'selenium-webdriver';

/**
 * Maps the `TestKey` constants to WebDriver's `Key` constants.
 * See https://github.com/SeleniumHQ/selenium/blob/trunk/javascript/webdriver/key.js#L29
 */
const keyMap = {
  [TestKey.BACKSPACE]: Key.BACK_SPACE,
  [TestKey.TAB]: Key.TAB,
  [TestKey.ENTER]: Key.ENTER,
  [TestKey.SHIFT]: Key.SHIFT,
  [TestKey.CONTROL]: Key.CONTROL,
  [TestKey.ALT]: Key.ALT,
  [TestKey.ESCAPE]: Key.ESCAPE,
  [TestKey.PAGE_UP]: Key.PAGE_UP,
  [TestKey.PAGE_DOWN]: Key.PAGE_DOWN,
  [TestKey.END]: Key.END,
  [TestKey.HOME]: Key.HOME,
  [TestKey.LEFT_ARROW]: Key.ARROW_LEFT,
  [TestKey.UP_ARROW]: Key.ARROW_UP,
  [TestKey.RIGHT_ARROW]: Key.ARROW_RIGHT,
  [TestKey.DOWN_ARROW]: Key.ARROW_DOWN,
  [TestKey.INSERT]: Key.INSERT,
  [TestKey.DELETE]: Key.DELETE,
  [TestKey.F1]: Key.F1,
  [TestKey.F2]: Key.F2,
  [TestKey.F3]: Key.F3,
  [TestKey.F4]: Key.F4,
  [TestKey.F5]: Key.F5,
  [TestKey.F6]: Key.F6,
  [TestKey.F7]: Key.F7,
  [TestKey.F8]: Key.F8,
  [TestKey.F9]: Key.F9,
  [TestKey.F10]: Key.F10,
  [TestKey.F11]: Key.F11,
  [TestKey.F12]: Key.F12,
  [TestKey.META]: Key.META
};

/** Converts a `ModifierKeys` object to a list of Protractor `Key`s. */
function toWebDriverModifierKeys(modifiers: ModifierKeys): string[] {
  const result: string[] = [];
  if (modifiers.control) {
    result.push(Key.CONTROL);
  }
  if (modifiers.alt) {
    result.push(Key.ALT);
  }
  if (modifiers.shift) {
    result.push(Key.SHIFT);
  }
  if (modifiers.meta) {
    result.push(Key.META);
  }
  return result;
}

/** A `TestElement` implementation for WebDriver. */
export class WebdriverElement implements TestElement {
  constructor(private readonly _webElement: () => WebElement) {}

  async blur(): Promise<void> {
    return this._executeScript(((element: HTMLElement) => element.blur()), this._webElement());
  }

  async clear(): Promise<void> {
    return this._webElement().clear();
  }

  async click(...args: [ModifierKeys?] | ['center', ModifierKeys?] |
      [number, number, ModifierKeys?]): Promise<void> {
    await this._dispatchClickEventSequence(args, Button.LEFT);
  }

  async rightClick(...args: [ModifierKeys?] | ['center', ModifierKeys?] |
      [number, number, ModifierKeys?]): Promise<void> {
    await this._dispatchClickEventSequence(args, Button.RIGHT);
  }

  async focus(): Promise<void> {
    return this._executeScript((element: HTMLElement) => element.blur(), this._webElement());
  }

  async getCssValue(property: string): Promise<string> {
    return this._webElement().getCssValue(property);
  }

  async hover(): Promise<void> {
    return this._actions().mouseMove(this._webElement()).perform();
  }

  async mouseAway(): Promise<void> {
    return this._actions().mouseMove(this._webElement(), {x: -1, y: -1}).perform();
  }

  async sendKeys(...keys: (string | TestKey)[]): Promise<void>;
  async sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]): Promise<void>;
  async sendKeys(...modifiersAndKeys: any[]): Promise<void> {
    const first = modifiersAndKeys[0];
    let modifiers: ModifierKeys;
    let rest: (string | TestKey)[];
    if (typeof first !== 'string' && typeof first !== 'number') {
      modifiers = first;
      rest = modifiersAndKeys.slice(1);
    } else {
      modifiers = {};
      rest = modifiersAndKeys;
    }

    const modifierKeys = toWebDriverModifierKeys(modifiers);
    const keys = rest.map(k => typeof k === 'string' ? k.split('') : [keyMap[k]])
        .reduce((arr, k) => arr.concat(k), [])
        // Key.chord doesn't work well with geckodriver (mozilla/geckodriver#1502),
        // so avoid it if no modifier keys are required.
        .map(k => modifierKeys.length > 0 ? Key.chord(...modifierKeys, k) : k);

    return this._webElement().sendKeys(...keys);
  }

  async text(options?: TextOptions): Promise<string> {
    if (options?.exclude) {
      return this._executeScript(_getTextWithExcludedElements, this._webElement(), options.exclude);
    }
    return this._webElement().getText();
  }

  async getAttribute(name: string): Promise<string|null> {
    return this._executeScript(
        (element: Element, attribute: string) => element.getAttribute(attribute),
        this._webElement(), name);
  }

  async hasClass(name: string): Promise<boolean> {
    const classes = (await this.getAttribute('class')) || '';
    return new Set(classes.split(/\s+/).filter(c => c)).has(name);
  }

  async getDimensions(): Promise<ElementDimensions> {
    const {width, height} = await this._webElement().getSize();
    const {x: left, y: top} = await this._webElement().getLocation();
    return {width, height, left, top};
  }

  async getProperty(name: string): Promise<any> {
    return this._executeScript(
        (element: Element, property: keyof Element) => element[property],
        this._webElement(), name);
  }

  async setInputValue(newValue: string): Promise<void> {
    return this._executeScript(
        (element: HTMLInputElement, value: string) => element.value = value,
        this._webElement(), newValue);
  }

  async selectOptions(...optionIndexes: number[]): Promise<void> {
    const options = await this._webElement().findElements(By.css('option'));
    const indexes = new Set(optionIndexes); // Convert to a set to remove duplicates.

    if (options.length && indexes.size) {
      // Reset the value so all the selected states are cleared. We can
      // reuse the input-specific method since the logic is the same.
      await this.setInputValue('');

      for (let i = 0; i < options.length; i++) {
        if (indexes.has(i)) {
          // We have to hold the control key while clicking on options so that multiple can be
          // selected in multi-selection mode. The key doesn't do anything for single selection.
          await this._actions().keyDown(Key.CONTROL).perform();
          await options[i].click();
          await this._actions().keyUp(Key.CONTROL).perform();
        }
      }
    }
  }

  async matchesSelector(selector: string): Promise<boolean> {
    return this._executeScript((element: Element, s: string) =>
        (Element.prototype.matches || (Element.prototype as any).msMatchesSelector)
            .call(element, s),
        this._webElement(), selector);
  }

  async isFocused(): Promise<boolean> {
    return WebElement.equals(
        this._webElement(), this._webElement().getDriver().switchTo().activeElement());
  }

  async dispatchEvent(name: string, data?: Record<string, EventData>): Promise<void> {
    return this._executeScript(_dispatchEvent, name, this._webElement(), data);
  }

  private _actions() {
    return this._webElement().getDriver().actions();
  }

  private async _executeScript<T>(script: Function, ...var_args: any[]): Promise<T> {
    return this._webElement().getDriver().executeScript(script, ...var_args);
  }

  /** Dispatches all the events that are part of a click event sequence. */
  private async _dispatchClickEventSequence(
      args: [ModifierKeys?] | ['center', ModifierKeys?] | [number, number, ModifierKeys?],
      button: string) {
    let modifiers: ModifierKeys = {};
    if (args.length && typeof args[args.length - 1] === 'object') {
      modifiers = args.pop() as ModifierKeys;
    }
    const modifierKeys = toWebDriverModifierKeys(modifiers);

    // Omitting the offset argument to mouseMove results in clicking the center.
    // This is the default behavior we want, so we use an empty array of offsetArgs if
    // no args remain after popping the modifiers from the args passed to this function.
    const offsetArgs = (args.length === 2 ?
        [{x: args[0], y: args[1]}] : []) as [{x: number, y: number}];

    let actions = this._actions().mouseMove(this._webElement(), ...offsetArgs);

    for (const modifierKey of modifierKeys) {
      actions = actions.keyDown(modifierKey);
    }
    actions = actions.click(button);
    for (const modifierKey of modifierKeys) {
      actions = actions.keyUp(modifierKey);
    }

    await actions.perform();
  }
}

/**
 * Dispatches an event with a particular name and data to an element.
 * Note that this needs to be a pure function, because it gets stringified by
 * Protractor and is executed inside the browser.
 */
function _dispatchEvent(name: string, element: Element, data?: Record<string, EventData>) {
  const event = document.createEvent('Event');
  event.initEvent(name);

  if (data) {
    // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the original object.
    Object.assign(event, data);
  }

  element.dispatchEvent(event);
}
