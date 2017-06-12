import {Component} from '@angular/core';
import {PeopleDatabase, UserData} from './people-database';
import {PersonDataSource} from './person-data-source';

export type UserProperties = 'userId' | 'userName' | 'progress' | 'color' | undefined;

export type TrackByStrategy = 'id' | 'reference' | 'index';

@Component({
  moduleId: module.id,
  selector: 'data-table-demo',
  templateUrl: 'data-table-demo.html',
  styleUrls: ['data-table-demo.css'],
})
export class DataTableDemo {
  static TRACK_BY: 'id' | 'reference' | 'index' = 'reference';

  get trackBy(): TrackByStrategy { return DataTableDemo.TRACK_BY; }
  set trackBy(trackBy: TrackByStrategy) { DataTableDemo.TRACK_BY = trackBy; }

  dataSource: PersonDataSource | null;
  propertiesToDisplay: UserProperties[] = [];
  changeReferences = false;
  highlights = new Set<string>();

  constructor(public _peopleDatabase: PeopleDatabase) {
    this.connect();
  }

  connect() {
    this.propertiesToDisplay = ['userId', 'userName', 'progress', 'color'];
    this.dataSource = new PersonDataSource(this._peopleDatabase);
    this._peopleDatabase.initialize();
  }

  disconnect() {
    this.dataSource = null;
    this.propertiesToDisplay = [];
  }

  getOpacity(progress: number) {
    let distanceFromMiddle = Math.abs(50 - progress);
    return distanceFromMiddle / 50 + .3;
  }

  userTrackBy(index: number, item: UserData) {
    switch (DataTableDemo.TRACK_BY) {
      case 'id': return item.id;
      case 'reference': return item;
      case 'index': return index;
    }
  }

  toggleColorColumn() {
    let colorColumnIndex = this.propertiesToDisplay.indexOf('color');
    if (colorColumnIndex == -1) {
      this.propertiesToDisplay.push('color');
    } else {
      this.propertiesToDisplay.splice(colorColumnIndex, 1);
    }
  }

  toggleHighlight(property: string, enable: boolean) {
    enable ? this.highlights.add(property) : this.highlights.delete(property);
  }
}
