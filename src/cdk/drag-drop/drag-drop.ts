/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, NgZone, ElementRef, inject, RendererFactory2} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {DragRef, DragRefConfig} from './drag-ref';
import {DropListRef} from './drop-list-ref';
import {DragDropRegistry} from './drag-drop-registry';

/** Default configuration to be used when creating a `DragRef`. */
const DEFAULT_CONFIG = {
  dragStartThreshold: 5,
  pointerDirectionChangeThreshold: 5,
};

/**
 * Service that allows for drag-and-drop functionality to be attached to DOM elements.
 */
@Injectable({providedIn: 'root'})
export class DragDrop {
  private _document = inject(DOCUMENT);
  private _ngZone = inject(NgZone);
  private _viewportRuler = inject(ViewportRuler);
  private _dragDropRegistry = inject(DragDropRegistry);
  private _renderer = inject(RendererFactory2).createRenderer(null, null);

  constructor(...args: unknown[]);
  constructor() {}

  /**
   * Turns an element into a draggable item.
   * @param element Element to which to attach the dragging functionality.
   * @param config Object used to configure the dragging behavior.
   */
  createDrag<T = any>(
    element: ElementRef<HTMLElement> | HTMLElement,
    config: DragRefConfig = DEFAULT_CONFIG,
  ): DragRef<T> {
    return new DragRef<T>(
      element,
      config,
      this._document,
      this._ngZone,
      this._viewportRuler,
      this._dragDropRegistry,
      this._renderer,
    );
  }

  /**
   * Turns an element into a drop list.
   * @param element Element to which to attach the drop list functionality.
   */
  createDropList<T = any>(element: ElementRef<HTMLElement> | HTMLElement): DropListRef<T> {
    return new DropListRef<T>(
      element,
      this._dragDropRegistry,
      this._document,
      this._ngZone,
      this._viewportRuler,
    );
  }
}
