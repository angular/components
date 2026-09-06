import {Component, signal} from '@angular/core';
import {Sort, MatSortModule} from '@angular/material/sort';

/**
 * @title Testing with MatSortHarness
 */
@Component({
  selector: 'sort-harness-example',
  templateUrl: 'sort-harness-example.html',
  imports: [MatSortModule],
})
export class SortHarnessExample {
  disableThirdHeader = signal(false);
  desserts = [
    {name: 'Frozen yogurt', calories: 159, fat: 6, carbs: 24, protein: 4},
    {name: 'Ice cream sandwich', calories: 237, fat: 9, carbs: 37, protein: 4},
    {name: 'Eclair', calories: 262, fat: 16, carbs: 24, protein: 6},
    {name: 'Cupcake', calories: 305, fat: 4, carbs: 67, protein: 4},
    {name: 'Gingerbread', calories: 356, fat: 16, carbs: 49, protein: 4},
  ];

  sortedData = signal(this.desserts.slice());

  sortData(sort: Sort) {
    const data = this.desserts.slice();

    if (!sort.active || sort.direction === '') {
      this.sortedData.set(data);
    } else {
      this.sortedData.set(
        data.sort((a, b) => {
          const aValue = a[sort.active as keyof typeof a];
          const bValue = b[sort.active as keyof typeof b];
          return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
        }),
      );
    }
  }
}
