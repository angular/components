/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Checks whether the given Element is a TextInputElement.
 * @docs-private
 */
export function isTextInput(element: Element): element is TextInputElement {
  return isTextArea(element) || isInputWithText(element);
}

function isTextArea(element: Element): element is HTMLTextAreaElement {
  return element.nodeName.toLowerCase() === 'textarea';
}

const inputsTypesWithoutText = ['checkbox', 'radio'];
function isInputWithText(element: Element): element is HTMLInputElement {
  return element.nodeName.toLowerCase() === 'input'
    && (inputsTypesWithoutText.indexOf((element as HTMLInputElement).type) < 0)
  ;
}

/**
 * Inputs that contains editable text values.
 * @docs-private
 */
export type TextInputElement = HTMLInputElement | HTMLTextAreaElement;

/**
 * get selection start with fallbacks
 * @docs-private
 */
export function getSelectionStart(element: TextInputElement): number {
  if (typeof element.selectionStart === 'number') {
    return element.selectionStart;
  } else if (typeof element.selectionEnd === 'number') {
    return element.selectionEnd;
  } else {
    return getValueLength(element);
  }
}

/**
 * get selection end with fallbacks
 * @docs-private
 */
export function getSelectionEnd(element: TextInputElement): number {
  if (typeof element.selectionEnd === 'number') {
    return element.selectionEnd;
  } else if (typeof element.selectionStart === 'number') {
    return element.selectionStart;
  } else {
    return getValueLength(element);
  }
}

/**
 * get value length with fallbacks
 * @docs-private
 */
export function getValueLength(element: TextInputElement): number {
  if (typeof element.value === 'string') {
    return element.value.length;
  } else {
    return 0;
  }
}
