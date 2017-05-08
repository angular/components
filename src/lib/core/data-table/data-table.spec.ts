import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {
  CdkCellOutlet,
  CdkColumnDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
  CdkHeaderDef,
  CdkHeaderRow,
  CdkHeaderRowPlaceholder,
  CdkRow,
  CdkRowCell,
  CdkRowCellDef,
  CdkRowDef,
  CdkRowPlaceholder,
  CdkTable,
  CdkTableViewData
} from './data-table';
import {DataSource} from './data-source';
import {CommonModule} from '@angular/common';
import {Observable} from 'rxjs/Observable';

fdescribe('CdkTable', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [
        SimpleCdkTableApp,
        CdkTable, CdkRowDef, CdkRowCellDef, CdkCellOutlet, CdkHeaderCellDef, CdkColumnDef, CdkRowCell, CdkRow,
        CdkHeaderCell, CdkHeaderRow, CdkHeaderDef,
        CdkRowPlaceholder, CdkHeaderRowPlaceholder,
      ],
      providers: [ ]
    });

    TestBed.compileComponents();
  }));

  describe('initialization', () => {
    let fixture: ComponentFixture<SimpleCdkTableApp>;
    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleCdkTableApp);
    });

    it('should render', () => {
      fixture.detectChanges();
    });
  });
});

export interface TestData {
  a: string,
  b: string,
  c: string,
}

export class SimpleDataSource extends DataSource<TestData> {
  constructor() {
    super();
  }

  connectTable(viewChange: Observable<CdkTableViewData>): Observable<TestData[]> {
    return viewChange.map((view: CdkTableViewData) => {
      return [];
    });
  }
}


@Component({
  template: `
    <cdk-table [dataSource]="dataSource">

      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A </cdk-header-cell>
        <cdk-row-cell *cdkRowCellDef="let row"> {{row.a}} </cdk-row-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef> Column B </cdk-header-cell>
        <cdk-row-cell *cdkRowCellDef="let row"> {{row.b}} </cdk-row-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <cdk-header-cell *cdkHeaderCellDef> Column C </cdk-header-cell>
        <cdk-row-cell *cdkRowCellDef="let row"> {{row.c}} </cdk-row-cell>
      </ng-container>

      <cdk-header *cdkHeaderDef="columnsToRender"></cdk-header>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
      
    </cdk-table>
  `
})
class SimpleCdkTableApp {
  dataSource: SimpleDataSource = new SimpleDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(CdkTable) cdkTable: CdkTable;
}
