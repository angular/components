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
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CanColor,
  CanDisableRipple,
  mixinColor,
  mixinDisableRipple,
  ThemePalette,
} from '@angular/material/core';
import {MatTabHeader} from './tab-header';
import {MatTabListItem} from './tab-list-item';

// Boilerplate for applying mixins to MatTabList.
/** @docs-private */
const _MatTabListMixinBase = mixinColor(
  mixinDisableRipple(
    class {
      constructor(public _elementRef: ElementRef) {}
    },
  ),
  'primary',
);

export interface MatTabListBaseHeader {
  _alignInkBarToSelectedTab: () => void;
  focusIndex: number;
}

/**
 * Wrapper for the tab header.
 * @docs-private
 */
@Component({
  selector: 'mat-tab-list',
  exportAs: 'matTabList',
  templateUrl: 'tab-list.html',
  styleUrls: ['tab-list.css'],
  encapsulation: ViewEncapsulation.None,
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  inputs: ['color', 'disableRipple'],
  host: {
    role: 'tablist',
  },
})
export class MatTabList extends _MatTabListMixinBase implements CanDisableRipple, CanColor {
  @ViewChild('tabHeader') _tabHeader: MatTabHeader;

  /** All of the tab list item that belong to the group. */
  @ContentChildren(MatTabListItem, {descendants: false}) _tabListItems: QueryList<MatTabListItem>;

  /** The index of the active tab. */
  @Input() selectedIndex: number = 0;

  /** The id of the groupId of the tab group that owns this list. */
  @Input() groupId: string | null = null;

  /**
   * Whether pagination should be disabled. This can be used to avoid unnecessary
   * layout recalculations if it's known that pagination won't be required.
   */
  @Input() disablePagination: boolean;

  /** Background color of the tab group. */
  @Input()
  get backgroundColor(): ThemePalette {
    return this._backgroundColor;
  }
  set backgroundColor(value: ThemePalette) {
    const nativeElement: HTMLElement = this._elementRef.nativeElement;

    nativeElement.classList.remove(`mat-background-${this.backgroundColor}`);

    if (value) {
      nativeElement.classList.add(`mat-background-${value}`);
    }

    this._backgroundColor = value;
  }
  private _backgroundColor: ThemePalette;

  /** Output to enable support for two-way binding on `[(selectedIndex)]` */
  @Output() readonly selectedIndexChange: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted when focus has changed within a tab group. */
  @Output() readonly focusChange: EventEmitter<number> = new EventEmitter<number>();

  constructor(elementRef: ElementRef) {
    super(elementRef);
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

  /** Handle click events, setting new selected index if appropriate. */
  _handleClick(index: number) {
    this.selectedIndexChange.emit(index);
  }

  _handleSelectFocusedIndex(index: number) {
    this.selectedIndexChange.emit(index);
  }

  /** Retrieves the tabindex for the tab. */
  _getTabIndex(tab: MatTabListItem, idx: number): number | null {
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

  /** Returns a unique id for each tab label element */
  _getTabLabelId(i: number): string {
    if (this.groupId == null) {
      return '';
    }
    return `mat-tab-label-${this.groupId}-${i}`;
  }

  /** Returns a unique id for each tab content element */
  _getTabContentId(i: number): string {
    if (this.groupId == null) {
      return '';
    }
    return `mat-tab-content-${this.groupId}-${i}`;
  }

  static ngAcceptInputType_selectedIndex: NumberInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
  static ngAcceptInputType_contentTabIndex: BooleanInput;
}
