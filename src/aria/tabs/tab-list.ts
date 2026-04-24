/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  WritableSignal,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  signal,
} from '@angular/core';
import {TabListPattern, TabPattern, sortDirectives} from '../private';
import {Tab} from './tab';
import {TABS, TAB_LIST} from './tab-tokens';

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
    '(click)': '_pattern.onClick($event)',
    '(focusin)': '_pattern.onFocusIn()',
  },
  providers: [{provide: TAB_LIST, useExisting: TabList}],
})
export class TabList implements OnInit, OnDestroy {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The parent Tabs container. */
  private readonly _tabsParent = inject(TABS);

  /** The Tabs registered for this TabList. */
  private readonly _tabs = signal(new Set<Tab>());

  /** The Tabs registered for this TabList. */
  readonly _sortedTabs = computed(() => [...this._tabs()].sort(sortDirectives));

  /** The Tab UIPatterns of the child Tabs. */
  private readonly _tabPatterns = computed(() => [...this._sortedTabs()].map(tab => tab._pattern));

  /** Whether the tablist is vertically or horizontally oriented. */
  readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

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

  /** The current selected tab as a model input. */
  readonly selectedTab = model<string | undefined>();

  /** The current selected Tab pattern, passed to the List pattern. */
  private readonly _selectedTabPattern: WritableSignal<TabPattern | undefined> = linkedSignal(
    () => {
      const tab = this.findTab(this.selectedTab());

      return tab?._pattern;
    },
  );

  /** Whether the tablist is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The TabList UIPattern. */
  readonly _pattern: TabListPattern = new TabListPattern({
    ...this,
    element: () => this._elementRef.nativeElement,
    activeItem: signal(undefined),
    items: this._tabPatterns,
    selectedTab: this._selectedTabPattern,
  });

  constructor() {
    // This needs to be in an afterRenderEffect to ensure the tabs have all been initialized.
    // Otherwise, the lookup here can fail and it does not get re-run afterwards.
    afterRenderEffect({
      write: () => {
        const pattern = this._selectedTabPattern();
        const tab = this._sortedTabs().find(tab => tab._pattern == pattern);

        this.selectedTab.set(tab?.value());
      },
    });

    afterRenderEffect({write: () => this._pattern.setDefaultStateEffect()});
  }

  ngOnInit() {
    this._tabsParent._registerList(this);
  }

  ngOnDestroy() {
    this._tabsParent._registerList(this);
  }

  _registerTab(child: Tab) {
    this._tabs().add(child);
    this._tabs.set(new Set(this._tabs()));
  }

  _unregisterTab(child: Tab) {
    this._tabs().delete(child);
    this._tabs.set(new Set(this._tabs()));
  }

  /** Opens the tab panel with the specified value. */
  open(value: string): boolean {
    return this._pattern.open(this.findTab(value)?._pattern);
  }

  findTab(value?: string) {
    return value ? this._sortedTabs().find(tab => tab.value() === value) : undefined;
  }
}
