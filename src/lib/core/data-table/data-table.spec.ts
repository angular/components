import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {CdkHeaderRowPlaceholder, CdkRowPlaceholder, CdkTable, CollectionViewer} from './data-table';
import {DataSource} from './data-source';
import {CommonModule} from '@angular/common';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {CdkCellOutlet, CdkHeaderRow, CdkHeaderRowDef, CdkRow, CdkRowDef} from './row';
import {CdkColumnDef, CdkHeaderCellDef, CdkHeaderRowCell, CdkRowCell, CdkRowCellDef} from './cell';
import {customMatchers} from '../../matchers';

describe('CdkTable', () => {
  let fixture: ComponentFixture<SimpleCdkTableApp>;

  let component: SimpleCdkTableApp;
  let dataSource: FakeDataSource;
  let table: CdkTable;
  let tableElement: HTMLElement;

  beforeEach(async(() => {
    jasmine.addMatchers(customMatchers);
    jasmine.addMatchers(tableCustomMatchers);

    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [
        SimpleCdkTableApp,
        CdkTable, CdkRowDef, CdkRowCellDef, CdkCellOutlet, CdkHeaderCellDef,
        CdkColumnDef, CdkRowCell, CdkRow,
        CdkHeaderRowCell, CdkHeaderRow, CdkHeaderRowDef,
        CdkRowPlaceholder, CdkHeaderRowPlaceholder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleCdkTableApp);

    component = fixture.componentInstance;
    dataSource = component.dataSource as FakeDataSource;
    table = component.table;
    tableElement = fixture.nativeElement.querySelector('cdk-table');

    fixture.detectChanges();  // Let the component and table create embedded views
    fixture.detectChanges();  // Let the cells render
  }));

  describe('should initialize', () => {
    it('with a connected data source', () => {
      expect(table.dataSource).toBe(dataSource);
      expect(dataSource.isConnected).toBe(true);
    });

    it('with a rendered header with the right number of header cells', () => {
      const header = getHeaderRow(tableElement);

      expect(header).not.toBe(undefined);
      expect(header.classList).toContain('customHeaderRowClass');
      expect(getHeaderRowCells(tableElement).length).toBe(component.columnsToRender.length);
    });

    it('with rendered rows with right number of row cells', () => {
      const rows = getRows(tableElement);

      expect(rows.length).toBe(dataSource.data.length);
      rows.forEach(row => {
        expect(row.classList).toContain('customRowClass');
        expect(getRowCells(row).length).toBe(component.columnsToRender.length);
      });
    });

    it('with column class names provided to header and data row cells', () => {
      getHeaderRowCells(tableElement).forEach((headerCell, index) => {
        expect(headerCell.classList).toContain(`cdk-column-${component.columnsToRender[index]}`);
      });

      getRows(tableElement).forEach(row => {
        getRowCells(row).forEach((cell, index) => {
          expect(cell.classList).toContain(`cdk-column-${component.columnsToRender[index]}`);
        });
      });
    });

    it('with the right accessibility roles', () => {
      expect(tableElement).toBeRole('grid');

      expect(getHeaderRow(tableElement)).toBeRole('row');
      getHeaderRowCells(tableElement).forEach(cell => expect(cell).toBeRole('columnheader'));

      getRows(tableElement).forEach(row => {
        expect(row).toBeRole('row');
        getRowCells(row).forEach(cell => expect(cell).toBeRole('gridcell'));
      });
    });
  });

  it('should re-render the rows when the data changes', () => {
    dataSource.addData();
    fixture.detectChanges();

    expect(getRows(tableElement).length).toBe(dataSource.data.length);

    // Check that the number of cells is correct
    getRows(tableElement).forEach(row => {
      expect(getRowCells(row).length).toBe(component.columnsToRender.length);
    });
  });

  it('should match the right table content with dynamic data', () => {
    let initialDataLength = dataSource.data.length;
    expect(dataSource.data.length).toBe(3);
    let headerContent = ['Column A', 'Column B', 'Column C'];

    let initialTableContent = [headerContent];
    dataSource.data.forEach(rowData => initialTableContent.push([rowData.a, rowData.b, rowData.c]));
    expect(tableElement).toMatchTableContent(initialTableContent);

    // Add data to the table and recreate what the rendered output should be.
    dataSource.addData();
    expect(dataSource.data.length).toBe(initialDataLength + 1); // Make sure data was added
    fixture.detectChanges();
    fixture.detectChanges();

    let changedTableContent = [headerContent];
    dataSource.data.forEach(rowData => changedTableContent.push([rowData.a, rowData.b, rowData.c]));
    expect(tableElement).toMatchTableContent(changedTableContent);
  });
});

interface TestData {
  a: string;
  b: string;
  c: string;
}

class FakeDataSource extends DataSource<TestData> {
  isConnected: boolean = false;

  _dataChange = new BehaviorSubject<TestData[]>([]);
  set data(data: TestData[]) { this._dataChange.next(data); }
  get data() { return this._dataChange.getValue(); }

  constructor() {
    super();
    for (let i = 0; i < 3; i++) { this.addData(); }
  }

  connectTable(viewChange: Observable<CollectionViewer>): Observable<TestData[]> {
    this.isConnected = true;
    return Observable.combineLatest(viewChange, this._dataChange).map((results: any[]) => {
      const [view, data] = results;
      return data;
    });
  }

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
    <cdk-table [dataSource]="dataSource">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A</cdk-header-cell>
        <cdk-row-cell *cdkRowCellDef="let row"> {{row.a}}</cdk-row-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef> Column B</cdk-header-cell>
        <cdk-row-cell *cdkRowCellDef="let row"> {{row.b}}</cdk-row-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <cdk-header-cell *cdkHeaderCellDef> Column C</cdk-header-cell>
        <cdk-row-cell *cdkRowCellDef="let row"> {{row.c}}</cdk-row-cell>
      </ng-container>

      <cdk-header-row class="customHeaderRowClass"
                      *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row class="customRowClass"
               *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class SimpleCdkTableApp {
  dataSource: FakeDataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @ViewChild(CdkTable) table: CdkTable;
}

function getElements(element: Element, query: string): Element[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getHeaderRow(tableElement: Element): Element {
  return tableElement.querySelector('.cdk-header-row');
}

function getRows(tableElement: Element) {
  return getElements(tableElement, '.cdk-row');
}

function getRowCells(row: Element) {
  return row ? getElements(row, '.cdk-row-cell') : [];
}

function getHeaderRowCells(tableElement: Element) {
  return getElements(getHeaderRow(tableElement), '.cdk-header-cell');
}

const tableCustomMatchers: jasmine.CustomMatcherFactories = {
  toMatchTableContent: function(util, customEqualityTesters) {
    return {
      compare: function (tableElement: Element, expectedTableContent: any[]) {
        const missedExpectations = [];
        function checkCellContent(cell: Element, expectedTextContent: string) {
          const actualTextContent = cell.textContent.trim();
          if (actualTextContent !== expectedTextContent) {
            missedExpectations.push(
                `Expected cell contents to be ${expectedTextContent} but was ${actualTextContent}`);
          }
        }

        // Check header cells
        const expectedHeaderContent = expectedTableContent.shift();
        getHeaderRowCells(tableElement).forEach((cell, index) => {
          return checkCellContent(cell, expectedHeaderContent[index]);
        });

        // Check data row cells
        getRows(tableElement).forEach((row, rowIndex) => {
          getRowCells(row).forEach((cell, cellIndex) => {
            checkCellContent(cell, expectedTableContent[rowIndex][cellIndex]);
          });
        });

        if (missedExpectations.length) {
          return {
            pass: false,
            message: missedExpectations.join('\n')
          };
        }

        return {
          pass: true,
          message: 'Table contained the right content'
        };
      }
    };
  }
};
