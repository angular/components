import {
  ViewChild,
  Component,
  Input,
  NgZone,
  QueryList,
  ElementRef,
  Renderer, ViewEncapsulation, ContentChildren, Output, EventEmitter
} from '@angular/core';
import {RIGHT_ARROW, LEFT_ARROW, ENTER, Dir, LayoutDirection} from '../core';
import {MdTabLabelWrapper} from './tab-label-wrapper';
import {MdInkBar} from './ink-bar';
import 'rxjs/add/operator/map';

export type ScrollDirection = 'after' | 'before';

@Component({
  moduleId: module.id,
  selector: 'md-tab-header',
  templateUrl: 'tab-header.html',
  styleUrls: ['tab-header.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.md-tab-header]': 'true',
    '[class.scroll]': '_isScrollingEnabled()',
    '[class.ltr]': "_getLayoutDirection() == 'ltr'",
    '[class.rtl]': "_getLayoutDirection() == 'rtl'",
  }
})
export class MdTabHeader {
  @ContentChildren(MdTabLabelWrapper) _labelWrappers: QueryList<MdTabLabelWrapper>;

  @ViewChild(MdInkBar) _inkBar: MdInkBar;
  @ViewChild('tabListContainer') _tabListContainer: ElementRef;
  @ViewChild('tabList') _tabList: ElementRef;

  /** The tab index that is focused. */
  private _focusIndex: number = 0;

  /** Index to focus after the view has been checked. */
  private _indexToFocus: number;

  /** The distance in pixels that the tab labels should be translated to the left. */
  private _scrollDistance = 0;

  private _disableScrollAfter = true;
  private _disableScrollBefore = true;

  /** The index of the active tab. */
  private _selectedIndex: number = 0;
  @Input() set selectedIndex(value: number) {
    this._selectedIndex = value;
    this._indexToFocus = value;
  }
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  /** Event emitted when the option is selected. */
  @Output() selectFocusedIndex = new EventEmitter();

  /** Event emitted when a label is focused. */
  @Output() indexFocused = new EventEmitter();

  constructor(private _zone: NgZone,
              private _elementRef: ElementRef,
              private _renderer: Renderer,
              private _dir: Dir) {}

  /**
   * Waits one frame for the view to update, then updates the ink bar and scroll.
   * Note: This must be run outside of the zone or it will create an infinite change detection loop
   * TODO: internal
   */
  ngAfterViewChecked(): void {
    this._zone.runOutsideAngular(() => {
      window.requestAnimationFrame(() => {
        this._updateInkBar();
        this._updateScrollPosition();

        this._disableScrollBefore = this.scrollDistance == 0;
        this._disableScrollAfter = this.scrollDistance == this._getMaxScrollDistance();
      });
    });

    if (this._indexToFocus != this.focusIndex) {
      this.focusIndex = this._indexToFocus;
    }
  }

  /** Tells the ink-bar to align itself to the current label wrapper */
  private _updateInkBar(): void {
    const selectedLabelWrapper = this._labelWrappers && this._labelWrappers.length
        ? this._labelWrappers.toArray()[this.selectedIndex].elementRef.nativeElement
        : null;
    this._inkBar.alignToElement(selectedLabelWrapper);
  }

  handleKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case RIGHT_ARROW:
        this.focusNextTab();
        break;
      case LEFT_ARROW:
        this.focusPreviousTab();
        break;
      case ENTER:
        this.selectFocusedIndex.emit(this.focusIndex);
        break;
    }
  }

  /**
   * Determines if an index is valid.  If the tabs are not ready yet, we assume that the user is
   * providing a valid index and return true.
   */
  isValidIndex(index: number): boolean {
    if (!this._labelWrappers) { return true; }

    const tab = this._labelWrappers.toArray()[index];
    return tab && !tab.disabled;
  }

  /** Tracks which element has focus; used for keyboard navigation */
  get focusIndex(): number {
    return this._focusIndex;
  }

  /** When the focus index is set, we must manually send focus to the correct label */
  set focusIndex(value: number) {
    if (!this.isValidIndex(value) || this._focusIndex == value) { return; }

    this._focusIndex = value;
    this.indexFocused.emit(value);

    if (this._isScrollingEnabled()) {
      this._scrollToLabel(value);
    }

    if (this._labelWrappers && this._labelWrappers.length) {
      this._labelWrappers.toArray()[value].focus();

      // Do not let the browser manage scrolling to focus the element, this will be handled
      // by using translation. In LTR, the scroll left should be 0. In RTL, the scroll width
      // should be the full width minus the offset width.
      const containerEl = this._tabListContainer.nativeElement;
      const dir = this._getLayoutDirection();
      if (dir == 'ltr') {
        containerEl.scrollLeft = 0;
      } else {
        containerEl.scrollLeft = containerEl.scrollWidth - containerEl.offsetWidth;
      }
    }
  }

  /**
   * Moves the focus before or after depending on the offset provided.  Valid offsets are 1 and -1.
   */
  moveFocus(offset: number) {
    if (this._labelWrappers) {
      const tabs: MdTabLabelWrapper[] = this._labelWrappers.toArray();
      for (let i = this.focusIndex + offset; i < tabs.length && i >= 0; i += offset) {
        if (this.isValidIndex(i)) {
          this._indexToFocus = i;
          return;
        }
      }
    }
  }

  /** Increment the focus index by 1 until a valid tab is found. */
  focusNextTab(): void {
    this.moveFocus(this._getLayoutDirection() == 'ltr' ? 1 : -1);
  }

  /** Decrement the focus index by 1 until a valid tab is found. */
  focusPreviousTab(): void {
    this.moveFocus(this._getLayoutDirection() == 'ltr' ? -1 : 1);
  }

  /** The layout direction of the containing app. */
  _getLayoutDirection(): LayoutDirection {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  _updateScrollPosition() {
    let translateX = this.scrollDistance + 'px';
    if (this._getLayoutDirection() == 'ltr') {
      translateX = '-' + translateX;
    }

    this._renderer.setElementStyle(this._tabList.nativeElement,
        'transform', `translate3d(${translateX}, 0, 0)`);
  }

  _isScrollingEnabled(): boolean {
    return this._tabList.nativeElement.scrollWidth > this._elementRef.nativeElement.offsetWidth;
  }

  _getMaxScrollDistance(): number {
    const lengthOfTabList = this._tabList.nativeElement.scrollWidth;
    const viewLength = this._tabListContainer.nativeElement.offsetWidth;
    return lengthOfTabList - viewLength;
  }

  _scrollHeader(scrollDir: ScrollDirection) {
    const viewLength = this._tabListContainer.nativeElement.offsetWidth;

    if (scrollDir == 'before') {
      this.scrollDistance -= viewLength / 3;
    } else {
      this.scrollDistance += viewLength / 3;
    }
  }

  _scrollToLabel(labelIndex: number) {
    const selectedLabel = this._labelWrappers.toArray()[labelIndex];
    const viewLength = this._tabListContainer.nativeElement.offsetWidth;

    let labelBeforePos: number, labelAfterPos: number;
    if (this._getLayoutDirection() == 'ltr') {
      labelBeforePos = selectedLabel.getOffsetLeft();
      labelAfterPos = labelBeforePos + selectedLabel.getOffsetWidth();
    } else {
      labelAfterPos = this._tabList.nativeElement.offsetWidth - selectedLabel.getOffsetLeft();
      labelBeforePos = labelAfterPos - selectedLabel.getOffsetWidth();
    }

    const beforeVisiblePos = this.scrollDistance;
    const afterVisiblePos = this.scrollDistance + viewLength;

    // If move is required, overscroll by a small amount to provide an affordance to click the
    // next label.
    const exaggeratedOverscroll = 60;

    if (labelBeforePos < beforeVisiblePos) {
      // Scroll header to move label to the before direction
      this.scrollDistance -= beforeVisiblePos - labelBeforePos + exaggeratedOverscroll;
    } else if (labelAfterPos > afterVisiblePos) {
      // Scroll header to move label to the after direction
      this.scrollDistance += labelAfterPos - afterVisiblePos + exaggeratedOverscroll;
    }
  }

  private set scrollDistance(v: number) {
    this._scrollDistance = Math.max(0, Math.min(this._getMaxScrollDistance(), v));
  }
  private get scrollDistance(): number { return this._scrollDistance;  }
}
