/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, inject, Injectable} from '@angular/core';
import {GridRow} from './grid-row';
import {GRID_ROW} from './grid-tokens';

/**
 * Grid Row Registry used to track the most recent grid row in the CDK table.
 * It should be provided in the component that uses the CDK table.
 *
 * ```typescript
 * @Component({
 *   providers: [NgGridRowRegistry],
 * })
 * export class ComponentUsingCdkTable {}
 * ```
 */
@Injectable()
export class NgGridRowRegistryForCdk {
  mostRecentRow: GridRow | null = null;
}

/**
 * Bridges the parent `GridRow` into a CDK table cell.
 *
 * `<td ngGridCell>` requires parent `<tr ngGridRow>` directive to provide GRID_ROW Token
 * However in CDK tables `<td>` is defined separately from `<tr>`.
 * Therefore we need to bridge `ngGridRow` defined in CDK `<tr>` into CDK Cell
 *
 * This directive provides `ngGridRow` to `<td ngGridCell>`
 *
 * ```html
 * <table cdk-table>
 *   <ng-container cdkColumnDef="name">
 *     <th ngGridCell ngProvideGridRowForCdk cdk-header-cell *cdkHeaderCellDef> Name </th>
 *     <td ngGridCell ngProvideGridRowForCdk cdk-cell *cdkCellDef="let row"> {{row.name}} </td>
 *   </ng-container>
 * </table>
 * ```
 */
@Directive({
  selector: '[ngProvideGridRowForCdk]',
  providers: [
    {
      provide: GRID_ROW,
      useFactory: () => {
        const row = inject(NgGridRowRegistryForCdk).mostRecentRow;
        if (!row) {
          throw new Error('ngProvideGridRowForCdk: no ngGridRow registered in NgGridRowRegistry.');
        }
        return row;
      },
    },
  ],
})
export class ProvideNgGridRowForCdkDirective {}

/**
 * Registers `ngGridRow` in NgGridRowRegistry.
 *
 * ```html
 * <table cdk-table>
 *   <tr
 *     ngGridRow ngRegisterGridRowForCdk
 *     cdk-header-row *cdkHeaderRowDef="displayedColumns"
 *   ></tr>
 *   <tr
 *     ngGridRow ngRegisterGridRowForCdk
 *     cdk-row *cdkRowDef="let row; columns: displayedColumns"
 *   ></tr>
 * </table>
 * ```
 */
@Directive({
  selector: '[ngRegisterGridRowForCdk]',
})
export class RegisterGridRowForCdkDirective {
  constructor() {
    inject(NgGridRowRegistryForCdk).mostRecentRow = inject(GridRow);
  }
}
