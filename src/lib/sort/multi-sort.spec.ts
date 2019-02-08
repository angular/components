import {CdkTableModule} from '@angular/cdk/table';
import {
  dispatchMouseEvent
} from '@angular/cdk/testing';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTableModule} from '../table/index';
import {
  MatMultiSort,
  MatSortHeader,
  MatSortHeaderIntl,
  MatSortModule,
  MultiSort,
  SortDirection
} from './index';

describe('MatMultiSort', () => {
  let fixture: ComponentFixture<SimpleMatSortApp>;

  let component: SimpleMatSortApp;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatSortModule, MatTableModule, CdkTableModule, NoopAnimationsModule],
      declarations: [
        SimpleMatSortApp
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleMatSortApp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('when multicolumn sort is enabled should preserve sorting state for previous columns', () => {
    // Detect any changes that were made in preparation for this test
    fixture.detectChanges();

    // Reset the sort to make sure there are no side affects from previous tests
    component.matSort.active = [];
    component.matSort.direction = {};

    const expectedDirections: {[id: string]: SortDirection } = {
      overrideDisableClear: 'asc',
      defaultA: 'desc',
      defaultB: 'asc',
      overrideStart: 'desc'
    };

    const expectedColumns = ['overrideDisableClear', 'defaultA', 'defaultB', 'overrideStart'];

    component.sort('overrideDisableClear');
    component.sort('defaultA');
    component.sort('defaultA');
    component.sort('defaultB');
    component.sort('overrideStart');

    expect(component.matSort.active).toEqual(expectedColumns);
    expect(component.matSort.direction).toEqual(expectedDirections);
  });

  it('should allow sorting by multiple columns', () => {

    testMultiColumnSortDirectionSequence(
        fixture, ['defaultA', 'defaultB']);
  });

  it('should apply the aria-labels to the button', () => {
    const button = fixture.nativeElement.querySelector('#defaultA button');
    expect(button.getAttribute('aria-label')).toBe('Change sorting for defaultA');
  });

  it('should apply the aria-sort label to the header when sorted', () => {
    const sortHeaderElement = fixture.nativeElement.querySelector('#defaultA');
    expect(sortHeaderElement.getAttribute('aria-sort')).toBe(null);

    component.sort('defaultA');
    fixture.detectChanges();
    expect(sortHeaderElement.getAttribute('aria-sort')).toBe('ascending');

    component.sort('defaultA');
    fixture.detectChanges();
    expect(sortHeaderElement.getAttribute('aria-sort')).toBe('descending');

    component.sort('defaultA');
    fixture.detectChanges();
    expect(sortHeaderElement.getAttribute('aria-sort')).toBe(null);
  });

  it('should re-render when the i18n labels have changed',
    inject([MatSortHeaderIntl], (intl: MatSortHeaderIntl) => {
      const header = fixture.debugElement.query(By.directive(MatSortHeader)).nativeElement;
      const button = header.querySelector('.mat-sort-header-button');

      intl.sortButtonLabel = () => 'Sort all of the things';
      intl.changes.next();
      fixture.detectChanges();

      expect(button.getAttribute('aria-label')).toBe('Sort all of the things');
    })
  );
});

/**
 * Performs a sequence of sorting on a multiple columns to see if the sort directions are
 * consistent with expectations. Detects any changes in the fixture to reflect any changes in
 * the inputs and resets the MatSort to remove any side effects from previous tests.
 */
function testMultiColumnSortDirectionSequence(fixture: ComponentFixture<SimpleMatSortApp>,
                                               ids: SimpleMatSortAppColumnIds[]) {
  const expectedSequence: SortDirection[] = ['asc', 'desc'];

  // Detect any changes that were made in preparation for this sort sequence
  fixture.detectChanges();

  // Reset the sort to make sure there are no side affects from previous tests
  const component = fixture.componentInstance;
  component.matSort.active = [];
  component.matSort.direction = {};

  ids.forEach(id => {
    // Run through the sequence to confirm the order
    let actualSequence = expectedSequence.map(() => {
      component.sort(id);

      // Check that the sort event's active sort is consistent with the MatSort
      expect(component.matSort.active).toContain(id);
      expect(component.latestSortEvent.active).toContain(id);

      // Check that the sort event's direction is consistent with the MatSort
      expect(component.matSort.direction).toBe(component.latestSortEvent.direction);
      return getDirection(component, id);
    });
    expect(actualSequence).toEqual(expectedSequence);

    // Expect that performing one more sort will clear the sort.
    component.sort(id);
    expect(component.matSort.active).not.toContain(id);
    expect(component.latestSortEvent.active).not.toContain(id);
    expect(getDirection(component, id)).toBe('');
  });
}

function getDirection(component: SimpleMatSortApp, id: string) {
  let direction = component.matSort.direction as { [id: string]: SortDirection };
  return direction[id];
}

/** Column IDs of the SimpleMatSortApp for typing of function params in the component (e.g. sort) */
type SimpleMatSortAppColumnIds = 'defaultA' | 'defaultB' | 'overrideStart' | 'overrideDisableClear';

@Component({
  template: `
    <div matMultiSort
         [matSortActive]="active"
         [matSortDisabled]="disableAllSort"
         [matSortStart]="start"
         [matSortDirection]="direction"
         (matSortChange)="latestSortEvent = $event">
      <div id="defaultA"
           #defaultA
           mat-sort-header="defaultA"
           [disabled]="disabledColumnSort">
        A
      </div>
      <div id="defaultB"
           #defaultB
           mat-sort-header="defaultB">
        B
      </div>
      <div id="overrideStart"
           #overrideStart
           mat-sort-header="overrideStart" start="desc">
        D
      </div>
      <div id="overrideDisableClear"
           #overrideDisableClear
           mat-sort-header="overrideDisableClear"
           disableClear>
        E
      </div>
    </div>
  `
})
class SimpleMatSortApp {
  latestSortEvent: MultiSort;

  active: string;
  start: SortDirection = 'asc';
  direction: { [id: string]: SortDirection } = {};
  disabledColumnSort = false;
  disableAllSort = false;

  @ViewChild(MatMultiSort) matSort: MatMultiSort;
  @ViewChild('defaultA') defaultA: MatSortHeader;
  @ViewChild('defaultB') defaultB: MatSortHeader;
  @ViewChild('overrideStart') overrideStart: MatSortHeader;
  @ViewChild('overrideDisableClear') overrideDisableClear: MatSortHeader;

  constructor (public elementRef: ElementRef<HTMLElement>) { }

  sort(id: SimpleMatSortAppColumnIds) {
    this.dispatchMouseEvent(id, 'click');
  }

  dispatchMouseEvent(id: SimpleMatSortAppColumnIds, event: string) {
    const sortElement = this.elementRef.nativeElement.querySelector(`#${id}`)!;
    dispatchMouseEvent(sortElement, event);
  }
}
