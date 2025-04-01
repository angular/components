/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {coerceArray} from '@angular/cdk/coercion';
import {Injectable, NgZone, OnDestroy, inject} from '@angular/core';
import {combineLatest, concat, Observable, Observer, Subject} from 'rxjs';
import {debounceTime, map, skip, startWith, take, takeUntil} from 'rxjs/operators';
import {MediaMatcher} from './media-matcher';

/** The current state of a layout breakpoint. */
export interface BreakpointState {
  /** Whether the breakpoint is currently matching. */
  matches: boolean;
  /**
   * A key boolean pair for each query provided to the observe method,
   * with its current matched state.
   */
  breakpoints: {
    [key: string]: boolean;
  };
}

/** The current state of a layout breakpoint. */
interface InternalBreakpointState {
  /** Whether the breakpoint is currently matching. */
  matches: boolean;
  /** The media query being to be matched */
  query: string;
}

interface Query {
  observable: Observable<InternalBreakpointState>;
  mql: MediaQueryList;
}

/** Utility for checking the matching state of `@media` queries. */
@Injectable({providedIn: 'root'})
export class BreakpointObserver implements OnDestroy {
  private _mediaMatcher = inject(MediaMatcher);
  private _zone = inject(NgZone);

  /**  A map of all media queries currently being listened for. */
  private _queries = new Map<string, Query>();
  /** A subject for all other observables to takeUntil based on. */
  private readonly _destroySubject = new Subject<void>();

  constructor(...args: unknown[]);
  constructor() {}

  /** Completes the active subject, signalling to all other observables to complete. */
  ngOnDestroy() {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  /**
   * Whether one or more media queries match the current viewport size.
   * @param value One or more media queries to check.
   * @returns Whether any of the media queries match.
   */
  isMatched(value: string | readonly string[]): boolean {
    const queries = splitQueries(coerceArray(value));
    return queries.some(mediaQuery => this._registerQuery(mediaQuery).mql.matches);
  }

  /**
   * Gets an observable of results for the given queries that will emit new results for any changes
   * in matching of the given queries.
   * @param value One or more media queries to check.
   * @returns A stream of matches for the given queries.
   */
  observe(value: string | readonly string[]): Observable<BreakpointState> {
    const queries = splitQueries(coerceArray(value));
    const observables = queries.map(query => this._registerQuery(query).observable);

    let stateObservable = combineLatest(observables);
    // Emit the first state immediately, and then debounce the subsequent emissions.
    stateObservable = concat(
      stateObservable.pipe(take(1)),
      stateObservable.pipe(skip(1), debounceTime(0)),
    );
    return stateObservable.pipe(
      map(breakpointStates => {
        const response: BreakpointState = {
          matches: false,
          breakpoints: {},
        };
        breakpointStates.forEach(({matches, query}) => {
          response.matches = response.matches || matches;
          response.breakpoints[query] = matches;
        });
        return response;
      }),
    );
  }

  /** Registers a specific query to be listened for. */
  private _registerQuery(query: string): Query {
    // Only set up a new MediaQueryList if it is not already being listened for.
    if (this._queries.has(query)) {
      return this._queries.get(query)!;
    }

    const mql = this._mediaMatcher.matchMedia(query);

    // Create callback for match changes and add it is as a listener.
    const queryObservable = new Observable((observer: Observer<MediaQueryListEvent>) => {
      // Listener callback methods are wrapped to be placed back in ngZone. Callbacks must be placed
      // back into the zone because matchMedia is only included in Zone.js by loading the
      // webapis-media-query.js file alongside the zone.js file.  Additionally, some browsers do not
      // have MediaQueryList inherit from EventTarget, which causes inconsistencies in how Zone.js
      // patches it.
      const handler = (e: MediaQueryListEvent): void => this._zone.run(() => observer.next(e));
      mql.addListener(handler);

      return () => {
        mql.removeListener(handler);
      };
    }).pipe(
      startWith(mql),
      map(({matches}) => ({query, matches})),
      takeUntil(this._destroySubject),
    );

    // Add the MediaQueryList to the set of queries.
    const output = {observable: queryObservable, mql};
    this._queries.set(query, output);
    return output;
  }
}

/**
 * Split each query string into separate query strings if two queries are provided as comma
 * separated.
 */
function splitQueries(queries: readonly string[]): readonly string[] {
  return queries
    .map(query => query.split(','))
    .reduce((a1, a2) => a1.concat(a2))
    .map(query => query.trim());
}
