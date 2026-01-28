/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  Directive,
  ElementRef,
  inject,
  computed,
  input,
  booleanAttribute,
  signal,
  model,
} from '@angular/core';
import {ToolbarPattern, ToolbarWidgetPattern} from '../private';
import {Directionality} from '@angular/cdk/bidi';
import type {ToolbarWidget} from './toolbar-widget';
import {sortDirectives} from './utils';

/**
 * A toolbar widget container for a group of interactive widgets, such as
 * buttons or radio groups. It provides a single point of reference for keyboard navigation
 * and focus management. It supports various orientations and disabled states.
 *
 * ```html
 * <div ngToolbar orientation="horizontal" [wrap]="true">
 *   <button ngToolbarWidget value="save">Save</button>
 *   <button ngToolbarWidget value="print">Print</button>
 *
 *   <div ngToolbarWidgetGroup [(value)]="selectedAlignment">
 *     <button ngToolbarWidget value="left">Left</button>
 *     <button ngToolbarWidget value="center">Center</button>
 *     <button ngToolbarWidget value="right">Right</button>
 *   </div>
 * </div>
 * ```
 *
 * @developerPreview 21.0
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
    '(focusin)': '_onFocus()',
  },
})
export class Toolbar<V> {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The TabList nested inside of the container. */
  private readonly _widgets = signal(new Set<ToolbarWidget<V>>());

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** Sorted UIPatterns of the child widgets */
  readonly _itemPatterns = computed<ToolbarWidgetPattern<V>[]>(() =>
    [...this._widgets()].sort(sortDirectives).map(widget => widget._pattern),
  );

  /** Whether the toolbar is vertically or horizontally oriented. */
  readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

  /**
   * Whether to allow disabled items to receive focus. When `true`, disabled items are
   * focusable but not interactive. When `false`, disabled items are skipped during navigation.
   */
  softDisabled = input(true, {transform: booleanAttribute});

  /** Whether the toolbar is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether focus should wrap when navigating. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /** The values of the selected widgets within the toolbar. */
  readonly values = model<V[]>([]);

  /** The toolbar UIPattern. */
  readonly _pattern: ToolbarPattern<V> = new ToolbarPattern<V>({
    ...this,
    items: this._itemPatterns,
    activeItem: signal(undefined),
    textDirection: this.textDirection,
    element: () => this._elementRef.nativeElement,
    getItem: e => this._getItem(e),
    values: this.values,
  });

  /** Whether the toolbar has received focus yet. */
  private _hasBeenFocused = signal(false);

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      afterRenderEffect(() => {
        const violations = this._pattern.validate();
        for (const violation of violations) {
          console.error(violation);
        }
      });
    }

    afterRenderEffect(() => {
      if (!this._hasBeenFocused()) {
        this._pattern.setDefaultState();
      }
    });
  }

  _onFocus() {
    this._hasBeenFocused.set(true);
  }

  _register(widget: ToolbarWidget<V>) {
    const widgets = this._widgets();
    if (!widgets.has(widget)) {
      widgets.add(widget);
      this._widgets.set(new Set(widgets));
    }
  }

  _unregister(widget: ToolbarWidget<V>) {
    const widgets = this._widgets();
    if (widgets.delete(widget)) {
      this._widgets.set(new Set(widgets));
    }
  }

  /** Finds the toolbar item associated with a given element. */
  private _getItem(element: Element) {
    return this._itemPatterns().find(item => item.element()?.contains(element));
  }
}
