/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {A11yModule} from '@angular/cdk/a11y';
import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BasicTable, GenericObject} from './basic-table';
import {MatTableModule} from '@angular/material/table';

/**
 * @title Checkbox benchmark component.
 */
@Component({
  selector: 'app-root',
  template: `
    <button id="show" (click)="show()">Show</button>
    <button id="hide" (click)="hide()">Hide</button>

    <button id="ten-rows" (click)="updateTable({ numRows: 10 })">10 Rows</button>
    <button id="one-hundred-rows" (click)="updateTable({ numRows: 100 })">100 Rows</button>
    <button id="one-thousand-rows" (click)="updateTable({ numRows: 1000 })">1000 Rows</button>

    <button id="five-cols" (click)="updateTable({ numCols: 5 })">5 Cols</button>
    <button id="ten-cols" (click)="updateTable({ numCols: 10 })">10 Cols</button>
    <button id="twenty-cols" (click)="updateTable({ numCols: 20 })">20 Cols</button>

    <ng-container *ngIf="isVisible">
      <basic-table [rows]="createRows()" [cols]="createCols()"></basic-table>
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class TableBenchmarkApp {
  isVisible = false;
  numRows = 10;
  numCols = 5;

  show() { this.isVisible = true; }
  hide() { this.isVisible = false; }

  /**
   * The cols array is just a string array of size numCols whose values are 0 to numCols.
   */
  createCols() {
    const cols = new Array(this.numCols);
    for (let i = 0; i < this.numCols; i++) {
      cols[i] = `${i}`;
    }
    return cols;
  }

  /**
   * The rows array is an object array.
   * Each object's keys are the values in the cols array, and the values are "ROW - COL".
   */
  createRows() {
    const rows = new Array(this.numRows);
    for (let i = 0; i < this.numRows; i++) {
      const row: GenericObject = {};
      for (let j = 0; j < this.numCols; j++) {
        row[j] = `${i} - ${j}`;
      }
      rows[i] = row;
    }
    return rows;
  }

  /**
   * Sets the number of rows and cols to display in our table.
   *
   * @param param0.numRows The new number of rows to display.
   * @param param0.numCols The new number of cols to display.
   */
  updateTable({ numRows, numCols }: { numRows?: number, numCols?: number}) {
    if (numRows !== undefined) { this.numRows = numRows; }
    if (numCols !== undefined) { this.numCols = numCols; }
  }
}


@NgModule({
  declarations: [BasicTable, TableBenchmarkApp],
  imports: [
    A11yModule,
    BrowserModule,
    MatTableModule,
  ],
  providers: [],
  bootstrap: [TableBenchmarkApp]
})
export class AppModule {}
