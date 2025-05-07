/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Input,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
} from '@angular/core';
import {CanStick} from './can-stick';
import {CdkCellDef, CdkColumnDef} from './cell';
import {CDK_TABLE} from './tokens';

/**
 * The row template that can be used by the mat-table. Should not be used outside of the
 * material library.
 */
export const CDK_ROW_TEMPLATE = `<ng-container cdkCellOutlet></ng-container>`;

/**
 * Base class for the CdkHeaderRowDef and CdkRowDef that handles checking their columns inputs
 * for changes and notifying the table.
 */
@Directive()
export abstract class BaseRowDef implements OnChanges {
  template = inject<TemplateRef<any>>(TemplateRef);
  protected _differs = inject(IterableDiffers);

  /** The columns to be displayed on this row. */
  columns: Iterable<string>;

  /** Differ used to check if any changes were made to the columns. */
  protected _columnsDiffer: IterableDiffer<any>;

  constructor(...args: unknown[]);
  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    // Create a new columns differ if one does not yet exist. Initialize it based on initial value
    // of the columns property or an empty array if none is provided.
    if (!this._columnsDiffer) {
      const columns = (changes['columns'] && changes['columns'].currentValue) || [];
      this._columnsDiffer = this._differs.find(columns).create();
      this._columnsDiffer.diff(columns);
    }
  }

  /**
   * Returns the difference between the current columns and the columns from the last diff, or null
   * if there is no difference.
   */
  getColumnsDiff(): IterableChanges<any> | null {
    return this._columnsDiffer.diff(this.columns);
  }

  /** Gets this row def's relevant cell template from the provided column def. */
  extractCellTemplate(column: CdkColumnDef): TemplateRef<any> {
    if (this instanceof CdkHeaderRowDef) {
      return column.headerCell.template;
    }
    if (this instanceof CdkFooterRowDef) {
      return column.footerCell.template;
    } else {
      return column.cell.template;
    }
  }
}

/**
 * Header row definition for the CDK table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
@Directive({
  selector: '[cdkHeaderRowDef]',
  inputs: [{name: 'columns', alias: 'cdkHeaderRowDef'}],
})
export class CdkHeaderRowDef extends BaseRowDef implements CanStick, OnChanges {
  _table? = inject(CDK_TABLE, {optional: true});

  private _hasStickyChanged = false;

  /** Whether the row is sticky. */
  @Input({alias: 'cdkHeaderRowDefSticky', transform: booleanAttribute})
  get sticky(): boolean {
    return this._sticky;
  }
  set sticky(value: boolean) {
    if (value !== this._sticky) {
      this._sticky = value;
      this._hasStickyChanged = true;
    }
  }
  private _sticky = false;

  constructor(...args: unknown[]);

  constructor() {
    super(inject<TemplateRef<any>>(TemplateRef), inject(IterableDiffers));
  }

  // Prerender fails to recognize that ngOnChanges in a part of this class through inheritance.
  // Explicitly define it so that the method is called as part of the Angular lifecycle.
  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }

  /** Whether the sticky state has changed. */
  hasStickyChanged(): boolean {
    const hasStickyChanged = this._hasStickyChanged;
    this.resetStickyChanged();
    return hasStickyChanged;
  }

  /** Resets the sticky changed state. */
  resetStickyChanged(): void {
    this._hasStickyChanged = false;
  }
}

/**
 * Footer row definition for the CDK table.
 * Captures the footer row's template and other footer properties such as the columns to display.
 */
@Directive({
  selector: '[cdkFooterRowDef]',
  inputs: [{name: 'columns', alias: 'cdkFooterRowDef'}],
})
export class CdkFooterRowDef extends BaseRowDef implements CanStick, OnChanges {
  _table? = inject(CDK_TABLE, {optional: true});

  private _hasStickyChanged = false;

  /** Whether the row is sticky. */
  @Input({alias: 'cdkFooterRowDefSticky', transform: booleanAttribute})
  get sticky(): boolean {
    return this._sticky;
  }
  set sticky(value: boolean) {
    if (value !== this._sticky) {
      this._sticky = value;
      this._hasStickyChanged = true;
    }
  }
  private _sticky = false;

  constructor(...args: unknown[]);

  constructor() {
    super(inject<TemplateRef<any>>(TemplateRef), inject(IterableDiffers));
  }

  // Prerender fails to recognize that ngOnChanges in a part of this class through inheritance.
  // Explicitly define it so that the method is called as part of the Angular lifecycle.
  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }

  /** Whether the sticky state has changed. */
  hasStickyChanged(): boolean {
    const hasStickyChanged = this._hasStickyChanged;
    this.resetStickyChanged();
    return hasStickyChanged;
  }

  /** Resets the sticky changed state. */
  resetStickyChanged(): void {
    this._hasStickyChanged = false;
  }
}

/**
 * Data row definition for the CDK table.
 * Captures the header row's template and other row properties such as the columns to display and
 * a when predicate that describes when this row should be used.
 */
@Directive({
  selector: '[cdkRowDef]',
  inputs: [
    {name: 'columns', alias: 'cdkRowDefColumns'},
    {name: 'when', alias: 'cdkRowDefWhen'},
  ],
})
export class CdkRowDef<T> extends BaseRowDef {
  _table? = inject(CDK_TABLE, {optional: true});

  /**
   * Function that should return true if this row template should be used for the provided index
   * and row data. If left undefined, this row will be considered the default row template to use
   * when no other when functions return true for the data.
   * For every row, there must be at least one when function that passes or an undefined to default.
   */
  when: (index: number, rowData: T) => boolean;

  constructor(...args: unknown[]);

  constructor() {
    // TODO(andrewseguin): Add an input for providing a switch function to determine
    //   if this template should be used.
    super(inject<TemplateRef<any>>(TemplateRef), inject(IterableDiffers));
  }
}

/** Context provided to the row cells when `multiTemplateDataRows` is false */
export interface CdkCellOutletRowContext<T> {
  /** Data for the row that this cell is located within. */
  $implicit?: T;

  /** Index of the data object in the provided data array. */
  index?: number;

  /** Length of the number of total rows. */
  count?: number;

  /** True if this cell is contained in the first row. */
  first?: boolean;

  /** True if this cell is contained in the last row. */
  last?: boolean;

  /** True if this cell is contained in a row with an even-numbered index. */
  even?: boolean;

  /** True if this cell is contained in a row with an odd-numbered index. */
  odd?: boolean;
}

/**
 * Context provided to the row cells when `multiTemplateDataRows` is true. This context is the same
 * as CdkCellOutletRowContext except that the single `index` value is replaced by `dataIndex` and
 * `renderIndex`.
 */
export interface CdkCellOutletMultiRowContext<T> {
  /** Data for the row that this cell is located within. */
  $implicit?: T;

  /** Index of the data object in the provided data array. */
  dataIndex?: number;

  /** Index location of the rendered row that this cell is located within. */
  renderIndex?: number;

  /** Length of the number of total rows. */
  count?: number;

  /** True if this cell is contained in the first row. */
  first?: boolean;

  /** True if this cell is contained in the last row. */
  last?: boolean;

  /** True if this cell is contained in a row with an even-numbered index. */
  even?: boolean;

  /** True if this cell is contained in a row with an odd-numbered index. */
  odd?: boolean;
}

/**
 * Outlet for rendering cells inside of a row or header row.
 * @nodoc
 */
@Directive({
  selector: '[cdkCellOutlet]',
})
export class CdkCellOutlet implements OnDestroy {
  _viewContainer = inject(ViewContainerRef);

  /** The ordered list of cells to render within this outlet's view container */
  cells: CdkCellDef[];

  /** The data context to be provided to each cell */
  context: any;

  /**
   * Static property containing the latest constructed instance of this class.
   * Used by the CDK table when each CdkHeaderRow and CdkRow component is created using
   * createEmbeddedView. After one of these components are created, this property will provide
   * a handle to provide that component's cells and context. After init, the CdkCellOutlet will
   * construct the cells with the provided context.
   */
  static mostRecentCellOutlet: CdkCellOutlet | null = null;

  constructor(...args: unknown[]);

  constructor() {
    CdkCellOutlet.mostRecentCellOutlet = this;
  }

  ngOnDestroy() {
    // If this was the last outlet being rendered in the view, remove the reference
    // from the static property after it has been destroyed to avoid leaking memory.
    if (CdkCellOutlet.mostRecentCellOutlet === this) {
      CdkCellOutlet.mostRecentCellOutlet = null;
    }
  }
}

/** Header template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'cdk-header-row, tr[cdk-header-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'cdk-header-row',
    'role': 'row',
  },
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  imports: [CdkCellOutlet],
})
export class CdkHeaderRow {}

/** Footer template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'cdk-footer-row, tr[cdk-footer-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'cdk-footer-row',
    'role': 'row',
  },
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  imports: [CdkCellOutlet],
})
export class CdkFooterRow {}

/** Data row template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'cdk-row, tr[cdk-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'cdk-row',
    'role': 'row',
  },
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  imports: [CdkCellOutlet],
})
export class CdkRow {}

/** Row that can be used to display a message when no data is shown in the table. */
@Directive({
  selector: 'ng-template[cdkNoDataRow]',
})
export class CdkNoDataRow {
  templateRef = inject<TemplateRef<any>>(TemplateRef);

  _contentClassName = 'cdk-no-data-row';

  constructor(...args: unknown[]);
  constructor() {}
}
