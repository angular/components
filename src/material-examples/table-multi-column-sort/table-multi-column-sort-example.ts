import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSort, MatTableDataSource} from '@angular/material';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  type: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', type: 'nonmetal'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', type: 'noble gas'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', type: 'alkali metal'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be', type: 'alkaline earth metal'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B', type: 'metalloid'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C', type: 'nonmetal'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N', type: 'nonmetal'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O', type: 'nonmetal'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F', type: 'nonmetal'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne', type: 'noble gas'},
  {position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na', type: 'alkali metal'},
  {position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg', type: 'alkaline earth metal'},
  {position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al', type: 'post-transition metal'},
  {position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si', type: 'metalloid'},
  {position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P', type: 'nonmetal'},
  {position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S', type: 'nonmetal'},
  {position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl', type: 'nonmetal'},
  {position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar', type: 'noble gas'},
  {position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K', type: 'alkali metal'},
  {position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca', type: 'alkaline earth metal'}
];

/**
 * @title Table with multi column sorting.
 */
@Component({
  selector: 'table-multi-column-sort-example',
  styleUrls: ['table-multi-column-sort-example.css'],
  templateUrl: 'table-multi-column-sort-example.html',
})
export class TableMultiColumnSortExample implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'type'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }
}
