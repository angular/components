/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EmbeddedViewRef, TemplateRef, ViewContainerRef} from '@angular/core';
import {Direction} from '@angular/cdk/bidi';
import {
  extendStyles,
  getTransform,
  matchElementSize,
  toggleNativeDragInteractions,
} from './dom/styling';
import {deepCloneNode} from './dom/clone-node';
import {getRootNode} from './dom/root-node';
import {getTransformTransitionDurationInMs} from './dom/transition-duration';

/** Template that can be used to create a drag preview element. */
export interface DragPreviewTemplate<T = any> {
  matchSize?: boolean;
  template: TemplateRef<T> | null;
  viewContainer: ViewContainerRef;
  context: T;
}

/** Inline styles to be set as `!important` while dragging. */
const importantProperties = new Set([
  // Needs to be important, because some `mat-table` sets `position: sticky !important`. See #22781.
  'position',
]);

export class PreviewRef {
  /** Reference to the view of the preview element. */
  private _previewEmbeddedView: EmbeddedViewRef<any> | null;

  /** Reference to the preview element. */
  private _preview: HTMLElement;

  /** Reference to the preview wrapper. */
  private _wrapper: HTMLElement;

  constructor(
    private _document: Document,
    private _rootElement: HTMLElement,
    private _direction: Direction,
    private _initialDomRect: DOMRect,
    private _previewTemplate: DragPreviewTemplate | null,
    private _previewClass: string | string[] | null,
    private _pickupPositionOnPage: {
      x: number;
      y: number;
    },
    private _initialTransform: string | null,
    private _zIndex: number,
  ) {}

  attach(parent: HTMLElement): void {
    this._wrapper = this._createWrapper();
    this._preview = this._createPreview();
    this._wrapper.appendChild(this._preview);
    parent.appendChild(this._wrapper);

    // The null check is necessary for browsers that don't support the popover API.
    // Note that we use a string access for compatibility with Closure.
    if ('showPopover' in this._wrapper) {
      this._wrapper['showPopover']();
    }
  }

  destroy(): void {
    this._wrapper?.remove();
    this._previewEmbeddedView?.destroy();
    this._preview = this._wrapper = this._previewEmbeddedView = null!;
  }

  setTransform(value: string): void {
    this._preview.style.transform = value;
  }

  getBoundingClientRect(): DOMRect {
    return this._preview.getBoundingClientRect();
  }

  addClass(className: string): void {
    this._preview.classList.add(className);
  }

  getTransitionDuration(): number {
    return getTransformTransitionDurationInMs(this._preview);
  }

  addEventListener(name: string, handler: EventListenerOrEventListenerObject) {
    this._preview.addEventListener(name, handler);
  }

  removeEventListener(name: string, handler: EventListenerOrEventListenerObject) {
    this._preview.removeEventListener(name, handler);
  }

  private _createWrapper(): HTMLElement {
    const wrapper = this._document.createElement('div');
    wrapper.setAttribute('popover', 'manual');
    wrapper.setAttribute('dir', this._direction);
    wrapper.classList.add('cdk-drag-preview-container');

    extendStyles(wrapper.style, {
      // This is redundant, but we need it for browsers that don't support the popover API.
      'position': 'fixed',
      'top': '0',
      'left': '0',
      'width': '100%',
      'height': '100%',
      'z-index': this._zIndex + '',

      // Reset the user agent styles.
      'background': 'none',
      'border': 'none',
      'pointer-events': 'none',
      'margin': '0',
      'padding': '0',
      'color': 'inherit',
    });
    toggleNativeDragInteractions(wrapper, false);

    return wrapper;
  }

  private _createPreview(): HTMLElement {
    const previewConfig = this._previewTemplate;
    const previewClass = this._previewClass;
    const previewTemplate = previewConfig ? previewConfig.template : null;
    let preview: HTMLElement;

    if (previewTemplate && previewConfig) {
      // Measure the element before we've inserted the preview
      // since the insertion could throw off the measurement.
      const rootRect = previewConfig.matchSize ? this._initialDomRect : null;
      const viewRef = previewConfig.viewContainer.createEmbeddedView(
        previewTemplate,
        previewConfig.context,
      );
      viewRef.detectChanges();
      preview = getRootNode(viewRef, this._document);
      this._previewEmbeddedView = viewRef;
      if (previewConfig.matchSize) {
        matchElementSize(preview, rootRect!);
      } else {
        preview.style.transform = getTransform(
          this._pickupPositionOnPage.x,
          this._pickupPositionOnPage.y,
        );
      }
    } else {
      preview = deepCloneNode(this._rootElement);
      matchElementSize(preview, this._initialDomRect!);

      if (this._initialTransform) {
        preview.style.transform = this._initialTransform;
      }
    }

    extendStyles(
      preview.style,
      {
        // It's important that we disable the pointer events on the preview, because
        // it can throw off the `document.elementFromPoint` calls in the `CdkDropList`.
        'pointer-events': 'none',
        // We have to reset the margin, because it can throw off positioning relative to the viewport.
        'margin': '0',
        'position': 'absolute',
        'top': '0',
        'left': '0',
      },
      importantProperties,
    );

    toggleNativeDragInteractions(preview, false);
    preview.classList.add('cdk-drag-preview');

    if (previewClass) {
      if (Array.isArray(previewClass)) {
        previewClass.forEach(className => preview.classList.add(className));
      } else {
        preview.classList.add(previewClass);
      }
    }

    return preview;
  }
}
