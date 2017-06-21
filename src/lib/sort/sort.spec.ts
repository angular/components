import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {MdSort, MdSortHeader, Sort, SortDirection, MdSortModule} from './index';
import {CdkDataTableModule, DataSource, CollectionViewer} from '../core/data-table/index';
import {Observable} from 'rxjs/Observable';
import {dispatchMouseEvent} from '../core/testing/dispatch-events';

fdescribe('MdSort', () => {
  let fixture: ComponentFixture<SimpleMdSortApp>;

  let component: SimpleMdSortApp;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSortModule, CdkDataTableModule],
      declarations: [SimpleMdSortApp, CdkTableMdSortApp],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleMdSortApp);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should have the sort headers register and unregister themselves', () => {
    const sortables = component.mdSort.sortables;
    expect(sortables.size).toBe(3);
    expect(sortables.get('a')).toBe(component.mdSortHeaderA);
    expect(sortables.get('b')).toBe(component.mdSortHeaderB);
    expect(sortables.get('c')).toBe(component.mdSortHeaderC);

    fixture.destroy();
    expect(sortables.size).toBe(0);
    expect(sortables.has('a')).toBeFalsy();
    expect(sortables.has('b')).toBeFalsy();
    expect(sortables.has('c')).toBeFalsy();
  });

  it('should use the column definition if used within a cdk table', () => {
    let cdkTableMdSortAppFixture = TestBed.createComponent(CdkTableMdSortApp);

    let cdkTableMdSortAppComponent = cdkTableMdSortAppFixture.componentInstance;

    cdkTableMdSortAppFixture.detectChanges();
    cdkTableMdSortAppFixture.detectChanges();

    const sortables = cdkTableMdSortAppComponent.mdSort.sortables;
    expect(sortables.size).toBe(3);
    expect(sortables.has('column_a')).toBe(true);
    expect(sortables.has('column_b')).toBe(true);
    expect(sortables.has('column_c')).toBe(true);
  });

  it('should be able to cycle from asc -> desc from any start point', () => {
    component.disableClear = true;

    component.start = 'ascending';
    testSingleColumnSortDirectionSequence(fixture, ['ascending', 'descending']);

    // Reverse directions
    component.reverseOrder = true;

    component.start = 'descending';
    testSingleColumnSortDirectionSequence(fixture, ['descending', 'ascending']);
  });

  it('should be able to cycle between asc, desc, and [none] from any start point', () => {
    component.start = 'ascending';
    testSingleColumnSortDirectionSequence(fixture, ['ascending', 'descending', '']);

    component.start = 'descending';
    testSingleColumnSortDirectionSequence(fixture, ['descending', '', 'ascending']);

    component.start = '';
    testSingleColumnSortDirectionSequence(fixture, ['', 'ascending', 'descending']);

    // Reverse directions
    component.reverseOrder = true;

    component.start = 'descending';
    testSingleColumnSortDirectionSequence(fixture, ['descending', 'ascending', '']);

    component.start = 'ascending';
    testSingleColumnSortDirectionSequence(fixture, ['ascending', '', 'descending']);

    component.start = '';
    testSingleColumnSortDirectionSequence(fixture, ['', 'descending', 'ascending']);
  });

  it('should reset sort direction when a different column is sorted', () => {
    component.sort('a');
    expect(component.mdSort.active).toBe('a');
    expect(component.mdSort.direction).toBe('ascending');

    component.sort('a');
    expect(component.mdSort.active).toBe('a');
    expect(component.mdSort.direction).toBe('descending');

    component.sort('b');
    expect(component.mdSort.active).toBe('b');
    expect(component.mdSort.direction).toBe('ascending');
  });
});

/**
 * Performs a sequence of sorting on a single column to see if the sort directions are
 * consistent with expectations. Detects any changes in the fixture to reflect any changes in
 * the inputs and resets the MdSort to remove any side effects from previous tests.
 */
function testSingleColumnSortDirectionSequence(fixture: ComponentFixture<SimpleMdSortApp>,
                                               expectedSequence: SortDirection[]) {
  // Detect any changes that were made in preparation for this sort sequence
  fixture.detectChanges();

  // Reset the md sort to make sure there are no side affects from previous tests
  const component = fixture.componentInstance;
  component.mdSort.active = null;
  component.mdSort.direction = '';

  // Run through the sequence to confirm the order
  let actualSequence = expectedSequence.map(() => {
    component.sort('a');

    // Check that the sort event's active sort is consistent with the MdSort
    expect(component.mdSort.active).toBe('a');
    expect(component.latestSortEvent.active).toBe('a');

    // Check that the sort event's direction is consistent with the MdSort
    expect(component.mdSort.direction).toBe(component.latestSortEvent.direction);
    return component.mdSort.direction;
  });
  expect(actualSequence).toEqual(expectedSequence);

  // Expect that performing one more sort will loop it back to the beginning.
  component.sort('a');
  expect(component.mdSort.direction).toBe(expectedSequence[0]);
}

@Component({
  template: `
    <div mdSort
         [mdSortActive]="active"
         [mdSortStart]="start"
         [mdSortDirection]="direction"
         [mdSortDisableClear]="disableClear"
         [mdSortReverseOrder]="reverseOrder"
         (mdSortChange)="latestSortEvent = $event">
      <div id="a" #sortHeaderA md-sort-header="a"> A </div>
      <div id="b" #sortHeaderB md-sort-header="b"> B </div>
      <div id="c" #sortHeaderC md-sort-header="c"> C </div>
    </div>
  `
})
class SimpleMdSortApp {
  latestSortEvent: Sort;

  active: string;
  start: SortDirection = 'ascending';
  direction: SortDirection = '';
  disableClear: boolean;
  reverseOrder: boolean;

  @ViewChild(MdSort) mdSort: MdSort;
  @ViewChild('sortHeaderA') mdSortHeaderA: MdSortHeader;
  @ViewChild('sortHeaderB') mdSortHeaderB: MdSortHeader;
  @ViewChild('sortHeaderC') mdSortHeaderC: MdSortHeader;

  constructor (public elementRef: ElementRef) { }

  sort(id: string) {
    const sortElement = this.elementRef.nativeElement.querySelector(`#${id}`);
    dispatchMouseEvent(sortElement, 'click');
  }
}


class FakeDataSource extends DataSource<any> {
  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return collectionViewer.viewChange.map(() => []);
  }
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource" mdSort>
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderA md-sort-header> Column A </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}}</cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderB md-sort-header> Column B </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.b}}</cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderC md-sort-header> Column C </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.c}}</cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class CdkTableMdSortApp {
  @ViewChild(MdSort) mdSort: MdSort;
  @ViewChild('sortHeaderA') mdSortHeaderA: MdSortHeader;
  @ViewChild('sortHeaderB') mdSortHeaderB: MdSortHeader;
  @ViewChild('sortHeaderC') mdSortHeaderC: MdSortHeader;

  dataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
}
