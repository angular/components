/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  ElementRef,
  inject,
  computed,
  input,
  booleanAttribute,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {ToolbarWidgetPattern, ToolbarWidgetGroupPattern, SignalLike} from '@angular/aria/private';
import {_IdGenerator} from '@angular/cdk/a11y';
import {Toolbar} from './toolbar';
import {TOOLBAR_WIDGET_GROUP} from './utils';
import type {ToolbarWidgetGroup} from './toolbar-widget-group';

/**
 * A widget within a toolbar.
 *
 * The `ngToolbarWidget` directive should be applied to any native HTML element that acts
 * as an interactive widget within an `ngToolbar` or `ngToolbarWidgetGroup`. It enables
 * keyboard navigation and selection within the toolbar.
 *
 * ```html
 * <button ngToolbarWidget value="action-id" [disabled]="isDisabled">
 *   Perform Action
 * </button>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngToolbarWidget]',
  exportAs: 'ngToolbarWidget',
  host: {
    '[attr.data-active]': 'active()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.inert]': 'hardDisabled() ? true : null',
    '[attr.disabled]': 'hardDisabled() ? true : null',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[id]': '_pattern.id()',
  },
})
export class ToolbarWidget<V> implements OnInit, OnDestroy {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The parent Toolbar. */
  private readonly _toolbar = inject<Toolbar<V>>(Toolbar);

  /** A unique identifier for the widget. */
  readonly id = input(inject(_IdGenerator).getId('ng-toolbar-widget-', true));

  /** The parent Toolbar UIPattern. */
  readonly _toolbarPattern = computed(() => this._toolbar._pattern);

  /** Whether the widget is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the widget is 'hard' disabled, which is different from `aria-disabled`. A hard disabled widget cannot receive focus. */
  readonly hardDisabled = computed(() => this._pattern.disabled() && !this._toolbar.softDisabled());

  /** The optional ToolbarWidgetGroup this widget belongs to. */
  readonly _group = inject<ToolbarWidgetGroup<V>>(TOOLBAR_WIDGET_GROUP, {optional: true});

  /** The value associated with the widget. */
  readonly value = input.required<V>();

  /** Whether the widget is currently active (focused). */
  readonly active = computed(() => this._pattern.active());

  /** Whether the widget is selected (only relevant in a selection group). */
  readonly selected = () => this._pattern.selected();

  private readonly _groupPattern: SignalLike<
    ToolbarWidgetGroupPattern<ToolbarWidgetPattern<V>, V> | undefined
  > = () => this._group?._pattern;

  /** The ToolbarWidget UIPattern. */
  readonly _pattern = new ToolbarWidgetPattern<V>({
    ...this,
    group: this._groupPattern,
    toolbar: this._toolbarPattern,
    id: this.id,
    value: this.value,
    element: () => this.element,
  });

  ngOnInit() {
    this._toolbar._register(this);
  }

  ngOnDestroy() {
    this._toolbar._unregister(this);
  }
}
