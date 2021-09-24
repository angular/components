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
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import {
  CanColor,
  CanDisableRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple
} from '@angular/material/core';

import {MAT_TAB_LABEL, MatTabLabel} from './tab-label';

// Boilerplate for applying mixins to MatTabListLabel.
/** @docs-private */
const _MatTabListLabelMixinBase = mixinDisabled(class {});

/** Directive for passing tab labels to tab list. */
@Directive({
  selector: 'mat-tab-list-label, matTabListLabel',
  inputs: ['disabled'],
})
export class MatTabListLabel extends _MatTabListLabelMixinBase {
  /** Aria label for the tab label. */
  @Input() ariaLabel: string;

  /**
   * Reference to the element that the tab label is labelled by.
   */
  @Input() ariaLabelledby: string;

  // TODO: Deduplicate with tab
  /** Content for the tab label given by `<ng-template mat-tab-label>`. */
  @ContentChild(MAT_TAB_LABEL)
  get templateLabel(): MatTabLabel {
    return this._templateLabelInput || this._templateLabel;
  }
  set templateLabel(value: MatTabLabel) {
    this._setTemplateLabelInput(value);
  }
  protected _templateLabel: MatTabLabel;

  /** Content for tab label passed as input. */
  @Input('templateLabel') _templateLabelInput?: MatTabLabel;

  /** Plain text label for the tab label, used when there is no template label. */
  @Input() textLabel: string = '';

  // TODO: Dedpulicate with tab
  /**
   * This has been extracted to a util because of TS 4 and VE.
   * View Engine doesn't support property rename inheritance.
   * TS 4.0 doesn't allow properties to override accessors or vice-versa.
   * @docs-private
   */
  protected _setTemplateLabelInput(value: MatTabLabel) {
    // Only update the templateLabel via query if there is actually
    // a MatTabLabel found. This works around an issue where a user may have
    // manually set `templateLabel` during creation mode, which would then get clobbered
    // by `undefined` when this query resolves.
    if (value) {
      this._templateLabel = value;
    }
  }
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
 * Wrapper for the tab header.
 * @docs-private
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
export class MatTabList extends _MatTabListMixinBase implements CanDisableRipple, CanColor,
                                                                CanDisableRipple {
  @ViewChild('tabHeader') _tabHeader: MatTabListBaseHeader;

  /** All of the tabs that belong to the group. */
  @ContentChildren(MatTabListLabel) _tabLabels: QueryList<MatTabListLabel>;

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

  constructor(
      elementRef: ElementRef,
  ) {
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
  _getTabIndex(tab: MatTabListLabel, idx: number): number|null {
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

  // TODO: Deduplicate these method. Also defined in tab group.
  // TODO: what if groupId is undefined?
  /** Returns a unique id for each tab label element */
  _getTabLabelId(i: number): string {
    return `mat-tab-label-${this.groupId}-${i}`;
  }

  /** Returns a unique id for each tab content element */
  _getTabContentId(i: number): string {
    return `mat-tab-content-${this.groupId}-${i}`;
  }

  static ngAcceptInputType_selectedIndex: NumberInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
  static ngAcceptInputType_contentTabIndex: BooleanInput;
}
