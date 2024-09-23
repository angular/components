/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Interface describing a tile.
 * @docs-private
 */
export interface Tile {
  /** Amount of rows that the tile takes up. */
  rowspan: number;
  /** Amount of columns that the tile takes up. */
  colspan: number;
}

/**
 * Class for determining, from a list of tiles, the (row, col) position of each of those tiles
 * in the grid. This is necessary (rather than just rendering the tiles in normal document flow)
 * because the tiles can have a rowspan.
 *
 * The positioning algorithm greedily places each tile as soon as it encounters a gap in the grid
 * large enough to accommodate it so that the tiles still render in the same order in which they
 * are given.
 *
 * The basis of the algorithm is the use of an array to track the already placed tiles. Each
 * element of the array corresponds to a column, and the value indicates how many cells in that
 * column are already occupied; zero indicates an empty cell. Moving "down" to the next row
 * decrements each value in the tracking array (indicating that the column is one cell closer to
 * being free).
 *
 * @docs-private
 */
export class TileCoordinator {
  /** Tracking array (see class description). */
  tracker: number[];

  /** Index at which the search for the next gap will start. */
  columnIndex: number = 0;

  /** The current row index. */
  rowIndex: number = 0;

  /** Gets the total number of rows occupied by tiles */
  get rowCount(): number {
    return this.rowIndex + 1;
  }

  /**
   * Gets the total span of rows occupied by tiles.
   * Ex: A list with 1 row that contains a tile with rowspan 2 will have a total rowspan of 2.
   */
  get rowspan() {
    const lastRowMax = Math.max(...this.tracker);
    // if any of the tiles has a rowspan that pushes it beyond the total row count,
    // add the difference to the rowcount
    return lastRowMax > 1 ? this.rowCount + lastRowMax - 1 : this.rowCount;
  }

  /** The computed (row, col) position of each tile (the output). */
  positions: TilePosition[];

  /**
   * Updates the tile positions.
   * @param numColumns Amount of columns in the grid.
   * @param tiles Tiles to be positioned.
   */
  update(numColumns: number, tiles: Tile[]) {
    this.columnIndex = 0;
    this.rowIndex = 0;

    this.tracker = new Array(numColumns);
    this.tracker.fill(0, 0, this.tracker.length);
    this.positions = tiles.map(tile => this._trackTile(tile));
  }

  /** Calculates the row and col position of a tile. */
  private _trackTile(tile: Tile): TilePosition {
    // Find a gap large enough for this tile.
    const gapStartIndex = this._findMatchingGap(tile.colspan);

    // Place tile in the resulting gap.
    this._markTilePosition(gapStartIndex, tile);

    // The next time we look for a gap, the search will start at columnIndex, which should be
    // immediately after the tile that has just been placed.
    this.columnIndex = gapStartIndex + tile.colspan;

    return new TilePosition(this.rowIndex, gapStartIndex);
  }

  /** Finds the next available space large enough to fit the tile. */
  private _findMatchingGap(tileCols: number): number {
    if (tileCols > this.tracker.length && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error(
        `mat-grid-list: tile with colspan ${tileCols} is wider than ` +
          `grid with cols="${this.tracker.length}".`,
      );
    }

    // Start index is inclusive, end index is exclusive.
    let gapStartIndex = -1;
    let gapEndIndex = -1;

    // Look for a gap large enough to fit the given tile. Empty spaces are marked with a zero.
    do {
      // If we've reached the end of the row, go to the next row.
      if (this.columnIndex + tileCols > this.tracker.length) {
        this._nextRow();
        gapStartIndex = this.tracker.indexOf(0, this.columnIndex);
        gapEndIndex = this._findGapEndIndex(gapStartIndex);
        continue;
      }

      gapStartIndex = this.tracker.indexOf(0, this.columnIndex);

      // If there are no more empty spaces in this row at all, move on to the next row.
      if (gapStartIndex == -1) {
        this._nextRow();
        gapStartIndex = this.tracker.indexOf(0, this.columnIndex);
        gapEndIndex = this._findGapEndIndex(gapStartIndex);
        continue;
      }

      gapEndIndex = this._findGapEndIndex(gapStartIndex);

      // If a gap large enough isn't found, we want to start looking immediately after the current
      // gap on the next iteration.
      this.columnIndex = gapStartIndex + 1;

      // Continue iterating until we find a gap wide enough for this tile. Since gapEndIndex is
      // exclusive, gapEndIndex is 0 means we didn't find a gap and should continue.
    } while (gapEndIndex - gapStartIndex < tileCols || gapEndIndex == 0);

    // If we still didn't manage to find a gap, ensure that the index is
    // at least zero so the tile doesn't get pulled out of the grid.
    return Math.max(gapStartIndex, 0);
  }

  /** Move "down" to the next row. */
  private _nextRow(): void {
    this.columnIndex = 0;
    this.rowIndex++;

    // Decrement all spaces by one to reflect moving down one row.
    for (let i = 0; i < this.tracker.length; i++) {
      this.tracker[i] = Math.max(0, this.tracker[i] - 1);
    }
  }

  /**
   * Finds the end index (exclusive) of a gap given the index from which to start looking.
   * The gap ends when a non-zero value is found.
   */
  private _findGapEndIndex(gapStartIndex: number): number {
    for (let i = gapStartIndex + 1; i < this.tracker.length; i++) {
      if (this.tracker[i] != 0) {
        return i;
      }
    }

    // The gap ends with the end of the row.
    return this.tracker.length;
  }

  /** Update the tile tracker to account for the given tile in the given space. */
  private _markTilePosition(start: number, tile: Tile): void {
    for (let i = 0; i < tile.colspan; i++) {
      this.tracker[start + i] = tile.rowspan;
    }
  }
}

/**
 * Simple data structure for tile position (row, col).
 * @docs-private
 */
export class TilePosition {
  constructor(
    public row: number,
    public col: number,
  ) {}
}
