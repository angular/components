import {TreeDataSource, MdTree, MdTreeViewData} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/combineLatest';
import {PeopleDatabase, UserData} from './person-database';


export class PersonDataSource extends TreeDataSource<any> {
  _filteredData = new BehaviorSubject<UserData[]>([]);
  get filteredData(): UserData[] { return this._filteredData.value; }

  _displayData = new BehaviorSubject<UserData[]>([]);
  get displayedData(): UserData[] { return this._displayData.value; }

  _renderedData: any[] = [];

  _filter = new BehaviorSubject<string>('');
  set filter(filter: string) { this._filter.next(filter); }
  get filter(): string { return this._filter.value; }


  constructor(private peopleDatabase: PeopleDatabase) {
    super();

    // When the base data or filter changes, fetch a new set of filtered data.
    const baseFilteredDataChanges = [this.peopleDatabase.baseDataChange, this._filter];
    Observable.combineLatest(baseFilteredDataChanges)
      .mergeMap(() => this.peopleDatabase.getData(this.filter))
      .subscribe((data: UserData[]) => {
        this._filteredData.next(data);
      });


    // Update displayed data when the filtered data changes, or the sort/pagination changes.
    // When the filtered data changes, re-sort the data and update data size and displayed data.
    this._filteredData.subscribe((result: any[]) => {

      this._displayData.next(result);
    });
  }

  connectTree(viewChange: Observable<MdTreeViewData>): Observable<UserData[]> {
    return Observable.combineLatest([viewChange, this._displayData]).map((result: any[]) => {
      const [view, displayData] = result;

      // Set the rendered rows length to the virtual page size. Fill in the data provided
      // from the index start until the end index or pagination size, whichever is smaller.
      this._renderedData.length = displayData.length;

      const buffer = 20;
      const rangeStart = Math.max(0, view.start - buffer);
      const rangeEnd = Math.min(displayData.length, view.end + buffer);
      for (let i = rangeStart; i < rangeEnd; i++) {
        this._renderedData[i] = displayData[i];
      }

      return this._renderedData; // Currently ignoring the view
    });
  }
}