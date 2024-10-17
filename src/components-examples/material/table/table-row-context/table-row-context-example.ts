import {Component} from '@angular/core';
import {MatTableModule} from '@angular/material/table';

/**
 * @title Table showing each row context properties.
 */
@Component({
  selector: 'table-row-context-example',
  styleUrl: 'table-row-context-example.css',
  templateUrl: 'table-row-context-example.html',
  imports: [MatTableModule],
})
export class TableRowContextExample {
  displayedColumns: string[] = ['$implicit', 'index', 'count', 'first', 'last', 'even', 'odd'];
  data: string[] = ['one', 'two', 'three', 'four', 'five'];
}
