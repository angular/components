import {DataSource} from '@angular/cdk/collections';
import {Component} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

export interface PeriodicElement {
  name: string;
  position: number;
  symbol: string;
  weight: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

/**
 * @title Example of {@link CdkScrollableTableBody} for the material flex table.
 */
@Component({
  selector: 'mat-scrollable-table-body-flex-example',
  templateUrl: 'mat-scrollable-table-body-flex-example.html',
})
export class MatScrollableTableBodyFlexExample {
  private readonly _allowedMaxHeights = ['100px', '200px', '400px', '800px'];
  private _maxHeightIndex = 1;
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new ExampleDataSource();

  get maxHeight() {
    return this._allowedMaxHeights[this._maxHeightIndex];
  }

  addRow() {
    this.dataSource.addRow();
  }

  removeRow() {
    this.dataSource.removeRow();
  }

  nextMaxHeight() {
    this._maxHeightIndex = (this._maxHeightIndex + 1) % this._allowedMaxHeights.length;
  }
}

/**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, ExampleDatabase. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
export class ExampleDataSource extends DataSource<PeriodicElement> {
  private _data = [...ELEMENT_DATA];
  /** Stream of data that is provided to the table. */
  data = new BehaviorSubject<PeriodicElement[]>(this._data);

  addRow() {
    const row = {...ELEMENT_DATA[this._data.length % ELEMENT_DATA.length]};
    row.position = this._data.length + 1;
    this._data.push(row);
    this.data.next(this._data);
  }

  removeRow() {
    this._data.pop();
    this.data.next(this._data);
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<PeriodicElement[]> {
    return this.data;
  }

  disconnect() {
    this.data.complete();
  }
}
