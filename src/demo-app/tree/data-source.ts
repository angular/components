import {TreeDataSource, MdTreeViewData} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/combineLatest';
import {PeopleDatabase, UserData} from './person-database';
import {
  IterableDiffers,
  IterableDiffer,
} from '@angular/core';


export class PersonDataSource extends TreeDataSource<any> {
  dottedLineLevels = new Map<UserData, number[]>();
  _filteredData = new BehaviorSubject<UserData[]>([]);
  get filteredData(): UserData[] { return this._filteredData.value; }

  _renderedData: any[] = [];

  _filter = new BehaviorSubject<string>('');
  set filter(filter: string) { this._filter.next(filter); }
  get filter(): string { return this._filter.value; }


  constructor(private peopleDatabase: PeopleDatabase) {
    super();

    // When the base   data or filter changes, fetch a new set of filtered data.
    const baseFilteredDataChanges = [this.peopleDatabase.baseDataChange, this._filter];
    Observable.combineLatest(baseFilteredDataChanges)
      .mergeMap(() => this.peopleDatabase.getData(this.filter))
      .subscribe((data: UserData[]) => {
        this._filteredData.next(data);
      });
  }

  get data(): Observable<UserData[]> {
    return this._filteredData;
  }

  connectTree(viewChange: Observable<MdTreeViewData>): Observable<UserData[]> {

    return Observable.combineLatest([viewChange, this.flattenNodes(this._filteredData)]).map((result: any[]) => {
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

  getChildren(node: UserData): UserData[] {
    if (!!node.children && node.children.length == 0) {
      setTimeout(() => {
        this.peopleDatabase.generateMoreNodes(node);
      }, 1000);
    }
    return node.children;
  }

  refresh() {
    this.peopleDatabase.baseDataChange.next(null);
  }

  _flattenNode(node: UserData, level: number, flatNodes: UserData[]) {
    let children = this.getChildren(node);
    let selected = this.expansionModel.isSelected(node);
    this.levelMap.set(node, level);

    this.indexMap.set(node, flatNodes.length);
    flatNodes.push(node);

    if (!!children && selected) {

      children.forEach((child, index) => {
        this.parentMap.set(child, node);
        this._flattenNode(child, level + 1, flatNodes);

        let dottedLineLevels = this.dottedLineLevels.get(node)|| [];
        dottedLineLevels = dottedLineLevels.slice();
        if (index != children.length - 1) {
          dottedLineLevels.push(level);
        }
        this.dottedLineLevels.set(child, dottedLineLevels);

      });
    }
  }
}