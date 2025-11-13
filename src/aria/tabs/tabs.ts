/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

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
  signal,
  afterRenderEffect,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  TabListPattern,
  TabPanelPattern,
  TabPattern,
  DeferredContent,
  DeferredContentAware,
} from '@angular/aria/private';

interface HasElement {
  element: HTMLElement;
}

/**
 * Sort directives by their document order.
 */
function sortDirectives(a: HasElement, b: HasElement) {
  return (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_PRECEDING) > 0
    ? 1
    : -1;
}

/**
 * A Tabs container.
 *
 * The `ngTabs` directive represents a set of layered sections of content. It acts as the
 * overarching container for a tabbed interface, coordinating the behavior of `ngTabList`,
 * `ngTab`, and `ngTabPanel` directives.
 *
 * ```html
 * <div ngTabs>
 *   <ul ngTabList [(selectedTab)]="selectedTabValue">
 *     <li ngTab value="tab1">Tab 1</li>
 *     <li ngTab value="tab2">Tab 2</li>
 *     <li ngTab value="tab3">Tab 3</li>
 *   </ul>
 *
 *   <div ngTabPanel value="tab1">
 *      <ng-template ngTabContent>Content for Tab 1</ng-template>
 *   </div>
 *   <div ngTabPanel value="tab2">
 *      <ng-template ngTabContent>Content for Tab 2</ng-template>
 *   </div>
 *   <div ngTabPanel value="tab3">
 *      <ng-template ngTabContent>Content for Tab 3</ng-template>
 *   </div>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngTabs]',
  exportAs: 'ngTabs',
})
export class Tabs {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The TabList nested inside of the container. */
  private readonly _tablist = signal<TabList | undefined>(undefined);

  /** The TabPanels nested inside of the container. */
  private readonly _unorderedPanels = signal(new Set<TabPanel>());

  /** The Tab UIPattern of the child Tabs. */
  readonly _tabPatterns = computed(() => this._tablist()?._tabPatterns());

  /** The TabPanel UIPattern of the child TabPanels. */
  readonly _unorderedTabpanelPatterns = computed(() =>
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
}

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
    '(focusin)': 'onFocus()',
  },
})
export class TabList implements OnInit, OnDestroy {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The parent Tabs. */
  private readonly _tabs = inject(Tabs);

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
        this._pattern.open(value);
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

  /** Opens the tab panel with the specified value. */
  open(value: string): boolean {
    return this._pattern.open(value);
  }
}

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

  /** The parent Tabs. */
  private readonly _tabs = inject(Tabs);

  /** The parent TabList. */
  private readonly _tabList = inject(TabList);

  /** A unique identifier for the widget. */
  readonly id = input(inject(_IdGenerator).getId('ng-tab-', true));

  /** The parent TabList UIPattern. */
  readonly tablist = computed(() => this._tabList._pattern);

  /** The TabPanel UIPattern associated with the tab */
  readonly tabpanel = computed(() =>
    this._tabs._unorderedTabpanelPatterns().find(tabpanel => tabpanel.value() === this.value()),
  );

  /** Whether a tab is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The remote tabpanel unique identifier. */
  readonly value = input.required<string>();

  /** Whether the tab is active. */
  readonly active = computed(() => this._pattern.active());

  /** Whether the tab is selected. */
  readonly selected = computed(() => this._pattern.selected());

  /** The Tab UIPattern. */
  readonly _pattern: TabPattern = new TabPattern({
    ...this,
    tablist: this.tablist,
    tabpanel: this.tabpanel,
    expanded: signal(false),
    element: () => this.element,
  });

  /** Opens this tab panel. */
  open() {
    this._pattern.open();
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
 * The `ngTabPanel` directive holds the content for a specific tab. It is linked to an
 * `ngTab` by a matching `value`. If a tab panel is hidden, the `inert` attribute will be
 * applied to remove it from the accessibility tree. Proper styling is required for visual hiding.
 *
 * ```html
 * <div ngTabPanel value="myTabId">
 *   <ng-template ngTabContent>
 *     <!-- Content for the tab panel -->
 *   </ng-template>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngTabPanel]',
  exportAs: 'ngTabPanel',
  host: {
    'role': 'tabpanel',
    '[attr.id]': '_pattern.id()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.inert]': '!visible() ? true : null',
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
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** The parent Tabs. */
  private readonly _Tabs = inject(Tabs);

  /** A global unique identifier for the tab. */
  readonly id = input(inject(_IdGenerator).getId('ng-tabpanel-', true));

  /** The Tab UIPattern associated with the tabpanel */
  readonly tab = computed(() =>
    this._Tabs._tabPatterns()?.find(tab => tab.value() === this.value()),
  );

  /** A local unique identifier for the tabpanel. */
  readonly value = input.required<string>();

  /** Whether the tab panel is visible. */
  readonly visible = computed(() => !this._pattern.hidden());

  /** The TabPanel UIPattern. */
  readonly _pattern: TabPanelPattern = new TabPanelPattern({
    ...this,
  });

  constructor() {
    afterRenderEffect(() => this._deferredContentAware.contentVisible.set(this.visible()));
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
 *
 * This structural directive should be applied to an `ng-template` within an `ngTabPanel`.
 * It enables lazy loading of the tab's content, meaning the content is only rendered
 * when the tab is activated for the first time.
 *
 * ```html
 * <div ngTabPanel value="myTabId">
 *   <ng-template ngTabContent>
 *     <p>This content will be loaded when 'myTabId' is selected.</p>
 *   </ng-template>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: 'ng-template[ngTabContent]',
  exportAs: 'ngTabContent',
  hostDirectives: [DeferredContent],
})
export class TabContent {}
