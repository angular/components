import {Injectable} from '@angular/core';
import {NAMES} from './names';
import {COLORS} from './colors';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/debounceTime';
import {MdSnackBar} from '@angular/material';

export let LATEST_ID: number = 0;

export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
  [key: string]: string;
}

@Injectable()
export class PeopleDatabase {
  baseData: UserData[] = [];
  baseDataChange = new BehaviorSubject<void>(null);

  constructor(private snackBar: MdSnackBar) {
    for (let i = 0; i < 10000; i++) { this.addPerson(true); }
  }

  getData(filter: string): Observable<UserData[]> {
    return new Observable(observer => {
      if (!filter) {
        observer.next(this.baseData.slice());
        return;
      }

      let filteredData = this.baseData.filter((item: UserData) => {
        let searchStr = item.name.toLowerCase();
        return searchStr.indexOf(filter.toLowerCase()) != -1;
      });

      observer.next(filteredData);
    });
  }

  addPerson(suppressSnackbar: boolean = false) {
    const name =
      NAMES[Math.round(Math.random() * (NAMES.length - 1))] + ' ' +
      NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) + '.';

    this.baseData.push({
      id: (++LATEST_ID).toString(),
      name: name,
      progress: this.getRandomProgress().toString(),
      color: COLORS[Math.round(Math.random() * (COLORS.length - 1))]
    });

    this.baseDataChange.next(null);

    if (!suppressSnackbar) {
      this.snackBar.open(`${name} added to the dataset`, null, {
        duration: 2000,
      });
    }
  }

  remove(selected: UserData[]) {
    this.baseData = this.baseData.filter(data => selected.indexOf(data) == -1);
    this.baseDataChange.next(null);
  }

  scramble(data: UserData[]) {
    const swappableIndicies: number[] = [];
    data.forEach(d => swappableIndicies.push(this.baseData.indexOf(d)));

    swappableIndicies.forEach(swapA => {
      let swapB = swappableIndicies[Math.floor(Math.random() * swappableIndicies.length)];
      const first = this.baseData[swapB];
      this.baseData[swapB] = this.baseData[swapA];
      this.baseData[swapA] = first;
    });

    this.baseDataChange.next(null);
  }

  randomizeProgress(data: UserData) {
    data.progress = this.getRandomProgress().toString();
  }

  getRandomProgress(): number {
    return Math.round(Math.random() * 100);
  }
}