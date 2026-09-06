/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BreakpointObserver, BreakpointState} from './breakpoints-observer';
import {MediaMatcher} from './media-matcher';
import {TestBed} from '@angular/core/testing';
import {Service} from '@angular/core';
import {Subscription} from 'rxjs';
import {skip, take} from 'rxjs/operators';

describe('BreakpointObserver', () => {
  const debounceTime = 20;
  let breakpointObserver: BreakpointObserver;
  let mediaMatcher: FakeMediaMatcher;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: MediaMatcher, useClass: FakeMediaMatcher}],
    });
    breakpointObserver = TestBed.inject(BreakpointObserver);
    mediaMatcher = TestBed.inject(MediaMatcher) as unknown as FakeMediaMatcher;
  });

  afterEach(() => {
    mediaMatcher.clear();
  });

  function wait(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  it('retrieves the whether a query is currently matched', () => {
    const query = 'everything starts as true in the FakeMediaMatcher';
    expect(breakpointObserver.isMatched(query)).toBeTruthy();
  });

  it('reuses the same MediaQueryList for matching queries', () => {
    expect(mediaMatcher.queryCount).toBe(0);
    breakpointObserver.observe('query1');
    expect(mediaMatcher.queryCount).toBe(1);
    breakpointObserver.observe('query1');
    expect(mediaMatcher.queryCount).toBe(1);
    breakpointObserver.observe('query2');
    expect(mediaMatcher.queryCount).toBe(2);
    breakpointObserver.observe('query1');
    expect(mediaMatcher.queryCount).toBe(2);
  });

  it('splits combined query strings into individual matchMedia listeners', () => {
    expect(mediaMatcher.queryCount).toBe(0);
    breakpointObserver.observe('query1, query2');
    expect(mediaMatcher.queryCount).toBe(2);
    breakpointObserver.observe('query1');
    expect(mediaMatcher.queryCount).toBe(2);
    breakpointObserver.observe('query2, query3');
    expect(mediaMatcher.queryCount).toBe(3);
  });

  it('accepts an array of queries', () => {
    const queries = ['1 query', '2 query', 'red query', 'blue query'];
    breakpointObserver.observe(queries);
    expect(mediaMatcher.queryCount).toBe(queries.length);
  });

  it('completes all events when the breakpoint manager is destroyed', () => {
    const firstTest = jasmine.createSpy('test1');
    breakpointObserver.observe('test1').subscribe({complete: firstTest});
    const secondTest = jasmine.createSpy('test2');
    breakpointObserver.observe('test2').subscribe({complete: secondTest});

    expect(firstTest).not.toHaveBeenCalled();
    expect(secondTest).not.toHaveBeenCalled();

    breakpointObserver.ngOnDestroy();

    expect(firstTest).toHaveBeenCalled();
    expect(secondTest).toHaveBeenCalled();
  });

  it('emits an event on the observable when values change', async () => {
    const query = '(width: 999px)';
    let queryMatchState = false;
    breakpointObserver.observe(query).subscribe((state: BreakpointState) => {
      queryMatchState = state.matches;
    });

    await wait(debounceTime);
    expect(queryMatchState).toBeTruthy();
    mediaMatcher.setMatchesQuery(query, false);
    await wait(debounceTime);
    expect(queryMatchState).toBeFalsy();
  });

  it('emits an event on the observable with the matching state of all queries provided', async () => {
    const queryOne = '(width: 999px)';
    const queryTwo = '(width: 700px)';
    let state: BreakpointState = {matches: false, breakpoints: {}};
    breakpointObserver.observe([queryOne, queryTwo]).subscribe((breakpoint: BreakpointState) => {
      state = breakpoint;
    });
    expect(state.breakpoints).toEqual({[queryOne]: true, [queryTwo]: true});

    mediaMatcher.setMatchesQuery(queryOne, false);
    mediaMatcher.setMatchesQuery(queryTwo, false);
    await wait(debounceTime);
    expect(state.breakpoints).toEqual({[queryOne]: false, [queryTwo]: false});

    mediaMatcher.setMatchesQuery(queryOne, true);
    mediaMatcher.setMatchesQuery(queryTwo, false);
    await wait(debounceTime);
    expect(state.breakpoints).toEqual({[queryOne]: true, [queryTwo]: false});
  });

  it('emits a true matches state when the query is matched', () => {
    const query = '(width: 999px)';
    breakpointObserver.observe(query).subscribe();
    mediaMatcher.setMatchesQuery(query, true);
    expect(breakpointObserver.isMatched(query)).toBeTruthy();
  });

  it('emits a false matches state when the query is not matched', async () => {
    const query = '(width: 999px)';
    breakpointObserver.observe(query).subscribe();
    mediaMatcher.setMatchesQuery(query, false);
    await wait(debounceTime);
    expect(breakpointObserver.isMatched(query)).toBeFalsy();
  });

  it('emits one event when multiple queries change', async () => {
    const observer = jasmine.createSpy('observer');
    const queryOne = '(width: 700px)';
    const queryTwo = '(width: 999px)';
    breakpointObserver.observe([queryOne, queryTwo]).pipe(skip(1)).subscribe(observer);

    mediaMatcher.setMatchesQuery(queryOne, false);
    mediaMatcher.setMatchesQuery(queryTwo, false);

    await wait(debounceTime);
    expect(observer).toHaveBeenCalledTimes(1);
  });

  it('should not complete other subscribers when preceding subscriber completes', async () => {
    const queryOne = '(width: 700px)';
    const queryTwo = '(width: 999px)';
    const breakpoint = breakpointObserver.observe([queryOne, queryTwo]).pipe(skip(1));
    const subscriptions: Subscription[] = [];
    let emittedValues: number[] = [];

    subscriptions.push(breakpoint.subscribe(() => emittedValues.push(1)));
    subscriptions.push(breakpoint.pipe(take(1)).subscribe(() => emittedValues.push(2)));
    subscriptions.push(breakpoint.subscribe(() => emittedValues.push(3)));
    subscriptions.push(breakpoint.subscribe(() => emittedValues.push(4)));

    mediaMatcher.setMatchesQuery(queryOne, true);
    mediaMatcher.setMatchesQuery(queryTwo, false);
    await wait(debounceTime);

    expect(emittedValues).toEqual([1, 2, 3, 4]);
    emittedValues = [];

    mediaMatcher.setMatchesQuery(queryOne, false);
    mediaMatcher.setMatchesQuery(queryTwo, true);
    await wait(debounceTime);

    expect(emittedValues).toEqual([1, 3, 4]);

    subscriptions.forEach(subscription => subscription.unsubscribe());
  });
});

export class FakeMediaQueryList {
  /** The callback for change events. */
  private _listeners: ((mql: MediaQueryListEvent) => void)[] = [];

  constructor(
    public matches: boolean,
    public media: string,
  ) {}

  /** Toggles the matches state and "emits" a change event. */
  setMatches(matches: boolean) {
    this.matches = matches;

    /** Simulate an asynchronous task. */
    setTimeout(() => {
      this._listeners.forEach(listener => listener(this as any));
    });
  }

  /** Registers a callback method for change events. */
  addListener(callback: (mql: MediaQueryListEvent) => void) {
    this._listeners.push(callback);
  }

  /** Removes a callback method from the change events. */
  removeListener(callback: (mql: MediaQueryListEvent) => void) {
    const index = this._listeners.indexOf(callback);

    if (index > -1) {
      this._listeners.splice(index, 1);
    }
  }
}

@Service({autoProvided: false})
export class FakeMediaMatcher {
  /** A map of match media queries. */
  private _queries = new Map<string, FakeMediaQueryList>();

  /** The number of distinct queries created in the media matcher during a test. */
  get queryCount(): number {
    return this._queries.size;
  }

  /** Fakes the match media response to be controlled in tests. */
  matchMedia(query: string): FakeMediaQueryList {
    const mql = new FakeMediaQueryList(true, query);
    this._queries.set(query, mql);
    return mql;
  }

  /** Clears all queries from the map of queries. */
  clear() {
    this._queries.clear();
  }

  /** Toggles the matching state of the provided query. */
  setMatchesQuery(query: string, matches: boolean) {
    if (this._queries.has(query)) {
      this._queries.get(query)!.setMatches(matches);
    } else {
      throw Error('This query is not being observed.');
    }
  }
}
