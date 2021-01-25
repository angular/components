import {Component} from '@angular/core';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
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

const EXPANDED_ELEMENT_DATA: PeriodicElement[] = [];
for (let x = 0; x < 100; x++) {
  for (const entry of ELEMENT_DATA) {
    EXPANDED_ELEMENT_DATA.push({...entry, position: entry.position + (10 * x)});
  }
}

/**
 * @title Example of a flex table with virtual scroll enabled.
 */
@Component({
  selector: 'cdk-virtual-flex-table-example',
  styleUrls: ['cdk-virtual-flex-table-example.css'],
  templateUrl: 'cdk-virtual-flex-table-example.html',
})
export class CdkVirtualFlexTableExample {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = EXPANDED_ELEMENT_DATA;
  trackBy = (index: number, el: PeriodicElement) => el.position;
}
