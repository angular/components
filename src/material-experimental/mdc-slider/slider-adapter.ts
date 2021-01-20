/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SpecificEventListener, EventType} from '@material/base';
import {MDCSliderAdapter, Thumb, TickMark} from '@material/slider';

export class SliderAdapter implements MDCSliderAdapter {
  hasClass(className: string): boolean {
    throw Error('Method not implemented.');
  }
  addClass(className: string): void {
    throw Error('Method not implemented.');
  }
  removeClass(className: string): void {
    throw Error('Method not implemented.');
  }
  getAttribute(attribute: string): string | null {
    throw Error('Method not implemented.');
  }
  addThumbClass(className: string, thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  removeThumbClass(className: string, thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  getInputValue(thumb: Thumb): string {
    throw Error('Method not implemented.');
  }
  setInputValue(value: string, thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  getInputAttribute(attribute: string, thumb: Thumb): string | null {
    throw Error('Method not implemented.');
  }
  setInputAttribute(attribute: string, value: string, thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  removeInputAttribute(attribute: string, thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  focusInput(thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  isInputFocused(thumb: Thumb): boolean {
    throw Error('Method not implemented.');
  }
  getThumbKnobWidth(thumb: Thumb): number {
    throw Error('Method not implemented.');
  }
  getThumbBoundingClientRect(thumb: Thumb): ClientRect {
    throw Error('Method not implemented.');
  }
  getBoundingClientRect(): ClientRect {
    throw Error('Method not implemented.');
  }
  isRTL(): boolean {
    throw Error('Method not implemented.');
  }
  setThumbStyleProperty(propertyName: string, value: string, thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  removeThumbStyleProperty(propertyName: string, thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  setTrackActiveStyleProperty(propertyName: string, value: string): void {
    throw Error('Method not implemented.');
  }
  removeTrackActiveStyleProperty(propertyName: string): void {
    throw Error('Method not implemented.');
  }
  setValueIndicatorText(value: number, thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  getValueToAriaValueTextFn(): ((value: number) => string) | null {
    throw Error('Method not implemented.');
  }
  updateTickMarks(tickMarks: TickMark[]): void {
    throw Error('Method not implemented.');
  }
  setPointerCapture(pointerId: number): void {
    throw Error('Method not implemented.');
  }
  emitChangeEvent(value: number, thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  emitInputEvent(value: number, thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  emitDragStartEvent(value: number, thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  emitDragEndEvent(value: number, thumb: Thumb): void {
    throw Error('Method not implemented.');
  }
  registerEventHandler<K extends EventType>(evtType: K, handler: SpecificEventListener<K>): void {
    throw Error('Method not implemented.');
  }
  deregisterEventHandler<K extends EventType>(evtType: K, handler: SpecificEventListener<K>): void {
    throw Error('Method not implemented.');
  }
  registerThumbEventHandler<K extends EventType>
    (thumb: Thumb, evtType: K, handler: SpecificEventListener<K>): void {
    throw Error('Method not implemented.');
  }
  deregisterThumbEventHandler<K extends EventType>
    (thumb: Thumb, evtType: K, handler: SpecificEventListener<K>): void {
    throw Error('Method not implemented.');
  }
  registerInputEventHandler<K extends EventType>
    (thumb: Thumb, evtType: K, handler: SpecificEventListener<K>): void {
    throw Error('Method not implemented.');
  }
  deregisterInputEventHandler<K extends EventType>
    (thumb: Thumb, evtType: K, handler: SpecificEventListener<K>): void {
    throw Error('Method not implemented.');
  }
  registerBodyEventHandler<K extends EventType>
    (evtType: K, handler: SpecificEventListener<K>): void {
    throw Error('Method not implemented.');
  }
  deregisterBodyEventHandler<K extends EventType>
    (evtType: K, handler: SpecificEventListener<K>): void {
    throw Error('Method not implemented.');
  }
  registerWindowEventHandler<K extends EventType>
    (evtType: K, handler: SpecificEventListener<K>): void {
    throw Error('Method not implemented.');
  }
  deregisterWindowEventHandler<K extends EventType>
    (evtType: K, handler: SpecificEventListener<K>): void {
    throw Error('Method not implemented.');
  }
}
