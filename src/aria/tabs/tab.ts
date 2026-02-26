/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {_IdGenerator} from '@angular/cdk/a11y';
import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
  OnInit,
} from '@angular/core';
import {TabPattern} from '../private';
import {TabList} from './tab-list';
import {TabPanel} from './tab-panel';

/**
 * A selectable tab in a TabList.
 *
 * The `ngTab` directive represents an individual tab control within an `ngTabList`. It
 * requires a `value` that uniquely identifies it and links it to a corresponding `ngTabPanel`.
 *
 * ```html
 * <li ngTab value="myTabId" [disabled]="isTabDisabled">
 *   My Tab Label
 * </li>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Tabs](guide/aria/tabs)
 */
@Directive({
  selector: '[ngTab]',
  exportAs: 'ngTab',
  host: {
    'role': 'tab',
    '[attr.data-active]': 'active()',
    '[attr.id]': '_pattern.id()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-controls]': '_pattern.controls()',
  },
})
export class Tab implements OnInit {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The parent TabList. */
  private readonly _tabList = inject(TabList);

  /** A unique identifier for the widget. */
  readonly id = input(inject(_IdGenerator).getId('ng-tab-', true));

  /** The panel associated with this tab. */
  readonly panel = input.required<TabPanel>();

  /** Whether a tab is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the tab is active. */
  readonly active = computed(() => this._pattern.active());

  /** Whether the tab is selected. */
  readonly selected = computed(() => this._pattern.selected());

  /** The Tab UIPattern. */
  readonly _pattern: TabPattern = new TabPattern({
    ...this,
    tablist: () => this._tabList._pattern,
    tabpanel: () => this.panel()._pattern,
    expanded: signal(false),
    element: () => this.element,
  });

  ngOnInit() {
    this.panel()._tabPattern = this._pattern;
  }

  /** Opens this tab panel. */
  open() {
    this._pattern.open();
  }
}
