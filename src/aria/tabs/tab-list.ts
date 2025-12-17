/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  signal,
  afterRenderEffect,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {TabListPattern} from '../private';
import {sortDirectives, TABS} from './utils';
import type {Tab} from './tab';

/**
 * A TabList container.
 *
 * The `ngTabList` directive controls a list of `ngTab` elements. It manages keyboard
 * navigation, selection, and the overall orientation of the tabs. It should be placed
 * within an `ngTabs` container.
 *
 * ```html
 * <ul ngTabList [(selectedTab)]="mySelectedTab" orientation="horizontal" selectionMode="explicit">
 *   <li ngTab value="first">First Tab</li>
 *   <li ngTab value="second">Second Tab</li>
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
    '(focusin)': '_onFocus()',
  },
})
export class TabList implements OnInit, OnDestroy {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The parent Tabs. */
  private readonly _tabs = inject(TABS);

  /** The Tabs nested inside of the TabList. */
  private readonly _unorderedTabs = signal(new Set<Tab>());

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** The Tab UIPatterns of the child Tabs. */
  readonly _tabPatterns = computed(() =>
    [...this._unorderedTabs()].sort(sortDirectives).map(tab => tab._pattern),
  );

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

  /** The current selected tab. */
  readonly selectedTab = model<string | undefined>();

  /** Whether the tablist is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The TabList UIPattern. */
  readonly _pattern: TabListPattern = new TabListPattern({
    ...this,
    items: this._tabPatterns,
    activeItem: signal(undefined),
    element: () => this._elementRef.nativeElement,
  });

  /** Whether the tree has received focus yet. */
  private _hasFocused = signal(false);

  constructor() {
    afterRenderEffect(() => {
      if (!this._hasFocused()) {
        this._pattern.setDefaultState();
      }
    });

    afterRenderEffect(() => {
      const tab = this._pattern.selectedTab();
      if (tab) {
        this.selectedTab.set(tab.value());
      }
    });

    afterRenderEffect(() => {
      const value = this.selectedTab();
      if (value) {
        this._tabPatterns().forEach(tab => tab.expanded.set(false));
        const tab = this._tabPatterns().find(t => t.value() === value);
        this._pattern.selectedTab.set(tab);
        tab?.expanded.set(true);
      }
    });
  }

  _onFocus() {
    this._hasFocused.set(true);
  }

  ngOnInit() {
    this._tabs._register(this);
  }

  ngOnDestroy() {
    this._tabs._unregister(this);
  }

  _register(child: Tab) {
    this._unorderedTabs().add(child);
    this._unorderedTabs.set(new Set(this._unorderedTabs()));
  }

  _unregister(child: Tab) {
    this._unorderedTabs().delete(child);
    this._unorderedTabs.set(new Set(this._unorderedTabs()));
  }

  /** Opens the tab panel with the specified value. */
  open(value: string): boolean {
    return this._pattern.open(value);
  }
}
