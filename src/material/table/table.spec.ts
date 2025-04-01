import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  tick,
} from '@angular/core/testing';
import {MatTable, MatTableDataSource, MatTableModule} from './index';
import {DataSource} from '@angular/cdk/table';
import {BehaviorSubject, Observable} from 'rxjs';
import {MatSort, MatSortHeader, MatSortModule} from '@angular/material/sort';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('MatTable', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        NoopAnimationsModule,
        MatTableApp,
        MatTableWithWhenRowApp,
        ArrayDataSourceMatTableApp,
        NativeHtmlTableApp,
        MatTableWithSortApp,
        MatTableWithPaginatorApp,
        StickyTableApp,
        TableWithNgContainerRow,
        NestedTableApp,
        MatFlexTableApp,
      ],
    });
  }));

  describe('with basic data source', () => {
    it('should be able to create a table with the right content and without when row', () => {
      let fixture = TestBed.createComponent(MatTableApp);
      fixture.detectChanges();

      const tableElement = fixture.nativeElement.querySelector('table')!;
      const data = fixture.componentInstance.dataSource!.data;
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        [data[0].a, data[0].b, data[0].c],
        [data[1].a, data[1].b, data[1].c],
        [data[2].a, data[2].b, data[2].c],
        ['fourth_row'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should create a table with special when row', () => {
      let fixture = TestBed.createComponent(MatTableWithWhenRowApp);
      fixture.detectChanges();

      const tableElement = fixture.nativeElement.querySelector('table');
      expectTableToMatchContent(tableElement, [
        ['Column A'],
        ['a_1'],
        ['a_2'],
        ['a_3'],
        ['fourth_row'],
        ['Footer A'],
      ]);
    });

    it('should create a table with multiTemplateDataRows true', () => {
      let fixture = TestBed.createComponent(MatTableWithWhenRowApp);
      fixture.componentInstance.multiTemplateDataRows = true;
      fixture.detectChanges();

      const tableElement = fixture.nativeElement.querySelector('table');
      expectTableToMatchContent(tableElement, [
        ['Column A'],
        ['a_1'],
        ['a_2'],
        ['a_3'],
        ['a_4'], // With multiple rows, this row shows up along with the special 'when' fourth_row
        ['fourth_row'],
        ['Footer A'],
      ]);
    });

    it('should be able to render a table correctly with native elements', () => {
      let fixture = TestBed.createComponent(NativeHtmlTableApp);
      fixture.detectChanges();

      const tableElement = fixture.nativeElement.querySelector('table');
      const data = fixture.componentInstance.dataSource!.data;
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        [data[0].a, data[0].b, data[0].c],
        [data[1].a, data[1].b, data[1].c],
        [data[2].a, data[2].b, data[2].c],
        [data[3].a, data[3].b, data[3].c],
      ]);
    });

    it('should be able to nest tables', () => {
      const fixture = TestBed.createComponent(NestedTableApp);
      fixture.detectChanges();
      const outerTable = fixture.nativeElement.querySelector('table');
      const innerTable = outerTable.querySelector('table');
      const outerRows = Array.from<HTMLTableRowElement>(outerTable.querySelector('tbody').rows);
      const innerRows = Array.from<HTMLTableRowElement>(innerTable.querySelector('tbody').rows);

      expect(outerTable).toBeTruthy();
      expect(outerRows.map(row => row.cells.length)).toEqual([3, 3, 3, 3]);

      expect(innerTable).toBeTruthy();
      expect(innerRows.map(row => row.cells.length)).toEqual([3, 3, 3, 3]);
    });

    it('should be able to show a message when no data is being displayed in a native table', () => {
      const fixture = TestBed.createComponent(NativeHtmlTableApp);
      fixture.detectChanges();

      // Assert that the data is inside the tbody specifically.
      const tbody = fixture.nativeElement.querySelector('tbody')!;
      const dataSource = fixture.componentInstance.dataSource!;
      const initialData = dataSource.data;

      expect(tbody.querySelector('.mat-mdc-no-data-row')).toBeFalsy();

      dataSource.data = [];
      fixture.detectChanges();

      const noDataRow: HTMLElement = tbody.querySelector('.mat-mdc-no-data-row');
      expect(noDataRow).toBeTruthy();
      expect(noDataRow.getAttribute('role')).toBe('row');

      dataSource.data = initialData;
      fixture.detectChanges();

      expect(tbody.querySelector('.mat-mdc-no-data-row')).toBeFalsy();
    });

    it('should be able to show a message when no data is being displayed', () => {
      const fixture = TestBed.createComponent(MatTableApp);
      fixture.detectChanges();

      // Assert that the data is inside the tbody specifically.
      const tbody = fixture.nativeElement.querySelector('tbody')!;
      const initialData = fixture.componentInstance.dataSource!.data;

      expect(tbody.querySelector('.mat-mdc-no-data-row')).toBeFalsy();

      fixture.componentInstance.dataSource!.data = [];
      fixture.detectChanges();

      const noDataRow: HTMLElement = tbody.querySelector('.mat-mdc-no-data-row');
      expect(noDataRow).toBeTruthy();
      expect(noDataRow.getAttribute('role')).toBe('row');

      fixture.componentInstance.dataSource!.data = initialData;
      fixture.detectChanges();

      expect(tbody.querySelector('.mat-mdc-no-data-row')).toBeFalsy();
    });

    it('should show the no data row if there is no data on init', () => {
      const fixture = TestBed.createComponent(MatTableApp);
      fixture.componentInstance.dataSource!.data = [];
      fixture.detectChanges();

      const tbody = fixture.nativeElement.querySelector('tbody')!;
      expect(tbody.querySelector('.mat-mdc-no-data-row')).toBeTruthy();
    });

    it('should set the content styling class on the tbody', () => {
      let fixture = TestBed.createComponent(NativeHtmlTableApp);
      fixture.detectChanges();

      const tbodyElement = fixture.nativeElement.querySelector('tbody');
      expect(tbodyElement.classList).toContain('mdc-data-table__content');
    });
  });

  it('should render with MatTableDataSource and sort', () => {
    let fixture = TestBed.createComponent(MatTableWithSortApp);
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('table')!;
    const data = fixture.componentInstance.dataSource!.data;
    expectTableToMatchContent(tableElement, [
      ['Column A', 'Column B', 'Column C'],
      [data[0].a, data[0].b, data[0].c],
      [data[1].a, data[1].b, data[1].c],
      [data[2].a, data[2].b, data[2].c],
    ]);
  });

  it('should render with MatTableDataSource and pagination', () => {
    let fixture = TestBed.createComponent(MatTableWithPaginatorApp);
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('table')!;
    const data = fixture.componentInstance.dataSource!.data;
    expectTableToMatchContent(tableElement, [
      ['Column A', 'Column B', 'Column C'],
      [data[0].a, data[0].b, data[0].c],
      [data[1].a, data[1].b, data[1].c],
      [data[2].a, data[2].b, data[2].c],
    ]);
  });

  it('should apply custom sticky CSS class to sticky cells', fakeAsync(() => {
    let fixture = TestBed.createComponent(StickyTableApp);
    fixture.detectChanges();
    flushMicrotasks();

    const stuckCellElement = fixture.nativeElement.querySelector('table th')!;
    expect(stuckCellElement.classList).toContain('mat-mdc-table-sticky');
  }));

  // Note: needs to be fakeAsync so it catches the error.
  it('should not throw when a row definition is on an ng-container', fakeAsync(() => {
    const fixture = TestBed.createComponent(TableWithNgContainerRow);

    expect(() => {
      fixture.detectChanges();
      tick();
    }).not.toThrow();
  }));

  it('should be able to render a flexbox-based table', () => {
    expect(() => {
      const fixture = TestBed.createComponent(MatFlexTableApp);
      fixture.detectChanges();
    }).not.toThrow();
  });

  describe('with MatTableDataSource and sort/pagination/filter', () => {
    let tableElement: HTMLElement;
    let fixture: ComponentFixture<ArrayDataSourceMatTableApp>;
    let dataSource: MatTableDataSource<TestData>;
    let component: ArrayDataSourceMatTableApp;

    beforeEach(() => {
      fixture = TestBed.createComponent(ArrayDataSourceMatTableApp);
      fixture.detectChanges();

      tableElement = fixture.nativeElement.querySelector('table');
      component = fixture.componentInstance;
      dataSource = fixture.componentInstance.dataSource;
    });

    it('should create table and display data source contents', () => {
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('changing data should update the table contents', () => {
      // Add data
      component.underlyingDataSource.addData();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['a_4', 'b_4', 'c_4'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Remove data
      const modifiedData = dataSource.data.slice();
      modifiedData.shift();
      dataSource.data = modifiedData;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['a_4', 'b_4', 'c_4'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should update the page index when switching to a smaller data set from a page', fakeAsync(() => {
      // Add 20 rows so we can switch pages.
      for (let i = 0; i < 20; i++) {
        component.underlyingDataSource.addData();
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
      }

      // Go to the last page.
      fixture.componentInstance.paginator.lastPage();
      fixture.detectChanges();

      // Switch to a smaller data set.
      dataSource.data = [{a: 'a_0', b: 'b_0', c: 'c_0'}];
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_0', 'b_0', 'c_0'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    }));

    it('should be able to filter the table contents', fakeAsync(() => {
      // Change filter to a_1, should match one row
      dataSource.filter = 'a_1';
      flushMicrotasks(); // Resolve promise that updates paginator's length
      fixture.detectChanges();
      expect(dataSource.filteredData.length).toBe(1);
      expect(dataSource.filteredData[0]).toBe(dataSource.data[0]);
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      expect(dataSource.paginator!.length).toBe(1);

      // Change filter to '  A_2  ', should match one row (ignores case and whitespace)
      dataSource.filter = '  A_2  ';
      flushMicrotasks();
      fixture.detectChanges();
      expect(dataSource.filteredData.length).toBe(1);
      expect(dataSource.filteredData[0]).toBe(dataSource.data[1]);
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_2', 'b_2', 'c_2'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Change filter to empty string, should match all rows
      dataSource.filter = '';
      flushMicrotasks();
      fixture.detectChanges();
      expect(dataSource.filteredData.length).toBe(3);
      expect(dataSource.filteredData[0]).toBe(dataSource.data[0]);
      expect(dataSource.filteredData[1]).toBe(dataSource.data[1]);
      expect(dataSource.filteredData[2]).toBe(dataSource.data[2]);
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Change filter function and filter, should match to rows with zebra.
      dataSource.filterPredicate = (data, filter) => {
        let dataStr;
        switch (data.a) {
          case 'a_1':
            dataStr = 'elephant';
            break;
          case 'a_2':
            dataStr = 'zebra';
            break;
          case 'a_3':
            dataStr = 'monkey';
            break;
          default:
            dataStr = '';
        }

        return dataStr.indexOf(filter) != -1;
      };
      dataSource.filter = 'zebra';
      flushMicrotasks();
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_2', 'b_2', 'c_2'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Change the filter to a falsy value that might come in from the view.
      dataSource.filter = 0 as any;
      flushMicrotasks();
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    }));

    it('should not match concatenated words', fakeAsync(() => {
      // Set the value to the last character of the first
      // column plus the first character of the second column.
      dataSource.filter = '1b';
      flushMicrotasks();
      fixture.detectChanges();
      expect(dataSource.filteredData.length).toBe(0);
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    }));

    it('should be able to sort the table contents', () => {
      // Activate column A sort
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Activate column A sort again (reverse direction)
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_3', 'b_3', 'c_3'],
        ['a_2', 'b_2', 'c_2'],
        ['a_1', 'b_1', 'c_1'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Change sort function to customize how it sorts - first column 1, then 3, then 2
      dataSource.sortingDataAccessor = data => {
        switch (data.a) {
          case 'a_1':
            return 'elephant';
          case 'a_2':
            return 'zebra';
          case 'a_3':
            return 'monkey';
          default:
            return '';
        }
      };
      component.sort.direction = '';
      component.sort.sort(component.sortHeader);
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_3', 'b_3', 'c_3'],
        ['a_2', 'b_2', 'c_2'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should by default correctly sort an empty string', () => {
      // Activate column A sort
      dataSource.data[0].a = ' ';
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();

      // Expect that empty string row comes before the other values
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Expect that empty string row comes before the other values
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_3', 'b_3', 'c_3'],
        ['a_2', 'b_2', 'c_2'],
        ['', 'b_1', 'c_1'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should by default correctly sort undefined values', () => {
      // Activate column A sort
      dataSource.data[0].a = undefined;

      // Expect that undefined row comes before the other values
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Expect that undefined row comes after the other values
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_3', 'b_3', 'c_3'],
        ['a_2', 'b_2', 'c_2'],
        ['', 'b_1', 'c_1'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should sort zero correctly', () => {
      // Activate column A sort
      dataSource.data[0].a = 1;
      dataSource.data[1].a = 0;
      dataSource.data[2].a = -1;

      // Expect that zero comes after the negative numbers and before the positive ones.
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['-1', 'b_3', 'c_3'],
        ['0', 'b_2', 'c_2'],
        ['1', 'b_1', 'c_1'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Expect that zero comes after the negative numbers and before
      // the positive ones when switching the sorting direction.
      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['1', 'b_1', 'c_1'],
        ['0', 'b_2', 'c_2'],
        ['-1', 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should be able to page the table contents', fakeAsync(() => {
      // Add 100 rows, should only display first 5 since page length is 5
      for (let i = 0; i < 100; i++) {
        component.underlyingDataSource.addData();
      }
      fixture.detectChanges();
      flushMicrotasks(); // Resolve promise that updates paginator's length
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['a_4', 'b_4', 'c_4'],
        ['a_5', 'b_5', 'c_5'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      // Navigate to the next page
      component.paginator.nextPage();
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_6', 'b_6', 'c_6'],
        ['a_7', 'b_7', 'c_7'],
        ['a_8', 'b_8', 'c_8'],
        ['a_9', 'b_9', 'c_9'],
        ['a_10', 'b_10', 'c_10'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    }));

    it('should sort strings with numbers larger than MAX_SAFE_INTEGER correctly', () => {
      const large = '9563256840123535';
      const larger = '9563256840123536';
      const largest = '9563256840123537';

      dataSource.data[0].a = largest;
      dataSource.data[1].a = larger;
      dataSource.data[2].a = large;

      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        [large, 'b_3', 'c_3'],
        [larger, 'b_2', 'c_2'],
        [largest, 'b_1', 'c_1'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      component.sort.sort(component.sortHeader);
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        [largest, 'b_1', 'c_1'],
        [larger, 'b_2', 'c_2'],
        [large, 'b_3', 'c_3'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });

    it('should fall back to empty table if invalid data is passed in', () => {
      component.underlyingDataSource.addData();
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['a_4', 'b_4', 'c_4'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      dataSource.data = null!;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      component.underlyingDataSource.addData();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
        ['a_3', 'b_3', 'c_3'],
        ['a_4', 'b_4', 'c_4'],
        ['a_5', 'b_5', 'c_5'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);

      dataSource.data = {} as any;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expectTableToMatchContent(tableElement, [
        ['Column A', 'Column B', 'Column C'],
        ['Footer A', 'Footer B', 'Footer C'],
      ]);
    });
  });
});

interface TestData {
  a: string | number | undefined;
  b: string | number | undefined;
  c: string | number | undefined;
}

class FakeDataSource extends DataSource<TestData> {
  _dataChange = new BehaviorSubject<TestData[]>([]);
  get data() {
    return this._dataChange.getValue();
  }
  set data(data: TestData[]) {
    this._dataChange.next(data);
  }

  constructor() {
    super();
    for (let i = 0; i < 4; i++) {
      this.addData();
    }
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
      c: `c_${nextIndex}`,
    });

    this.data = copiedData;
  }
}

@Component({
  template: `
    <table mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="column_a">
        <th mat-header-cell *matHeaderCellDef> Column A</th>
        <td mat-cell *matCellDef="let row"> {{row.a}}</td>
        <td mat-footer-cell *matFooterCellDef> Footer A</td>
      </ng-container>

      <ng-container matColumnDef="column_b">
        <th mat-header-cell *matHeaderCellDef> Column B</th>
        <td mat-cell *matCellDef="let row"> {{row.b}}</td>
        <td mat-footer-cell *matFooterCellDef> Footer B</td>
      </ng-container>

      <ng-container matColumnDef="column_c">
        <th mat-header-cell *matHeaderCellDef> Column C</th>
        <td mat-cell *matCellDef="let row"> {{row.c}}</td>
        <td mat-footer-cell *matFooterCellDef> Footer C</td>
      </ng-container>

      <ng-container matColumnDef="special_column">
        <td mat-cell *matCellDef="let row"> fourth_row </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columnsToRender"></tr>
      <tr mat-row *matRowDef="let row; columns: columnsToRender"></tr>
      <tr mat-row *matRowDef="let row; columns: ['special_column']; when: isFourthRow"></tr>
      <tr *matNoDataRow>
        <td>No data</td>
      </tr>
      <tr mat-footer-row *matFooterRowDef="columnsToRender"></tr>
    </table>
  `,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
})
class MatTableApp {
  dataSource: FakeDataSource | null = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
  isFourthRow = (i: number, _rowData: TestData) => i == 3;

  @ViewChild(MatTable) table: MatTable<TestData>;
}

@Component({
  template: `
    <table mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="column_a">
        <th mat-header-cell *matHeaderCellDef> Column A</th>
        <td mat-cell *matCellDef="let row"> {{row.a}}</td>
      </ng-container>

      <ng-container matColumnDef="column_b">
        <th mat-header-cell *matHeaderCellDef> Column B</th>
        <td mat-cell *matCellDef="let row"> {{row.b}}</td>
      </ng-container>

      <ng-container matColumnDef="column_c">
        <th mat-header-cell *matHeaderCellDef> Column C</th>
        <td mat-cell *matCellDef="let row"> {{row.c}}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columnsToRender"></tr>
      <tr mat-row *matRowDef="let row; columns: columnsToRender"></tr>
      <tr *matNoDataRow>
        <td>No data</td>
      </tr>
    </table>
  `,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
})
class NativeHtmlTableApp {
  dataSource: FakeDataSource | null = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(MatTable) table: MatTable<TestData>;
}

@Component({
  template: `
    <table mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="column_a">
        <th mat-header-cell *matHeaderCellDef>Column A</th>
        <td mat-cell *matCellDef="let row">{{row.a}}</td>
      </ng-container>

      <ng-container matColumnDef="column_b">
        <th mat-header-cell *matHeaderCellDef>Column B</th>
        <td mat-cell *matCellDef="let row">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="column_a">
              <th mat-header-cell *matHeaderCellDef> Column A</th>
              <td mat-cell *matCellDef="let row"> {{row.a}}</td>
              <td mat-footer-cell *matFooterCellDef> Footer A</td>
            </ng-container>

            <ng-container matColumnDef="column_b">
              <th mat-header-cell *matHeaderCellDef> Column B</th>
              <td mat-cell *matCellDef="let row"> {{row.b}}</td>
              <td mat-footer-cell *matFooterCellDef> Footer B</td>
            </ng-container>

            <ng-container matColumnDef="column_c">
              <th mat-header-cell *matHeaderCellDef> Column C</th>
              <td mat-cell *matCellDef="let row"> {{row.c}}</td>
              <td mat-footer-cell *matFooterCellDef> Footer C</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnsToRender"></tr>
            <tr mat-row *matRowDef="let row; columns: columnsToRender"></tr>
          </table>
        </td>
      </ng-container>

      <ng-container matColumnDef="column_c">
        <th mat-header-cell *matHeaderCellDef>Column C</th>
        <td mat-cell *matCellDef="let row">{{row.c}}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columnsToRender"></tr>
      <tr mat-row *matRowDef="let row; columns: columnsToRender"></tr>
    </table>
  `,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
})
class NestedTableApp {
  dataSource: FakeDataSource | null = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
}

@Component({
  template: `
    <table mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="column_a">
        <th mat-header-cell *matHeaderCellDef> Column A </th>
        <td mat-cell *matCellDef="let row"> {{row.a}} </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columnsToRender; sticky: true"></tr>
      <tr mat-row *matRowDef="let row; columns: columnsToRender"></tr>
    </table>
  `,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
})
class StickyTableApp {
  dataSource = new FakeDataSource();
  columnsToRender = ['column_a'];

  @ViewChild(MatTable) table: MatTable<TestData>;
}

@Component({
  template: `
    <table mat-table [dataSource]="dataSource" [multiTemplateDataRows]="multiTemplateDataRows">
      <ng-container matColumnDef="column_a">
        <th mat-header-cell *matHeaderCellDef> Column A</th>
        <td mat-cell *matCellDef="let row"> {{row.a}}</td>
        <td mat-footer-cell *matFooterCellDef> Footer A</td>
      </ng-container>

      <ng-container matColumnDef="special_column">
        <td mat-cell *matCellDef="let row"> fourth_row </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="['column_a']"></tr>
      <tr mat-row *matRowDef="let row; columns: ['column_a']"></tr>
      <tr mat-row *matRowDef="let row; columns: ['special_column']; when: isFourthRow"></tr>
      <tr mat-footer-row *matFooterRowDef="['column_a']"></tr>
    </table>
  `,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
})
class MatTableWithWhenRowApp {
  multiTemplateDataRows = false;
  dataSource: FakeDataSource | null = new FakeDataSource();
  isFourthRow = (i: number, _rowData: TestData) => i == 3;

  @ViewChild(MatTable) table: MatTable<TestData>;
}

@Component({
  template: `
    <table mat-table [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="column_a">
        <th mat-header-cell *matHeaderCellDef mat-sort-header="a"> Column A</th>
        <td mat-cell *matCellDef="let row"> {{row.a}}</td>
        <td mat-footer-cell *matFooterCellDef> Footer A</td>
      </ng-container>

      <ng-container matColumnDef="column_b">
        <th mat-header-cell *matHeaderCellDef> Column B</th>
        <td mat-cell *matCellDef="let row"> {{row.b}}</td>
        <td mat-footer-cell *matFooterCellDef> Footer B</td>
      </ng-container>

      <ng-container matColumnDef="column_c">
        <th mat-header-cell *matHeaderCellDef> Column C</th>
        <td mat-cell *matCellDef="let row"> {{row.c}}</td>
        <td mat-footer-cell *matFooterCellDef> Footer C</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columnsToRender"></tr>
      <tr mat-row *matRowDef="let row; columns: columnsToRender"></tr>
      <tr mat-footer-row *matFooterRowDef="columnsToRender"></tr>
    </table>

    <mat-paginator [pageSize]="5"></mat-paginator>
  `,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
})
class ArrayDataSourceMatTableApp implements AfterViewInit {
  underlyingDataSource = new FakeDataSource();
  dataSource = new MatTableDataSource<TestData>();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(MatTable) table: MatTable<TestData>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSortHeader) sortHeader: MatSortHeader;

  constructor() {
    this.underlyingDataSource.data = [];

    // Add three rows of data
    this.underlyingDataSource.addData();
    this.underlyingDataSource.addData();
    this.underlyingDataSource.addData();

    this.underlyingDataSource.connect().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}

@Component({
  template: `
    <table mat-table [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="column_a">
        <th mat-header-cell *matHeaderCellDef mat-sort-header="a"> Column A</th>
        <td mat-cell *matCellDef="let row"> {{row.a}}</td>
      </ng-container>

      <ng-container matColumnDef="column_b">
        <th mat-header-cell *matHeaderCellDef> Column B</th>
        <td mat-cell *matCellDef="let row"> {{row.b}}</td>
      </ng-container>

      <ng-container matColumnDef="column_c">
        <th mat-header-cell *matHeaderCellDef> Column C</th>
        <td mat-cell *matCellDef="let row"> {{row.c}}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columnsToRender"></tr>
      <tr mat-row *matRowDef="let row; columns: columnsToRender"></tr>
    </table>
  `,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
})
class MatTableWithSortApp implements OnInit {
  underlyingDataSource = new FakeDataSource();
  dataSource = new MatTableDataSource<TestData>();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(MatTable) table: MatTable<TestData>;
  @ViewChild(MatSort) sort: MatSort;

  constructor() {
    this.underlyingDataSource.data = [];

    // Add three rows of data
    this.underlyingDataSource.addData();
    this.underlyingDataSource.addData();
    this.underlyingDataSource.addData();

    this.underlyingDataSource.connect().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  ngOnInit() {
    this.dataSource!.sort = this.sort;
  }
}

@Component({
  template: `
    <table mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="column_a">
        <th mat-header-cell *matHeaderCellDef> Column A</th>
        <td mat-cell *matCellDef="let row"> {{row.a}}</td>
      </ng-container>

      <ng-container matColumnDef="column_b">
        <th mat-header-cell *matHeaderCellDef> Column B</th>
        <td mat-cell *matCellDef="let row"> {{row.b}}</td>
      </ng-container>

      <ng-container matColumnDef="column_c">
        <th mat-header-cell *matHeaderCellDef> Column C</th>
        <td mat-cell *matCellDef="let row"> {{row.c}}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columnsToRender"></tr>
      <tr mat-row *matRowDef="let row; columns: columnsToRender"></tr>
    </table>

    <mat-paginator [pageSize]="5"></mat-paginator>
  `,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
})
class MatTableWithPaginatorApp implements OnInit {
  underlyingDataSource = new FakeDataSource();
  dataSource = new MatTableDataSource<TestData>();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(MatTable) table: MatTable<TestData>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor() {
    this.underlyingDataSource.data = [];

    // Add three rows of data
    this.underlyingDataSource.addData();
    this.underlyingDataSource.addData();
    this.underlyingDataSource.addData();

    this.underlyingDataSource.connect().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  ngOnInit() {
    this.dataSource!.paginator = this.paginator;
  }
}

@Component({
  template: `
    <table mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="column_a">
        <th mat-header-cell *matHeaderCellDef>Column A</th>
        <td mat-cell *matCellDef="let row">{{row.a}}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columnsToRender"></tr>
      <ng-container *matRowDef="let row; columns: columnsToRender">
        <tr mat-row></tr>
      </ng-container>
    </table>
  `,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
})
class TableWithNgContainerRow {
  dataSource: FakeDataSource | null = new FakeDataSource();
  columnsToRender = ['column_a'];
}

@Component({
  template: `
    <mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="column_a">
        <mat-header-cell *matHeaderCellDef> Column A</mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.a}}</mat-cell>
        <mat-footer-cell *matFooterCellDef> Footer A</mat-footer-cell>
      </ng-container>

      <ng-container matColumnDef="column_b">
        <mat-header-cell *matHeaderCellDef> Column B</mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.b}}</mat-cell>
        <mat-footer-cell *matFooterCellDef> Footer B</mat-footer-cell>
      </ng-container>

      <ng-container matColumnDef="column_c">
        <mat-header-cell *matHeaderCellDef> Column C</mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.c}}</mat-cell>
        <mat-footer-cell *matFooterCellDef> Footer C</mat-footer-cell>
      </ng-container>

      <ng-container matColumnDef="special_column">
        <mat-cell *matCellDef="let row"> fourth_row </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="columnsToRender"></mat-header-row>
      <mat-row *matRowDef="let row; columns: columnsToRender"></mat-row>
      <div *matNoDataRow>No data</div>
      <mat-footer-row *matFooterRowDef="columnsToRender"></mat-footer-row>
    </mat-table>
  `,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
})
class MatFlexTableApp {
  dataSource: FakeDataSource | null = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
  @ViewChild(MatTable) table: MatTable<TestData>;
}

function getElements(element: Element, query: string): Element[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getHeaderRows(tableElement: Element): Element[] {
  return [].slice.call(tableElement.querySelectorAll('.mat-mdc-header-row'))!;
}

function getFooterRows(tableElement: Element): Element[] {
  return [].slice.call(tableElement.querySelectorAll('.mat-mdc-footer-row'))!;
}

function getRows(tableElement: Element): Element[] {
  return getElements(tableElement, '.mat-mdc-row');
}

function getCells(row: Element): Element[] {
  if (!row) {
    return [];
  }

  return getElements(row, 'td');
}

function getHeaderCells(headerRow: Element): Element[] {
  return getElements(headerRow, 'th');
}

function getFooterCells(footerRow: Element): Element[] {
  return getElements(footerRow, 'td');
}

function getActualTableContent(tableElement: Element): string[][] {
  let actualTableContent: Element[][] = [];
  getHeaderRows(tableElement).forEach(row => {
    actualTableContent.push(getHeaderCells(row));
  });

  // Check data row cells
  const rows = getRows(tableElement).map(row => getCells(row));
  actualTableContent = actualTableContent.concat(rows);

  getFooterRows(tableElement).forEach(row => {
    actualTableContent.push(getFooterCells(row));
  });

  // Convert the nodes into their text content;
  return actualTableContent.map(row => row.map(cell => cell.textContent!.trim()));
}

export function expectTableToMatchContent(tableElement: Element, expected: any[]) {
  const missedExpectations: string[] = [];
  function checkCellContent(actualCell: string, expectedCell: string) {
    if (actualCell !== expectedCell) {
      missedExpectations.push(`Expected cell contents to be ${expectedCell} but was ${actualCell}`);
    }
  }

  const actual = getActualTableContent(tableElement);

  // Make sure the number of rows match
  if (actual.length !== expected.length) {
    missedExpectations.push(`Expected ${expected.length} total rows but got ${actual.length}`);
    fail(missedExpectations.join('\n'));
  }

  actual.forEach((row, rowIndex) => {
    const expectedRow = expected[rowIndex];

    // Make sure the number of cells match
    if (row.length !== expectedRow.length) {
      missedExpectations.push(`Expected ${expectedRow.length} cells in row but got ${row.length}`);
      fail(missedExpectations.join('\n'));
    }

    row.forEach((actualCell, cellIndex) => {
      const expectedCell = expectedRow ? expectedRow[cellIndex] : null;
      checkCellContent(actualCell, expectedCell);
    });
  });

  if (missedExpectations.length) {
    fail(missedExpectations.join('\n'));
  }
}
