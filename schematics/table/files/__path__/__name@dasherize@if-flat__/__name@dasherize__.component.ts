import { Component, OnInit, ViewChild, <% if(!!viewEncapsulation) { %>, ViewEncapsulation<% }%><% if(changeDetection !== 'Default') { %>, ChangeDetectionStrategy<% }%> } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { MatPaginator, MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { of } from 'rxjs/observable/of';
import { merge } from 'rxjs/observable/merge';

export interface Element {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

export class ExampleDataSource extends DataSource<any> {
  data: Element[] = [
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
    {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
    {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
    {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
    {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
    {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
    {position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na'},
    {position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg'},
    {position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al'},
    {position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si'},
    {position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P'},
    {position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S'},
    {position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl'},
    {position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar'},
    {position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K'},
    {position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca'},
  ];

  constructor(private _paginator: MatPaginator, private _sort: MatSort) {
    super();
  }

  connect(): Observable<Element[]> {
    const stream = [
      of(this.data),
      this._paginator.page,
      this._sort.sortChange
    ];

    return merge(...stream).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  disconnect() {}

  getPagedData(data) {
    const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
    return data.splice(startIndex, this._paginator.pageSize);
  }

  getSortedData(data) {
    if (!this._sort.active || this._sort.direction === '') { return data; }
    return data.sort((a, b) => {
      const propertyA = a[this._sort.active];
      const propertyB = b[this._sort.active];
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }
}

@Component({
  selector: '<%= selector %>',<% if(inlineTemplate) { %>
  template: `
    <div class="mat-elevation-z8">
      <mat-table #table [dataSource]="dataSource" matSort>

        <!-- Position Column -->
        <ng-container matColumnDef="position">
          <mat-header-cell *matHeaderCellDef mat-sort-header>No.</mat-header-cell>
          <mat-cell *matCellDef="let element">{{element.position}}</mat-cell>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef mat-sort-header>Name</mat-header-cell>
          <mat-cell *matCellDef="let element">{{element.name}}</mat-cell>
        </ng-container>

        <!-- Weight Column -->
        <ng-container matColumnDef="weight">
          <mat-header-cell *matHeaderCellDef mat-sort-header>Weight</mat-header-cell>
          <mat-cell *matCellDef="let element">{{element.weight}}</mat-cell>
        </ng-container>

        <!-- Color Column -->
        <ng-container matColumnDef="symbol">
          <mat-header-cell *matHeaderCellDef mat-sort-header>Symbol</mat-header-cell>
          <mat-cell *matCellDef="let element">{{element.symbol}}</mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
      </mat-table>

      <mat-paginator #paginator
        [length]="20"
        [pageIndex]="0"
        [pageSize]="10"
        [pageSizeOptions]="[5, 10, 25, 100]">
      </mat-paginator>
    </div>
  `,<% } else { %>
  templateUrl: './<%= dasherize(name) %>.component.html',<% } if(inlineStyle) { %>
  styles: []<% } else { %>
  styleUrls: ['./<%= dasherize(name) %>.component.<%= styleext %>']<% } %><% if(!!viewEncapsulation) { %>,
  encapsulation: ViewEncapsulation.<%= viewEncapsulation %><% } if (changeDetection !== 'Default') { %>,
  changeDetection: ChangeDetectionStrategy.<%= changeDetection %><% } %>
})
export class <%= classify(name) %>Component implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['position', 'name', 'weight', 'symbol'];
  dataSource: ExampleDataSource;

  ngOnInit() {
    this.dataSource = new ExampleDataSource(this.paginator, this.sort);
  }
}
