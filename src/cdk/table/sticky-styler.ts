/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Directions that can be used when setting sticky positioning. */
export type StickyDirection = 'top' | 'bottom' | 'left' | 'right';

/**
 * Z-index values that should be used when sticking row cells to the top and bottom. If one of those
 * cells are also stuck to the left or right, their z-index should be incremented by one. In doing
 * this, it is guaranteed that header cells will always cover footer cells, and both will always
 * cover data rows.
 */
export enum StickyRowZIndex {
  Top = 100,
  Bottom = 10,
  Left = 1,
  Right = 1,
}

/** Applies and removes sticky positioning styles to the `CdkTable` rows and columns cells. */
export class StickyStyler {
  constructor(private usesNativeHtmlTable: boolean, private stickyCellCSS: string) { }

  /**
   * Clears the sticky positioning styles from the row and its cells by resetting the `position`
   * style, setting the zIndex to 0, and unsetting each provided sticky direction.
   */
  clearStickyPositioningStyles(rows: HTMLElement[], stickyDirections: StickyDirection[]) {
    rows.forEach(row => {
      this._removeStickyStyle(row, stickyDirections);
      for (let i = 0; i < row.children.length; i++) {
        const cell = row.children[i] as HTMLElement;
        this._removeStickyStyle(cell, stickyDirections);
      }
    });
  }

  /**
   * Applies sticky left and right positions to the cells of each row according to the sticky
   * states of the rendered column definitions.
   */
  updateStickyColumns(
      rows: HTMLElement[], stickyLeftStates: boolean[], stickyRightStates: boolean[]) {
    const hasStickyColumns =
        stickyLeftStates.some(state => state) || stickyRightStates.some(state => state);
    if (!rows.length || !hasStickyColumns) {
      return;
    }

    const cellWidths: number[] = this._getCellWidths(rows[0]);
    const leftPositions = this._getStickyLeftColumnPositions(cellWidths, stickyLeftStates);
    const rightPositions = this._getStickyRightColumnPositions(cellWidths, stickyRightStates);

    rows.forEach(row => {
      for (let i = 0; i < row.children.length; i++) {
        const cell = row.children[i] as HTMLElement;
        if (stickyLeftStates[i]) {
          this._addStickyStyle(cell, 'left', leftPositions[i]);
        }

        if (stickyRightStates[i]) {
          this._addStickyStyle(cell, 'right', rightPositions[i]);
        }
      }
    });
  }

  /**
   * Applies sticky positioning to the row's cells if using the native table layout, and to the
   * row itself otherwise.
   */
  stickRows(rows: HTMLElement[], stickyStates: boolean[], position: 'top' | 'bottom') {
    // Bottom-positions rows should stick in reverse order
    // (e.g. last stuck item will be bottom: 0px)
    if (position === 'bottom') {
      rows = rows.reverse();
    }

    let stickyHeight = 0;
    rows.forEach((row, i) => {
      if (!stickyStates[i]) {
        return;
      }

      if (this.usesNativeHtmlTable) {
        for (let j = 0; j < row.children.length; j++) {
          const cell = row.children[j] as HTMLElement;
          this._addStickyStyle(cell, position, stickyHeight);
        }
      } else {
        // Flex does not respect the stick positioning on the cells, needs to be applied to the row.
        // If this is applied on a native table, Safari causes the header to fly in wrong direction.
        this._addStickyStyle(row, position, stickyHeight);
      }

      stickyHeight += row.getBoundingClientRect().height;
    });
  }

  /**
   * When using the native table in Safari, sticky footer cells do not stick. The only way to stick
   * footer rows is to apply sticky styling to the tfoot container. This should only be done if
   * all footer rows are sticky. If not all footer rows are sticky, remove sticky positioning from
   * the tfoot element.
   */
  updateStickyFooterContainer(tableElement: Element, stickyStates: boolean[]) {
    if (!this.usesNativeHtmlTable) {
      return;
    }

    const tfoot = tableElement.querySelector('tfoot')!;
    if (stickyStates.some(state => !state)) {
      this._removeStickyStyle(tfoot, ['bottom']);
    } else {
      this._addStickyStyle(tfoot, 'bottom', 0);
    }
  }

  /**
   * Removes the sticky style on the element by removing the sticky cell CSS class, resetting the
   * z-index back to 0, removing each of the provided sticky directions, and removing the
   * sticky position if there are no more directions.
   */
  _removeStickyStyle(element: HTMLElement, stickyDirections: StickyDirection[]) {
    stickyDirections.forEach(dir => element.style[dir] = '');
    element.style.zIndex = this._getCalculatedZIndex(element);

    // If the element no longer has any more sticky directions, remove sticky positioning and
    // the sticky CSS class.
    const hasDirection = ['top', 'bottom', 'left', 'right'].some(dir => element.style[dir]);
    if (!hasDirection) {
      element.style.position = '';
      element.classList.remove(this.stickyCellCSS);
    }
  }

  /**
   * Adds the sticky styling to the element by adding the sticky style class, changing position
   * to be sticky (and -webkit-sticky), setting the appropriate zIndex, and adding a sticky
   * direction and value.
   */
  _addStickyStyle(element: HTMLElement, dir: StickyDirection, dirValue: number) {
    element.classList.add(this.stickyCellCSS);
    element.style[dir] = `${dirValue}px`;
    element.style.cssText += 'position: -webkit-sticky; position: sticky; ';
    element.style.zIndex = this._getCalculatedZIndex(element);
  }

  /**
   * Calculate what the z-index should be for the element depending on the sticky directions styles
   * that it has set. It should be the case that elements with a top direction should always be at
   * the forefront, followed by bottom direction elements. Finally, anything with left or right
   * direction should come behind those. All else should be the lowest and not have any increased
   * z-index.
   */
  _getCalculatedZIndex(element: HTMLElement): string {
    const zIndexIncrements = {
      top: 100,
      bottom: 10,
      left: 1,
      right: 1,
    };

    let zIndex = 0;
    ['top', 'bottom', 'left', 'right'].forEach(dir => {
      if (element.style[dir]) {
        zIndex += zIndexIncrements[dir];
      }
    });

    return String(zIndex);
  }

  /** Gets the widths for each cell in the provided row. */
  _getCellWidths(row: HTMLElement): number[] {
    const cellWidths: number[] = [];
    const firstRowCells = row.children;
    for (let i = 0; i < firstRowCells.length; i++) {
      let cell: HTMLElement = firstRowCells[i] as HTMLElement;
      cellWidths.push(cell.getBoundingClientRect().width);
    }

    return cellWidths;
  }

  /**
   * Determines the left and right positions of each sticky column cell, which will be the
   * accumulation of all sticky column cell widths to the left and right, respectively.
   * Non-sticky cells do not need to have a value set since their positions will not be applied.
   */
  _getStickyLeftColumnPositions(widths: number[], stickyStates: boolean[]): number[] {
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
  _getStickyRightColumnPositions(widths: number[], stickyStates: boolean[]): number[] {
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
}
