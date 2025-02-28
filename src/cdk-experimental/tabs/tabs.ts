/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  booleanAttribute,
  computed,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {TabPattern} from '@angular/cdk-experimental/ui-patterns/tabs/tab';
import {TablistPattern} from '@angular/cdk-experimental/ui-patterns/tabs/tablist';
import {TabpanelPattern} from '@angular/cdk-experimental/ui-patterns/tabs/tabpanel';
import {toSignal} from '@angular/core/rxjs-interop';
import {_IdGenerator} from '@angular/cdk/a11y';

/**
 * A Tabs container.
 *
 * Represents a set of layered sections of content. The CdkTabs is a container meant to be used with
 * CdkTablist, CdkTab, and CdkTabpanel as follows:
 *
 * ```html
 * <div cdkTabs>
 *   <ul cdkTablist>
 *     <li cdkTab>Tab 1</li>
 *     <li cdkTab>Tab 2</li>
 *     <li cdkTab>Tab 3</li>
 *   </ul>
 *
 *   <div cdkTabpanel>Tab content 1</div>
 *   <div cdkTabpanel>Tab content 2</div>
 *   <div cdkTabpanel>Tab content 3</div>
 * </div>
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
  /** The CdkTabs nested inside of the container. */
  private readonly _cdkTabs = contentChildren(CdkTab, {descendants: true});

  /** The CdkTabpanels nested inside of the container. */
  private readonly _cdkTabpanels = contentChildren(CdkTabpanel, {descendants: true});

  /** The Tab UIPattern of the child Tabs. */
  tabs = computed(() => this._cdkTabs().map(tab => tab.pattern));

  /** The Tabpanel UIPattern of the child Tabpanels. */
  tabpanels = computed(() => this._cdkTabpanels().map(tabpanel => tabpanel.pattern));
}

/**
 * A Tablist container.
 *
 * Controls a list of CdkTab(s).
 */
@Directive({
  selector: '[cdkTablist]',
  exportAs: 'cdkTablist',
  host: {
    'role': 'tablist',
    'class': 'cdk-tablist',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.aria-orientation]': 'pattern.orientation()',
    '[attr.aria-activedescendant]': 'pattern.activedescendant()',
    '(keydown)': 'pattern.onKeydown($event)',
    '(mousedown)': 'pattern.onPointerdown($event)',
  },
})
export class CdkTablist {
  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  private readonly _directionality = inject(Directionality);

  /** The CdkTabs nested inside of the CdkTablist. */
  private readonly _cdkTabs = contentChildren(CdkTab, {descendants: true});

  /** A signal wrapper for directionality. */
  protected textDirection = toSignal(this._directionality.change, {
    initialValue: this._directionality.value,
  });

  /** The Tab UIPatterns of the child Tabs. */
  protected items = computed(() => this._cdkTabs().map(tab => tab.pattern));

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

  /** The ids of the current selected tab. */
  selectedIds = model<string[]>([]);

  /** The current index that has been navigated to. */
  activeIndex = model<number>(0);

  /** The Tablist UIPattern. */
  pattern: TablistPattern = new TablistPattern({
    ...this,
    items: this.items,
    textDirection: this.textDirection,
  });
}

/** A selectable tab in a tablist. */
@Directive({
  selector: '[cdkTab]',
  exportAs: 'cdkTab',
  host: {
    'role': 'tab',
    'class': 'cdk-tab',
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

  /** The parent CdkTablist. */
  private readonly _cdkTablist = inject(CdkTablist);

  /** A unique identifier for the tab. */
  private readonly _generatedId = inject(_IdGenerator).getId('cdk-tab-');

  /** A unique identifier for the tab. */
  protected id = computed(() => this._generatedId);

  /** A reference to the tab element to be focused on navigation. */
  protected element = computed(() => this._elementRef.nativeElement);

  /** The position of the tab in the list. */
  protected index = computed(() => this._cdkTabs.tabs().findIndex(tab => tab.id === this.id));

  /** The parent Tablist UIPattern. */
  protected tablist = computed(() => this._cdkTablist.pattern);

  /** The Tabpanel UIPattern associated with the tab */
  protected tabpanel = computed(() => this._cdkTabs.tabpanels()[this.index()]);

  /** Whether a tab is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** The Tab UIPattern. */
  pattern: TabPattern = new TabPattern({
    ...this,
    id: this.id,
    tablist: this.tablist,
    tabpanel: this.tabpanel,
    element: this.element,
  });
}

/** A Tabpanel container for the resources of layered content associated with a tab. */
@Directive({
  selector: '[cdkTabpanel]',
  exportAs: 'cdkTabpanel',
  host: {
    'role': 'tabpanel',
    'class': 'cdk-tabpanel',
    '[attr.id]': 'pattern.id()',
    '[attr.aria-hidden]': 'pattern.hidden()',
  },
})
export class CdkTabpanel {
  /** The parent CdkTabs. */
  private readonly _cdkTabs = inject(CdkTabs);

  /** A unique identifier for the tab. */
  private readonly _generatedId = inject(_IdGenerator).getId('cdk-tabpanel-');

  /** A unique identifier for the tabpanel. */
  protected id = computed(() => this._generatedId);

  /** The position of the tabpanel in the tabs. */
  protected index = computed(() =>
    this._cdkTabs.tabpanels().findIndex(tabpanel => tabpanel.id === this.id),
  );

  /** The Tab UIPattern associated with the tabpanel */
  protected tab = computed(() => this._cdkTabs.tabs()[this.index()]);

  /** The Tabpanel UIPattern. */
  pattern: TabpanelPattern = new TabpanelPattern({
    ...this,
    id: this.id,
    tab: this.tab,
  });
}
