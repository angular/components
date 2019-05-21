import {browser, by, element, ElementFinder} from 'protractor';
import {promise as wdpromise} from 'selenium-webdriver';

import {ComponentHarness, ComponentHarnessType, Locator, Options, TestElement} from './component-harness';

/**
 * Component harness factory for protractor.
 * The function will not try to fetch the host element of harness at once, which
 * is for performance purpose; however, this is the most common way to load
 * protractor harness. If you do care whether the host element is present when
 * loading harness, using the load function that accepts extra searching
 * options.
 * @param componentHarness: Type of user defined harness.
 * @param rootSelector: Optional. Css selector to specify the root of component.
 * Set to 'body' by default
 */
export async function load<T extends ComponentHarness>(
  componentHarness: ComponentHarnessType<T>,
  rootSelector: string): Promise<T>;

/**
 * Component harness factory for protractor.
 * @param componentHarness: Type of user defined harness.
 * @param rootSelector: Optional. Css selector to specify the root of component.
 * Set to 'body' by default.
 * @param options Optional. Extra searching options
 */
export async function load<T extends ComponentHarness>(
  componentHarness: ComponentHarnessType<T>, rootSelector?: string,
  options?: Options): Promise<T|null>;

export async function load<T extends ComponentHarness>(
  componentHarness: ComponentHarnessType<T>, rootSelector = 'body',
  options?: Options): Promise<T|null> {
  const root = await getElement(rootSelector, undefined, options);
  if (root === null) {
    return null;
  }
  const locator = new ProtractorLocator(root);
  return new componentHarness(locator);
}

/**
 * Gets the corresponding ElementFinder for the root of a TestElement.
 */
export function getElementFinder(testElement: TestElement): ElementFinder {
  if (testElement instanceof ProtractorElement) {
    return testElement.element;
  }

  throw new Error('Invalid element provided');
}

class ProtractorLocator implements Locator {
  private root: ProtractorElement;
  constructor(private rootFinder: ElementFinder) {
    this.root = new ProtractorElement(this.rootFinder);
  }

  host(): TestElement {
    return this.root;
  }

  async find(css: string, options?: Options): Promise<TestElement|null> {
    const finder = await getElement(css, this.rootFinder, options);
    if (finder === null) return null;
    return new ProtractorElement(finder);
  }

  async findAll(css: string): Promise<TestElement[]> {
    const elementFinders = this.rootFinder.all(by.css(css));
    const res: TestElement[] = [];
    await elementFinders.each(el => {
      if (el) {
        res.push(new ProtractorElement(el));
      }
    });
    return res;
  }

  async load<T extends ComponentHarness>(
    componentHarness: ComponentHarnessType<T>, css: string,
    options?: Options): Promise<T|null> {
    const root = await getElement(css, this.rootFinder, options);
    if (root === null) return null;
    const locator = new ProtractorLocator(root);
    return new componentHarness(locator);
  }

  async loadAll<T extends ComponentHarness>(
    componentHarness: ComponentHarnessType<T>,
    rootSelector: string,
  ): Promise<T[]> {
    const roots = this.rootFinder.all(by.css(rootSelector));
    const res: T[] = [];
    await roots.each(el => {
      if (el) {
        const locator = new ProtractorLocator(el);
        res.push(new componentHarness(locator));
      }
    });
    return res;
  }
}

class ProtractorElement implements TestElement {
  constructor(readonly element: ElementFinder) {}

  blur(): Promise<void> {
    return toPromise<void>(this.element['blur']());
  }

  clear(): Promise<void> {
    return toPromise<void>(this.element.clear());
  }

  click(): Promise<void> {
    return toPromise<void>(this.element.click());
  }

  focus(): Promise<void> {
    return toPromise<void>(this.element['focus']());
  }

  getCssValue(property: string): Promise<string> {
    return toPromise<string>(this.element.getCssValue(property));
  }

  async hover(): Promise<void> {
    return toPromise<void>(browser.actions()
      .mouseMove(await this.element.getWebElement())
      .perform());
  }

  sendKeys(keys: string): Promise<void> {
    return toPromise<void>(this.element.sendKeys(keys));
  }

  text(): Promise<string> {
    return toPromise(this.element.getText());
  }

  getAttribute(name: string): Promise<string|null> {
    return toPromise(this.element.getAttribute(name));
  }
}

function toPromise<T>(p: wdpromise.Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    p.then(resolve, reject);
  });
}

/**
 * Get an element finder based on the css selector and root element.
 * Note that it will check whether the element is present only when
 * Options.allowNull is set. This is for performance purpose.
 * @param css the css selector
 * @param root Optional Search element under the root element. If not set,
 * search element globally. If options.global is set, root is ignored.
 * @param options Optional, extra searching options
 */
async function getElement(css: string, root?: ElementFinder, options?: Options):
  Promise<ElementFinder|null> {
  const useGlobalRoot = options && !!options.global;
  const elem = root === undefined || useGlobalRoot ? element(by.css(css)) :
    root.element(by.css(css));
  const allowNull = options !== undefined && options.allowNull !== undefined ?
    options.allowNull :
    undefined;
  if (allowNull !== undefined) {
    // Only check isPresent when allowNull is set
    if (!(await elem.isPresent())) {
      if (allowNull) {
        return null;
      }
      throw new Error('Cannot find element based on the css selector: ' + css);
    }
    return elem;
  }
  return elem;
}
