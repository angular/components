/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {trustedHTMLFromString} from './trusted-types';

// !!!Note!!! this file isn't synced into g3, but is replaced with a version that uses
// internal-specific APIs. The internal version may have to be updated if the signature of
// the function changes.

/** Sanitizes and sets the `innerHTML` of an element. */
export function _setInnerHtml(element: HTMLElement, html: SafeHtml, sanitizer: DomSanitizer): void {
  const cleanHtml = sanitizer.sanitize(SecurityContext.HTML, html);

  if (!cleanHtml && (typeof ngDevMode === 'undefined' || ngDevMode)) {
    throw new Error(`Could not sanitize HTML: ${html}`);
  }

  element.innerHTML = trustedHTMLFromString(cleanHtml || '') as unknown as string;
}
