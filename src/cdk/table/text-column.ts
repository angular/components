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
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CdkCellDef,
  CdkColumnDef,
  CdkHeaderCellDef,
  CdkHeaderCell,
  CdkCell,
  CdkFooterCellDef,
  CdkFooterCell,
} from './cell';
import {CdkTable} from './table';
import {
  getTableTextColumnMissingParentTableError,
  getTableTextColumnMissingNameError,
} from './table-errors';
import {TEXT_COLUMN_OPTIONS, TextColumnOptions} from './tokens';

/**
 * Column that simply shows text content for the header, row cells, and optionally for the footer.
 * Assumes that the table is using the native table implementation (`<table>`).
 *
 * By default, the name of this column will be the header text and data property accessor.
 * The header text can be overridden with the `headerText` input. Cell values can be overridden with
 * the `dataAccessor` input. If the table has a footer definition, the default footer text for this
 * column will be empty. The footer text can be overridden with the `footerText` or
 * `footerDataAccessor` input. Change the text justification to the start or end using the
 * `justify` input.
 */
@Component({
  selector: 'cdk-text-column',
  template: `
    <ng-container cdkColumnDef>
      <th cdk-header-cell *cdkHeaderCellDef [style.text-align]="justify">
        {{headerText}}
      </th>
      <td cdk-cell *cdkCellDef="let data" [style.text-align]="justify">
        {{dataAccessor(data, name)}}
      </td>
      <td cdk-footer-cell *cdkFooterCellDef [style.text-align]="justify">
        {{footerTextTransform(name)}}
      </td>
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  // Change detection is intentionally not set to OnPush. This component's template will be provided
  // to the table to be inserted into its view. This is problematic when change detection runs since
  // the bindings in this template will be evaluated _after_ the table's view is evaluated, which
  // mean's the template in the table's view will not have the updated value (and in fact will cause
  // an ExpressionChangedAfterItHasBeenCheckedError).
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    CdkCell,
    CdkCellDef,
    CdkColumnDef,
    CdkFooterCell,
    CdkFooterCellDef,
    CdkHeaderCell,
    CdkHeaderCellDef,
  ],
})
export class CdkTextColumn<T> implements OnDestroy, OnInit {
  /** Column name that should be used to reference this column. */
  @Input()
  get name(): string {
    return this._name;
  }
  set name(name: string) {
    this._name = name;

    // With Ivy, inputs can be initialized before static query results are
    // available. In that case, we defer the synchronization until "ngOnInit" fires.
    this._syncColumnDefName();
  }
  _name: string;

  /**
   * Text label that should be used for the column header. If this property is not
   * set, the header text will default to the column name with its first letter capitalized.
   */
  @Input() headerText: string;

  /**
   * Accessor function to retrieve the data rendered for each cell. If this
   * property is not set, the data cells will render the value found in the data's property matching
   * the column's name. For example, if the column is named `id`, then the rendered value will be
   * value defined by the data's `id` property.
   */
  @Input() dataAccessor: (data: T, name: string) => string;

  /**
   * Text label that should be used for the column footer. If this property is not
   * set, the footer won't be displayed unless `footerDataAccessor` is set.
   */
  @Input() footerText: string;

  /**
   * Footer data accessor function. If this property is set, it will take precedence over the
   * footerText property. If footerText is set and footerDataAccessor is not, footerText will be
   * used. If neither is set, and the table has a footer defined, the footer cells will render an
   * empty string.
   */
  @Input() footerTextTransform: (name: string) => string;

  /** Alignment of the cell values. */
  @Input() justify: 'start' | 'end' | 'center' = 'start';

  /** @docs-private */
  @ViewChild(CdkColumnDef, {static: true}) columnDef: CdkColumnDef;

  /**
   * The column cell is provided to the column during `ngOnInit` with a static query.
   * Normally, this will be retrieved by the column using `ContentChild`, but that assumes the
   * column definition was provided in the same view as the table, which is not the case with this
   * component.
   * @docs-private
   */
  @ViewChild(CdkCellDef, {static: true}) cell: CdkCellDef;

  /**
   * The column headerCell is provided to the column during `ngOnInit` with a static query.
   * Normally, this will be retrieved by the column using `ContentChild`, but that assumes the
   * column definition was provided in the same view as the table, which is not the case with this
   * component.
   * @docs-private
   */
  @ViewChild(CdkHeaderCellDef, {static: true}) headerCell: CdkHeaderCellDef;

  /**
   * The column footerCell is provided to the column during `ngOnInit` with a static query.
   * @docs-private
   */
  @ViewChild(CdkFooterCellDef, {static: true}) footerCell: CdkFooterCellDef;

  constructor(
    // `CdkTextColumn` is always requiring a table, but we just assert it manually
    // for better error reporting.
    // tslint:disable-next-line: lightweight-tokens
    @Optional() private readonly _table: CdkTable<T>,
    @Optional() @Inject(TEXT_COLUMN_OPTIONS) private readonly _options: TextColumnOptions<T>,
  ) {
    this._options = _options || {};
  }

  ngOnInit() {
    this._syncColumnDefName();

    if (this.headerText === undefined) {
      this.headerText = this._createDefaultHeaderText();
    }

    if (!this.dataAccessor) {
      this.dataAccessor =
        this._options.defaultDataAccessor || ((data: T, name: string) => (data as any)[name]);
    }

    this._defineFooterTextTransform();

    if (this._table) {
      // Provide the cell and headerCell directly to the table with the static `ViewChild` query,
      // since the columnDef will not pick up its content by the time the table finishes checking
      // its content and initializing the rows.
      this.columnDef.cell = this.cell;
      this.columnDef.headerCell = this.headerCell;
      this.columnDef.footerCell = this.footerCell;
      this._table.addColumnDef(this.columnDef);
    } else if (typeof ngDevMode === 'undefined' || ngDevMode) {
      throw getTableTextColumnMissingParentTableError();
    }
  }

  ngOnDestroy() {
    if (this._table) {
      this._table.removeColumnDef(this.columnDef);
    }
  }

  /**
   * Creates a default header text. Use the options' header text transformation function if one
   * has been provided. Otherwise simply capitalize the column name.
   */
  _createDefaultHeaderText(): string {
    const name = this.name;

    if (!name && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw getTableTextColumnMissingNameError();
    }

    if (this._options && this._options.defaultHeaderTextTransform) {
      return this._options.defaultHeaderTextTransform(name);
    }

    return name[0].toUpperCase() + name.slice(1);
  }

  /** Synchronizes the column definition name with the text column name. */
  private _syncColumnDefName(): void {
    if (this.columnDef) {
      this.columnDef.name = this.name;
    }
  }

  /**
   * Defines the function to transform the footer text for the column.
   * If `footerTextTransform` is not set, it will:
   * - Use `footerText` if defined, or
   * - Use `defaultFooterTextTransform` from options, or
   * - Default to an empty string.
   */
  private _defineFooterTextTransform(): void {
    if (!this.footerTextTransform) {
      // footerText can just be an empty string
      if (this.footerText !== undefined) {
        this.footerTextTransform = () => this.footerText;
      } else {
        this.footerTextTransform = this._options.defaultFooterTextTransform || (() => '');
      }
    }
  }
}
