/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parallel} from './change-detection';
import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessLoader,
  HarnessPredicate,
  HarnessQuery,
  LocatorFactory,
  LocatorFnResult,
} from './component-harness';
import {TestElement} from './test-element';

/** Parsed form of the queries passed to the `locatorFor*` methods. */
type ParsedQueries<T extends ComponentHarness> = {
  /** The full list of queries, in their original order. */
  allQueries: (string | HarnessPredicate<T>)[];
  /**
   * A filtered view of `allQueries` containing only the queries that are looking for a
   * `ComponentHarness`
   */
  harnessQueries: HarnessPredicate<T>[];
  /**
   * A filtered view of `allQueries` containing only the queries that are looking for a
   * `TestElement`
   */
  elementQueries: string[];
  /** The set of all `ComponentHarness` subclasses represented in the original query list. */
  harnessTypes: Set<ComponentHarnessConstructor<T>>;
};

/**
 * Base harness environment class that can be extended to allow `ComponentHarness`es to be used in
 * different test environments (e.g. testbed, protractor, etc.). This class implements the
 * functionality of both a `HarnessLoader` and `LocatorFactory`. This class is generic on the raw
 * element type, `E`, used by the particular test environment.
 */
export abstract class HarnessEnvironment<E> implements HarnessLoader, LocatorFactory {
  /** The root element of this `HarnessEnvironment` as a `TestElement`. */
  get rootElement(): TestElement {
    this._rootElement = this._rootElement || this.createTestElement(this.rawRootElement);
    return this._rootElement;
  }
  set rootElement(element: TestElement) {
    this._rootElement = element;
  }
  private _rootElement: TestElement | undefined;

  protected constructor(
    /** The native root element of this `HarnessEnvironment`. */
    protected rawRootElement: E,
  ) {}

  /** Gets a locator factory rooted at the document root. */
  documentRootLocatorFactory(): LocatorFactory {
    return this.createEnvironment(this.getDocumentRoot());
  }

  /**
   * Creates an asynchronous locator function that can be used to find a `ComponentHarness` instance
   * or element under the root element of this `HarnessEnvironment`.
   *
   * For example, given the following DOM and assuming `DivHarness.hostSelector` is `'div'`
   *
   * ```html
   * <div id="d1"></div><div id="d2"></div>
   * ```
   *
   * then we expect:
   *
   * ```ts
   * await lf.locatorFor(DivHarness, 'div')() // Gets a `DivHarness` instance for #d1
   * await lf.locatorFor('div', DivHarness)() // Gets a `TestElement` instance for #d1
   * await lf.locatorFor('span')()            // Throws because the `Promise` rejects
   * ```
   *
   * @param queries A list of queries specifying which harnesses and elements to search for:
   *   - A `string` searches for elements matching the CSS selector specified by the string.
   *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
   *     given class.
   *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
   *     predicate.
   * @return An asynchronous locator function that searches for and returns a `Promise` for the
   *   first element or harness matching the given search criteria. Matches are ordered first by
   *   order in the DOM, and second by order in the queries list. If no matches are found, the
   *   `Promise` rejects. The type that the `Promise` resolves to is a union of all result types for
   *   each query.
   */
  locatorFor<T extends (HarnessQuery<any> | string)[]>(
    ...queries: T
  ): () => Promise<LocatorFnResult<T>> {
    return () =>
      _assertResultFound(
        this._getAllHarnessesAndTestElements(queries),
        _getDescriptionForLocatorForQueries(queries),
      );
  }

  /**
   * Creates an asynchronous locator function that can be used to find a `ComponentHarness` instance
   * or element under the root element of this `HarnessEnvironmnet`.
   *
   * For example, given the following DOM and assuming `DivHarness.hostSelector` is `'div'`
   *
   * ```html
   * <div id="d1"></div><div id="d2"></div>
   * ```
   *
   * then we expect:
   *
   * ```ts
   * await lf.locatorForOptional(DivHarness, 'div')() // Gets a `DivHarness` instance for #d1
   * await lf.locatorForOptional('div', DivHarness)() // Gets a `TestElement` instance for #d1
   * await lf.locatorForOptional('span')()            // Gets `null`
   * ```
   *
   * @param queries A list of queries specifying which harnesses and elements to search for:
   *   - A `string` searches for elements matching the CSS selector specified by the string.
   *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
   *     given class.
   *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
   *     predicate.
   * @return An asynchronous locator function that searches for and returns a `Promise` for the
   *   first element or harness matching the given search criteria. Matches are ordered first by
   *   order in the DOM, and second by order in the queries list. If no matches are found, the
   *   `Promise` is resolved with `null`. The type that the `Promise` resolves to is a union of all
   *   result types for each query or null.
   */
  locatorForOptional<T extends (HarnessQuery<any> | string)[]>(
    ...queries: T
  ): () => Promise<LocatorFnResult<T> | null> {
    return async () => (await this._getAllHarnessesAndTestElements(queries))[0] || null;
  }

  /**
   * Creates an asynchronous locator function that can be used to find `ComponentHarness` instances
   * or elements under the root element of this `HarnessEnvironment`.
   *
   * For example, given the following DOM and assuming `DivHarness.hostSelector` is `'div'` and
   * `IdIsD1Harness.hostSelector` is `'#d1'`
   *
   * ```html
   * <div id="d1"></div><div id="d2"></div>
   * ```
   *
   * then we expect:
   *
   * ```ts
   * // Gets [DivHarness for #d1, TestElement for #d1, DivHarness for #d2, TestElement for #d2]
   * await lf.locatorForAll(DivHarness, 'div')()
   * // Gets [TestElement for #d1, TestElement for #d2]
   * await lf.locatorForAll('div', '#d1')()
   * // Gets [DivHarness for #d1, IdIsD1Harness for #d1, DivHarness for #d2]
   * await lf.locatorForAll(DivHarness, IdIsD1Harness)()
   * // Gets []
   * await lf.locatorForAll('span')()
   * ```
   *
   * @param queries A list of queries specifying which harnesses and elements to search for:
   *   - A `string` searches for elements matching the CSS selector specified by the string.
   *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
   *     given class.
   *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
   *     predicate.
   * @return An asynchronous locator function that searches for and returns a `Promise` for all
   *   elements and harnesses matching the given search criteria. Matches are ordered first by
   *   order in the DOM, and second by order in the queries list. If an element matches more than
   *   one `ComponentHarness` class, the locator gets an instance of each for the same element. If
   *   an element matches multiple `string` selectors, only one `TestElement` instance is returned
   *   for that element. The type that the `Promise` resolves to is an array where each element is
   *   the union of all result types for each query.
   */
  locatorForAll<T extends (HarnessQuery<any> | string)[]>(
    ...queries: T
  ): () => Promise<LocatorFnResult<T>[]> {
    return () => this._getAllHarnessesAndTestElements(queries);
  }

  /** @return A `HarnessLoader` rooted at the root element of this `HarnessEnvironment`. */
  async rootHarnessLoader(): Promise<HarnessLoader> {
    return this;
  }

  /**
   * Gets a `HarnessLoader` instance for an element under the root of this `HarnessEnvironment`.
   * @param selector The selector for the root element.
   * @return A `HarnessLoader` rooted at the first element matching the given selector.
   * @throws If no matching element is found for the given selector.
   */
  async harnessLoaderFor(selector: string): Promise<HarnessLoader> {
    return this.createEnvironment(
      await _assertResultFound(this.getAllRawElements(selector), [
        _getDescriptionForHarnessLoaderQuery(selector),
      ]),
    );
  }

  /**
   * Gets a `HarnessLoader` instance for an element under the root of this `HarnessEnvironment`.
   * @param selector The selector for the root element.
   * @return A `HarnessLoader` rooted at the first element matching the given selector, or null if
   *     no matching element is found.
   */
  async harnessLoaderForOptional(selector: string): Promise<HarnessLoader | null> {
    const elements = await this.getAllRawElements(selector);
    return elements[0] ? this.createEnvironment(elements[0]) : null;
  }

  /**
   * Gets a list of `HarnessLoader` instances, one for each matching element.
   * @param selector The selector for the root element.
   * @return A list of `HarnessLoader`, one rooted at each element matching the given selector.
   */
  async harnessLoaderForAll(selector: string): Promise<HarnessLoader[]> {
    const elements = await this.getAllRawElements(selector);
    return elements.map(element => this.createEnvironment(element));
  }

  /**
   * Searches for an instance of the component corresponding to the given harness type under the
   * `HarnessEnvironment`'s root element, and returns a `ComponentHarness` for that instance. If
   * multiple matching components are found, a harness for the first one is returned. If no matching
   * component is found, an error is thrown.
   * @param query A query for a harness to create
   * @return An instance of the given harness type
   * @throws If a matching component instance can't be found.
   */
  getHarness<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T> {
    return this.locatorFor(query)();
  }

  /**
   * Searches for an instance of the component corresponding to the given harness type under the
   * `HarnessEnvironment`'s root element, and returns a `ComponentHarness` for that instance. If
   * multiple matching components are found, a harness for the first one is returned. If no matching
   * component is found, null is returned.
   * @param query A query for a harness to create
   * @return An instance of the given harness type (or null if not found).
   */
  getHarnessOrNull<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T | null> {
    return this.locatorForOptional(query)();
  }

 /**
   * Searches for an instance of the component corresponding to the given harness type and index 
   * under the `HarnessEnvironment`'s root element, and returns a `ComponentHarness` for that 
   * instance. The index specifies the offset of the component to find. If no matching
   * component is found at that index, an error is thrown.
   * @param query A query for a harness to create
   * @param index The zero-indexed offset of the component to find
   * @return An instance of the given harness type
   * @throws If a matching component instance can't be found.
   */
  async getHarnessAtIndex<T extends ComponentHarness>(
    query: HarnessQuery<T>,
    offset: number,
  ): Promise<T> {
    if (offset < 0) {
      throw Error('Index must not be negative');
    }
    const harnesses = await this.locatorForAll(query)();
    if (offset >= harnesses.length) {
      throw Error(`No harness was located at index ${offset}`);
    }
    return harnesses[offset];
  }

  /**
   * Searches for all instances of the component corresponding to the given harness type under the
   * `HarnessEnvironment`'s root element, and returns a list `ComponentHarness` for each instance.
   * @param query A query for a harness to create
   * @return A list instances of the given harness type.
   */
  getAllHarnesses<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T[]> {
    return this.locatorForAll(query)();
  }

  /**
   * Searches for all instance of the component corresponding to the given harness type under the
   * `HarnessEnvironment`'s root element, and returns the number that were found.
   * @param query A query for a harness to create
   * @return The number of instances that were found.
   */
  async countHarnesses<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<number> {
    return (await this.locatorForAll(query)()).length;
  }

  /**
   * Searches for an instance of the component corresponding to the given harness type under the
   * `HarnessEnvironment`'s root element, and returns a boolean indicating if any were found.
   * @param query A query for a harness to create
   * @return A boolean indicating if an instance was found.
   */
  async hasHarness<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<boolean> {
    return (await this.locatorForOptional(query)()) !== null;
  }

  /**
   * Searches for an element with the given selector under the evironment's root element,
   * and returns a `HarnessLoader` rooted at the matching element. If multiple elements match the
   * selector, the first is used. If no elements match, an error is thrown.
   * @param selector The selector for the root element of the new `HarnessLoader`
   * @return A `HarnessLoader` rooted at the element matching the given selector.
   * @throws If a matching element can't be found.
   */
  async getChildLoader(selector: string): Promise<HarnessLoader> {
    return this.createEnvironment(
      await _assertResultFound(this.getAllRawElements(selector), [
        _getDescriptionForHarnessLoaderQuery(selector),
      ]),
    );
  }

  /**
   * Searches for all elements with the given selector under the environment's root element,
   * and returns an array of `HarnessLoader`s, one for each matching element, rooted at that
   * element.
   * @param selector The selector for the root element of the new `HarnessLoader`
   * @return A list of `HarnessLoader`s, one for each matching element, rooted at that element.
   */
  async getAllChildLoaders(selector: string): Promise<HarnessLoader[]> {
    return (await this.getAllRawElements(selector)).map(e => this.createEnvironment(e));
  }

  /** Creates a `ComponentHarness` for the given harness type with the given raw host element. */
  protected createComponentHarness<T extends ComponentHarness>(
    harnessType: ComponentHarnessConstructor<T>,
    element: E,
  ): T {
    return new harnessType(this.createEnvironment(element));
  }

  /**
   * Flushes change detection and async tasks captured in the Angular zone.
   * In most cases it should not be necessary to call this manually. However, there may be some edge
   * cases where it is needed to fully flush animation events.
   * This is an abstrct method that must be implemented by subclasses.
   */
  abstract forceStabilize(): Promise<void>;

  /**
   * Waits for all scheduled or running async tasks to complete. This allows harness
   * authors to wait for async tasks outside of the Angular zone.
   * This is an abstrct method that must be implemented by subclasses.
   */
  abstract waitForTasksOutsideAngular(): Promise<void>;

  /** Gets the root element for the document. */
  protected abstract getDocumentRoot(): E;

  /** Creates a `TestElement` from a raw element. */
  protected abstract createTestElement(element: E): TestElement;

  /** Creates a `HarnessEnvironment` rooted at the given raw element. */
  protected abstract createEnvironment(element: E): HarnessEnvironment<E>;

  /**
   * Gets a list of all elements matching the given selector under this environment's root element.
   */
  protected abstract getAllRawElements(selector: string): Promise<E[]>;

  /**
   * Matches the given raw elements with the given list of element and harness queries to produce a
   * list of matched harnesses and test elements.
   */
  private async _getAllHarnessesAndTestElements<T extends (HarnessQuery<any> | string)[]>(
    queries: T,
  ): Promise<LocatorFnResult<T>[]> {
    if (!queries.length) {
      throw Error('CDK Component harness query must contain at least one element.');
    }

    const {allQueries, harnessQueries, elementQueries, harnessTypes} = _parseQueries(queries);

    // Combine all of the queries into one large comma-delimited selector and use it to get all raw
    // elements matching any of the individual queries.
    const rawElements = await this.getAllRawElements(
      [...elementQueries, ...harnessQueries.map(predicate => predicate.getSelector())].join(','),
    );

    // If every query is searching for the same harness subclass, we know every result corresponds
    // to an instance of that subclass. Likewise, if every query is for a `TestElement`, we know
    // every result corresponds to a `TestElement`. Otherwise we need to verify which result was
    // found by which selector so it can be matched to the appropriate instance.
    const skipSelectorCheck =
      (elementQueries.length === 0 && harnessTypes.size === 1) || harnessQueries.length === 0;

    const perElementMatches = await parallel(() =>
      rawElements.map(async rawElement => {
        const testElement = this.createTestElement(rawElement);
        const allResultsForElement = await parallel(
          // For each query, get `null` if it doesn't match, or a `TestElement` or
          // `ComponentHarness` as appropriate if it does match. This gives us everything that
          // matches the current raw element, but it may contain duplicate entries (e.g.
          // multiple `TestElement` or multiple `ComponentHarness` of the same type).
          () =>
            allQueries.map(query =>
              this._getQueryResultForElement(query, rawElement, testElement, skipSelectorCheck),
            ),
        );
        return _removeDuplicateQueryResults(allResultsForElement);
      }),
    );
    return ([] as any).concat(...perElementMatches);
  }

  /**
   * Check whether the given query matches the given element, if it does return the matched
   * `TestElement` or `ComponentHarness`, if it does not, return null. In cases where the caller
   * knows for sure that the query matches the element's selector, `skipSelectorCheck` can be used
   * to skip verification and optimize performance.
   */
  private async _getQueryResultForElement<T extends ComponentHarness>(
    query: string | HarnessPredicate<T>,
    rawElement: E,
    testElement: TestElement,
    skipSelectorCheck: boolean = false,
  ): Promise<T | TestElement | null> {
    if (typeof query === 'string') {
      return skipSelectorCheck || (await testElement.matchesSelector(query)) ? testElement : null;
    }
    if (skipSelectorCheck || (await testElement.matchesSelector(query.getSelector()))) {
      const harness = this.createComponentHarness(query.harnessType, rawElement);
      return (await query.evaluate(harness)) ? harness : null;
    }
    return null;
  }
}

/**
 * Parses a list of queries in the format accepted by the `locatorFor*` methods into an easier to
 * work with format.
 */
function _parseQueries<T extends (HarnessQuery<any> | string)[]>(
  queries: T,
): ParsedQueries<LocatorFnResult<T> & ComponentHarness> {
  const allQueries = [];
  const harnessQueries = [];
  const elementQueries = [];
  const harnessTypes = new Set<
    ComponentHarnessConstructor<LocatorFnResult<T> & ComponentHarness>
  >();

  for (const query of queries) {
    if (typeof query === 'string') {
      allQueries.push(query);
      elementQueries.push(query);
    } else {
      const predicate = query instanceof HarnessPredicate ? query : new HarnessPredicate(query, {});
      allQueries.push(predicate);
      harnessQueries.push(predicate);
      harnessTypes.add(predicate.harnessType);
    }
  }

  return {allQueries, harnessQueries, elementQueries, harnessTypes};
}

/**
 * Removes duplicate query results for a particular element. (e.g. multiple `TestElement`
 * instances or multiple instances of the same `ComponentHarness` class.
 */
async function _removeDuplicateQueryResults<T extends (ComponentHarness | TestElement | null)[]>(
  results: T,
): Promise<T> {
  let testElementMatched = false;
  let matchedHarnessTypes = new Set();
  const dedupedMatches = [];
  for (const result of results) {
    if (!result) {
      continue;
    }
    if (result instanceof ComponentHarness) {
      if (!matchedHarnessTypes.has(result.constructor)) {
        matchedHarnessTypes.add(result.constructor);
        dedupedMatches.push(result);
      }
    } else if (!testElementMatched) {
      testElementMatched = true;
      dedupedMatches.push(result);
    }
  }
  return dedupedMatches as T;
}

/** Verifies that there is at least one result in an array. */
async function _assertResultFound<T>(
  results: Promise<T[]>,
  queryDescriptions: string[],
): Promise<T> {
  const result = (await results)[0];
  if (result == undefined) {
    throw Error(
      `Failed to find element matching one of the following queries:\n` +
        queryDescriptions.map(desc => `(${desc})`).join(',\n'),
    );
  }
  return result;
}

/** Gets a list of description strings from a list of queries. */
function _getDescriptionForLocatorForQueries(queries: (string | HarnessQuery<any>)[]) {
  return queries.map(query =>
    typeof query === 'string'
      ? _getDescriptionForTestElementQuery(query)
      : _getDescriptionForComponentHarnessQuery(query),
  );
}

/** Gets a description string for a `ComponentHarness` query. */
function _getDescriptionForComponentHarnessQuery(query: HarnessQuery<any>) {
  const harnessPredicate =
    query instanceof HarnessPredicate ? query : new HarnessPredicate(query, {});
  const {name, hostSelector} = harnessPredicate.harnessType;
  const description = `${name} with host element matching selector: "${hostSelector}"`;
  const constraints = harnessPredicate.getDescription();
  return (
    description +
    (constraints ? ` satisfying the constraints: ${harnessPredicate.getDescription()}` : '')
  );
}

/** Gets a description string for a `TestElement` query. */
function _getDescriptionForTestElementQuery(selector: string) {
  return `TestElement for element matching selector: "${selector}"`;
}

/** Gets a description string for a `HarnessLoader` query. */
function _getDescriptionForHarnessLoaderQuery(selector: string) {
  return `HarnessLoader for element matching selector: "${selector}"`;
}
