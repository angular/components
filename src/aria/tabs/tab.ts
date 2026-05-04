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
  OnInit,
  OnDestroy,
  booleanAttribute,
  computed,
  inject,
  input,
  afterRenderEffect,
} from '@angular/core';
import {TabPattern, HasElement} from '../private';
import {TAB_LIST} from './tab-tokens';

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

  /** The parent TabList. */
  private readonly _tabList = inject(TAB_LIST);

  /** A unique identifier for the widget. */
  readonly id = input(inject(_IdGenerator).getId('ng-tab-', true));

  /** The TabPanel UIPattern associated with the tab */
  private readonly _tabpanelPattern = computed(() => {
    return this._tabList._tabsParent._panelMap().get(this.value());
  });

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
    element: () => this.element,
    tabList: () => this._tabList._pattern,
    tabPanel: this._tabpanelPattern,
  });

  /** Opens this tab panel. */
  open() {
    this._pattern.open();
  }

  constructor() {
    afterRenderEffect({
      read: () => {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          if (this._tabList && this._tabList._tabsParent) {
            if (!this._tabList._tabsParent._panelMap().has(this.value())) {
              console.error(
                `ngTab with value '${this.value()}' does not have a corresponding ngTabPanel.`,
              );
            }
          }
        }
      },
    });
  }

  ngOnInit() {
    this._tabList._collection.register(this);
  }

  ngOnDestroy() {
    this._tabList._collection.unregister(this);
  }
}
