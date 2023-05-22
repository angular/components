import {Component} from '@angular/core';
import {MatRippleModule} from '@angular/material/core';
import {MatTableModule} from '@angular/material/table';

const ELEMENT_DATA = [
  {name: 'Hydrogen'},
  {name: 'Helium'},
  {name: 'Lithium'},
  {name: 'Beryllium'},
  {name: 'Boron'},
  {name: 'Carbon'},
  {name: 'Nitrogen'},
  {name: 'Oxygen'},
  {name: 'Fluorine'},
  {name: 'Neon'},
];

/**
 * @title Tables with Material Design ripples.
 */
@Component({
  selector: 'table-with-ripples-example',
  templateUrl: 'table-with-ripples-example.html',
  standalone: true,
  imports: [MatTableModule, MatRippleModule],
})
export class TableWithRipplesExample {
  displayedColumns: string[] = ['name'];
  dataSource = ELEMENT_DATA;
}
