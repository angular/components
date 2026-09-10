import {Component} from '@angular/core';
import {MatTableModule} from '@angular/material/table';

export interface IsotopeData {
  position: number;
  element: string;
  isotope: string;
  weight: number;
}

const ISOTOPE_DATA: IsotopeData[] = [
  {position: 1, element: 'Hydrogen', isotope: 'Protium', weight: 1.0078},
  {position: 2, element: 'Hydrogen', isotope: 'Deuterium', weight: 2.0141},
  {position: 3, element: 'Hydrogen', isotope: 'Tritium', weight: 3.016},
  {position: 4, element: 'Helium', isotope: 'Helium-3', weight: 3.016},
  {position: 5, element: 'Helium', isotope: 'Helium-4', weight: 4.0026},
];

/**
 * @title Table with merged rows using rowspan
 */
@Component({
  selector: 'table-rowspan-example',
  styleUrl: 'table-rowspan-example.css',
  templateUrl: 'table-rowspan-example.html',
  imports: [MatTableModule],
})
export class TableRowspanExample {
  displayedColumns: string[] = ['element', 'isotope', 'weight'];

  dataSource: IsotopeData[] = ISOTOPE_DATA;

  spans: Record<string, number>[] = [];

  constructor() {
    this._cacheSpan('element', row => row.element);
  }

  /** Caches rowspan values for a column. */
  private _cacheSpan(key: string, accessor: (row: IsotopeData) => string): void {
    for (let i = 0; i < this.dataSource.length;) {
      const currentValue = accessor(this.dataSource[i]);
      let count = 1;

      for (let j = i + 1; j < this.dataSource.length; j++) {
        if (currentValue !== accessor(this.dataSource[j])) {
          break;
        }

        count++;
      }

      if (!this.spans[i]) {
        this.spans[i] = {};
      }

      this.spans[i][key] = count;
      i += count;
    }
  }

  /** Returns the rowspan for an element cell. */
  getRowSpan(column: 'element', index: number): number | undefined {
    return this.spans[index]?.[column];
  }
}
