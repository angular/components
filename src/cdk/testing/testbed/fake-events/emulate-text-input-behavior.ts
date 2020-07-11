/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModifierKeys} from '@angular/cdk/testing';
import {dispatchFakeEvent} from './dispatch-events';
import {TextInputElement} from './text-input-element';
import {emulateArrowInTextInput, isArrowKey} from './emulate-arrow-in-text-input';
import {writeCharacter} from './emulate-char-in-text-input';

/**
 * Emulate browser behavior of keys in text inputs.
 *
 * will not send key events themself but:
 * - Change the value on character input at cursor position
 *
 * @param modifiers ModifierKeys that may change behavior
 * @param key to emulate
 * @param element TextInputElement
 * @see to send key events use {@linkcode file://./type-in-element.ts#typeInElement}
 *
 * @docs-private
 */
export function emulateKeyInTextInput(
  modifiers: ModifierKeys, key: string, element: TextInputElement,
) {
  if (key.length === 1) {
    writeCharacter(element, key);
  } else if (isArrowKey(key)) {
    emulateArrowInTextInput(modifiers, key, element);
  }
}

/**
 * Clears the text of a TextInputElement.
 * @docs-private
 */
export function clearTextElement(element: TextInputElement) {
  element.value = '';
  dispatchFakeEvent(element, 'input');
}
