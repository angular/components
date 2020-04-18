/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModifierKeys} from '@angular/cdk/testing';
import {dispatchFakeEvent, dispatchKeyboardEvent} from './dispatch-events';
import {triggerFocus} from './element-focus';

/**
 * Checks whether the given Element is a text input element.
 * @docs-private
 */
function isTextInput(element: Element): element is HTMLInputElement | HTMLTextAreaElement {
  const nodeName = element.nodeName.toLowerCase();
  return nodeName === 'input' || nodeName === 'textarea' ;
}

/**
 * Checks whether the given Element's content is editable.
 * An element is content editable if
 * - the element has "contenteditable" attribute set to "true"
 * - any of its ancestors has "contenteditable" attribute set to "true"
 * - the owner document has designMode attribute set to "on".
 * @docs-private
 */
function isContentEditable(element: Element): element is HTMLElement {
  return element instanceof HTMLElement && element.isContentEditable;
}

/**
 * Checks whether the given Element changes with input from keyboard.
 * @docs-private
 */
function isInputAware(element: Element): element is HTMLElement {
  return isTextInput(element) || isContentEditable(element);
}

/**
 * Focuses an input, sets its value and dispatches
 * the `input` event, simulating the user typing.
 * @param element Element onto which to set the value.
 * @param keys The keys to send to the element.
 * @docs-private
 */
export function typeInElement(
    element: HTMLElement, ...keys: (string | {keyCode?: number, key?: string})[]): void;

/**
 * Focuses an input, sets its value and dispatches
 * the `input` event, simulating the user typing.
 * @param element Element onto which to set the value.
 * @param modifiers Modifier keys that are held while typing.
 * @param keys The keys to send to the element.
 * @docs-private
 */
export function typeInElement(element: HTMLElement, modifiers: ModifierKeys,
                              ...keys: (string | {keyCode?: number, key?: string})[]): void;

export function typeInElement(element: HTMLElement, ...modifiersAndKeys: any) {
  if (!isInputAware(element)) {
    throw new Error('Attempting to send keys to an invalid element');
  }
  const first = modifiersAndKeys[0];
  let modifiers: ModifierKeys;
  let rest: (string | {keyCode?: number, key?: string})[];
  if (typeof first !== 'string' && first.keyCode === undefined && first.key === undefined) {
    modifiers = first;
    rest = modifiersAndKeys.slice(1);
  } else {
    modifiers = {};
    rest = modifiersAndKeys;
  }
  const keys: {keyCode?: number, key?: string}[] = rest
      .map(k => typeof k === 'string' ?
          k.split('').map(c => ({keyCode: c.toUpperCase().charCodeAt(0), key: c})) : [k])
      .reduce((arr, k) => arr.concat(k), []);

  triggerFocus(element);
  for (const key of keys) {
    dispatchKeyboardEvent(element, 'keydown', key.keyCode, key.key, modifiers);
    dispatchKeyboardEvent(element, 'keypress', key.keyCode, key.key, modifiers);
    if (isInputAware(element) && key.key?.length === 1) {
      if (isTextInput(element)) {
        element.value += key.key;
      } else {
        element.appendChild(new Text(key.key));
      }
      dispatchFakeEvent(element, 'input');
    }
    dispatchKeyboardEvent(element, 'keyup', key.keyCode, key.key, modifiers);
  }
}

/**
 * Clears the content or text of an input aware element.
 * @docs-private
 */
export function clearElement(element: Element) {
  if (!isInputAware(element)) {
    throw new Error('Attempting to clear an invalid element');
  }
  triggerFocus(element);
  if (isTextInput(element)) {
    element.value = '';
  } else {
    element.textContent = '';
  }
  dispatchFakeEvent(element, 'input');
}
