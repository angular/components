import {Component, Input} from '@angular/core';

/**
 * Just a generic object whose keys are strings and whose values can be anything.
 *
 * This is used by BasicTable whose rows are objects whose keys correspond to the cols provided and
 * whose values can be anything.
 */
export interface GenericObject {
  [key: string]: any;
}

/**
 * @title A basic table.
 * @input rows - Objects whose properties are the cols provided.
 * @input cols - An array of strings.
 */
@Component({
  selector: 'basic-table',
  template: `
  <table mat-table [dataSource]="rows" class="mat-elevation-z8">

    <ng-container *ngFor="let col of cols" matColumnDef="{{ col }}">
      <th mat-header-cell *matHeaderCellDef> {{ col }} </th>
      <td mat-cell *matCellDef="let cell"> {{ cell[col] }} </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="cols"></tr>
    <tr mat-row *matRowDef="let row; columns: cols;"></tr>
  </table>
  `,
  styles: ['table { width: 100% }', 'th.mat-header-cell, td.mat-cell { padding: 0px 20px }'],
})
export class BasicTable {
  @Input() rows: GenericObject[];
  @Input() cols: string[];
}
