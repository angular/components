/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dispatchFakeEvent} from './dispatch-events';

function triggerFocusChange(element: HTMLElement, event: 'focus' | 'blur') {
  let eventFired = false;
  const handler = () => eventFired = true;
  element.addEventListener(event, handler);
  element[event]();
  element.removeEventListener(event, handler);
  if (!eventFired) {
    dispatchFakeEvent(element, event);
  }
}

/**
 * Patches an elements focus and blur methods to emit events consistently and predictably.
 * This is necessary, because some browsers, like IE11, will call the focus handlers asynchronously,
 * while others won't fire them at all if the browser window is not focused.
 */
export function patchElementFocus(element: HTMLElement) {
    element.focus = () => {
        dispatchFakeEvent(element, 'focus');
        dispatchFakeEvent(element, 'focusin');
    };
    element.blur = () => {
        dispatchFakeEvent(element, 'blur');
        dispatchFakeEvent(element, 'focusout');
    };
}

/** @docs-private */
export function triggerFocus(element: HTMLElement) {
  triggerFocusChange(element, 'focus');
}

/** @docs-private */
export function triggerBlur(element: HTMLElement) {
  triggerFocusChange(element, 'blur');
}
