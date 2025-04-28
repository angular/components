/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Directions that can be used when setting sticky positioning.
 * @docs-private
 */
import {afterNextRender, Injector} from '@angular/core';
import {Direction} from '../bidi';
import {StickyPositioningListener} from './sticky-position-listener';

export type StickyDirection = 'top' | 'bottom' | 'left' | 'right';

interface UpdateStickyColumnsParams {
  rows: HTMLElement[];
  stickyStartStates: boolean[];
  stickyEndStates: boolean[];
}

/**
 * List of all possible directions that can be used for sticky positioning.
 * @docs-private
 */
export const STICKY_DIRECTIONS: StickyDirection[] = ['top', 'bottom', 'left', 'right'];

/**
 * Applies and removes sticky positioning styles to the `CdkTable` rows and columns cells.
 * @docs-private
 */
export class StickyStyler {
  private _elemSizeCache = new WeakMap<HTMLElement, {width: number; height: number}>();
  private _resizeObserver = globalThis?.ResizeObserver
    ? new globalThis.ResizeObserver(entries => this._updateCachedSizes(entries))
    : null;
  private _updatedStickyColumnsParamsToReplay: UpdateStickyColumnsParams[] = [];
  private _stickyColumnsReplayTimeout: ReturnType<typeof setTimeout> | null = null;
  private _cachedCellWidths: number[] = [];
  private readonly _borderCellCss: Readonly<{[d in StickyDirection]: string}>;
  private _destroyed = false;

  /**
   * @param _isNativeHtmlTable Whether the sticky logic should be based on a table
   *     that uses the native `<table>` element.
   * @param _stickCellCss The CSS class that will be applied to every row/cell that has
   *     sticky positioning applied.
   * @param direction The directionality context of the table (ltr/rtl); affects column positioning
   *     by reversing left/right positions.
   * @param _isBrowser Whether the table is currently being rendered on the server or the client.
   * @param _needsPositionStickyOnElement Whether we need to specify position: sticky on cells
   *     using inline styles. If false, it is assumed that position: sticky is included in
   *     the component stylesheet for _stickCellCss.
   * @param _positionListener A listener that is notified of changes to sticky rows/columns
   *     and their dimensions.
   * @param _tableInjector The table's Injector.
   */
  constructor(
    private _isNativeHtmlTable: boolean,
    private _stickCellCss: string,
    private _isBrowser = true,
    private readonly _needsPositionStickyOnElement = true,
    public direction: Direction,
    private readonly _positionListener: StickyPositioningListener,
    private readonly _tableInjector: Injector,
  ) {
    this._borderCellCss = {
      'top': `${_stickCellCss}-border-elem-top`,
      'bottom': `${_stickCellCss}-border-elem-bottom`,
      'left': `${_stickCellCss}-border-elem-left`,
      'right': `${_stickCellCss}-border-elem-right`,
    };
  }

  /**
   * Clears the sticky positioning styles from the row and its cells by resetting the `position`
   * style, setting the zIndex to 0, and unsetting each provided sticky direction.
   * @param rows The list of rows that should be cleared from sticking in the provided directions
   * @param stickyDirections The directions that should no longer be set as sticky on the rows.
   */
  clearStickyPositioning(rows: HTMLElement[], stickyDirections: StickyDirection[]) {
    if (stickyDirections.includes('left') || stickyDirections.includes('right')) {
      this._removeFromStickyColumnReplayQueue(rows);
    }

    const elementsToClear: HTMLElement[] = [];
    for (const row of rows) {
      // If the row isn't an element (e.g. if it's an `ng-container`),
      // it won't have inline styles or `children` so we skip it.
      if (row.nodeType !== row.ELEMENT_NODE) {
        continue;
      }

      elementsToClear.push(row, ...(Array.from(row.children) as HTMLElement[]));
    }

    // Coalesce with sticky row/column updates (and potentially other changes like column resize).
    afterNextRender(
      {
        write: () => {
          for (const element of elementsToClear) {
            this._removeStickyStyle(element, stickyDirections);
          }
        },
      },
      {
        injector: this._tableInjector,
      },
    );
  }

  /**
   * Applies sticky left and right positions to the cells of each row according to the sticky
   * states of the rendered column definitions.
   * @param rows The rows that should have its set of cells stuck according to the sticky states.
   * @param stickyStartStates A list of boolean states where each state represents whether the cell
   *     in this index position should be stuck to the start of the row.
   * @param stickyEndStates A list of boolean states where each state represents whether the cell
   *     in this index position should be stuck to the end of the row.
   * @param recalculateCellWidths Whether the sticky styler should recalculate the width of each
   *     column cell. If `false` cached widths will be used instead.
   * @param replay Whether to enqueue this call for replay after a ResizeObserver update.
   */
  updateStickyColumns(
    rows: HTMLElement[],
    stickyStartStates: boolean[],
    stickyEndStates: boolean[],
    recalculateCellWidths = true,
    replay = true,
  ) {
    // Don't cache any state if none of the columns are sticky.
    if (
      !rows.length ||
      !this._isBrowser ||
      !(stickyStartStates.some(state => state) || stickyEndStates.some(state => state))
    ) {
      this._positionListener?.stickyColumnsUpdated({sizes: []});
      this._positionListener?.stickyEndColumnsUpdated({sizes: []});
      return;
    }

    // Coalesce with sticky row updates (and potentially other changes like column resize).
    const firstRow = rows[0];
    const numCells = firstRow.children.length;

    const isRtl = this.direction === 'rtl';
    const start = isRtl ? 'right' : 'left';
    const end = isRtl ? 'left' : 'right';

    const lastStickyStart = stickyStartStates.lastIndexOf(true);
    const firstStickyEnd = stickyEndStates.indexOf(true);

    let cellWidths: number[];
    let startPositions: number[];
    let endPositions: number[];

    if (replay) {
      this._updateStickyColumnReplayQueue({
        rows: [...rows],
        stickyStartStates: [...stickyStartStates],
        stickyEndStates: [...stickyEndStates],
      });
    }

    afterNextRender(
      {
        earlyRead: () => {
          cellWidths = this._getCellWidths(firstRow, recalculateCellWidths);

          startPositions = this._getStickyStartColumnPositions(cellWidths, stickyStartStates);
          endPositions = this._getStickyEndColumnPositions(cellWidths, stickyEndStates);
        },
        write: () => {
          for (const row of rows) {
            for (let i = 0; i < numCells; i++) {
              const cell = row.children[i] as HTMLElement;
              if (stickyStartStates[i]) {
                this._addStickyStyle(cell, start, startPositions[i], i === lastStickyStart);
              }

              if (stickyEndStates[i]) {
                this._addStickyStyle(cell, end, endPositions[i], i === firstStickyEnd);
              }
            }
          }

          if (this._positionListener && cellWidths.some(w => !!w)) {
            this._positionListener.stickyColumnsUpdated({
              sizes:
                lastStickyStart === -1
                  ? []
                  : cellWidths
                      .slice(0, lastStickyStart + 1)
                      .map((width, index) => (stickyStartStates[index] ? width : null)),
            });
            this._positionListener.stickyEndColumnsUpdated({
              sizes:
                firstStickyEnd === -1
                  ? []
                  : cellWidths
                      .slice(firstStickyEnd)
                      .map((width, index) =>
                        stickyEndStates[index + firstStickyEnd] ? width : null,
                      )
                      .reverse(),
            });
          }
        },
      },
      {
        injector: this._tableInjector,
      },
    );
  }

  /**
   * Applies sticky positioning to the row's cells if using the native table layout, and to the
   * row itself otherwise.
   * @param rowsToStick The list of rows that should be stuck according to their corresponding
   *     sticky state and to the provided top or bottom position.
   * @param stickyStates A list of boolean states where each state represents whether the row
   *     should be stuck in the particular top or bottom position.
   * @param position The position direction in which the row should be stuck if that row should be
   *     sticky.
   *
   */
  stickRows(rowsToStick: HTMLElement[], stickyStates: boolean[], position: 'top' | 'bottom') {
    // Since we can't measure the rows on the server, we can't stick the rows properly.
    if (!this._isBrowser) {
      return;
    }

    // If positioning the rows to the bottom, reverse their order when evaluating the sticky
    // position such that the last row stuck will be "bottom: 0px" and so on. Note that the
    // sticky states need to be reversed as well.
    const rows = position === 'bottom' ? rowsToStick.slice().reverse() : rowsToStick;
    const states = position === 'bottom' ? stickyStates.slice().reverse() : stickyStates;

    // Measure row heights all at once before adding sticky styles to reduce layout thrashing.
    const stickyOffsets: number[] = [];
    const stickyCellHeights: (number | undefined)[] = [];
    const elementsToStick: HTMLElement[][] = [];

    // Coalesce with other sticky row updates (top/bottom), sticky columns updates
    // (and potentially other changes like column resize).
    afterNextRender(
      {
        earlyRead: () => {
          for (let rowIndex = 0, stickyOffset = 0; rowIndex < rows.length; rowIndex++) {
            if (!states[rowIndex]) {
              continue;
            }

            stickyOffsets[rowIndex] = stickyOffset;
            const row = rows[rowIndex];
            elementsToStick[rowIndex] = this._isNativeHtmlTable
              ? (Array.from(row.children) as HTMLElement[])
              : [row];

            const height = this._retrieveElementSize(row).height;
            stickyOffset += height;
            stickyCellHeights[rowIndex] = height;
          }
        },
        write: () => {
          const borderedRowIndex = states.lastIndexOf(true);

          for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            if (!states[rowIndex]) {
              continue;
            }

            const offset = stickyOffsets[rowIndex];
            const isBorderedRowIndex = rowIndex === borderedRowIndex;
            for (const element of elementsToStick[rowIndex]) {
              this._addStickyStyle(element, position, offset, isBorderedRowIndex);
            }
          }

          if (position === 'top') {
            this._positionListener?.stickyHeaderRowsUpdated({
              sizes: stickyCellHeights,
              offsets: stickyOffsets,
              elements: elementsToStick,
            });
          } else {
            this._positionListener?.stickyFooterRowsUpdated({
              sizes: stickyCellHeights,
              offsets: stickyOffsets,
              elements: elementsToStick,
            });
          }
        },
      },
      {
        injector: this._tableInjector,
      },
    );
  }

  /**
   * When using the native table in Safari, sticky footer cells do not stick. The only way to stick
   * footer rows is to apply sticky styling to the tfoot container. This should only be done if
   * all footer rows are sticky. If not all footer rows are sticky, remove sticky positioning from
   * the tfoot element.
   */
  updateStickyFooterContainer(tableElement: Element, stickyStates: boolean[]) {
    if (!this._isNativeHtmlTable) {
      return;
    }

    // Coalesce with other sticky updates (and potentially other changes like column resize).
    afterNextRender(
      {
        write: () => {
          const tfoot = tableElement.querySelector('tfoot')!;

          if (tfoot) {
            if (stickyStates.some(state => !state)) {
              this._removeStickyStyle(tfoot, ['bottom']);
            } else {
              this._addStickyStyle(tfoot, 'bottom', 0, false);
            }
          }
        },
      },
      {
        injector: this._tableInjector,
      },
    );
  }

  /** Triggered by the table's OnDestroy hook. */
  destroy() {
    if (this._stickyColumnsReplayTimeout) {
      clearTimeout(this._stickyColumnsReplayTimeout);
    }

    this._resizeObserver?.disconnect();
    this._destroyed = true;
  }

  /**
   * Removes the sticky style on the element by removing the sticky cell CSS class, re-evaluating
   * the zIndex, removing each of the provided sticky directions, and removing the
   * sticky position if there are no more directions.
   */
  _removeStickyStyle(element: HTMLElement, stickyDirections: StickyDirection[]) {
    if (!element.classList.contains(this._stickCellCss)) {
      return;
    }

    for (const dir of stickyDirections) {
      element.style[dir] = '';
      element.classList.remove(this._borderCellCss[dir]);
    }

    // If the element no longer has any more sticky directions, remove sticky positioning and
    // the sticky CSS class.
    // Short-circuit checking element.style[dir] for stickyDirections as they
    // were already removed above.
    const hasDirection = STICKY_DIRECTIONS.some(
      dir => stickyDirections.indexOf(dir) === -1 && element.style[dir],
    );
    if (hasDirection) {
      element.style.zIndex = this._getCalculatedZIndex(element);
    } else {
      // When not hasDirection, _getCalculatedZIndex will always return ''.
      element.style.zIndex = '';
      if (this._needsPositionStickyOnElement) {
        element.style.position = '';
      }
      element.classList.remove(this._stickCellCss);
    }
  }

  /**
   * Adds the sticky styling to the element by adding the sticky style class, changing position
   * to be sticky (and -webkit-sticky), setting the appropriate zIndex, and adding a sticky
   * direction and value.
   */
  _addStickyStyle(
    element: HTMLElement,
    dir: StickyDirection,
    dirValue: number,
    isBorderElement: boolean,
  ) {
    element.classList.add(this._stickCellCss);
    if (isBorderElement) {
      element.classList.add(this._borderCellCss[dir]);
    }
    element.style[dir] = `${dirValue}px`;
    element.style.zIndex = this._getCalculatedZIndex(element);
    if (this._needsPositionStickyOnElement) {
      element.style.cssText += 'position: -webkit-sticky; position: sticky; ';
    }
  }

  /**
   * Calculate what the z-index should be for the element, depending on what directions (top,
   * bottom, left, right) have been set. It should be true that elements with a top direction
   * should have the highest index since these are elements like a table header. If any of those
   * elements are also sticky in another direction, then they should appear above other elements
   * that are only sticky top (e.g. a sticky column on a sticky header). Bottom-sticky elements
   * (e.g. footer rows) should then be next in the ordering such that they are below the header
   * but above any non-sticky elements. Finally, left/right sticky elements (e.g. sticky columns)
   * should minimally increment so that they are above non-sticky elements but below top and bottom
   * elements.
   */
  _getCalculatedZIndex(element: HTMLElement): string {
    const zIndexIncrements = {
      top: 100,
      bottom: 10,
      left: 1,
      right: 1,
    };

    let zIndex = 0;
    // Use `Iterable` instead of `Array` because TypeScript, as of 3.6.3,
    // loses the array generic type in the `for of`. But we *also* have to use `Array` because
    // typescript won't iterate over an `Iterable` unless you compile with `--downlevelIteration`
    for (const dir of STICKY_DIRECTIONS as Iterable<StickyDirection> & StickyDirection[]) {
      if (element.style[dir]) {
        zIndex += zIndexIncrements[dir];
      }
    }

    return zIndex ? `${zIndex}` : '';
  }

  /** Gets the widths for each cell in the provided row. */
  _getCellWidths(row: HTMLElement, recalculateCellWidths = true): number[] {
    if (!recalculateCellWidths && this._cachedCellWidths.length) {
      return this._cachedCellWidths;
    }

    const cellWidths: number[] = [];
    const firstRowCells = row.children;
    for (let i = 0; i < firstRowCells.length; i++) {
      const cell = firstRowCells[i] as HTMLElement;
      cellWidths.push(this._retrieveElementSize(cell).width);
    }

    this._cachedCellWidths = cellWidths;
    return cellWidths;
  }

  /**
   * Determines the left and right positions of each sticky column cell, which will be the
   * accumulation of all sticky column cell widths to the left and right, respectively.
   * Non-sticky cells do not need to have a value set since their positions will not be applied.
   */
  _getStickyStartColumnPositions(widths: number[], stickyStates: boolean[]): number[] {
    const positions: number[] = [];
    let nextPosition = 0;

    for (let i = 0; i < widths.length; i++) {
      if (stickyStates[i]) {
        positions[i] = nextPosition;
        nextPosition += widths[i];
      }
    }

    return positions;
  }

  /**
   * Determines the left and right positions of each sticky column cell, which will be the
   * accumulation of all sticky column cell widths to the left and right, respectively.
   * Non-sticky cells do not need to have a value set since their positions will not be applied.
   */
  _getStickyEndColumnPositions(widths: number[], stickyStates: boolean[]): number[] {
    const positions: number[] = [];
    let nextPosition = 0;

    for (let i = widths.length; i > 0; i--) {
      if (stickyStates[i]) {
        positions[i] = nextPosition;
        nextPosition += widths[i];
      }
    }

    return positions;
  }

  /**
   * Retreives the most recently observed size of the specified element from the cache, or
   * meaures it directly if not yet cached.
   */
  private _retrieveElementSize(element: HTMLElement): {width: number; height: number} {
    const cachedSize = this._elemSizeCache.get(element);
    if (cachedSize) {
      return cachedSize;
    }

    const clientRect = element.getBoundingClientRect();
    const size = {width: clientRect.width, height: clientRect.height};

    if (!this._resizeObserver) {
      return size;
    }

    this._elemSizeCache.set(element, size);
    this._resizeObserver.observe(element, {box: 'border-box'});
    return size;
  }

  /**
   * Conditionally enqueue the requested sticky update and clear previously queued updates
   * for the same rows.
   */
  private _updateStickyColumnReplayQueue(params: UpdateStickyColumnsParams) {
    this._removeFromStickyColumnReplayQueue(params.rows);

    // No need to replay if a flush is pending.
    if (!this._stickyColumnsReplayTimeout) {
      this._updatedStickyColumnsParamsToReplay.push(params);
    }
  }

  /** Remove updates for the specified rows from the queue. */
  private _removeFromStickyColumnReplayQueue(rows: HTMLElement[]) {
    const rowsSet = new Set(rows);
    for (const update of this._updatedStickyColumnsParamsToReplay) {
      update.rows = update.rows.filter(row => !rowsSet.has(row));
    }
    this._updatedStickyColumnsParamsToReplay = this._updatedStickyColumnsParamsToReplay.filter(
      update => !!update.rows.length,
    );
  }

  /** Update _elemSizeCache with the observed sizes. */
  private _updateCachedSizes(entries: ResizeObserverEntry[]) {
    let needsColumnUpdate = false;
    for (const entry of entries) {
      const newEntry = entry.borderBoxSize?.length
        ? {
            width: entry.borderBoxSize[0].inlineSize,
            height: entry.borderBoxSize[0].blockSize,
          }
        : {
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          };

      if (
        newEntry.width !== this._elemSizeCache.get(entry.target as HTMLElement)?.width &&
        isCell(entry.target)
      ) {
        needsColumnUpdate = true;
      }

      this._elemSizeCache.set(entry.target as HTMLElement, newEntry);
    }

    if (needsColumnUpdate && this._updatedStickyColumnsParamsToReplay.length) {
      if (this._stickyColumnsReplayTimeout) {
        clearTimeout(this._stickyColumnsReplayTimeout);
      }

      this._stickyColumnsReplayTimeout = setTimeout(() => {
        if (this._destroyed) {
          return;
        }

        for (const update of this._updatedStickyColumnsParamsToReplay) {
          this.updateStickyColumns(
            update.rows,
            update.stickyStartStates,
            update.stickyEndStates,
            true,
            false,
          );
        }
        this._updatedStickyColumnsParamsToReplay = [];
        this._stickyColumnsReplayTimeout = null;
      }, 0);
    }
  }
}

function isCell(element: Element) {
  return ['cdk-cell', 'cdk-header-cell', 'cdk-footer-cell'].some(klass =>
    element.classList.contains(klass),
  );
}
