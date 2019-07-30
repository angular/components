/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dispatchFakeEvent, dispatchKeyboardEvent} from './dispatch-events';
import {triggerFocus} from './element-focus';

/** Modifier keys that may be held while typing. */
export interface KeyModifiers {
  control?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

/**
 * Represents a special key that does not result in a character being inputed in a text field.
 * @docs-private
 */
export interface SpecialKey {
  keyCode: number;
  key?: string;
}

/**
 * Checks whether the given Element is a text input element.
 * @docs-private
 */
export function isTextInput(element: Element): element is HTMLInputElement | HTMLTextAreaElement {
  return element.nodeName.toLowerCase() === 'input' ||
      element.nodeName.toLowerCase() === 'textarea' ;
}

/**
 * Focuses an input, sets its value and dispatches
 * the `input` event, simulating the user typing.
 * @param element Element onto which to set the value.
 * @param keys The keys to send to the element.
 * @docs-private
 */
export function typeInElement(element: HTMLElement, ...keys: (string | SpecialKey)[]): void;

/**
 * Focuses an input, sets its value and dispatches
 * the `input` event, simulating the user typing.
 * @param element Element onto which to set the value.
 * @param modifiers Modifier keys that are held while typing.
 * @param keys The keys to send to the element.
 * @docs-private
 */
export function typeInElement(
    element: HTMLElement, modifiers: KeyModifiers, ...keys: (string | SpecialKey)[]): void;

export function typeInElement(element: HTMLElement, ...modifiersAndKeys: any) {
  const first = modifiersAndKeys[0];
  let modifiers: KeyModifiers;
  let keys: (string | SpecialKey)[];
  if (typeof first !== 'string' && first.keyCode === undefined) {
    modifiers = first;
    keys = modifiersAndKeys.slice(1);
  } else {
    modifiers = {};
    keys = modifiersAndKeys;
  }

  // TODO: pass through modifiers
  triggerFocus(element);
  for (const keyOrStr of keys) {
    if (typeof keyOrStr === 'string') {
      for (const key of keyOrStr) {
        const keyCode = key.charCodeAt(0);
        dispatchKeyboardEvent(element, 'keydown', keyCode);
        dispatchKeyboardEvent(element, 'keypress', keyCode);
        if (isTextInput(element)) {
          element.value += key;
          dispatchFakeEvent(element, 'input');
        }
        dispatchKeyboardEvent(element, 'keyup', keyCode);
      }
    } else {
      dispatchKeyboardEvent(element, 'keydown', keyOrStr.keyCode, keyOrStr.key);
      dispatchKeyboardEvent(element, 'keypress', keyOrStr.keyCode, keyOrStr.key);
      dispatchKeyboardEvent(element, 'keyup', keyOrStr.keyCode, keyOrStr.key);
    }
  }
}

/**
 * Clears the text in an input or textarea element.
 * @docs-private
 */
export function clearElement(element: HTMLInputElement | HTMLTextAreaElement) {
  triggerFocus(element as HTMLElement);
  element.value = '';
  dispatchFakeEvent(element, 'input');
}
