/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ContentChild,
  Directive,
  ElementRef,
  Input,
  TemplateRef,
  booleanAttribute,
  inject,
} from '@angular/core';
import {CanStick} from './can-stick';
import {CDK_TABLE} from './tokens';

/** Base interface for a cell definition. Captures a column's cell template definition. */
export interface CellDef {
  template: TemplateRef<any>;
}

/**
 * Cell definition for a CDK table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
@Directive({
  selector: '[cdkCellDef]',
  standalone: true,
})
export class CdkCellDef implements CellDef {
  /** @docs-private */
  template = inject<TemplateRef<any>>(TemplateRef);

  constructor(...args: unknown[]);
  constructor() {}
}

/**
 * Header cell definition for a CDK table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
@Directive({
  selector: '[cdkHeaderCellDef]',
  standalone: true,
})
export class CdkHeaderCellDef implements CellDef {
  /** @docs-private */
  template = inject<TemplateRef<any>>(TemplateRef);

  constructor(...args: unknown[]);
  constructor() {}
}

/**
 * Footer cell definition for a CDK table.
 * Captures the template of a column's footer cell and as well as cell-specific properties.
 */
@Directive({
  selector: '[cdkFooterCellDef]',
  standalone: true,
})
export class CdkFooterCellDef implements CellDef {
  /** @docs-private */
  template = inject<TemplateRef<any>>(TemplateRef);

  constructor(...args: unknown[]);
  constructor() {}
}

/**
 * Column definition for the CDK table.
 * Defines a set of cells available for a table column.
 */
@Directive({
  selector: '[cdkColumnDef]',
  providers: [{provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: CdkColumnDef}],
  standalone: true,
})
export class CdkColumnDef implements CanStick {
  _table? = inject(CDK_TABLE, {optional: true});

  private _hasStickyChanged = false;

  /** Unique name for this column. */
  @Input('cdkColumnDef')
  get name(): string {
    return this._name;
  }
  set name(name: string) {
    this._setNameInput(name);
  }
  protected _name: string;

  /** Whether the cell is sticky. */
  @Input({transform: booleanAttribute})
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

  /**
   * Whether this column should be sticky positioned on the end of the row. Should make sure
   * that it mimics the `CanStick` mixin such that `_hasStickyChanged` is set to true if the value
   * has been changed.
   */
  @Input({transform: booleanAttribute})
  get stickyEnd(): boolean {
    return this._stickyEnd;
  }
  set stickyEnd(value: boolean) {
    if (value !== this._stickyEnd) {
      this._stickyEnd = value;
      this._hasStickyChanged = true;
    }
  }
  _stickyEnd: boolean = false;

  /** @docs-private */
  @ContentChild(CdkCellDef) cell: CdkCellDef;

  /** @docs-private */
  @ContentChild(CdkHeaderCellDef) headerCell: CdkHeaderCellDef;

  /** @docs-private */
  @ContentChild(CdkFooterCellDef) footerCell: CdkFooterCellDef;

  /**
   * Transformed version of the column name that can be used as part of a CSS classname. Excludes
   * all non-alphanumeric characters and the special characters '-' and '_'. Any characters that
   * do not match are replaced by the '-' character.
   */
  cssClassFriendlyName: string;

  /**
   * Class name for cells in this column.
   * @docs-private
   */
  _columnCssClassName: string[];

  constructor(...args: unknown[]);
  constructor() {}

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

  /**
   * Overridable method that sets the css classes that will be added to every cell in this
   * column.
   * In the future, columnCssClassName will change from type string[] to string and this
   * will set a single string value.
   * @docs-private
   */
  protected _updateColumnCssClassName() {
    this._columnCssClassName = [`cdk-column-${this.cssClassFriendlyName}`];
  }

  /**
   * This has been extracted to a util because of TS 4 and VE.
   * View Engine doesn't support property rename inheritance.
   * TS 4.0 doesn't allow properties to override accessors or vice-versa.
   * @docs-private
   */
  protected _setNameInput(value: string) {
    // If the directive is set without a name (updated programmatically), then this setter will
    // trigger with an empty string and should not overwrite the programmatically set value.
    if (value) {
      this._name = value;
      this.cssClassFriendlyName = value.replace(/[^a-z0-9_-]/gi, '-');
      this._updateColumnCssClassName();
    }
  }
}

/** Base class for the cells. Adds a CSS classname that identifies the column it renders in. */
export class BaseCdkCell {
  constructor(columnDef: CdkColumnDef, elementRef: ElementRef) {
    elementRef.nativeElement.classList.add(...columnDef._columnCssClassName);
  }
}

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'cdk-header-cell, th[cdk-header-cell]',
  host: {
    'class': 'cdk-header-cell',
    'role': 'columnheader',
  },
  standalone: true,
})
export class CdkHeaderCell extends BaseCdkCell {
  constructor(...args: unknown[]);

  constructor() {
    super(inject(CdkColumnDef), inject(ElementRef));
  }
}

/** Footer cell template container that adds the right classes and role. */
@Directive({
  selector: 'cdk-footer-cell, td[cdk-footer-cell]',
  host: {
    'class': 'cdk-footer-cell',
  },
  standalone: true,
})
export class CdkFooterCell extends BaseCdkCell {
  constructor(...args: unknown[]);

  constructor() {
    const columnDef = inject(CdkColumnDef);
    const elementRef = inject(ElementRef);

    super(columnDef, elementRef);

    const role = columnDef._table?._getCellRole();
    if (role) {
      elementRef.nativeElement.setAttribute('role', role);
    }
  }
}

/** Cell template container that adds the right classes and role. */
@Directive({
  selector: 'cdk-cell, td[cdk-cell]',
  host: {
    'class': 'cdk-cell',
  },
  standalone: true,
})
export class CdkCell extends BaseCdkCell {
  constructor(...args: unknown[]);

  constructor() {
    const columnDef = inject(CdkColumnDef);
    const elementRef = inject(ElementRef);

    super(columnDef, elementRef);

    const role = columnDef._table?._getCellRole();
    if (role) {
      elementRef.nativeElement.setAttribute('role', role);
    }
  }
}
