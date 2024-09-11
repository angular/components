/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkTextColumn} from '@angular/cdk/table';
import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatFooterCell,
  MatFooterCellDef,
} from './cell';

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
  selector: 'mat-text-column',
  template: `
    <ng-container matColumnDef>
      <th mat-header-cell *matHeaderCellDef [style.text-align]="justify">
        {{headerText}}
      </th>
      <td mat-cell *matCellDef="let data" [style.text-align]="justify">
        {{dataAccessor(data, name)}}
      </td>
      <td mat-footer-cell *matFooterCellDef [style.text-align]="justify">
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
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatFooterCell,
    MatFooterCellDef,
    MatHeaderCell,
    MatHeaderCellDef,
  ],
})
export class MatTextColumn<T> extends CdkTextColumn<T> {}
