/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable, NgZone} from '@angular/core';
import {MediaMatcher} from './media-matcher';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import {Subscription} from 'rxjs/Subscription';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {fromEventPattern} from 'rxjs/observable/fromEventPattern';
import {RxChain, startWith, map} from '../rxjs';

export interface MediaChange {
  query: string;
  matches: boolean;
}

interface MediaQueryManagerQuery {
  observable: Observable<MediaChange>;
  mql: MediaQueryList;
}

/* class ZonedMatchMediaObservable<MediaQueryList> extends Observable<MediaQueryList> {
  constructor(private zone: NgZone,
              private addHandler: (handler: Function) => void,
              private removeHandler: (handler: Function) => void) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<MediaQueryList>) {
    const handler = (mql: MediaQueryList): void => {
      this.zone.run(() => subscriber.next(mql));
    };
    this.addHandler(handler);
    subscriber.add(new Subscription(() => {
      this.removeHandler(handler);
    }));
  }
} */

@Injectable()
export class MediaQueryManager {
  // A map of all media queries currently being listened for.
  private _queries: Map<string, MediaQueryManagerQuery> = new Map();

  constructor(private _ngZone: NgZone, private mediaMatcher: MediaMatcher) {}

  /**
   * Whether the query is listened for and currently matches.
   *
   * @param query A media query or list of media queries.
   */
  isMatched(value: string| string[]): boolean {
    let queries = coerceArray(value);
    return queries.some((mediaQuery: string) => {
      return this._registerQuery(mediaQuery).mql.matches;
    });
  }

  /**
   * Retrieves an observable for the query or list of queries provided, informing of all of the
   * changes.
   *
   * @param query A media query or list of media queries.
   */
  observe(value: string | string[]): Observable<MediaChange> {
    let queries = coerceArray(value);
    let observables = queries.map(query => this._registerQuery(query).observable);

    return combineLatest(observables, (a: MediaChange, b: MediaChange) => {
      return <MediaChange>{
        matches: (a && a.matches) || (b && b.matches),
        query: queries.join(', ')
      };
    });
  }

  /**
   * Registers a media query to be listened for.
   *
   * @param query A media query.
   */
  private _registerQuery(query: string): MediaQueryManagerQuery {
    // Only set up a new MediaQueryList if it is not already being watched for.
    if (this._queries.has(query)) {
      return this._queries.get(query)!;
    }
    // Create new MediaQueryList.
    let mql: MediaQueryList = this.mediaMatcher.matchMedia(query);
    // Create callback for match changes and add it is as a listener.
    // let queryObservable = RxChain.from(new ZonedMatchMediaObservable(
    let queryObservable = RxChain.from(fromEventPattern(
      (h: MediaQueryListListener) => {
        (mql as any).addEventListener('change', h);
      },
      (h: MediaQueryListListener) => {
        (mql as any).removeEventListener('change', h);
        this._queries.delete(query);
      }))
      .call(startWith, mql)
      .call(map, (nextMql: MediaQueryList) => {
        return { query: query, matches: nextMql.matches };
      })
      .result();

    // Add the MediaQueryList to the set of queries.
    let output =  {observable: queryObservable, mql: mql};
    this._queries.set(query, output);
    return output;
  }
}


/**
 * Coerces a string or array of strings into an array of strings.
 */
function coerceArray(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}
