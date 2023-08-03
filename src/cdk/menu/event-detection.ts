/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef} from '@angular/core';
import {ENTER, SPACE} from '@angular/cdk/keycodes';

/** Checks whether a keyboard event will trigger a native `click` event on an element. */
export function eventDispatchesNativeClick(
  elementRef: ElementRef<HTMLElement>,
  event: KeyboardEvent,
): boolean {
  // Synthetic events won't trigger clicks.
  if (!event.isTrusted) {
    return false;
  }

  const el = elementRef.nativeElement;
  const keyCode = event.keyCode;

  // Buttons trigger clicks both on space and enter events.
  if (el.nodeName === 'BUTTON' && !(el as HTMLButtonElement).disabled) {
    return keyCode === ENTER || keyCode === SPACE;
  }

  // Links only trigger clicks on enter.
  if (el.nodeName === 'A') {
    return keyCode === ENTER;
  }

  // Any other elements won't dispatch clicks from keyboard events.
  return false;
}
