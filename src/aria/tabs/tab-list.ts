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

  /** The Tabs nested inside this group. */
  private readonly _tabs = contentChildren(Tab, {descendants: true});

  /** The Tab UIPatterns of the child Tabs. */
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

  /** The current selected tab index. */
  readonly selectedTabIndex = model<number>(0);

  /** The current selected tab (pattern). */
  readonly selectedTab = linkedSignal<TabPattern | undefined>(
    () => this._tabPatterns()[this.selectedTabIndex()],
  );

  /** The TabList UIPattern. */
  readonly _pattern: TabListPattern = new TabListPattern({
    ...this,
    items: this._tabPatterns,
    activeItem: signal(undefined),
    element: () => this._elementRef.nativeElement,
  });

  constructor() {
    afterRenderEffect(() => {
      this.selectedTabIndex.set(this._tabPatterns().indexOf(this.selectedTab()!));
    });
  }

  ngAfterViewInit() {
    this._pattern.setDefaultState();
  }
}
