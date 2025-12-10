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
  contentChildren,
} from '@angular/core';
import {ToolbarWidgetPattern, ToolbarWidgetGroupPattern} from '@angular/aria/private';
import {Toolbar} from './toolbar';
import {ToolbarWidget} from './toolbar-widget';
import {TOOLBAR_WIDGET_GROUP} from './utils';

/**
 * A directive that groups toolbar widgets, used for more complex widgets like radio groups
 * that have their own internal navigation.
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngToolbarWidgetGroup]',
  exportAs: 'ngToolbarWidgetGroup',
  providers: [{provide: TOOLBAR_WIDGET_GROUP, useExisting: ToolbarWidgetGroup}],
})
export class ToolbarWidgetGroup<V> {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The parent Toolbar. */
  private readonly _toolbar = inject<Toolbar<V>>(Toolbar, {optional: true});

  /** The list of child widgets within the group. */
  private readonly _widgets = contentChildren(ToolbarWidget, {descendants: true});

  /** The parent Toolbar UIPattern. */
  private readonly _toolbarPattern = computed(() => this._toolbar?._pattern);

  /** Whether the widget group is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The list of toolbar items within the group. */
  private readonly _itemPatterns = () => this._widgets().map(w => w._pattern);

  /** Whether the group allows multiple widgets to be selected. */
  readonly multi = input(false, {transform: booleanAttribute});

  /** The ToolbarWidgetGroup UIPattern. */
  readonly _pattern = new ToolbarWidgetGroupPattern<ToolbarWidgetPattern<V>, V>({
    ...this,
    items: this._itemPatterns,
    toolbar: this._toolbarPattern,
  });
}
