import {Component} from '@angular/core';
import {Http, Response} from '@angular/http';
import {DataSource} from '@angular/cdk';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

@Component({
  selector: 'table-http-example',
  styleUrls: ['table-http-example.css'],
  templateUrl: 'table-http-example.html',
})
export class TableHttpExample {
  displayedColumns = ['number', 'state', 'title'];
  exampleDatabase: ExampleHttpDatabase | null;
  dataSource: ExampleDataSource | null;

  constructor(http: Http) {
    this.exampleDatabase = new ExampleHttpDatabase(http);
    this.dataSource = new ExampleDataSource(this.exampleDatabase);
  }
}

export interface MyGithubIssue {
  number: string;
  state: string;
  title: string;
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDatabase {
  private issuesUrl = 'https://api.github.com/repos/angular/material2/issues';  // URL to web API

  constructor(private http: Http) {}

  getRepoIssues(): Observable<MyGithubIssue[]> {
    return this.http.get(this.issuesUrl).map(this.extractData);
  }

  extractData(result: Response): MyGithubIssue[] {
    return result.json().map(issue => {
      return {
        number: issue.number,
        state: issue.state,
        title: issue.title,
      };
    });
  }
}

/**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, ExampleHttpDatabase. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
export class ExampleDataSource extends DataSource<MyGithubIssue> {
  constructor(private _exampleDatabase: ExampleHttpDatabase) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<MyGithubIssue[]> {
    return this._exampleDatabase.getRepoIssues();
  }

  disconnect() {}
}
