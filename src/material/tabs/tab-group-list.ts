/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef, Inject,
  Input, OnDestroy, OnInit, Optional, QueryList, ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {Subscription} from 'rxjs';
import {MatTabsConfig, MAT_TABS_CONFIG} from '.';
import {MatTab, MAT_TAB_GROUP} from './tab';
import {_MatTabGroupBase} from './tab-group';
import {MatTabGroupBody} from './tab-group-body';
import {MatTabList} from './tab-list';

@Component({
  selector: 'mat-tab-group-list',
  exportAs: 'matTabGroupList',
  templateUrl: 'tab-group-list.html',
  styleUrls: ['tab-group.css'],
  encapsulation: ViewEncapsulation.None,
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  inputs: ['color', 'disableRippel'],
  providers: [{provide: MAT_TAB_GROUP, useExisting: MatTabGroupList}],
  host: {
    'class': 'mat-tab-group',
    '[class.mat-tab-group-dynamic-height]': 'dynamicHeight',
  },
})
export class MatTabGroupList extends _MatTabGroupBase implements OnInit, OnDestroy {
  @ContentChildren(MatTab, {descendants: true}) _allTabs: QueryList<MatTab>;
  @Input('tabBody') _tabBody: MatTabGroupBody;
  @ViewChild('tabList') _tabList: MatTabList;

  protected _getTabBodyWrapper(): ElementRef {
    return this._tabBody.tabBodyWrapper;
  }

  constructor(
      elementRef: ElementRef,
      changeDetectorRef: ChangeDetectorRef,
      @Inject(MAT_TABS_CONFIG) @Optional() defaultConfig?: MatTabsConfig,
      @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string) {
    super(elementRef, changeDetectorRef, defaultConfig, animationMode);
  }

  ngOnInit() {
    this._connectTabBody();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._animationDoneSubscription.unsubscribe();
  }

  /**
   * Sets focus to a particular tab.
   * @param index Index of the tab to be focused.
   */
  focusTab(index: number) {
    this._tabList.focusTab(index);
  }

  /** Re-aligns the ink bar to the selected tab element. */
  realignInkBar() {
    this._tabList.realignInkBar();
  }

  /** Handle click events, setting new selected index if appropriate. */
  _handleSelectedIndexChange(index: number) {
    this.selectedIndex = index;
  }

  private _connectTabBody(): void {
    this._tabBody.tabs = this._tabs;
    this._tabBody.groupId = this._groupId;
    this._tabBody.selectedIndexObs = this._selectedIndexObs;
    this._tabBody.animationModeObs = this._animationModeObs;
    this._tabBody.contentTabIndex = this.contentTabIndex;
    this._animationDoneSubscription.unsubscribe();
    this._animationDoneSubscription = this._tabBody.animationDone.subscribe(() => {
      this.animationDone.emit();
    });
  }

  private _animationDoneSubscription = Subscription.EMPTY;
}
