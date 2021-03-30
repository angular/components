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
import * as webdriver from 'selenium-webdriver';
import {getWebDriverModifierKeys, webDriverKeyMap} from './webdriver-keys';

/** A `TestElement` implementation for WebDriver. */
export class WebDriverElement implements TestElement {
  constructor(readonly element: () => webdriver.WebElement) {}

  async blur(): Promise<void> {
    return this._executeScript(((element: HTMLElement) => element.blur()), this.element());
  }

  async clear(): Promise<void> {
    return this.element().clear();
  }

  async click(...args: [ModifierKeys?] | ['center', ModifierKeys?] |
      [number, number, ModifierKeys?]): Promise<void> {
    await this._dispatchClickEventSequence(args, webdriver.Button.LEFT);
  }

  async rightClick(...args: [ModifierKeys?] | ['center', ModifierKeys?] |
      [number, number, ModifierKeys?]): Promise<void> {
    await this._dispatchClickEventSequence(args, webdriver.Button.RIGHT);
  }

  async focus(): Promise<void> {
    return this._executeScript((element: HTMLElement) => element.blur(), this.element());
  }

  async getCssValue(property: string): Promise<string> {
    return this.element().getCssValue(property);
  }

  async hover(): Promise<void> {
    return this._actions().mouseMove(this.element()).perform();
  }

  async mouseAway(): Promise<void> {
    return this._actions().mouseMove(this.element(), {x: -1, y: -1}).perform();
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

    const modifierKeys = getWebDriverModifierKeys(modifiers);
    const keys = rest.map(k => typeof k === 'string' ? k.split('') : [webDriverKeyMap[k]])
        .reduce((arr, k) => arr.concat(k), [])
        // webdriver.Key.chord doesn't work well with geckodriver (mozilla/geckodriver#1502),
        // so avoid it if no modifier keys are required.
        .map(k => modifierKeys.length > 0 ? webdriver.Key.chord(...modifierKeys, k) : k);

    return this.element().sendKeys(...keys);
  }

  async text(options?: TextOptions): Promise<string> {
    if (options?.exclude) {
      return this._executeScript(_getTextWithExcludedElements, this.element(), options.exclude);
    }
    return this.element().getText();
  }

  async getAttribute(name: string): Promise<string|null> {
    return this._executeScript(
        (element: Element, attribute: string) => element.getAttribute(attribute),
        this.element(), name);
  }

  async hasClass(name: string): Promise<boolean> {
    const classes = (await this.getAttribute('class')) || '';
    return new Set(classes.split(/\s+/).filter(c => c)).has(name);
  }

  async getDimensions(): Promise<ElementDimensions> {
    const {width, height} = await this.element().getSize();
    const {x: left, y: top} = await this.element().getLocation();
    return {width, height, left, top};
  }

  async getProperty(name: string): Promise<any> {
    return this._executeScript(
        (element: Element, property: keyof Element) => element[property],
        this.element(), name);
  }

  async setInputValue(newValue: string): Promise<void> {
    return this._executeScript(
        (element: HTMLInputElement, value: string) => element.value = value,
        this.element(), newValue);
  }

  async selectOptions(...optionIndexes: number[]): Promise<void> {
    const options = await this.element().findElements(webdriver.By.css('option'));
    const indexes = new Set(optionIndexes); // Convert to a set to remove duplicates.

    if (options.length && indexes.size) {
      // Reset the value so all the selected states are cleared. We can
      // reuse the input-specific method since the logic is the same.
      await this.setInputValue('');

      for (let i = 0; i < options.length; i++) {
        if (indexes.has(i)) {
          // We have to hold the control key while clicking on options so that multiple can be
          // selected in multi-selection mode. The key doesn't do anything for single selection.
          await this._actions().keyDown(webdriver.Key.CONTROL).perform();
          await options[i].click();
          await this._actions().keyUp(webdriver.Key.CONTROL).perform();
        }
      }
    }
  }

  async matchesSelector(selector: string): Promise<boolean> {
    return this._executeScript((element: Element, s: string) =>
        (Element.prototype.matches || (Element.prototype as any).msMatchesSelector)
            .call(element, s),
        this.element(), selector);
  }

  async isFocused(): Promise<boolean> {
    return webdriver.WebElement.equals(
        this.element(), this.element().getDriver().switchTo().activeElement());
  }

  async dispatchEvent(name: string, data?: Record<string, EventData>): Promise<void> {
    return this._executeScript(dispatchEvent, name, this.element(), data);
  }

  private _actions() {
    return this.element().getDriver().actions();
  }

  private async _executeScript<T>(script: Function, ...var_args: any[]): Promise<T> {
    return this.element().getDriver().executeScript(script, ...var_args);
  }

  /** Dispatches all the events that are part of a click event sequence. */
  private async _dispatchClickEventSequence(
      args: [ModifierKeys?] | ['center', ModifierKeys?] | [number, number, ModifierKeys?],
      button: string) {
    let modifiers: ModifierKeys = {};
    if (args.length && typeof args[args.length - 1] === 'object') {
      modifiers = args.pop() as ModifierKeys;
    }
    const modifierKeys = getWebDriverModifierKeys(modifiers);

    // Omitting the offset argument to mouseMove results in clicking the center.
    // This is the default behavior we want, so we use an empty array of offsetArgs if
    // no args remain after popping the modifiers from the args passed to this function.
    const offsetArgs = (args.length === 2 ?
        [{x: args[0], y: args[1]}] : []) as [{x: number, y: number}];

    let actions = this._actions().mouseMove(this.element(), ...offsetArgs);

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
 * Dispatches an event with a particular name and data to an element. Note that this needs to be a
 * pure function, because it gets stringified by WebDriver and is executed inside the browser.
 */
function dispatchEvent(name: string, element: Element, data?: Record<string, EventData>) {
  const event = document.createEvent('Event');
  event.initEvent(name);
  // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the original object.
  Object.assign(event, data || {});
  element.dispatchEvent(event);
}
