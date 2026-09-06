/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import {ToolbarPattern, ToolbarWidgetPattern, SortedCollection} from '../private';
import {Directionality} from '@angular/cdk/bidi';
import type {ToolbarWidget} from './toolbar-widget';

/**
 * A toolbar widget container for a group of interactive widgets, such as
 * buttons or radio groups. It provides a single point of reference for keyboard navigation
 * and focus management. It supports various orientations and disabled states.
 *
 * ```html
 * <div ngToolbar orientation="horizontal" [wrap]="true">
 *   <button ngToolbarWidget>Save</button>
 *   <button ngToolbarWidget>Print</button>
 *
 *   <div ngToolbarWidgetGroup>
 *     <button ngToolbarWidget>Left</button>
 *     <button ngToolbarWidget>Center</button>
 *     <button ngToolbarWidget>Right</button>
 *   </div>
 * </div>
 * ```
 *
 * @see [Toolbar](guide/aria/toolbar)
 */
@Directive({
  selector: '[ngToolbar]',
  exportAs: 'ngToolbar',
  host: {
    'role': 'toolbar',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-orientation]': '_pattern.orientation()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(click)': '_pattern.onClick($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(focusin)': '_pattern.onFocusIn()',
  },
})
export class Toolbar implements OnDestroy {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The collection of widgets in the toolbar. */
  readonly _collection = new SortedCollection<ToolbarWidget>();

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** Sorted UIPatterns of the child widgets */
  readonly _itemPatterns = computed<ToolbarWidgetPattern[]>(() =>
    this._collection.orderedItems().map(widget => widget._pattern),
  );

  /** Whether the toolbar is vertically or horizontally oriented. */
  readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

  /**
   * Whether to allow disabled items to receive focus. When `true`, disabled items are
   * focusable but not interactive. When `false`, disabled items are skipped during navigation.
   */
  readonly softDisabled = input(true, {transform: booleanAttribute});

  /** Whether the toolbar is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether focus should wrap when navigating. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /** The toolbar UIPattern. */
  readonly _pattern: ToolbarPattern = new ToolbarPattern({
    ...this,
    items: this._itemPatterns,
    activeItem: signal(undefined),
    textDirection: this.textDirection,
    element: () => this._elementRef.nativeElement,
    getItem: e => this._getItem(e),
  });

  constructor() {
    afterRenderEffect({write: () => this._pattern.setDefaultStateEffect()});

    afterNextRender(() => {
      this._collection.startObserving(this.element);
    });
  }

  ngOnDestroy() {
    this._collection.stopObserving();
  }

  /** Finds the toolbar item associated with a given element. */
  private _getItem(element: Element) {
    return this._itemPatterns().find(item => item.element()?.contains(element));
  }
}
