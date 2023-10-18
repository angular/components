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
  Directive,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  CdkTable,
  _CoalescedStyleScheduler,
  _COALESCED_STYLE_SCHEDULER,
  CDK_TABLE,
  STICKY_POSITIONING_LISTENER,
} from '@angular/cdk/table';
import {
  _DisposeViewRepeaterStrategy,
  _RecycleViewRepeaterStrategy,
  _VIEW_REPEATER_STRATEGY,
} from '@angular/cdk/collections';

/**
 * Enables the recycle view repeater strategy, which reduces rendering latency. Not compatible with
 * tables that animate rows.
 */
@Directive({
  selector: 'mat-table[recycleRows], table[mat-table][recycleRows]',
  providers: [{provide: _VIEW_REPEATER_STRATEGY, useClass: _RecycleViewRepeaterStrategy}],
})
export class MatRecycleRows {}

@Component({
  selector: 'mat-table, table[mat-table]',
  exportAs: 'matTable',
  // Note that according to MDN, the `caption` element has to be projected as the **first**
  // element in the table. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption
  // We can't reuse `CDK_TABLE_TEMPLATE` because it's incompatible with local compilation mode.
  template: `
    <ng-content select="caption"></ng-content>
    <ng-content select="colgroup, col"></ng-content>
    <ng-template #defaultTable>
      <ng-container [outletSource]="_tableOutlet">
        <ng-container headerRowOutlet></ng-container>
        <ng-container rowOutlet></ng-container>
        <ng-container noDataRowOutlet></ng-container>
        <ng-container footerRowOutlet></ng-container>
      </ng-container>
    </ng-template>
    <ng-template #nativeTable>
      <ng-container [outletSource]="_tableOutlet">
        <thead nativeHead role="rowgroup">
          <ng-container headerRowOutlet></ng-container>
        </thead>
        <tbody nativeBody role="rowgroup">
          <ng-container rowOutlet></ng-container>
          <ng-container noDataRowOutlet></ng-container>
        </tbody>
        <tfoot nativeFoot role="rowgroup">
          <ng-container footerRowOutlet></ng-container>
        </tfoot>
      </ng-container>
    </ng-template>
    <ng-template [tableOutlet]="_isNativeHtmlTable ? nativeTable : defaultTable"></ng-template>
  `,
  styleUrls: ['table.css'],
  host: {
    'class': 'mat-mdc-table mdc-data-table__table',
    '[class.mdc-table-fixed-layout]': 'fixedLayout',
    'ngSkipHydration': '',
  },
  providers: [
    {provide: CdkTable, useExisting: MatTable},
    {provide: CDK_TABLE, useExisting: MatTable},
    {provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler},
    // TODO(michaeljamesparsons) Abstract the view repeater strategy to a directive API so this code
    //  is only included in the build if used.
    {provide: _VIEW_REPEATER_STRATEGY, useClass: _DisposeViewRepeaterStrategy},
    // Prevent nested tables from seeing this table's StickyPositioningListener.
    {provide: STICKY_POSITIONING_LISTENER, useValue: null},
  ],
  encapsulation: ViewEncapsulation.None,
  // See note on CdkTable for explanation on why this uses the default change detection strategy.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MatTable<T> extends CdkTable<T> implements OnInit {
  /** Overrides the sticky CSS class set by the `CdkTable`. */
  protected override stickyCssClass = 'mat-mdc-table-sticky';

  /** Overrides the need to add position: sticky on every sticky cell element in `CdkTable`. */
  protected override needsPositionStickyOnElement = false;

  override ngOnInit() {
    super.ngOnInit();

    // After ngOnInit, the `CdkTable` has created and inserted the table sections (thead, tbody,
    // tfoot). MDC requires the `mdc-data-table__content` class to be added to the body. Note that
    // this only applies to native tables, because we don't wrap the content of flexbox-based ones.
    if (this._isNativeHtmlTable) {
      const tbody = this._outletSource.nativeBody.elementRef;
      this._renderer.addClass(tbody.nativeElement, 'mdc-data-table__content');
    }
  }
}
