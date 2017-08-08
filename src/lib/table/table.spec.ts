import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {DataSource} from '@angular/cdk/table';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {MdTableModule} from './index';
import {MdTable} from './table';
import {MdTableDataSource} from './array-data-source'

describe('MdTable', () => {
  let fixture: ComponentFixture<SimpleMdTableApp>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTableModule],
      declarations: [SimpleMdTableApp],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleMdTableApp);
    fixture.detectChanges();
    fixture.detectChanges();
  });

  it('should create a table with the right content', () => {
    const tableElement = fixture.nativeElement.querySelector('.mat-table');
    const headerRow = tableElement.querySelectorAll('.mat-header-cell');
    expectTextContent(headerRow[0], 'Column A');
    expectTextContent(headerRow[1], 'Column B');
    expectTextContent(headerRow[2], 'Column C');

    const rows = tableElement.querySelectorAll('.mat-row');
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll('.mat-cell');
      expectTextContent(cells[0], `a_${i + 1}`);
      expectTextContent(cells[1], `b_${i + 1}`);
      expectTextContent(cells[2], `c_${i + 1}`);
    }
  });

  /**
   it('should be able to use the array data source to render the table', () => {
    const arrayCdkTableFixture = TestBed.createComponent(ArrayDataSourceCdkTableApp);
    tableElement = arrayCdkTableFixture.nativeElement.querySelector('cdk-table');
    arrayCdkTableFixture.detectChanges();

    expectTableToMatchContent(tableElement, [
      ['Column A', 'Column B', 'Column C'],
      ['a_1', 'b_1', 'c_1']
    ]);

    const arrayDataSource = arrayCdkTableFixture.componentInstance.dataSource;
    arrayDataSource.data = [
      {a: 'a_1', b: 'b_1', c: 'c_1'},
      {a: 'a_2', b: 'b_2', c: 'c_2'},
      {a: 'a_3', b: 'b_3', c: 'c_3'},
    ];
    arrayCdkTableFixture.detectChanges();  // Allow cells to populate their templates

    expectTableToMatchContent(tableElement, [
      ['Column A', 'Column B', 'Column C'],
      ['a_1', 'b_1', 'c_1'],
      ['a_2', 'b_2', 'c_2'],
      ['a_3', 'b_3', 'c_3'],
    ]);

    // Making a change to the data should update the table.
    arrayDataSource.data[0].a = 'changed_a_1';
    arrayCdkTableFixture.detectChanges();  // Allow cells to populate their templates
    expectTableToMatchContent(tableElement, [
      ['Column A', 'Column B', 'Column C'],
      ['changed_a_1', 'b_1', 'c_1'],
      ['a_2', 'b_2', 'c_2'],
      ['a_3', 'b_3', 'c_3'],
    ]);

    // Adding a new object will not update the table until update called.
    arrayDataSource.data.push({a: 'a_4', b: 'b_4', c: 'c_4'});
    arrayCdkTableFixture.detectChanges();  // Prove that detect changes won't render row
    expectTableToMatchContent(tableElement, [
      ['Column A', 'Column B', 'Column C'],
      ['changed_a_1', 'b_1', 'c_1'],
      ['a_2', 'b_2', 'c_2'],
      ['a_3', 'b_3', 'c_3'],
    ]);

    arrayDataSource.update();  // Calling update will trigger update
    arrayCdkTableFixture.detectChanges();  // Prove that detect changes won't render row
    expectTableToMatchContent(tableElement, [
      ['Column A', 'Column B', 'Column C'],
      ['changed_a_1', 'b_1', 'c_1'],
      ['a_2', 'b_2', 'c_2'],
      ['a_3', 'b_3', 'c_3'],
      ['a_4', 'b_4', 'c_4'],
    ]);
  });
   */
});

function expectTextContent(el, text) {
  if (el && el.textContent) {
    expect(el.textContent.trim()).toBe(text);
  } else {
    fail(`Missing text content of ${text} in element ${el}`);
  }
}

interface TestData {
  a: string;
  b: string;
  c: string;
}

class FakeDataSource extends DataSource<TestData> {
  _dataChange = new BehaviorSubject<TestData[]>([]);
  set data(data: TestData[]) { this._dataChange.next(data); }
  get data() { return this._dataChange.getValue(); }

  constructor() {
    super();
    for (let i = 0; i < 3; i++) { this.addData(); }
  }

  connect(): Observable<TestData[]> {
    return this._dataChange;
  }

  disconnect() {}

  addData() {
    const nextIndex = this.data.length + 1;

    let copiedData = this.data.slice();
    copiedData.push({
      a: `a_${nextIndex}`,
      b: `b_${nextIndex}`,
      c: `c_${nextIndex}`
    });

    this.data = copiedData;
  }
}

@Component({
  template: `
    <md-table [dataSource]="dataSource">
      <ng-container mdColumnDef="column_a">
        <md-header-cell *mdHeaderCellDef> Column A</md-header-cell>
        <md-cell *mdCellDef="let row"> {{row.a}}</md-cell>
      </ng-container>

      <ng-container mdColumnDef="column_b">
        <md-header-cell *mdHeaderCellDef> Column B</md-header-cell>
        <md-cell *mdCellDef="let row"> {{row.b}}</md-cell>
      </ng-container>

      <ng-container mdColumnDef="column_c">
        <md-header-cell *mdHeaderCellDef> Column C</md-header-cell>
        <md-cell *mdCellDef="let row"> {{row.c}}</md-cell>
      </ng-container>

      <md-header-row *mdHeaderRowDef="columnsToRender"></md-header-row>
      <md-row *mdRowDef="let row; columns: columnsToRender"></md-row>
    </md-table>
  `
})
class SimpleMdTableApp {
  dataSource: FakeDataSource | null = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(MdTable) table: MdTable<TestData>;
}


@Component({
  template: `
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef> Column B</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.b}}</cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <cdk-header-cell *cdkHeaderCellDef> Column C</cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.c}}</cdk-cell>
      </ng-container>

      <cdk-header-row class="customHeaderRowClass"
                      *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row class="customRowClass"
               *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class ArrayDataSourceCdkTableApp {
  dataSource = new MdTableDataSource<TestData>([{a: 'a_1', b: 'b_1', c: 'c_1'}]);
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(MdTable) table: MdTable<TestData>;
}