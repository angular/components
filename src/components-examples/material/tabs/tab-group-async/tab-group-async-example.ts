import {Component} from '@angular/core';
import {Observable, of} from 'rxjs';
import {MatTabsModule} from '@angular/material/tabs';
import {AsyncPipe} from '@angular/common';
import {delay} from 'rxjs/operators';

export interface ExampleTab {
  label: string;
  content: string;
}

/**
 * @title Tab group with asynchronously loading tab contents
 */
@Component({
  selector: 'tab-group-async-example',
  templateUrl: 'tab-group-async-example.html',
  imports: [MatTabsModule, AsyncPipe],
})
export class TabGroupAsyncExample {
  asyncTabs: Observable<ExampleTab[]>;

  constructor() {
    this.asyncTabs = of([
      {label: 'First', content: 'Content 1'},
      {label: 'Second', content: 'Content 2'},
      {label: 'Third', content: 'Content 3'},
    ]).pipe(delay(1000));
  }
}
