/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Workaround for nested sticky problem in Edge.
 * Remove this and the code part on sticky-styler when Edge nested sticky columns are fixed.
 * See https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/18940617/
 * @docs-private
 */
// TODO missing tests
export class EdgeNestedStickyFix {
  isBrowserEdge = typeof CSS !== 'undefined' && CSS.supports('(-ms-ime-align:auto)');
  // This is initialized when found undefined the first time, before being used
  private scrollingContext!: HTMLElement;
  private stickyRowWrappers: HTMLElement[] = [];
  private lastKnownHorizontalScroll = 0;
  private lastKnownVerticalScroll = 0;

  /**
   * Uses the fix to manage a sticky row.
   *
   * @param row The row to manage
   * @param isSticky Its stickyness status
   * @param position Where the row is positioned
   * @param stickyHeight The offset the row should have if it's sticky
   * @memberof EdgeNestedStickyFix
   */
  useEdgeFix(
    row: HTMLElement,
    isSticky: boolean,
    position: 'top' | 'bottom',
    stickyHeight: number
  ) {
    // First time we get the scrollContext, we initialize the wrokaround
    if (this.scrollingContext === undefined) {
    // Being this the first time we enter stickRows method, we know no rows
    //  are wrapped. If the current row was, the method searching for the
    //  scrolling context would stop to the wrapper instead of the one we need
    this.initializeHorizontalScrollPropagation(row);
    }

    if (!isSticky) {
      this.unstickRow(row);
      return;
    }

    this.stickRow(row, position, stickyHeight);
  }

  private unstickRow(row: HTMLElement) {
    // Check if the row was wrapped and, if so, we unwrap it
    if (this.isRowWrapped(row)) {
        this.unwrapStickyRow(row);
    }
  }

  private stickRow(row: HTMLElement, position: 'top' | 'bottom', stickyHeight: number) {
    // If the row isn't wrapped, we wrap it up and get the wrapper reference
    const wrapper = this.isRowWrapped(row)
      ? this.getRowWrapper(row)
      : this.wrapStickyRow(row);

    const scrollRect = this.scrollingContext.getBoundingClientRect();
    const positionValue = position === 'top'
    ? scrollRect.top + stickyHeight
    : window.document.body.clientHeight
        - scrollRect.bottom
        + stickyHeight
        + (scrollRect.height - this.scrollingContext.clientHeight);

    // Updates wrapper position rules
    wrapper.style[position] = `${positionValue}px`;
    wrapper.style.left = `${scrollRect.left}px`;
  }

  private initializeHorizontalScrollPropagation(row: HTMLElement) {
    this.scrollingContext = this.getScrollingContext(row);
    this.lastKnownVerticalScroll = this.scrollingContext.getBoundingClientRect().top;

    // We use passive listeners to keep the scroll animation smooth
    this.scrollingContext.addEventListener('scroll', () => {
      if (this.scrollingContext.scrollLeft === this.lastKnownHorizontalScroll) {
        return;
      }
      window.requestAnimationFrame(this.propagateHorizontalScroll.bind(this));
    }, { passive: true });

    // TODO memory leak?
    // Capture all scroll events on the page using the third parameter and a document-level listener
    window.document.addEventListener('scroll', event => {
      if (event.target === this.scrollingContext
        || !(event.target as HTMLElement).contains(this.scrollingContext)) {
        return;
      }

      // TODO eats up 1px or so every time it fires
      // TODO animation lags behind the scroll
      this.updateStickyRowsPosition();
    }, { passive: true });

    // TODO resize breaks positioning, must recalculate/update them
    window.addEventListener('resize', this.updateStickyRowsWidth.bind(this), { passive: true });
  }

  private unwrapStickyRow(row: HTMLElement) {
    const wrapper = row.parentElement!;
    // Removes placeholder
    wrapper.previousElementSibling!.remove();
    // Takes out the row
    wrapper.parentNode!.insertBefore(row, wrapper);
    // Removes the wrapper from the keep-scroll-in-sync array
    const wrapperIndex = this.stickyRowWrappers!.findIndex(element => wrapper === element);
    this.stickyRowWrappers!.splice(wrapperIndex, 1);
    // Removes wrapper
    wrapper.remove();
    // Reset row width
    row.style.width = '';
  }

  private wrapStickyRow(row: HTMLElement) {
    const rowWidth = row.clientWidth;

    const wrapper = window.document.createElement('div');
    wrapper.classList.add('mat-edge-sticky-row-wrapper');

    // We delegate to the next frame to be sure not to have some kind of race-condition
    //  which would give us a wrong wrapper width
    // Es. when the scrolling element is loaded async and displayed under a expandable panel
    //  See 'table-sticky-complex-flex' example
    window.requestAnimationFrame(this.updateStickyRowsWidth.bind(this));

    // Insert wrapper
    row.parentNode!.insertBefore(wrapper, row);
    // Put in the row
    wrapper.appendChild(row);
    // Insert placeholder
    wrapper.parentNode!.insertBefore(row.cloneNode(), wrapper);
    // Set expected row width
    row.style.width = `${rowWidth}px`;

    // Initial sync of scroll position
    // Ths must be after all DOM manipulations have been done or it won't work
    wrapper.scrollLeft = this.scrollingContext.scrollLeft;

    // Register the wrapper to be in sync with scrolling context horizontal offset
    this.stickyRowWrappers.push(wrapper);

    return wrapper;
  }

  private isRowWrapped(row: HTMLElement) {
    return this.getRowWrapper(row).classList.contains('mat-edge-sticky-row-wrapper');
  }

  private getRowWrapper(row: HTMLElement) {
    return row.parentElement!;
  }

  private getScrollingContext(scrolledElement: HTMLElement) {
    // If a scrolling context is marked by the developer, we use it
    // This can be useful when using libraries that manage scrolling in a not native way,
    //  like ngx-perfect-scrollbar, effectively breaking our normal scrolling context research
    const markedScrollingContext = scrolledElement.closest('.cdk-scrolling-context');
    if (markedScrollingContext !== null) {
      return markedScrollingContext as HTMLElement;
    }

    // Find the nearest scrolling element ancestor
    do {
      scrolledElement = scrolledElement.parentElement!;
    } while (scrolledElement.offsetWidth === scrolledElement.scrollWidth
      || scrolledElement.parentElement === null);
    return scrolledElement.parentElement!;
  }

  private propagateHorizontalScroll() {
    // Forces reflow only 1 time
    this.lastKnownHorizontalScroll = this.scrollingContext.scrollLeft;

    this.stickyRowWrappers!.forEach(wrapper => {
      wrapper.scrollLeft = this.lastKnownHorizontalScroll;
    });
  }

  private updateStickyRowsPosition() {
    const scrollRect = this.scrollingContext.getBoundingClientRect();
    const scrollDelta = this.lastKnownVerticalScroll - scrollRect.top;

    this.stickyRowWrappers!.forEach(({style: wrapperStyle}) => {
      // Define in which position the row is pinned
      const position = wrapperStyle.top ? 'top' : 'bottom';
      const newPosition = `${parseInt(wrapperStyle[position]!, 10)
        + scrollDelta * (position === 'top' ? -1 : 1)}px`;

      // Updates wrapper positioning rules
      wrapperStyle[position] = newPosition;
      wrapperStyle.left = `${scrollRect.left}px`;
    });

    this.lastKnownVerticalScroll = scrollRect.top;
  }

  private updateStickyRowsWidth() {
    // We must use clientWidth to avoid counting in the possible scrollbar width
    const scrollingContextWidth = this.scrollingContext.clientWidth;

    this.stickyRowWrappers!.forEach(wrapper => {
      wrapper.style.width = `${scrollingContextWidth}px`;
    });
  }
}
