/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable} from '@angular/core';
import {Platform} from '../platform';

@Injectable()
export class MediaMatcher {
  private _matchMedia: (query: string) => MediaQueryList;
  constructor(platform: Platform) {
    this._matchMedia = platform.isBrowser ?
      (<any>window).matchMedia.bind((<any>window)) :
      (query: string) => <MediaQueryList>{
        matches: query === 'all' || query === '',
        media: query,
        addListener: () => {},
        removeListener: () => {}
      };
  }

  matchMedia(query: string) {
    createEmptyStyleRule(query);
    return this._matchMedia(query);
  }
}


/**
 * For Webkit engines that only trigger the MediaQueryListListener
 * when there is at least one CSS selector for the respective media query.
 * @param query A media query.
 */
function createEmptyStyleRule(query: string) {
  if (!styleElementForWebkitCompatibility[query]) {
    try {
      let style: HTMLStyleElement = document.createElement('style');

      style.setAttribute('type', 'text/css');
      if (!style.sheet) {
        let cssText = `@media ${query} {.fx-query-test{ }}`;
        style.appendChild(document.createTextNode(cssText));
      }

      document.getElementsByTagName('head')[0].appendChild(style);

      // Store in private global registry
      styleElementForWebkitCompatibility[query] = style;
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 * Global registry for all dynamically-created, injected style tags.
 */
let styleElementForWebkitCompatibility: {[key: string]: HTMLStyleElement} = {};
