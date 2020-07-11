/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  TextInputElement, getSelectionStart, getValueLength, getSelectionEnd,
} from './text-input-element';

type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';
export function isArrowKey(key: string): key is ArrowKey {
  return key.startsWith('Arrow');
}

/**
 * will move cursor and/or change selection of text value
 */
export function emulateArrowInTextInput(
  modifiers: { shift?: boolean }, key: ArrowKey, element: TextInputElement,
) {
  if (modifiers.shift) {
    switch (key) {
      case 'ArrowUp': return emulateShiftArrowUp(element);
      case 'ArrowRight': return emulateShiftArrowRight(element);
      case 'ArrowDown': return emulateShiftArrowDown(element);
      case 'ArrowLeft': return emulateShiftArrowLeft(element);
    }
  } else {
    switch (key) {
      case 'ArrowUp': return emulateArrowUp(element);
      case 'ArrowRight': return emulateArrowRight(element);
      case 'ArrowDown': return emulateArrowDown(element);
      case 'ArrowLeft': return emulateArrowLeft(element);
    }
  }
}

function emulateArrowUp(target: TextInputElement) {
  const lineLength = getLineLength(target);
  const selectionStart = getSelectionStart(target);

  setCursor(target, Math.max(selectionStart - lineLength, 0));
}

function setCursor(target: TextInputElement, position: number) {
  target.setSelectionRange(position, position, 'none');
}

function getLineLength(target: TextInputElement, valueLength = getValueLength(target)) {
  return target instanceof HTMLTextAreaElement ? target.cols : valueLength;
}

function emulateArrowRight(target: TextInputElement) {
  if (target.selectionStart !== target.selectionEnd) {
    setCursor(target, getSelectionEnd(target));
    return;
  }

  const valueLength = getValueLength(target);
  const selectionEnd = target.selectionEnd;
  if (selectionEnd && selectionEnd < valueLength) {
    setCursor(target, selectionEnd + 1);
  } else {
    setCursor(target, valueLength);
  }
}

function emulateArrowDown(target: TextInputElement) {
  const valueLength = getValueLength(target);
  const lineLength = getLineLength(target, valueLength);
  const selectionEnd = getSelectionEnd(target);
  setCursor(target, Math.min(selectionEnd + lineLength, valueLength));
}

function emulateArrowLeft(target: TextInputElement) {
  if (target.selectionStart !== target.selectionEnd) {
    setCursor(target, getSelectionStart(target));
    target.selectionEnd = target.selectionStart;
    return;
  }

  const selectionStart = getSelectionStart(target);
  if (selectionStart && selectionStart > 0) {
    setCursor(target, selectionStart - 1);
    return;
  }

  const valueLength = getValueLength(target);
  if (valueLength > 0) {
    setCursor(target, valueLength - 1);
    return;
  }

  setCursor(target, 0);
}

function emulateShiftArrowUp(target: TextInputElement) {
  const lineLength = getLineLength(target);

  if (isSelectionDirectionOf(target, 'forward')) {
    reduceSelectionAtSelectionEnd(target, lineLength);
  } else {
    extendSelectionAtSelectionStart(target, lineLength);
  }
}

function isSelectionDirectionOf(target: TextInputElement, direction: 'forward' | 'backward') {
  return target.selectionDirection === direction && (target.selectionStart !== target.selectionEnd);
}

function extendSelectionAtSelectionStart(target: TextInputElement, lengthToExtend: number) {
  const selectionStart = getSelectionStart(target);
  const newSelectionStart = Math.max(selectionStart - lengthToExtend, 0);
  target.selectionStart = newSelectionStart;
  if (target.selectionDirection !== 'backward') {
    target.selectionDirection = 'backward';
  }
}

function reduceSelectionAtSelectionEnd(target: TextInputElement, lengthToReduce: number) {
  const selectionStart = getSelectionStart(target);
  const selectionEnd = getSelectionEnd(target);
  const newSelectionEnd = selectionEnd - lengthToReduce;

  if (selectionStart < newSelectionEnd) {
    target.selectionEnd = newSelectionEnd;
  } else {
    target.selectionEnd = selectionStart;
    target.selectionDirection = 'none';
    // there's a different behavior in firefox, which would move selection end:
    // target.selectionEnd = selectionStart;
    // target.selectionStart = newSelectionEnd;
    // target.selectionDirection = 'backward';
  }
}

function emulateShiftArrowRight(target: TextInputElement) {
  if (isSelectionDirectionOf(target, 'backward')) {
    reduceSelectionAtSelectionStart(target, 1);
  } else {
    extendSelectionAtSelectionEnd(target, 1);
  }
}

function extendSelectionAtSelectionEnd(target: TextInputElement, lengthToExtend: number) {
  const valueLength = getValueLength(target);
  const selectionEnd = getSelectionEnd(target);
  target.selectionEnd = Math.min(selectionEnd + lengthToExtend, valueLength);
  if (target.selectionDirection !== 'forward') {
    target.selectionDirection = 'forward';
  }
}

function reduceSelectionAtSelectionStart(target: TextInputElement, lengthToReduce: number) {
  const selectionStart = getSelectionStart(target);
  const selectionEnd = getSelectionEnd(target);
  const newSelectionStart = selectionStart + lengthToReduce;

  if (newSelectionStart < selectionEnd) {
    target.selectionStart = newSelectionStart;
  } else {
    target.selectionStart = selectionEnd;
    target.selectionDirection = 'none';
    // there's a different behavior in firefox, which would move selection end:
    // target.selectionStart = selectionEnd;
    // target.selectionEnd = newSelectionStart;
    // target.selectionDirection = 'forward';
  }
}

function emulateShiftArrowDown(target: TextInputElement) {
  const lineLength = getLineLength(target);

  if (isSelectionDirectionOf(target, 'backward')) {
    reduceSelectionAtSelectionStart(target, lineLength);
  } else {
    extendSelectionAtSelectionEnd(target, lineLength);
  }
}

function emulateShiftArrowLeft(target: TextInputElement) {
  if (isSelectionDirectionOf(target, 'forward')) {
    reduceSelectionAtSelectionEnd(target, 1);
  } else {
    extendSelectionAtSelectionStart(target, 1);
  }
}
