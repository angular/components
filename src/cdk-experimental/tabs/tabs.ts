/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DeferredContent, DeferredContentAware} from '@angular/cdk-experimental/deferred-content';
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
import {TabListPattern, TabPanelPattern, TabPattern} from '../ui-patterns';

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
 * Represents a set of layered sections of content. The CdkTabs is a container meant to be used with
 * CdkTabList, CdkTab, and CdkTabPanel as follows:
 *
 * ```html
 * <div cdkTabs>
 *   <ul cdkTabList>
 *     <li cdkTab value="tab1">Tab 1</li>
 *     <li cdkTab value="tab2">Tab 2</li>
 *     <li cdkTab value="tab3">Tab 3</li>
 *   </ul>
 *
 *   <div cdkTabPanel value="tab1">
 *      <ng-template cdkTabContent>Tab content 1</ng-template>
 *   </div>
 *   <div cdkTabPanel value="tab2">
 *      <ng-template cdkTabContent>Tab content 2</ng-template>
 *   </div>
 *   <div cdkTabPanel value="tab3">
 *      <ng-template cdkTabContent>Tab content 3</ng-template>
 *   </div>
 * ```
 */
@Directive({
  selector: '[cdkTabs]',
  exportAs: 'cdkTabs',
  host: {
    'class': 'cdk-tabs',
  },
})
export class CdkTabs {
  /** The CdkTabList nested inside of the container. */
  private readonly _tablist = signal<CdkTabList | undefined>(undefined);

  /** The CdkTabPanels nested inside of the container. */
  private readonly _unorderedPanels = signal(new Set<CdkTabPanel>());

  /** The Tab UIPattern of the child Tabs. */
  tabs = computed(() => this._tablist()?.tabs());

  /** The TabPanel UIPattern of the child TabPanels. */
  unorderedTabpanels = computed(() =>
    [...this._unorderedPanels()].map(tabpanel => tabpanel.pattern),
  );

  register(child: CdkTabList | CdkTabPanel) {
    if (child instanceof CdkTabList) {
      this._tablist.set(child);
    }

    if (child instanceof CdkTabPanel) {
      this._unorderedPanels().add(child);
      this._unorderedPanels.set(new Set(this._unorderedPanels()));
    }
  }

  deregister(child: CdkTabList | CdkTabPanel) {
    if (child instanceof CdkTabList) {
      this._tablist.set(undefined);
    }

    if (child instanceof CdkTabPanel) {
      this._unorderedPanels().delete(child);
      this._unorderedPanels.set(new Set(this._unorderedPanels()));
    }
  }
}

/**
 * A TabList container.
 *
 * Controls a list of CdkTab(s).
 */
@Directive({
  selector: '[cdkTabList]',
  exportAs: 'cdkTabList',
  host: {
    'role': 'tablist',
    'class': 'cdk-tablist',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.aria-orientation]': 'pattern.orientation()',
    '[attr.aria-activedescendant]': 'pattern.activedescendant()',
    '(keydown)': 'pattern.onKeydown($event)',
    '(pointerdown)': 'pattern.onPointerdown($event)',
    '(focusin)': 'onFocus()',
  },
})
export class CdkTabList implements OnInit, OnDestroy {
  /** The parent CdkTabs. */
  private readonly _cdkTabs = inject(CdkTabs);

  /** The CdkTabs nested inside of the CdkTabList. */
  private readonly _unorderedTabs = signal(new Set<CdkTab>());

  /** The internal tab selection state. */
  private readonly _selection = linkedSignal(() => (this.tab() ? [this.tab()!] : []));

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** The Tab UIPatterns of the child Tabs. */
  readonly tabs = computed(() =>
    [...this._unorderedTabs()].sort(sortDirectives).map(tab => tab.pattern),
  );

  /** Whether the tablist is vertically or horizontally oriented. */
  readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

  /** Whether focus should wrap when navigating. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /** Whether disabled items in the list should be skipped when navigating. */
  readonly skipDisabled = input(true, {transform: booleanAttribute});

  /** The focus strategy used by the tablist. */
  readonly focusMode = input<'roving' | 'activedescendant'>('roving');

  /** The selection strategy used by the tablist. */
  readonly selectionMode = input<'follow' | 'explicit'>('follow');

  /** Whether the tablist is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The current selected tab. */
  readonly tab = model<string | undefined>();

  /** The TabList UIPattern. */
  readonly pattern: TabListPattern = new TabListPattern({
    ...this,
    items: this.tabs,
    value: this._selection,
    activeItem: signal(undefined),
  });

  /** Whether the tree has received focus yet. */
  private _hasFocused = signal(false);

  constructor() {
    afterRenderEffect(() => this.tab.set(this._selection()[0]));

    afterRenderEffect(() => {
      if (!this._hasFocused()) {
        this.pattern.setDefaultState();
      }
    });
  }

  onFocus() {
    this._hasFocused.set(true);
  }

  ngOnInit() {
    this._cdkTabs.register(this);
  }

  ngOnDestroy() {
    this._cdkTabs.deregister(this);
  }

  register(child: CdkTab) {
    this._unorderedTabs().add(child);
    this._unorderedTabs.set(new Set(this._unorderedTabs()));
  }

  deregister(child: CdkTab) {
    this._unorderedTabs().delete(child);
    this._unorderedTabs.set(new Set(this._unorderedTabs()));
  }
}

/** A selectable tab in a TabList. */
@Directive({
  selector: '[cdkTab]',
  exportAs: 'cdkTab',
  host: {
    'role': 'tab',
    'class': 'cdk-tab',
    '[class.cdk-active]': 'pattern.active()',
    '[attr.id]': 'pattern.id()',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.aria-selected]': 'pattern.selected()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.aria-controls]': 'pattern.controls()',
  },
})
export class CdkTab implements HasElement, OnInit, OnDestroy {
  /** A reference to the tab element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent CdkTabs. */
  private readonly _cdkTabs = inject(CdkTabs);

  /** The parent CdkTabList. */
  private readonly _cdkTabList = inject(CdkTabList);

  /** A global unique identifier for the tab. */
  private readonly _id = inject(_IdGenerator).getId('cdk-tab-');

  /** The host native element. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** The parent TabList UIPattern. */
  readonly tablist = computed(() => this._cdkTabList.pattern);

  /** The TabPanel UIPattern associated with the tab */
  readonly tabpanel = computed(() =>
    this._cdkTabs.unorderedTabpanels().find(tabpanel => tabpanel.value() === this.value()),
  );

  /** Whether a tab is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** A local unique identifier for the tab. */
  readonly value = input.required<string>();

  /** The Tab UIPattern. */
  readonly pattern: TabPattern = new TabPattern({
    ...this,
    id: () => this._id,
    tablist: this.tablist,
    tabpanel: this.tabpanel,
    value: this.value,
  });

  ngOnInit() {
    this._cdkTabList.register(this);
  }

  ngOnDestroy() {
    this._cdkTabList.deregister(this);
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
  selector: '[cdkTabPanel]',
  exportAs: 'cdkTabPanel',
  host: {
    'role': 'tabpanel',
    'class': 'cdk-tabpanel',
    '[attr.id]': 'pattern.id()',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.inert]': 'pattern.hidden() ? true : null',
    '[attr.aria-labelledby]': 'pattern.labelledBy()',
  },
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
})
export class CdkTabPanel implements OnInit, OnDestroy {
  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** The parent CdkTabs. */
  private readonly _cdkTabs = inject(CdkTabs);

  /** A global unique identifier for the tab. */
  private readonly _id = inject(_IdGenerator).getId('cdk-tabpanel-');

  /** The Tab UIPattern associated with the tabpanel */
  readonly tab = computed(() => this._cdkTabs.tabs()?.find(tab => tab.value() === this.value()));

  /** A local unique identifier for the tabpanel. */
  readonly value = input.required<string>();

  /** The TabPanel UIPattern. */
  readonly pattern: TabPanelPattern = new TabPanelPattern({
    ...this,
    id: () => this._id,
    tab: this.tab,
  });

  constructor() {
    afterRenderEffect(() => this._deferredContentAware.contentVisible.set(!this.pattern.hidden()));
  }

  ngOnInit() {
    this._cdkTabs.register(this);
  }

  ngOnDestroy() {
    this._cdkTabs.deregister(this);
  }
}

/**
 * A TabContent container for the lazy-loaded content.
 */
@Directive({
  selector: 'ng-template[cdkTabContent]',
  exportAs: 'cdTabContent',
  hostDirectives: [DeferredContent],
})
export class CdkTabContent {}
