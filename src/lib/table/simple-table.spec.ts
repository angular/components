import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {SimpleDataSource} from './simple-data-source';
import {MdTable, MdTableModule} from './index';
import {CdkDataTableModule} from '../core/data-table/index';

describe('MdTable', () => {
  let fixture: ComponentFixture<SimpleMdTableApp>;

  let component: SimpleMdTableApp;
  let table: MdTable<any>;
  let tableElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTableModule, CdkDataTableModule],
      declarations: [
        SimpleMdTableApp,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleMdTableApp);

    component = fixture.componentInstance;
    table = component.table;
    tableElement = fixture.nativeElement.querySelector('md-table');

    fixture.detectChanges();  // Let the component and table create embedded views
    fixture.detectChanges();  // Let the cells render
  });

  it('should create a table with the right content', () => {
    const headerRow = tableElement.querySelector('.mat-header-row');
    const headerRowCells = headerRow ? headerRow.querySelectorAll('.mat-header-cell') : [];
    expect(headerRowCells[0].innerHTML.trim()).toBe('Column A');
    expect(headerRowCells[1].innerHTML.trim()).toBe('Column B');
    expect(headerRowCells[2].innerHTML.trim()).toBe('Column C');

    const rows = tableElement.querySelectorAll('.mat-row');
    expect(rows[0] ? rows[0].textContent : '').toBe(' a_1 b_1 c_1');
    expect(rows[1] ? rows[1].textContent : '').toBe(' a_2 b_2 c_2');
    expect(rows[2] ? rows[2].textContent : '').toBe(' a_3 b_3 c_3');
  });
});

interface TestData {
  a: string;
  b: string;
  c: string;
}

@Component({
  template: `
    <md-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <md-header-cell *cdkHeaderCellDef> Column A</md-header-cell>
        <md-cell *cdkCellDef="let row"> {{row.a}}</md-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <md-header-cell *cdkHeaderCellDef> Column B</md-header-cell>
        <md-cell *cdkCellDef="let row"> {{row.b}}</md-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <md-header-cell *cdkHeaderCellDef> Column C</md-header-cell>
        <md-cell *cdkCellDef="let row"> {{row.c}}</md-cell>
      </ng-container>

      <md-header-row class="customHeaderRowClass"
                     *cdkHeaderRowDef="columnsToRender"></md-header-row>
      <md-row class="customRowClass"
              *cdkRowDef="let row; columns: columnsToRender"></md-row>
    </md-table>
  `
})
class SimpleMdTableApp {
  dataSource = new SimpleDataSource<TestData>();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(MdTable) table: MdTable<TestData>;

  constructor() {
    this.dataSource.data = [
      {a: 'a_1', b: 'b_1', c: 'c_1'},
      {a: 'a_2', b: 'b_2', c: 'c_2'},
      {a: 'a_3', b: 'b_3', c: 'c_3'}
    ];
  }
}
