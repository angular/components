import {MatTableDataSource} from './table-data-source';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {Component, ViewChild} from '@angular/core';

declare global {
  interface Window {
    ngDevMode?: object | null;
  }
}

describe('MatTableDataSource', () => {
  describe('sort', () => {
    let dataSource: MatTableDataSource<{'prop': string | number}>;
    let fixture: ComponentFixture<MatSortApp>;
    let sort: MatSort;

    beforeEach(() => {
      fixture = TestBed.createComponent(MatSortApp);
      fixture.detectChanges();
      dataSource = new MatTableDataSource();
      sort = fixture.componentInstance.sort;
      dataSource.sort = sort;
    });

    /** Test the data source's `sortData` function. */
    function testSortWithValues(values: (string | number)[]) {
      // The data source and MatSort expect the list to contain objects with values, where
      // the sort should be performed over a particular key.
      // Map the values into an array of objects where each value is keyed by "prop"
      // e.g. [0, 1, 2] -> [{prop: 0}, {prop: 1}, {prop: 2}]
      const data = values.map(v => ({'prop': v}));

      // Set the active sort to be on the "prop" key
      sort.active = 'prop';

      const reversedData = data.slice().reverse();
      const sortedData = dataSource.sortData(reversedData, sort);
      expect(sortedData).toEqual(data);
    }

    it('should be able to correctly sort an array of numbers', () => {
      testSortWithValues([-2, -1, 0, 1, 2]);
    });

    it('should be able to correctly sort an array of string', () => {
      testSortWithValues(['apples', 'bananas', 'cherries', 'lemons', 'strawberries']);
    });

    it('should be able to correctly sort an array of strings and numbers', () => {
      testSortWithValues([3, 'apples', 'bananas', 'cherries', 'lemons', 'strawberries']);
    });

    it('should be able to correctly sort an array of strings and numbers with left zero', () => {
      testSortWithValues([
        '001',
        '2',
        3,
        4,
        'apples',
        'bananas',
        'cherries',
        'lemons',
        'strawberries',
      ]);
    });

    it('should unsubscribe from the re-render stream when disconnected', () => {
      const spy = spyOn(dataSource._renderChangesSubscription!, 'unsubscribe');
      dataSource.disconnect();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should re-subscribe to the sort stream when re-connecting after being disconnected', () => {
      dataSource.disconnect();
      const spy = spyOn(fixture.componentInstance.sort.sortChange, 'subscribe');
      dataSource.connect();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should update filteredData even if the data source is disconnected', () => {
      dataSource.data = [{'prop': 1}, {'prop': 2}, {'prop': 3}];
      expect(dataSource.filteredData).toEqual([{'prop': 1}, {'prop': 2}, {'prop': 3}]);

      dataSource.disconnect();
      dataSource.data = [{'prop': 3}, {'prop': 2}, {'prop': 1}];
      expect(dataSource.filteredData).toEqual([{'prop': 3}, {'prop': 2}, {'prop': 1}]);
    });

    it('should filter data', () => {
      dataSource.data = [{'prop': 1}, {'prop': 'foo'}, {'prop': 'banana'}];
      dataSource.filter = 'b';
      expect(dataSource.filteredData).toEqual([{'prop': 'banana'}]);
    });

    it('does not warn in non-dev mode when filtering non-object data', fakeAsync(() => {
      const warnSpy = spyOn(console, 'warn');
      window.ngDevMode = null;
      dataSource.data = [1, 2, 3, 4, 5] as unknown as {'prop': number}[];

      dataSource.filter = '1';
      tick();

      expect(warnSpy).not.toHaveBeenCalled();
      expect(dataSource.filteredData).toEqual([]);
    }));

    it('displays the warning in dev mode when filtering non-object data', fakeAsync(() => {
      const warnSpy = spyOn(console, 'warn');
      window.ngDevMode = {};
      dataSource.data = [1, 2, 3, 4, 5] as unknown as {'prop': number}[];

      dataSource.filter = '1';
      tick();

      expect(warnSpy).toHaveBeenCalledWith(
        jasmine.stringContaining('requires data to be a non-null object'),
      );
      expect(dataSource.filteredData).toEqual([]);
    }));
  });
});

@Component({
  template: `<div matSort matSortDirection="asc"></div>`,
  imports: [MatSortModule],
})
class MatSortApp {
  @ViewChild(MatSort, {static: true}) sort!: MatSort;
}
