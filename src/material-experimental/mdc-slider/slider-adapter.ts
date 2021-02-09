/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SpecificEventListener, EventType} from '@material/base';
import {MDCSliderAdapter, Thumb, TickMark} from '@material/slider';
import {MatSlider} from './slider';

export class SliderAdapter implements MDCSliderAdapter {
  constructor(private readonly _delegate: MatSlider) {}
  hasClass = (className: string): boolean => {
    return this._delegate._hostElement.classList.contains(className);
  }
  addClass = (className: string): void => {
    this._delegate._hostElement.classList.add(className);
  }
  removeClass = (className: string): void => {
    this._delegate._hostElement.classList.remove(className);
  }
  getAttribute = (attribute: string): string | null => {
    return this._delegate._hostElement.getAttribute(attribute);
  }
  addThumbClass = (className: string, thumb: Thumb): void => {
    this._delegate._getThumbElement(thumb).classList.add(className);
  }
  removeThumbClass = (className: string, thumb: Thumb): void => {
    this._delegate._getThumbElement(thumb).classList.remove(className);
  }
  getInputValue = (thumb: Thumb): string => {
    return this._delegate._getInputElement(thumb).value;
  }
  setInputValue = (value: string, thumb: Thumb): void => {
    this._delegate._getInputElement(thumb).value = value;
  }
  getInputAttribute = (attribute: string, thumb: Thumb): string | null => {
    return this._delegate._getInputElement(thumb).getAttribute(attribute);
  }
  setInputAttribute = (attribute: string, value: string, thumb: Thumb): void => {
    this._delegate._getInputElement(thumb).setAttribute(attribute, value);
  }
  removeInputAttribute = (attribute: string, thumb: Thumb): void => {
    this._delegate._getInputElement(thumb).removeAttribute(attribute);
  }
  focusInput = (thumb: Thumb): void => {
    this._delegate._getInputElement(thumb).focus();
  }
  isInputFocused = (thumb: Thumb): boolean => {
    return this._delegate._getInput(thumb)._isFocused();
  }
  getThumbKnobWidth = (thumb: Thumb): number => {
    return this._delegate._getKnobElement(thumb).getBoundingClientRect().width;
  }
  getThumbBoundingClientRect = (thumb: Thumb): ClientRect => {
    return this._delegate._getThumbElement(thumb).getBoundingClientRect();
  }
  getBoundingClientRect = (): ClientRect => {
    return this._delegate._hostElement.getBoundingClientRect();
  }
  isRTL = (): boolean => {
    // TODO(wagnermaciel): Actually implementing this.
    return false;
  }
  setThumbStyleProperty = (propertyName: string, value: string, thumb: Thumb): void => {
    this._delegate._getThumbElement(thumb).style.setProperty(propertyName, value);
  }
  removeThumbStyleProperty = (propertyName: string, thumb: Thumb): void => {
    this._delegate._getThumbElement(thumb).style.removeProperty(propertyName);
  }
  setTrackActiveStyleProperty = (propertyName: string, value: string): void => {
    this._delegate._trackActive.nativeElement.style.setProperty(propertyName, value);
  }
  removeTrackActiveStyleProperty = (propertyName: string): void => {
    this._delegate._trackActive.nativeElement.style.removeProperty(propertyName);
  }
  setValueIndicatorText = (value: number, thumb: Thumb): void => {
    this._delegate._setValueIndicatorText(value, thumb);
  }
  getValueToAriaValueTextFn = (): ((value: number) => string) | null => {
    return this._delegate.displayWith;
  }
  updateTickMarks = (tickMarks: TickMark[]): void => {
    this._delegate._tickMarks = tickMarks;
    this._delegate._cdr.markForCheck();
  }
  setPointerCapture = (pointerId: number): void => {
    this._delegate._hostElement.setPointerCapture(pointerId);
  }
  // We ignore emitChangeEvent and emitInputEvent because the slider inputs
  // are already exposed so users can just listen for those events directly themselves.
  emitChangeEvent = (value: number, thumb: Thumb): void => {};
  emitInputEvent = (value: number, thumb: Thumb): void => {};
  emitDragStartEvent = (value: number, thumb: Thumb): void => {
    const input = this._delegate._getInput(thumb);
    input.dragStart.emit({
      source: input,
      parent: this._delegate,
      value,
      thumb,
    });
  }
  emitDragEndEvent = (value: number, thumb: Thumb): void => {
    const input = this._delegate._getInput(thumb);
    input.dragEnd.emit({
      source: input,
      parent: this._delegate,
      value,
      thumb,
    });
  }
  registerEventHandler =
    <K extends EventType>(evtType: K, handler: SpecificEventListener<K>): void => {
      this._delegate._hostElement.addEventListener(evtType, handler);
  }
  deregisterEventHandler =
    <K extends EventType>(evtType: K, handler: SpecificEventListener<K>): void => {
      this._delegate._hostElement.removeEventListener(evtType, handler);
  }
  registerThumbEventHandler =
    <K extends EventType>(thumb: Thumb, evtType: K, handler: SpecificEventListener<K>): void => {
      this._delegate._getThumbElement(thumb).addEventListener(evtType, handler);
  }
  deregisterThumbEventHandler =
    <K extends EventType>(thumb: Thumb, evtType: K, handler: SpecificEventListener<K>): void => {
      this._delegate._getThumbElement(thumb).removeEventListener(evtType, handler);
  }
  registerInputEventHandler =
    <K extends EventType>(thumb: Thumb, evtType: K, handler: SpecificEventListener<K>): void => {
      this._delegate._getInputElement(thumb).addEventListener(evtType, handler);
  }
  deregisterInputEventHandler =
    <K extends EventType>(thumb: Thumb, evtType: K, handler: SpecificEventListener<K>): void => {
      this._delegate._getInputElement(thumb).removeEventListener(evtType, handler);
  }
  registerBodyEventHandler =
    <K extends EventType>(evtType: K, handler: SpecificEventListener<K>): void => {
      this._delegate._document.body.addEventListener(evtType, handler);
  }
  deregisterBodyEventHandler =
    <K extends EventType>(evtType: K, handler: SpecificEventListener<K>): void => {
      this._delegate._document.body.removeEventListener(evtType, handler);
  }
  registerWindowEventHandler =
    <K extends EventType>(evtType: K, handler: SpecificEventListener<K>): void => {
      this._delegate._window.addEventListener(evtType, handler);
  }
  deregisterWindowEventHandler =
    <K extends EventType>(evtType: K, handler: SpecificEventListener<K>): void => {
      this._delegate._window.removeEventListener(evtType, handler);
  }
}
