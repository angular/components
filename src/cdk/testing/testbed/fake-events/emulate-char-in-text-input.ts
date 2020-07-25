/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dispatchFakeEvent} from './dispatch-events';
import {getSelectionEnd, getSelectionStart, TextInputElement} from './text-input-element';

/**
 * emulate writing characters into text input fields.
 * @docs-private
 */
export function writeCharacter(element: TextInputElement, key: string) {
  if (!hasToRespectSelection(element)) {
    element.value += key;
  } else {
    const value = element.value;
    const selectionStart = getSelectionStart(element);
    const valueBeforeSelection = value.substr(0, selectionStart);
    const selectionEnd = getSelectionEnd(element);
    const valueAfterSelection = value.substr(selectionEnd);
    element.value = valueBeforeSelection + key + valueAfterSelection;

    const cursor = selectionStart + key.length;
    element.setSelectionRange(cursor, cursor, 'none');
  }
  dispatchFakeEvent(element, 'input');
}

const knownInputTypesWithSelectionIssues = ['color'];
function hasToRespectSelection(element: TextInputElement): boolean {
  try {
    return typeof element.value === 'string' && element.value.length > 0
      && typeof element.selectionStart === 'number' && element.selectionStart < element.value.length
    ;
  } catch (e) {
    // Safari will throw 'type error' on input[type=color].selectionStart.get().
    if (knownInputTypesWithSelectionIssues.indexOf(element.type) < 0) {
      console.warn('could not detect selection of ', element);
    }
    // In general we can't respect selection if we can't detect selection so this will return false.
    return false;
  }
}
