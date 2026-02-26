/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  linkedSignal,
  model,
  signal,
} from '@angular/core';
import {TabListPattern, TabPattern} from '../private';
import {Tab} from './tab';
import {TAB_LIST} from './tab-tokens';

/**
 * A TabList container.
 *
 * The `ngTabList` directive controls a list of `ngTab` elements, linked to their corresponding tab
 * panels. It manages keyboard navigation, selection, and the overall orientation of the tabs.
 *
 * ```html
 * <ul ngTabList [(selectedTabIndex)]="selectedTab" orientation="horizontal" selectionMode="explicit">
 *   <li ngTab [panel]="panel1">First Tab</li>
 *   <li ngTab [panel]="panel2">Second Tab</li>
 * </ul>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Tabs](guide/aria/tabs)
 */
@Directive({
  selector: '[ngTabList]',
  exportAs: 'ngTabList',
  host: {
    'role': 'tablist',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-orientation]': '_pattern.orientation()',
    '[attr.aria-activedescendant]': '_pattern.activeDescendant()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
  },
  providers: [{provide: TAB_LIST, useExisting: TabList}],
})
export class TabList implements AfterViewInit {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The tabs nested inside this list. */
  private readonly _tabs = contentChildren(Tab, {descendants: true});

  /** The corresponding patterns for the child tabs. */
  readonly _tabPatterns = computed(() => this._tabs().map(tab => tab._pattern));

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** Whether the tablist is vertically or horizontally oriented. */
  readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

  /** Whether focus should wrap when navigating. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /**
   * Whether to allow disabled items to receive focus. When `true`, disabled items are
   * focusable but not interactive. When `false`, disabled items are skipped during navigation.
   */
  readonly softDisabled = input(true, {transform: booleanAttribute});

  /**
   * The focus strategy used by the tablist.
   * - `roving`: Focus is moved to the active tab using `tabindex`.
   * - `activedescendant`: Focus remains on the tablist container, and `aria-activedescendant` is used to indicate the active tab.
   */
  readonly focusMode = input<'roving' | 'activedescendant'>('roving');

  /**
   * The selection strategy used by the tablist.
   * - `follow`: The focused tab is automatically selected.
   * - `explicit`: Tabs are selected explicitly by the user (e.g., via click or spacebar).
   */
  readonly selectionMode = input<'follow' | 'explicit'>('follow');

  /** Whether the tablist is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /**
   * The current selected tab index.
   *
   * Can be used to set the initially selected tab, or to programmatically force a tab
   * to be selected.
   */
  readonly selectedTabIndex = model<number>(0);

  /** The current selected tab pattern. */
  private readonly _selectedTabPattern = linkedSignal<TabPattern | undefined>(
    () => this._tabPatterns()[this.selectedTabIndex()],
  );

  /** The TabList UIPattern. */
  readonly _pattern: TabListPattern = new TabListPattern({
    ...this,
    element: () => this._elementRef.nativeElement,
    activeItem: signal(undefined),
    items: this._tabPatterns,
    selectedTab: this._selectedTabPattern,
  });

  constructor() {
    afterRenderEffect(() => {
      const tab = this._selectedTabPattern();
      const index = tab && this._tabPatterns().includes(tab) ? this._tabPatterns().indexOf(tab) : 0;
      this.selectedTabIndex.set(index);
    });
  }

  ngAfterViewInit() {
    this._pattern.setDefaultState();
  }
}
