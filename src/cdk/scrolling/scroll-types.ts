/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef} from '@angular/core';
import {Observable} from 'rxjs';

export type _Without<T> = {[P in keyof T]?: never};
export type _XOR<T, U> = (_Without<T> & U) | (_Without<U> & T);
export type _Top = {top?: number};
export type _Bottom = {bottom?: number};
export type _Left = {left?: number};
export type _Right = {right?: number};
export type _Start = {start?: number};
export type _End = {end?: number};
export type _XAxis = _XOR<_XOR<_Left, _Right>, _XOR<_Start, _End>>;
export type _YAxis = _XOR<_Top, _Bottom>;

/**
 * An extended version of ScrollToOptions that allows expressing scroll offsets relative to the
 * top, bottom, left, right, start, or end of the viewport rather than just the top and left.
 * Please note: the top and bottom properties are mutually exclusive, as are the left, right,
 * start, and end properties.
 */
export type ExtendedScrollToOptions = _XAxis & _YAxis & ScrollOptions;

/** Edge from which a scroll offset can be measured. */
export type ScrollOffsetEdge = 'top' | 'left' | 'right' | 'bottom' | 'start' | 'end';

/**
 * Object that can be registered with the `ScrollDispatcher`. Used to avoid a circular
 * dependencies between the `ScrollDispatcher` and `CdkScrollable.`
 * @docs-private
 */
export interface Scrollable {
  elementScrolled(): Observable<Event>;
  getElementRef(): ElementRef<HTMLElement>;
  measureScrollOffset(from: ScrollOffsetEdge): number;
  scrollTo(options: ExtendedScrollToOptions): void;
}
