/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, ElementRef, inject, Injector} from '@angular/core';
import {createDragRef, DragRef, DragRefConfig} from './drag-ref';
import {createDropListRef, DropListRef} from './drop-list-ref';

/**
 * Service that allows for drag-and-drop functionality to be attached to DOM elements.
 * @deprecated Use the `createDragRef` or `createDropListRef` function for better tree shaking.
 * Will be removed in v23.
 * @breaking-change 23.0.0
 */
@Injectable({providedIn: 'root'})
export class DragDrop {
  private _injector = inject(Injector);

  constructor(...args: unknown[]);
  constructor() {}

  /**
   * Turns an element into a draggable item.
   * @param element Element to which to attach the dragging functionality.
   * @param config Object used to configure the dragging behavior.
   * @deprecated Use the `createDragRef` function that provides better tree shaking.
   * @breaking-change 23.0.0
   */
  createDrag<T = any>(
    element: ElementRef<HTMLElement> | HTMLElement,
    config?: DragRefConfig,
  ): DragRef<T> {
    return createDragRef(this._injector, element, config);
  }

  /**
   * Turns an element into a drop list.
   * @param element Element to which to attach the drop list functionality.
   * @deprecated Use the `createDropListRef` function that provides better tree shaking.
   * @breaking-change 23.0.0
   */
  createDropList<T = any>(element: ElementRef<HTMLElement> | HTMLElement): DropListRef<T> {
    return createDropListRef(this._injector, element);
  }
}
