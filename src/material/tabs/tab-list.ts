/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusOrigin} from '@angular/cdk/a11y';
import {BooleanInput, NumberInput} from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import {CanColor, CanDisableRipple, mixinColor, mixinDisableRipple, ThemePalette} from '../core';

import {MAT_TABS_CONFIG, MatTab, MatTabsConfig} from '.';

/** A simple change event emitted on focus or selection changes. */
export class MatTabChangeEvent {
  /** Index of the currently-selected tab. */
  index: number;
  /** Reference to the currently-selected tab. */
  tab: MatTab;
}

// Boilerplate for applying mixins to MatTabList.
/** @docs-private */
const _MatTabListMixinBase = mixinColor(
    mixinDisableRipple(class {
      constructor(public _elementRef: ElementRef) {}
    }),
    'primary');

export interface MatTabListBaseHeader {
  _alignInkBarToSelectedTab: () => void;
  focusIndex: number;
}

/**
 * Tab-list subcomponent of the Material design tab-group component.
 * See: https://material.io/design/components/tabs.html
 */
@Component({
  selector: 'mat-tab-list',
  exportAs: 'matTabList',
  templateUrl: 'tab-list.html',
  styleUrls: ['tab-list.css'],
  encapsulation: ViewEncapsulation.None,
  // tslint:disable-next-line:validate-decorator
  changeDetection: ChangeDetectionStrategy.Default,
  inputs: ['color', 'disableRipple'],
})
export class MatTabList extends _MatTabListMixinBase implements CanDisableRipple,
                                                                CanColor, CanDisableRipple {
  @ViewChild('tabHeader') _tabHeader: MatTabListBaseHeader;

  /** All of the tabs that belong to the group. */
  @Input('tabs') _tabs: QueryList<MatTab>;

  /** The index of the active tab. */
  @Input() selectedIndex: number|null = null;

  /** The id of the groupId of the tab group that owns this list. */
  @Input() groupId: number|null = null;

  /**
   * Whether pagination should be disabled. This can be used to avoid unnecessary
   * layout recalculations if it's known that pagination won't be required.
   */
  @Input() disablePagination: boolean;

  /** Output to enable support for two-way binding on `[(selectedIndex)]` */
  @Output() readonly selectedIndexChange: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted when focus has changed within a tab group. */
  @Output() readonly focusChange: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted when the tab selection has changed. */
  @Output()
  readonly selectedTabChange: EventEmitter<MatTabChangeEvent> =
      new EventEmitter<MatTabChangeEvent>(true);

  constructor(
      elementRef: ElementRef,
      @Inject(MAT_TABS_CONFIG) @Optional() defaultConfig?: MatTabsConfig,
  ) {
    super(elementRef);
    this.disablePagination = defaultConfig && defaultConfig.disablePagination != null ?
        defaultConfig.disablePagination :
        false
  }

  /** Re-aligns the ink bar to the selected tab element. */
  realignInkBar() {
    if (this._tabHeader) {
      this._tabHeader._alignInkBarToSelectedTab();
    }
  }

  /**
   * Sets focus to a particular tab.
   * @param index Index of the tab to be focused.
   */
  focusTab(index: number) {
    const header = this._tabHeader;

    if (header) {
      header.focusIndex = index;
    }
  }

  _focusChanged(index: number) {
    this.focusChange.emit(index);
  }

  /** Returns a unique id for each tab label element */
  _getTabLabelId(i: number): string|null {
    if (this.groupId == null) {
      return null;
    }
    return `mat-tab-label-${this.groupId}-${i}`;
  }

  /** Returns a unique id for each tab content element */
  _getTabContentId(i: number): string|null {
    if (this.groupId == null) {
      return null;
    }
    return `mat-tab-content-${this.groupId}-${i}`;
  }

  /** Handle click events, setting new selected index if appropriate. */
  _handleClick(tab: MatTab, tabHeader: MatTabListBaseHeader, index: number) {
    if (!tab.disabled) {
      this.selectedIndex = tabHeader.focusIndex = index;
      this.selectedIndexChange.emit(index);
    }
  }

  _handleSelectFocusedIndex(index: number) {
    this.selectedIndexChange.emit(index);
  }

  /** Retrieves the tabindex for the tab. */
  _getTabIndex(tab: MatTab, idx: number): number|null {
    if (tab.disabled) {
      return null;
    }
    return this.selectedIndex === idx ? 0 : -1;
  }

  /** Callback for when the focused state of a tab has changed. */
  _tabFocusChanged(focusOrigin: FocusOrigin, index: number) {
    // Mouse/touch focus happens during the `mousedown`/`touchstart` phase which
    // can cause the tab to be moved out from under the pointer, interrupting the
    // click sequence (see #21898). We don't need to scroll the tab into view for
    // such cases anyway, because it will be done when the tab becomes selected.
    if (focusOrigin && focusOrigin !== 'mouse' && focusOrigin !== 'touch') {
      this._tabHeader.focusIndex = index;
    }
  }

  static ngAcceptInputType_selectedIndex: NumberInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
  static ngAcceptInputType_contentTabIndex: BooleanInput
}
