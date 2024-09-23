/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Injectable, CSP_NONCE, inject} from '@angular/core';
import {Platform} from '@angular/cdk/platform';

/** Global registry for all dynamically-created, injected media queries. */
const mediaQueriesForWebkitCompatibility: Set<string> = new Set<string>();

/** Style tag that holds all of the dynamically-created media queries. */
let mediaQueryStyleNode: HTMLStyleElement | undefined;

/** A utility for calling matchMedia queries. */
@Injectable({providedIn: 'root'})
export class MediaMatcher {
  private _platform = inject(Platform);
  private _nonce = inject(CSP_NONCE, {optional: true});

  /** The internal matchMedia method to return back a MediaQueryList like object. */
  private _matchMedia: (query: string) => MediaQueryList;

  constructor(...args: unknown[]);

  constructor() {
    this._matchMedia =
      this._platform.isBrowser && window.matchMedia
        ? // matchMedia is bound to the window scope intentionally as it is an illegal invocation to
          // call it from a different scope.
          window.matchMedia.bind(window)
        : noopMatchMedia;
  }

  /**
   * Evaluates the given media query and returns the native MediaQueryList from which results
   * can be retrieved.
   * Confirms the layout engine will trigger for the selector query provided and returns the
   * MediaQueryList for the query provided.
   */
  matchMedia(query: string): MediaQueryList {
    if (this._platform.WEBKIT || this._platform.BLINK) {
      createEmptyStyleRule(query, this._nonce);
    }
    return this._matchMedia(query);
  }
}

/**
 * Creates an empty stylesheet that is used to work around browser inconsistencies related to
 * `matchMedia`. At the time of writing, it handles the following cases:
 * 1. On WebKit browsers, a media query has to have at least one rule in order for `matchMedia`
 * to fire. We work around it by declaring a dummy stylesheet with a `@media` declaration.
 * 2. In some cases Blink browsers will stop firing the `matchMedia` listener if none of the rules
 * inside the `@media` match existing elements on the page. We work around it by having one rule
 * targeting the `body`. See https://github.com/angular/components/issues/23546.
 */
function createEmptyStyleRule(query: string, nonce: string | undefined | null) {
  if (mediaQueriesForWebkitCompatibility.has(query)) {
    return;
  }

  try {
    if (!mediaQueryStyleNode) {
      mediaQueryStyleNode = document.createElement('style');

      if (nonce) {
        mediaQueryStyleNode.setAttribute('nonce', nonce);
      }

      mediaQueryStyleNode.setAttribute('type', 'text/css');
      document.head!.appendChild(mediaQueryStyleNode);
    }

    if (mediaQueryStyleNode.sheet) {
      mediaQueryStyleNode.sheet.insertRule(`@media ${query} {body{ }}`, 0);
      mediaQueriesForWebkitCompatibility.add(query);
    }
  } catch (e) {
    console.error(e);
  }
}

/** No-op matchMedia replacement for non-browser platforms. */
function noopMatchMedia(query: string): MediaQueryList {
  // Use `as any` here to avoid adding additional necessary properties for
  // the noop matcher.
  return {
    matches: query === 'all' || query === '',
    media: query,
    addListener: () => {},
    removeListener: () => {},
  } as any;
}
