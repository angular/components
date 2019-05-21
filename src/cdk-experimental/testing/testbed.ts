import {ComponentFixture} from '@angular/core/testing';

import {ComponentHarness, ComponentHarnessType, Locator, Options, TestElement} from './component-harness';

/**
 * Component harness factory for testbed.
 * @param componentHarness: Type of user defined harness.
 * @param fixture: Component Fixture of the component to be tested.
 */
export function load<T extends ComponentHarness>(
  componentHarness: ComponentHarnessType<T>,
  fixture: ComponentFixture<{}>): T {
  const root = fixture.nativeElement;
  const stabilize = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const locator = new UnitTestLocator(root, stabilize);
  return new componentHarness(locator);
}

/**
 * Gets the corresponding Element for the root of a TestElement.
 */
export function getNativeElement(testElement: TestElement): Element {
  if (testElement instanceof UnitTestElement) {
    return testElement.element;
  }

  throw new Error('Invalid element provided');
}

/**
 * Locator implementation for testbed.
 * Note that, this locator is exposed for internal usage, please do not use it.
 */
export class UnitTestLocator implements Locator {
  private rootElement: TestElement;
  constructor(private root: Element, private stabilize: () => Promise<void>) {
    this.rootElement = new UnitTestElement(root, this.stabilize);
  }

  host(): TestElement {
    return this.rootElement;
  }

  async find(css: string, options?: Options): Promise<TestElement|null> {
    await this.stabilize();
    const e = getElement(css, this.root, options);
    if (e === null) return null;
    return new UnitTestElement(e, this.stabilize);
  }

  async findAll(css: string): Promise<TestElement[]> {
    await this.stabilize();
    const elements = this.root.querySelectorAll(css);
    const res: TestElement[] = [];
    for (let i = 0; i < elements.length; i++) {
      res.push(new UnitTestElement(elements[i], this.stabilize));
    }
    return res;
  }

  async load<T extends ComponentHarness>(
    componentHarness: ComponentHarnessType<T>, css: string,
    options?: Options): Promise<T|null> {
    const root = getElement(css, this.root, options);
    if (root === null) {
      return null;
    }
    const stabilize = this.stabilize;
    const locator = new UnitTestLocator(root, stabilize);
    return new componentHarness(locator);
  }

  async loadAll<T extends ComponentHarness>(
    componentHarness: ComponentHarnessType<T>,
    rootSelector: string): Promise<T[]> {
    await this.stabilize();
    const roots = this.root.querySelectorAll(rootSelector);
    const res: T[] = [];
    for (let i = 0; i < roots.length; i++) {
      const root = roots[i];
      const stabilize = this.stabilize;
      const locator = new UnitTestLocator(root, stabilize);
      res.push(new componentHarness(locator));
    }
    return res;
  }
}

class UnitTestElement implements TestElement {
  constructor(
    readonly element: Element, private stabilize: () => Promise<void>) {}

  async blur(): Promise<void> {
    await this.stabilize();
    (this.element as HTMLElement).blur();
    await this.stabilize();
  }

  async clear(): Promise<void> {
    await this.stabilize();
    if (!(this.element instanceof HTMLInputElement ||
      this.element instanceof HTMLTextAreaElement)) {
      throw new Error('Attempting to clear an invalid element');
    }
    this.element.focus();
    this.element.value = '';
    this.element.dispatchEvent(new Event('input'));
    await this.stabilize();
  }

  async click(): Promise<void> {
    await this.stabilize();
    (this.element as HTMLElement).click();
    await this.stabilize();
  }

  async focus(): Promise<void> {
    await this.stabilize();
    (this.element as HTMLElement).focus();
    await this.stabilize();
  }

  async getCssValue(property: string): Promise<string> {
    await this.stabilize();
    return Promise.resolve(
      getComputedStyle(this.element).getPropertyValue(property));
  }

  async hover(): Promise<void> {
    await this.stabilize();
    this.element.dispatchEvent(new Event('mouseenter'));
    await this.stabilize();
  }

  async sendKeys(keys: string): Promise<void> {
    await this.stabilize();
    (this.element as HTMLElement).focus();
    const e = this.element as HTMLInputElement;
    for (const key of keys) {
      const eventParams = {key, char: key, keyCode: key.charCodeAt(0)};
      e.dispatchEvent(new KeyboardEvent('keydown', eventParams));
      e.dispatchEvent(new KeyboardEvent('keypress', eventParams));
      e.value += key;
      e.dispatchEvent(new KeyboardEvent('keyup', eventParams));
      e.dispatchEvent(new Event('input'));
    }
    await this.stabilize();
  }

  async text(): Promise<string> {
    await this.stabilize();
    return Promise.resolve(this.element.textContent || '');
  }

  async getAttribute(name: string): Promise<string|null> {
    await this.stabilize();
    let value = this.element.getAttribute(name);
    // If cannot find attribute in the element, also try to find it in
    // property, this is useful for input/textarea tags
    if (value === null) {
      if (name in this.element) {
        // tslint:disable-next-line:no-any handle unnecessary compile error
        value = (this.element as any)[name];
      }
    }
    return value;
  }
}


/**
 * Get an element based on the css selector and root element.
 * @param css the css selector
 * @param root Search element under the root element. If options.global is set,
 *     root is ignored.
 * @param options Optional, extra searching options
 * @return When element is not present, return null if Options.allowNull is set
 * to true, throw an error if Options.allowNull is set to false; otherwise,
 * return the element
 */
function getElement(css: string, root: Element, options?: Options): Element|
  null {
  const useGlobalRoot = options && !!options.global;
  const elem = (useGlobalRoot ? document : root).querySelector(css);
  const allowNull = options !== undefined && options.allowNull !== undefined ?
    options.allowNull :
    undefined;
  if (elem === null) {
    if (allowNull) {
      return null;
    }
    throw new Error('Cannot find element based on the css selector: ' + css);
  }
  return elem;
}
