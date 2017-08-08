import {Component, ViewChild} from '@angular/core';
import {PeopleDatabase, UserData} from './people-database';
import {PersonDataSource} from './person-data-source';
import {MdPaginator, MdSort, MdTableDataSource} from '@angular/material';

export type UserProperties = 'userId' | 'userName' | 'progress' | 'color' | undefined;

export type TrackByStrategy = 'id' | 'reference' | 'index';

const properties = ['id', 'name', 'progress', 'color'];

@Component({
  moduleId: module.id,
  selector: 'table-demo',
  templateUrl: 'table-demo.html',
  styleUrls: ['table-demo.css'],
})
export class TableDemo {
  dataSource: MdTableDataSource<UserData> | null;
  displayedColumns: UserProperties[] = [];
  trackByStrategy: TrackByStrategy = 'reference';
  changeReferences = false;
  highlights = new Set<string>();

  dynamicColumnDefs: any[] = [];
  dynamicColumnIds: string[] = [];

  @ViewChild(MdPaginator) _paginator: MdPaginator;

  @ViewChild(MdSort) sort: MdSort;

  constructor(public _peopleDatabase: PeopleDatabase) { }

  ngAfterViewInit() {
    this.connect();
  }

  addDynamicColumnDef() {
    const nextProperty = properties[this.dynamicColumnDefs.length];
    this.dynamicColumnDefs.push({
      id: nextProperty.toUpperCase(),
      property: nextProperty,
      headerText: nextProperty
    });

    this.dynamicColumnIds = this.dynamicColumnDefs.map(columnDef => columnDef.id);
  }

  removeDynamicColumnDef() {
    this.dynamicColumnDefs.pop();
    this.dynamicColumnIds.pop();
  }

  connect() {
    this.displayedColumns = ['userId', 'userName', 'progress', 'color'];
    this.dataSource = new MdTableDataSource(this._peopleDatabase.data, this.sort, this._paginator);
    this.dataSource.dataAccessor = (data: UserData, property: string) => {
      switch (property) {
        case 'userId': return +data.id;
        case 'userName': return data.name;
        case 'progress': return +data.progress;
        case 'color': return data.color;
        default: return '';
      }
    };

    this._peopleDatabase.initialize();
  }

  disconnect() {
    this.dataSource = null;
    this.displayedColumns = [];
  }

  getOpacity(progress: number) {
    let distanceFromMiddle = Math.abs(50 - progress);
    return distanceFromMiddle / 50 + .3;
  }

  userTrackBy = (index: number, item: UserData) => {
    switch (this.trackByStrategy) {
      case 'id': return item.id;
      case 'reference': return item;
      case 'index': return index;
    }
  }

  toggleColorColumn() {
    let colorColumnIndex = this.displayedColumns.indexOf('color');
    if (colorColumnIndex == -1) {
      this.displayedColumns.push('color');
    } else {
      this.displayedColumns.splice(colorColumnIndex, 1);
    }
  }

  toggleHighlight(property: string, enable: boolean) {
    enable ? this.highlights.add(property) : this.highlights.delete(property);
  }
}
