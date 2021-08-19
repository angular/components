/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {MatTab} from './tab';
import {MatTabList} from './tab-list';

/**
 * Tab-body subcomponent of the Material design tab-roup component.
 * See: https://material.io/design/components/tabs.html
 */
@Component({
  selector: 'mat-tab-group-body',
  templateUrl: 'tab-group-body.html',
  styleUrls: ['tab-group-body.css'],
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matTabGroupBody',
})
export class MatTabGroupBody implements OnDestroy {
  /** Snapshot of the height of the tab body wrapper before another tab is activated. */
  private _tabBodyWrapperHeight: number = 0;

  @ViewChild('tabBodyWrapper') _tabBodyWrapper: ElementRef;

  get tabBodyWrapper(): ElementRef { return this._tabBodyWrapper; }

  /** All of the tabs that belong to the group. */
  @Input('tabs') _tabs: QueryList<MatTab>;
  set tabs(value: QueryList<MatTab>) {
    this._tabs = value;
  }

  /** Whether the tab group should grow to the size of the active tab. */
  @Input()
  dynamicHeight: boolean = false;

  /** The index of the active tab. */
  @Input('selectedIndex') _selectedIndex: number|null = null;

  @Input('animationMode') _animationMode?: string|null;

  /** The id of the groupId of the tab group that owns this tab body. */
  @Input('groupId') groupId: number;

  /**
   * `tabindex` to be set on the inner element that wraps the tab content. Can be used for improved
   * accessibility when the tab does not have focusable elements or if it has scrollable content.
   * The `tabindex` will be removed automatically for inactive tabs.
   * Read more at https://www.w3.org/TR/wai-aria-practices/examples/tabs/tabs-2/tabs.html
   */
  @Input() contentTabIndex: number|null = null;

  /** Duration for the tab animation. Will be normalized to milliseconds if no units are set. */
  @Input() animationDuration = '500ms';

  /** Event emitted when the body animation has completed */
  @Output() readonly animationDone: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted when the tab begins to animate towards the center as the active tab. */
  @Output() readonly _onCentering: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted when the tab completes its animation towards the center. */
  @Output() readonly _onCentered: EventEmitter<void> = new EventEmitter<void>(true);

  /** Set and subscribe to observable for changes in selected index. */
  setSelectedIndexObs(obs: Observable<number|null>) {
    this._selectedIndexSubscription.unsubscribe();
    this._selectedIndexSubscription = obs.subscribe(selectedIndex => {
      this._selectedIndex = selectedIndex;
    });
  }
  private _selectedIndexSubscription = Subscription.EMPTY;

  /** Set and subscribe to observable for changes in animation mode. */
  setAnimationModeObs(obs: Observable<string|undefined|null>) {
    this._animationModeSubscription.unsubscribe();
    this._animationModeSubscription = obs.subscribe(animationMode => {
      this._animationMode = animationMode;
    });
  }
  private _animationModeSubscription = Subscription.EMPTY;

  ngOnDestroy() {
    this._selectedIndexSubscription.unsubscribe();
    this._animationModeSubscription.unsubscribe();
  }

  getTabBodyWrapper(): ElementRef {
    return this._tabBodyWrapper;
  }

  /** Returns a unique id for each tab content element */
  _getTabContentId(i: number): string|null {
    return MatTabGroupBody.getTabContentId(i, this.groupId);
  }

  /** Returns a unique id for each tab label element */
  _getTabLabelId(i: number): string|null {
    return MatTabList.getTabLabelId(i, this.groupId);
  }

  /**
   * Sets the height of the body wrapper to the height of the activating tab if dynamic
   * height property is true.
   */
  _setTabBodyWrapperHeight(tabHeight: number): void {
    if (!this.dynamicHeight || !this._tabBodyWrapperHeight) { return; }

    const wrapper: HTMLElement = this._tabBodyWrapper.nativeElement;

    wrapper.style.height = this._tabBodyWrapperHeight + 'px';

    // This conditional forces the browser to paint the height so that
    // the animation to the new height can have an origin.
    if (this._tabBodyWrapper.nativeElement.offsetHeight) {
      wrapper.style.height = tabHeight + 'px';
    }
  }

  /** Removes the height of the tab body wrapper. */
  _removeTabBodyWrapperHeight(): void {
    const wrapper = this._tabBodyWrapper.nativeElement;
    this._tabBodyWrapperHeight = wrapper.clientHeight;
    wrapper.style.height = '';
    this.animationDone.emit();
  }

  /** Returns a unique id for each tab content element */
  static getTabContentId(i: number, groupId: number|null): string|null {
    if (groupId == null) {
      return null;
    }
    return `mat-tab-content-${groupId}-${i}`;
  }
}
