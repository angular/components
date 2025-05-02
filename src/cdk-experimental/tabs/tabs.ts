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
  contentChild,
  contentChildren,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {TabListPattern, TabPanelPattern, TabPattern} from '../ui-patterns';

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
  private readonly _cdkTabList = contentChild(CdkTabList);

  /** The CdkTabPanels nested inside of the container. */
  private readonly _cdkTabPanels = contentChildren(CdkTabPanel);

  /** The Tab UIPattern of the child Tabs. */
  tabs = computed(() => this._cdkTabList()?.tabs());

  /** The TabPanel UIPattern of the child TabPanels. */
  tabpanels = computed(() => this._cdkTabPanels().map(tabpanel => tabpanel.pattern));
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
  },
})
export class CdkTabList {
  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  private readonly _directionality = inject(Directionality);

  /** The CdkTabs nested inside of the CdkTabList. */
  private readonly _cdkTabs = contentChildren(CdkTab);

  /** A signal wrapper for directionality. */
  protected textDirection = toSignal(this._directionality.change, {
    initialValue: this._directionality.value,
  });

  /** The Tab UIPatterns of the child Tabs. */
  tabs = computed(() => this._cdkTabs().map(tab => tab.pattern));

  /** Whether the tablist is vertically or horizontally oriented. */
  orientation = input<'vertical' | 'horizontal'>('horizontal');

  /** Whether focus should wrap when navigating. */
  wrap = input(true, {transform: booleanAttribute});

  /** Whether disabled items in the list should be skipped when navigating. */
  skipDisabled = input(true, {transform: booleanAttribute});

  /** The focus strategy used by the tablist. */
  focusMode = input<'roving' | 'activedescendant'>('roving');

  /** The selection strategy used by the tablist. */
  selectionMode = input<'follow' | 'explicit'>('follow');

  /** Whether the tablist is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** The current index that has been navigated to. */
  activeIndex = model<number>(0);

  /** The TabList UIPattern. */
  pattern: TabListPattern = new TabListPattern({
    ...this,
    items: this.tabs,
    textDirection: this.textDirection,
    value: signal<string[]>([]),
  });
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
export class CdkTab {
  /** A reference to the tab element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent CdkTabs. */
  private readonly _cdkTabs = inject(CdkTabs);

  /** The parent CdkTabList. */
  private readonly _cdkTabList = inject(CdkTabList);

  /** A global unique identifier for the tab. */
  private readonly _id = inject(_IdGenerator).getId('cdk-tab-');

  /** The parent TabList UIPattern. */
  protected tablist = computed(() => this._cdkTabList.pattern);

  /** The TabPanel UIPattern associated with the tab */
  protected tabpanel = computed(() =>
    this._cdkTabs.tabpanels().find(tabpanel => tabpanel.value() === this.value()),
  );

  /** Whether a tab is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** A local unique identifier for the tab. */
  value = input.required<string>();

  /** The Tab UIPattern. */
  pattern: TabPattern = new TabPattern({
    ...this,
    id: () => this._id,
    element: () => this._elementRef.nativeElement,
    tablist: this.tablist,
    tabpanel: this.tabpanel,
    value: this.value,
  });
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
    'tabindex': '0',
    'class': 'cdk-tabpanel',
    '[attr.id]': 'pattern.id()',
    '[attr.inert]': 'pattern.hidden() ? true : null',
  },
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
})
export class CdkTabPanel {
  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** The parent CdkTabs. */
  private readonly _cdkTabs = inject(CdkTabs);

  /** A global unique identifier for the tab. */
  private readonly _id = inject(_IdGenerator).getId('cdk-tabpanel-');

  /** The Tab UIPattern associated with the tabpanel */
  protected tab = computed(() => this._cdkTabs.tabs()?.find(tab => tab.value() === this.value()));

  /** A local unique identifier for the tabpanel. */
  value = input.required<string>();

  /** The TabPanel UIPattern. */
  pattern: TabPanelPattern = new TabPanelPattern({
    ...this,
    id: () => this._id,
    tab: this.tab,
  });

  constructor() {
    effect(() => this._deferredContentAware.contentVisible.set(!this.pattern.hidden()));
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
