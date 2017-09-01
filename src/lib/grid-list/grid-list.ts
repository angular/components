/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  QueryList,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import {auditTime} from '@angular/cdk/rxjs';
import {Directionality} from '@angular/cdk/bidi';
import {Subscription} from 'rxjs/Subscription';
import {of as observableOf} from 'rxjs/observable/of';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {
  coerceToString,
  coerceToNumber,
} from './grid-list-measure';
import {MdGridTile} from './grid-tile';
import {TileCoordinator} from './tile-coordinator';
import {TileStyler, FitTileStyler, RatioTileStyler, FixedTileStyler} from './tile-styler';
import {matchedMedia, processResponsiveValues} from './grid-util';

const MD_FIT_MODE = 'fit';

@Component({
  moduleId: module.id,
  selector: 'md-grid-list, mat-grid-list',
  templateUrl: 'grid-list.html',
  styleUrls: ['grid-list.css'],
  host: {
    'class': 'mat-grid-list',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MdGridList implements OnInit, OnDestroy, AfterContentChecked, AfterContentInit {
  /** Number of columns being rendered. */
  private _cols: number;

  /**
   * Row height value passed in by user. This can be one of three types:
   * - Number value (ex: "100px"):  sets a fixed row height to that value
   * - Ratio value (ex: "4:3"): sets the row height based on width:height ratio
   * - "Fit" mode (ex: "fit"): sets the row height to total height divided by number of rows
   */
  private _rowHeight: string;

  /** The amount of space between tiles. This will be something like '5px' or '2em'. */
  private _gutter: string = '1px';

  /** Sets position and size styles for a tile */
  private _tileStyler: TileStyler;

  /**
   * Responsive row height value passed in by user.
   * This will be something like {'sm': '100px', 'md': '4:3', 'lg': 'fit'}.
   */
  private _responsiveRowHeight = {};

  /**
   * The responsive amount of space between tiles.
   * This will be something like {'sm': '5px', 'md': '2em'}.
   */
  private _responsiveGutter = {};

  /**
   * Responsive number of columns being rendered.
   * This will be something like {'sm': '3', 'gt-sm': '8'}
   */
  private _responsiveCols = {};

  /** Subscription for window.resize event **/
  private _resizeSubscription: Subscription;

  private _currentCols: number;
  private _currentGutter: string = this._gutter;
  private _currentRowHeight: string;

  /** Query list of tiles that are being rendered. */
  @ContentChildren(MdGridTile) _tiles: QueryList<MdGridTile>;

  constructor(
      private _renderer: Renderer2,
      private _element: ElementRef,
      @Optional() private _dir: Directionality) {}

  /** Amount of columns in the grid list. */
  @Input()
  get cols() { return this._currentCols; }
  set cols(value: any) {
    this._cols = coerceToNumber(value);
    this._calculateCols();
  }

  /** Size of the grid list's gutter in pixels. */
  @Input()
  get gutterSize() { return this._currentGutter; }
  set gutterSize(value: any) {
    this._gutter = coerceToString(value);
    this._calculateGutter();
  }

  /** Set internal representation of row height from the user-provided value. */
  @Input()
  set rowHeight(value: string | number) {
    this._rowHeight = coerceToString(value);
    this._setTileStyler();
  }

  /** Set the responsive row height. */
  @Input()
  set responsiveRowHeight(value: {}) {
    this._responsiveRowHeight = processResponsiveValues(value, false);
    this._setTileStyler();
  }

  /** Set the responsive grid list's gutter size in pixels. */
  @Input()
  set responsiveGutterSize(value: {}) {
    this._responsiveGutter = processResponsiveValues(value, false);
    this._calculateGutter();
  }

  /** Set the responsive amount of columns in the grid list. */
  @Input()
  set responsiveCols(value: {}) {
    this._responsiveCols = processResponsiveValues(value);
    this._calculateCols();
  }

  ngOnInit() {
    this._checkCols();
    this._checkRowHeight();
  }

  /** Track resize event */
  ngAfterContentInit() {
    let resize = typeof window !== 'undefined' ?
      auditTime.call(fromEvent(window, 'resize'), 150) :
      observableOf(null);
    this._resizeSubscription = resize.subscribe(() => {
      this._onResize();
    });
  }

  _onResize() {
    this._calculateCols();
    this._calculateGutter();
    this._setTileStyler();
    this._layoutTiles();
  }

  /**
   * The layout calculation is fairly cheap if nothing changes, so there's little cost
   * to run it frequently.
   */
  ngAfterContentChecked() {
    this._layoutTiles();
  }

  /** Destroy resize subscription */
  ngOnDestroy() {
    if (this._resizeSubscription) {
      this._resizeSubscription.unsubscribe();
    }
  }

  /** Throw a friendly error if cols property is missing */
  private _checkCols() {
    if (!this.cols) {
      throw Error(`md-grid-list: must pass in number of columns. ` +
                      `Example: <md-grid-list cols="3">`);
    }
  }

  /** Default to equal width:height if rowHeight property is missing */
  private _checkRowHeight(): void {
    if (!this._currentRowHeight) {
      this._tileStyler = new RatioTileStyler('1:1');
    }
  }

  /** Creates correct Tile Styler subtype based on rowHeight passed in by user */
  private _setTileStyler(): void {
    this._calculateRowHeight();
    if (this._currentRowHeight === MD_FIT_MODE) {
      this._tileStyler = new FitTileStyler();
    } else if (this._currentRowHeight && this._currentRowHeight.indexOf(':') > -1) {
      this._tileStyler = new RatioTileStyler(this._currentRowHeight);
    } else {
      this._tileStyler = new FixedTileStyler(this._currentRowHeight);
    }
  }

  /** Computes and applies the size and position for all children grid tiles. */
  private _layoutTiles(): void {
    let tracker = new TileCoordinator(this.cols, this._tiles);
    let direction = this._dir ? this._dir.value : 'ltr';
    this._tileStyler.init(this.gutterSize, tracker, this.cols, direction);

    this._tiles.forEach((tile, index) => {
      let pos = tracker.positions[index];
      this._tileStyler.setStyle(tile, pos.row, pos.col);
    });

    this._setListStyle(this._tileStyler.getComputedHeight());
  }

  /** Sets style on the main grid-list element, given the style name and value. */
  _setListStyle(style: [string, string] | null): void {
    if (style) {
      this._renderer.setStyle(this._element.nativeElement, style[0], style[1]);
    }
  }

  private _calculateCols() {
    this._currentCols = matchedMedia(this._responsiveCols, this._cols);
  }

  private _calculateRowHeight() {
    this._currentRowHeight = matchedMedia(this._responsiveRowHeight, this._rowHeight);
  }

  private _calculateGutter() {
    this._currentGutter = matchedMedia(this._responsiveGutter, this._gutter);
  }
}
