/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Renderer2, VERSION, ListenerOptions} from '@angular/core';

// TODO(crisbeto): remove this function when making breaking changes for v20.
/**
 * Binds an event listener with specific options in a backwards-compatible way.
 * This function is necessary, because `Renderer2.listen` only supports listener options
 * after 19.1 and during the v19 period we support any 19.x version.
 * @docs-private
 */
export function _bindEventWithOptions(
  renderer: Renderer2,
  target: EventTarget,
  eventName: string,
  callback: (event: any) => boolean | void,
  options: ListenerOptions,
): () => void {
  const major = parseInt(VERSION.major);
  const minor = parseInt(VERSION.minor);

  // Event options in `listen` are only supported in 19.1 and beyond.
  // We also allow 0.0.x, because that indicates a build at HEAD.
  if (major > 19 || (major === 19 && minor > 0) || (major === 0 && minor === 0)) {
    return renderer.listen(target, eventName, callback, options);
  }

  target.addEventListener(eventName, callback, options);

  return () => {
    target.removeEventListener(eventName, callback, options);
  };
}
