import {Component} from '@angular/core';
import {TableDemoDataSource, Character} from './demo-data-source';
import {MdTableSortData, NgForContext} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'data-table-demo',
  templateUrl: 'data-table-demo.html',
  styleUrls: ['data-table-demo.css']
})
export class DataTableDemo {
  dataSource = new TableDemoDataSource();

  lastRowClicked: Character;

  onSearchChanged(val: string) {
    this.dataSource.filter = val;
    this.dataSource.loadTableRows();
  }

  onSort(event: MdTableSortData) {
    this.dataSource.sortOrder = event.sortOrder;
    this.dataSource.sortColumn = event.sortColumn;
    this.dataSource.loadTableRows();
  }

  characterIsVillan(row: Character): boolean {
    return row.villan;
  }

  lastCharacterDisplayed(row: Character, context: NgForContext) {
    return context.last;
  }

  rowClicked(row: Character) {
    this.lastRowClicked = row;
  }
}
