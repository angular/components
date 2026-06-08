/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, Directive, ViewEncapsulation} from '@angular/core';
import {
  CdkTable,
  CDK_TABLE,
  STICKY_POSITIONING_LISTENER,
  HeaderRowOutlet,
  DataRowOutlet,
  NoDataRowOutlet,
  FooterRowOutlet,
} from '@angular/cdk/table';
import {_DisposeViewRepeaterStrategy, _RecycleViewRepeaterStrategy} from '@angular/cdk/collections';

/**
 * Enables the recycle view repeater strategy, which reduces rendering latency. Not compatible with
 * tables that animate rows.
 *
 * @deprecated This directive is a no-op and will be removed.
 * @breaking-change 23.0.0
 */
@Directive({selector: 'mat-table[recycleRows], table[mat-table][recycleRows]'})
export class MatRecycleRows {}

@Component({
  selector: 'mat-table, table[mat-table]',
  exportAs: 'matTable',
  // Note that according to MDN, the `caption` element has to be projected as the **first**
  // element in the table. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption
  template: `
    <ng-content select="caption"/>
    <ng-content select="colgroup, col"/>

    <!--
      Unprojected content throws a hydration error so we need this to capture it.
      It gets removed on the client so it doesn't affect the layout.
    -->
    @if (_isServer) {
      <ng-content/>
    }

    @if (_isNativeHtmlTable) {
      <thead role="rowgroup">
        <ng-container headerRowOutlet/>
      </thead>
      <tbody class="mdc-data-table__content" role="rowgroup">
        <ng-container rowOutlet/>
        <ng-container noDataRowOutlet/>
      </tbody>
      <tfoot role="rowgroup">
        <ng-container footerRowOutlet/>
      </tfoot>
    } @else {
      <ng-container headerRowOutlet/>
      <ng-container rowOutlet/>
      <ng-container noDataRowOutlet/>
      <ng-container footerRowOutlet/>
    }
  `,
  styleUrl: 'table.css',
  host: {
    'class': 'mat-mdc-table mdc-data-table__table',
    '[class.mat-table-fixed-layout]': 'fixedLayout',
  },
  providers: [
    {provide: CdkTable, useExisting: MatTable},
    {provide: CDK_TABLE, useExisting: MatTable},
    // Prevent nested tables from seeing this table's StickyPositioningListener.
    {provide: STICKY_POSITIONING_LISTENER, useValue: null},
  ],
  encapsulation: ViewEncapsulation.None,
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [HeaderRowOutlet, DataRowOutlet, NoDataRowOutlet, FooterRowOutlet],
})
export class MatTable<T> extends CdkTable<T> {
  /** Overrides the sticky CSS class set by the `CdkTable`. */
  protected override stickyCssClass = 'mat-mdc-table-sticky';

  /** Overrides the need to add position: sticky on every sticky cell element in `CdkTable`. */
  protected override needsPositionStickyOnElement = false;
}
