import {ContentChild, Directive, ElementRef, Input, Renderer, TemplateRef} from '@angular/core';

/**
 * Row cell definition for a CDK data-table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
@Directive({selector: '[cdkRowCellDef]'})
export class CdkRowCellDef {
  constructor(public template: TemplateRef<any>) { }
}

/**
 * Header row cell definition for a CDK data-table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
@Directive({selector: '[cdkHeaderCellDef]'})
export class CdkHeaderCellDef {
  constructor(public template: TemplateRef<any>) { }
}

/**
 * Column definition for the CDK data-table.
 * Captures the template for the header and data cells of a column.
 */
@Directive({selector: '[cdkColumnDef]'})
export class CdkColumnDef {
  @Input('cdkColumnDef') name: string;

  @ContentChild(CdkRowCellDef) cell: CdkRowCellDef;
  @ContentChild(CdkHeaderCellDef) headerCell: CdkHeaderCellDef;
}

/** Header cell template container that adds the right classes and role. */
@Directive({
  selector: 'cdk-header-cell',
  host: {
    'class': 'cdk-header-cell',
    'role': 'columnheader',
  },
})
export class CdkHeaderRowCell {
  constructor(private columnDef: CdkColumnDef,
              private elementRef: ElementRef,
              private renderer: Renderer) {
    this.renderer.setElementClass(elementRef.nativeElement, `cdk-column-${columnDef.name}`, true);
  }
}

/** Cell template container that adds the right classes and role. */
@Directive({
  selector: 'cdk-row-cell',
  host: {
    'class': 'cdk-row-cell',
    'role': 'gridcell',
  },
})
export class CdkRowCell {
  constructor(private columnDef: CdkColumnDef,
              private elementRef: ElementRef,
              private renderer: Renderer) {
    this.renderer.setElementClass(elementRef.nativeElement, `cdk-column-${columnDef.name}`, true);
  }
}