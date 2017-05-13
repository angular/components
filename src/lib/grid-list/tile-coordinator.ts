import {QueryList} from '@angular/core';
import {MdGridTile} from './grid-tile';
import {MdGridTileTooWideError} from './grid-list-errors';

/**
 * Class for determining, from a list of tiles, the (row, col) position of each of those tiles
 * in the grid. This is necessary (rather than just rendering the tiles in normal document flow)
 * because the tiles can have a rowspan.
 *
 * The positioning algorithm greedily places each tile as soon as it encounters a gap in the grid
 * large enough to accommodate it so that the tiles still render in the same order in which they
 * are given.
 *
 * If the order should be ignored, we start from the beginning for each tile
 *
 * The basis of the algorithm is the use of an two-dimensional array to track the already placed
 * tiles. Each element of the array corresponds to a row, each element of a row corresponds to a
 * cell. True indicates that the cell is already occupied; false indicates an empty cell.
 *
 * @docs-private
 */
export class TileCoordinator {

  /** Number of columns per row */
  numColumns: number = 0;

  /** Tracking two-dimensional (see class description). */
  tracker: boolean[][];

  /** Index at which the search for the next gap will start. */
  columnIndex: number = 0;

  /** The current row index. */
  rowIndex: number = 0;

  /** Gets the total of rows occupied by tiles */
  get rows() {
    return this.tracker.length;
  }

  /** The computed (row, col) position of each tile (the output). */
  positions: TilePosition[];

  constructor(numColumns: number, tiles: QueryList<MdGridTile>, ignoreOrder: boolean) {
    this.numColumns = numColumns;

    this.tracker = [];
    this._createNewRow();

    this.positions = tiles.map(tile => this._trackTile(tile, ignoreOrder));
  }

  /** Calculates the row and col position of a tile. */
  private _trackTile(tile: MdGridTile, ignoreOrder: boolean): TilePosition {
    // Find a gap large enough for this tile.
    let gapStartIndex = this._findMatchingGap(tile.colspan, tile.rowspan);

    // Place tile in the resulting gap.
    this._markTilePosition(gapStartIndex, tile);

    // create position before possible rowIndex reset
    let tilePosition = new TilePosition(this.rowIndex, gapStartIndex);

    // if order is ignored, reset the indexes
    if (ignoreOrder) {
      // The next time we look for a gap, we start at the beginning
      this.columnIndex = 0;
      this.rowIndex = 0;
    } else {
      // The next time we look for a gap, the search will start at columnIndex, which should be
      // immediately after the tile that has just been placed.
      this.columnIndex = gapStartIndex + tile.colspan;
    }

    return tilePosition;
  }

  /** Finds the next available space large enough to fit the tile. */
  private _findMatchingGap(tileCols: number, tileRows: number): number {
    if (tileCols > this.numColumns) {
      throw new MdGridTileTooWideError(tileCols, this.numColumns);
    }

    // Start index is inclusive, end index is exclusive.
    let gapStartIndex = -1;
    let gapIsLargeEnough = false;

    // Look for a gap large enough to fit the given tile. Empty spaces are marked with false.
    do {
      // If we've reached the end of the row, go to the next row.
      if (this.columnIndex + tileCols > this.tracker[this.rowIndex].length) {
        this._nextRow();
        continue;
      }

      gapStartIndex = this.tracker[this.rowIndex].indexOf(false, this.columnIndex);

      // If there are no more empty spaces in this row at all, move on to the next row.
      if (gapStartIndex == -1) {
        this._nextRow();
        continue;
      }

      // if no cell has been occupied the gap sure is large enough
      if (this.tracker[this.rowIndex].indexOf(true, this.columnIndex) == -1) {
        gapIsLargeEnough = true;
      } else {
        gapIsLargeEnough = this._checkGapSize(gapStartIndex, tileCols, tileRows);
      }

      // If a gap large enough isn't found, we want to start looking immediately after the current
      // gap on the next iteration.
      this.columnIndex = gapStartIndex + 1;

      // Continue iterating until we find a gap large enough for this tile.
    } while (!gapIsLargeEnough);
    return gapStartIndex;
  }

  /** Move down to the next row. */
  private _nextRow(): void {
    this.columnIndex = 0;
    this.rowIndex++;

    // if there is no next row, add it
    if (this.rowIndex >= this.tracker.length) {
      this._createNewRow();
    }
  }

  /** Create new row */
  private _createNewRow(): void {
      this.tracker.push(new Array(this.numColumns));
      this.tracker[this.tracker.length - 1].fill(false);
  }

  /**
   * Cheks if a gap is large enough for a tile, given the index from which to start looking,
   * the tile cols and rows. The gap ends when a occupied cell is found.
   */
  private _checkGapSize(gapStartIndex: number, tileCols: number, tileRows: number): boolean {
    for (let i = 0; i < tileRows; i++) {

      // if we would have to check a not yet tracked row, we know it is empty
      // and that the gap is large enough
      if (this.rowIndex + i  >= this.tracker.length) {
        break;
      }

      // if a row has been tracked, it will have at least one occupied cell in it.
      // so we have to check if the gap is large enough
      for (let j = gapStartIndex; j < gapStartIndex + tileCols; j++) {

        // if we encounter a occupied cell the gap isn't large enough
        if (this.tracker[this.rowIndex + i][j] !== false) {
          return false;
        }
      }
    }

    // if we haven't encounter a occupied cell the gap is large enough
    return true;
  }

  /** Update the tile tracker to account for the given tile in the given space. */
  private _markTilePosition(start: number, tile: MdGridTile): void {
    for (let i = 0; i < tile.rowspan; i++) {

      // if the row wasn't create yet
      if (this.rowIndex + i >= this.tracker.length) {
        // create new row
        this._createNewRow();
      }

      for (let j = 0; j < tile.colspan; j++) {
        this.tracker[this.rowIndex + i][start + j] = true;
      }
    }
  }
}

/**
 * Simple data structure for tile position (row, col).
 * @docs-private
 */
export class TilePosition {
  constructor(public row: number, public col: number) {}
}
