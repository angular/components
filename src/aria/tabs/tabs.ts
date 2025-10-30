/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DeferredContent, DeferredContentAware} from '@angular/aria/deferred-content';
import {_IdGenerator} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  linkedSignal,
  signal,
  Signal,
  afterRenderEffect,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {TabListPattern, TabPanelPattern, TabPattern} from '@angular/aria/private';

interface HasElement {
  element: Signal<HTMLElement>;
}

/**
 * Sort directives by their document order.
 */
function sortDirectives(a: HasElement, b: HasElement) {
  return (a.element().compareDocumentPosition(b.element()) & Node.DOCUMENT_POSITION_PRECEDING) > 0
    ? 1
    : -1;
}

/**
 * A Tabs container.
 *
 * Represents a set of layered sections of content. The Tabs is a container meant to be used with
 * TabList, Tab, and TabPanel as follows:
 *
 * ```html
 * <div ngTabs>
 *   <ul ngTabList>
 *     <li ngTab value="tab1">Tab 1</li>
 *     <li ngTab value="tab2">Tab 2</li>
 *     <li ngTab value="tab3">Tab 3</li>
 *   </ul>
 *
 *   <div ngTabPanel value="tab1">
 *      <ng-template ngTabContent>Tab content 1</ng-template>
 *   </div>
 *   <div ngTabPanel value="tab2">
 *      <ng-template ngTabContent>Tab content 2</ng-template>
 *   </div>
 *   <div ngTabPanel value="tab3">
 *      <ng-template ngTabContent>Tab content 3</ng-template>
 *   </div>
 * ```
 */
@Directive({
  selector: '[ngTabs]',
  exportAs: 'ngTabs',
  host: {
    'class': 'ng-tabs',
  },
})
export class Tabs {
  /** The TabList nested inside of the container. */
  private readonly _tablist = signal<TabList | undefined>(undefined);

  /** The TabPanels nested inside of the container. */
  private readonly _unorderedPanels = signal(new Set<TabPanel>());

  /** The Tab UIPattern of the child Tabs. */
  tabs = computed(() => this._tablist()?.tabs());

  /** The TabPanel UIPattern of the child TabPanels. */
  unorderedTabpanels = computed(() =>
    [...this._unorderedPanels()].map(tabpanel => tabpanel._pattern),
  );

  register(child: TabList | TabPanel) {
    if (child instanceof TabList) {
      this._tablist.set(child);
    }

    if (child instanceof TabPanel) {
      this._unorderedPanels().add(child);
      this._unorderedPanels.set(new Set(this._unorderedPanels()));
    }
  }

  deregister(child: TabList | TabPanel) {
    if (child instanceof TabList) {
      this._tablist.set(undefined);
    }

    if (child instanceof TabPanel) {
      this._unorderedPanels().delete(child);
      this._unorderedPanels.set(new Set(this._unorderedPanels()));
    }
  }

  /** Opens the tab panel with the specified value. */
  open(value: string) {
    const tab = this._findTabPatternByValue(value);

    tab?.expansion.open();
  }

  _findTabPatternByValue(value: string) {
    return this.tabs()?.find(t => t.value() === value);
  }
}

/**
 * A TabList container.
 *
 * Controls a list of Tab(s).
 */
@Directive({
  selector: '[ngTabList]',
  exportAs: 'ngTabList',
  host: {
    'role': 'tablist',
    'class': 'ng-tablist',
    '[attr.tabindex]': 'tabindex()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-activedescendant]': 'activedescendant()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(focusin)': 'onFocus()',
  },
})
export class TabList implements OnInit, OnDestroy {
  /** A reference to the tab list element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent Tabs. */
  private readonly _tabs = inject(Tabs);

  /** The Tabs nested inside of the TabList. */
  private readonly _unorderedTabs = signal(new Set<Tab>());

  /** The internal tab selection state. */
  private readonly _selection = linkedSignal(() =>
    this.selectedTab() ? [this.selectedTab()!] : [],
  );

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** The Tab UIPatterns of the child Tabs. */
  readonly tabs = computed(() =>
    [...this._unorderedTabs()].sort(sortDirectives).map(tab => tab._pattern),
  );

  /** Whether the tablist is vertically or horizontally oriented. */
  readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

  /** Whether focus should wrap when navigating. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /** Whether to allow disabled items to receive focus. */
  readonly softDisabled = input(false, {transform: booleanAttribute});

  /** The focus strategy used by the tablist. */
  readonly focusMode = input<'roving' | 'activedescendant'>('roving');

  /** The selection strategy used by the tablist. */
  readonly selectionMode = input<'follow' | 'explicit'>('follow');

  /** Whether the tablist is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The current selected tab. */
  readonly selectedTab = model<string | undefined>();

  /** The id of the current active tab. */
  readonly activedescendant = computed(() => this._pattern.activedescendant());

  /** Whether selection should follow focus. */
  readonly followFocus = computed(() => this._pattern.followFocus());

  /** The tabindex of the tablist. */
  readonly tabindex = computed(() => this._pattern.tabindex());

  /** The TabList UIPattern. */
  readonly _pattern: TabListPattern = new TabListPattern({
    ...this,
    items: this.tabs,
    value: this._selection,
    activeItem: signal(undefined),
    element: () => this._elementRef.nativeElement,
  });

  /** Whether the tree has received focus yet. */
  private _hasFocused = signal(false);

  constructor() {
    afterRenderEffect(() => this.selectedTab.set(this._selection()[0]));

    afterRenderEffect(() => {
      if (!this._hasFocused()) {
        this._pattern.setDefaultState();
      }
    });
  }

  onFocus() {
    this._hasFocused.set(true);
  }

  ngOnInit() {
    this._tabs.register(this);
  }

  ngOnDestroy() {
    this._tabs.deregister(this);
  }

  register(child: Tab) {
    this._unorderedTabs().add(child);
    this._unorderedTabs.set(new Set(this._unorderedTabs()));
  }

  deregister(child: Tab) {
    this._unorderedTabs().delete(child);
    this._unorderedTabs.set(new Set(this._unorderedTabs()));
  }
}

/** A selectable tab in a TabList. */
@Directive({
  selector: '[ngTab]',
  exportAs: 'ngTab',
  host: {
    'role': 'tab',
    'class': 'ng-tab',
    '[attr.data-active]': 'active()',
    '[attr.id]': '_pattern.id()',
    '[attr.tabindex]': 'tabindex()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.aria-controls]': '_pattern.controls()',
  },
})
export class Tab implements HasElement, OnInit, OnDestroy {
  /** A reference to the tab element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent Tabs. */
  private readonly _tabs = inject(Tabs);

  /** The parent TabList. */
  private readonly _tabList = inject(TabList);

  /** A global unique identifier for the tab. */
  private readonly _id = inject(_IdGenerator).getId('ng-tab-');

  /** The host native element. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** The parent TabList UIPattern. */
  readonly tablist = computed(() => this._tabList._pattern);

  /** The TabPanel UIPattern associated with the tab */
  readonly tabpanel = computed(() =>
    this._tabs.unorderedTabpanels().find(tabpanel => tabpanel.value() === this.value()),
  );

  /** Whether a tab is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** A local unique identifier for the tab. */
  readonly value = input.required<string>();

  /** Whether the tab is active. */
  readonly active = computed(() => this._pattern.active());

  /** Whether the tab is expanded. */
  readonly expanded = computed(() => this._pattern.expanded());

  /** Whether the tab is selected. */
  readonly selected = computed(() => this._pattern.selected());

  /** The tabindex of the tab. */
  readonly tabindex = computed(() => this._pattern.tabindex());

  /** The Tab UIPattern. */
  readonly _pattern: TabPattern = new TabPattern({
    ...this,
    id: () => this._id,
    tablist: this.tablist,
    tabpanel: this.tabpanel,
    value: this.value,
  });

  /** Opens this tab panel. */
  open() {
    this._pattern.expansion.open();
  }

  ngOnInit() {
    this._tabList.register(this);
  }

  ngOnDestroy() {
    this._tabList.deregister(this);
  }
}

/**
 * A TabPanel container for the resources of layered content associated with a tab.
 *
 * If a tabpanel is hidden due to its corresponding tab is not activated, the `inert` attribute
 * will be applied to the tabpanel element to remove it from the accessibility tree and stop
 * all the keyboard and pointer interactions. Note that this does not visually hide the tabpenl
 * and a proper styling is required.
 */
@Directive({
  selector: '[ngTabPanel]',
  exportAs: 'ngTabPanel',
  host: {
    'role': 'tabpanel',
    'class': 'ng-tabpanel',
    '[attr.id]': '_pattern.id()',
    '[attr.tabindex]': 'tabindex()',
    '[attr.inert]': 'hidden() ? true : null',
    '[attr.aria-labelledby]': '_pattern.labelledBy()',
  },
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
})
export class TabPanel implements OnInit, OnDestroy {
  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** The parent Tabs. */
  private readonly _Tabs = inject(Tabs);

  /** A global unique identifier for the tab. */
  private readonly _id = inject(_IdGenerator).getId('ng-tabpanel-', true);

  /** The Tab UIPattern associated with the tabpanel */
  readonly tab = computed(() => this._Tabs.tabs()?.find(tab => tab.value() === this.value()));

  /** A local unique identifier for the tabpanel. */
  readonly value = input.required<string>();

  /** Whether the tab panel is hidden. */
  readonly hidden = computed(() => this._pattern.hidden());

  /** The tabindex of the tab panel. */
  readonly tabindex = computed(() => this._pattern.tabindex());

  /** The TabPanel UIPattern. */
  readonly _pattern: TabPanelPattern = new TabPanelPattern({
    ...this,
    id: () => this._id,
    tab: this.tab,
  });

  constructor() {
    afterRenderEffect(() => this._deferredContentAware.contentVisible.set(!this._pattern.hidden()));
  }

  ngOnInit() {
    this._Tabs.register(this);
  }

  ngOnDestroy() {
    this._Tabs.deregister(this);
  }
}

/**
 * A TabContent container for the lazy-loaded content.
 */
@Directive({
  selector: 'ng-template[ngTabContent]',
  exportAs: 'ngTabContent',
  hostDirectives: [DeferredContent],
})
export class TabContent {}
