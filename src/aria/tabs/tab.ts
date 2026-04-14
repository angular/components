/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {_IdGenerator} from '@angular/cdk/a11y';
import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import {TabPattern, HasElement} from '../private';
import {TABS, TAB_LIST} from './tab-tokens';
import {TabPanel} from './tab-panel';

/**
 * A selectable tab in a TabList.
 *
 * The `ngTab` directive represents an individual tab control within an `ngTabList`. It
 * requires a `panel` that references a corresponding `ngTabPanel`.
 *
 * ```html
 * <li ngTab [panel]="panel1" [disabled]="isTabDisabled">
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
export class Tab implements HasElement, OnInit, OnDestroy {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The parent Tabs wrapper. */
  private readonly _tabsWrapper = inject(TABS);

  /** The parent TabList. */
  private readonly _tabList = inject(TAB_LIST);

  /** A unique identifier for the widget. */
  readonly id = input(inject(_IdGenerator).getId('ng-tab-', true));

  /** Direct reference to panel associated with this tab.  */
  readonly panelRef = input<TabPanel>(undefined, {alias: 'panel'});

  /** The panel associated with this tab. */
  readonly panel = computed(() => this.panelRef() ?? this._tabsWrapper.findTabPanel(this.value()));

  /** Whether a tab is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The remote tabpanel unique identifier. */
  readonly value = input<string>();

  /** Whether the tab is active. */
  readonly active = computed(() => this._pattern.active());

  /** Whether the tab is selected. */
  readonly selected = computed(() => this._pattern.selected());

  /** The Tab UIPattern. */
  readonly _pattern: TabPattern = new TabPattern({
    ...this,
    element: () => this.element,
    tabList: () => this._tabList._pattern,
    tabPanel: computed(() => this.panel()?._pattern),
  });

  /** Opens this tab panel. */
  open() {
    this._pattern.open();
  }

  ngOnInit() {
    this._tabList._registerTab(this);
  }

  ngOnDestroy() {
    this._tabList._unregisterTab(this);
  }
}
