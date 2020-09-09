/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BehaviorSubject, Subscription} from 'rxjs';
import {
  AsyncFactoryFn,
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
  allQueries: (string | HarnessPredicate<T>)[],
  /**
   * A filtered view of `allQueries` containing only the queries that are looking for a
   * `ComponentHarness`
   */
  harnessQueries: HarnessPredicate<T>[],
  /**
   * A filtered view of `allQueries` containing only the queries that are looking for a
   * `TestElement`
   */
  elementQueries: string[],
  /** The set of all `ComponentHarness` subclasses represented in the original query list. */
  harnessTypes: Set<ComponentHarnessConstructor<T>>,
};

/** Represents the status of change detection batching. */
export interface ChangeDetectionBatchingStatus {
  /** Whether change detection is batching. */
  isBatching: boolean;
  /**
   * An optional callback, if present it indicates that change detection should be run immediately,
   * while handling the batching status change. The callback should then be called as soon as change
   * detection is done.
   */
  onDetectChangesNow?: () => void;
}

/** Subject used to dispatch and listen for changes to the change detection batching status . */
const batchChangeDetectionSubject = new BehaviorSubject<ChangeDetectionBatchingStatus>({
  isBatching: false
});

/** The current subscription to `batchChangeDetectionSubject`. */
let batchChangeDetectionSubscription: Subscription | null;

/**
 * The default handler for change detection batching status changes. This handler will be used if
 * the specific environment does not install its own.
 * @param status The new change detection batching status.
 */
function defaultBatchChangeDetectionHandler(status: ChangeDetectionBatchingStatus) {
  status.onDetectChangesNow?.();
}

/**
 * Allows a test `HarnessEnvironment` to install its own handler for change detection batching
 * status changes.
 * @param handler The handler for the change detection batching status.
 */
export function handleChangeDetectionBatching(
    handler: (status: ChangeDetectionBatchingStatus) => void) {
  stopHandlingChangeDetectionBatching();
  batchChangeDetectionSubscription = batchChangeDetectionSubject.subscribe(handler);
}

/** Allows a `HarnessEnvironment` to stop handling change detection batching status changes. */
export function stopHandlingChangeDetectionBatching() {
  batchChangeDetectionSubscription?.unsubscribe();
  batchChangeDetectionSubscription = null;
}

/**
 * Batches together triggering of change detection over the duration of the given function.
 * @param fn The function to call with batched change detection.
 * @param triggerBeforeAndAfter Optionally trigger change detection once before and after the batch
 *   operation. If false, change detection will not be triggered.
 * @return The result of the given function.
 */
async function batchChangeDetection<T>(fn: () => Promise<T>, triggerBeforeAndAfter: boolean) {
  // If change detection batching is already in progress, just run the function.
  if (batchChangeDetectionSubject.getValue().isBatching) {
    return await fn();
  }

  // If nothing is handling change detection batching, install the default handler.
  if (!batchChangeDetectionSubscription) {
    batchChangeDetectionSubject.subscribe(defaultBatchChangeDetectionHandler);
  }

  if (triggerBeforeAndAfter) {
    await new Promise(resolve => batchChangeDetectionSubject.next({
      isBatching: true,
      onDetectChangesNow: resolve,
    }));
    const result = await fn();
    await new Promise(resolve => batchChangeDetectionSubject.next({
      isBatching: false,
      onDetectChangesNow: resolve,
    }));
    return result;
  } else {
    batchChangeDetectionSubject.next({isBatching: true});
    const result = await fn();
    batchChangeDetectionSubject.next({isBatching: false});
    return result;
  }
}

/**
 * Disables the harness system's auto change detection for the duration of the given function.
 * @param fn The function to disable auto change detection for.
 * @return The result of the given function.
 */
export async function noAutoChangeDetection<T>(fn: () => Promise<T>) {
  return batchChangeDetection(fn, false);
}

/**
 * Resolves the given list of async values in parallel (i.e. via Promise.all) while batching change
 * detection over the entire operation such that change detection occurs exactly once before
 * resolving the values and once after.
 * @param values The async values to resolve in parallel with batched change detection.
 * @return The resolved values.
 */
export async function parallel<T>(values: Iterable<T | PromiseLike<T>>) {
  return batchChangeDetection(() => Promise.all(values), true);
}

/**
 * Base harness environment class that can be extended to allow `ComponentHarness`es to be used in
 * different test environments (e.g. testbed, protractor, etc.). This class implements the
 * functionality of both a `HarnessLoader` and `LocatorFactory`. This class is generic on the raw
 * element type, `E`, used by the particular test environment.
 */
export abstract class HarnessEnvironment<E> implements HarnessLoader, LocatorFactory {
  // Implemented as part of the `LocatorFactory` interface.
  rootElement: TestElement;

  protected constructor(protected rawRootElement: E) {
    this.rootElement = this.createTestElement(rawRootElement);
  }

  // Implemented as part of the `LocatorFactory` interface.
  documentRootLocatorFactory(): LocatorFactory {
    return this.createEnvironment(this.getDocumentRoot());
  }

  // Implemented as part of the `LocatorFactory` interface.
  locatorFor<T extends (HarnessQuery<any> | string)[]>(...queries: T):
      AsyncFactoryFn<LocatorFnResult<T>> {
    return () => _assertResultFound(
        this._getAllHarnessesAndTestElements(queries),
        _getDescriptionForLocatorForQueries(queries));
  }

  // Implemented as part of the `LocatorFactory` interface.
  locatorForOptional<T extends (HarnessQuery<any> | string)[]>(...queries: T):
      AsyncFactoryFn<LocatorFnResult<T> | null> {
    return async () => (await this._getAllHarnessesAndTestElements(queries))[0] || null;
  }

  // Implemented as part of the `LocatorFactory` interface.
  locatorForAll<T extends (HarnessQuery<any> | string)[]>(...queries: T):
      AsyncFactoryFn<LocatorFnResult<T>[]> {
    return () => this._getAllHarnessesAndTestElements(queries);
  }

  // Implemented as part of the `LocatorFactory` interface.
  async rootHarnessLoader(): Promise<HarnessLoader> {
    return this;
  }

  // Implemented as part of the `LocatorFactory` interface.
  async harnessLoaderFor(selector: string): Promise<HarnessLoader> {
    return this.createEnvironment(await _assertResultFound(this.getAllRawElements(selector),
        [_getDescriptionForHarnessLoaderQuery(selector)]));
  }

  // Implemented as part of the `LocatorFactory` interface.
  async harnessLoaderForOptional(selector: string): Promise<HarnessLoader | null> {
    const elements = await this.getAllRawElements(selector);
    return elements[0] ? this.createEnvironment(elements[0]) : null;
  }

  // Implemented as part of the `LocatorFactory` interface.
  async harnessLoaderForAll(selector: string): Promise<HarnessLoader[]> {
    const elements = await this.getAllRawElements(selector);
    return elements.map(element => this.createEnvironment(element));
  }

  // Implemented as part of the `HarnessLoader` interface.
  getHarness<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T> {
    return this.locatorFor(query)();
  }

  // Implemented as part of the `HarnessLoader` interface.
  getAllHarnesses<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T[]> {
    return this.locatorForAll(query)();
  }

  // Implemented as part of the `HarnessLoader` interface.
  async getChildLoader(selector: string): Promise<HarnessLoader> {
    return this.createEnvironment(await _assertResultFound(this.getAllRawElements(selector),
        [_getDescriptionForHarnessLoaderQuery(selector)]));
  }

  // Implemented as part of the `HarnessLoader` interface.
  async getAllChildLoaders(selector: string): Promise<HarnessLoader[]> {
    return (await this.getAllRawElements(selector)).map(e => this.createEnvironment(e));
  }

  /** Creates a `ComponentHarness` for the given harness type with the given raw host element. */
  protected createComponentHarness<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T>, element: E): T {
    return new harnessType(this.createEnvironment(element));
  }

  // Part of LocatorFactory interface, subclasses will implement.
  abstract forceStabilize(): Promise<void>;

  // Part of LocatorFactory interface, subclasses will implement.
  abstract waitForTasksOutsideAngular(): Promise<void>;

  /** Gets the root element for the document. */
  protected abstract getDocumentRoot(): E;

  /** Creates a `TestElement` from a raw element. */
  protected abstract createTestElement(element: E): TestElement;

  /** Creates a `HarnessLoader` rooted at the given raw element. */
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
      queries: T): Promise<LocatorFnResult<T>[]> {
    const {allQueries, harnessQueries, elementQueries, harnessTypes} = _parseQueries(queries);

    // Combine all of the queries into one large comma-delimited selector and use it to get all raw
    // elements matching any of the individual queries.
    const rawElements = await this.getAllRawElements(
        [...elementQueries, ...harnessQueries.map(predicate => predicate.getSelector())].join(','));

    // If every query is searching for the same harness subclass, we know every result corresponds
    // to an instance of that subclass. Likewise, if every query is for a `TestElement`, we know
    // every result corresponds to a `TestElement`. Otherwise we need to verify which result was
    // found by which selector so it can be matched to the appropriate instance.
    const skipSelectorCheck = (elementQueries.length === 0 && harnessTypes.size === 1) ||
        harnessQueries.length === 0;

    // We want to batch change detection while we're filtering harnesses, because harness predicates
    // may trigger change detection by reading state from DOM elements. If not batched these change
    // detections would be triggered once per potential match element which could cause significant
    // slowdown.
    const perElementMatches = await parallel(rawElements.map(async rawElement => {
      const testElement = this.createTestElement(rawElement);
      const allResultsForElement = await Promise.all(
          // For each query, get `null` if it doesn't match, or a `TestElement` or
          // `ComponentHarness` as appropriate if it does match. This gives us everything that
          // matches the current raw element, but it may contain duplicate entries (e.g.
          // multiple `TestElement` or multiple `ComponentHarness` of the same type).
          allQueries.map(query => this._getQueryResultForElement(
              query, rawElement, testElement, skipSelectorCheck)));
      return _removeDuplicateQueryResults(allResultsForElement);
    }));
    return ([] as any).concat(...perElementMatches);
  }

  /**
   * Check whether the given query matches the given element, if it does return the matched
   * `TestElement` or `ComponentHarness`, if it does not, return null. In cases where the caller
   * knows for sure that the query matches the element's selector, `skipSelectorCheck` can be used
   * to skip verification and optimize performance.
   */
  private async _getQueryResultForElement<T extends ComponentHarness>(
      query: string | HarnessPredicate<T>, rawElement: E, testElement: TestElement,
      skipSelectorCheck: boolean = false): Promise<T | TestElement | null> {
    if (typeof query === 'string') {
      return ((skipSelectorCheck || await testElement.matchesSelector(query)) ? testElement : null);
    }
    if (skipSelectorCheck || await testElement.matchesSelector(query.getSelector())) {
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
function _parseQueries<T extends (HarnessQuery<any> | string)[]>(queries: T):
    ParsedQueries<LocatorFnResult<T> & ComponentHarness> {
  const allQueries = [];
  const harnessQueries = [];
  const elementQueries = [];
  const harnessTypes =
      new Set<ComponentHarnessConstructor<LocatorFnResult<T> & ComponentHarness>>();

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
    results: T): Promise<T> {
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
async function _assertResultFound<T>(results: Promise<T[]>, queryDescriptions: string[]):
    Promise<T> {
  const result = (await results)[0];
  if (result == undefined) {
    throw Error(`Failed to find element matching one of the following queries:\n` +
        queryDescriptions.map(desc => `(${desc})`).join(',\n'));
  }
  return result;
}

/** Gets a list of description strings from a list of queries. */
function _getDescriptionForLocatorForQueries(queries: (string | HarnessQuery<any>)[]) {
  return queries.map(query => typeof query === 'string' ?
      _getDescriptionForTestElementQuery(query) : _getDescriptionForComponentHarnessQuery(query));
}

/** Gets a description string for a `ComponentHarness` query. */
function _getDescriptionForComponentHarnessQuery(query: HarnessQuery<any>) {
  const harnessPredicate =
      query instanceof HarnessPredicate ? query : new HarnessPredicate(query, {});
  const {name, hostSelector} = harnessPredicate.harnessType;
  const description = `${name} with host element matching selector: "${hostSelector}"`;
  const constraints = harnessPredicate.getDescription();
  return description + (constraints ?
      ` satisfying the constraints: ${harnessPredicate.getDescription()}` : '');
}

/** Gets a description string for a `TestElement` query. */
function _getDescriptionForTestElementQuery(selector: string) {
  return `TestElement for element matching selector: "${selector}"`;
}

/** Gets a description string for a `HarnessLoader` query. */
function _getDescriptionForHarnessLoaderQuery(selector: string) {
  return `HarnessLoader for element matching selector: "${selector}"`;
}
