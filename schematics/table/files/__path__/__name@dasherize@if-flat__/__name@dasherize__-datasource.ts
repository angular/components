import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map } from 'rxjs/operators/map';
import { Observable } from 'rxjs/Observable';

/** TODO: Replace this with your own data model type */
export interface <%= classify(name) %>Item {
  name: string;
  id: number;
}

// TODO: replace this with real data from your application
const EXAMPLE_DATA = <%= classify(name) %>Item[] = [
  {id: 1, name: 'Hydrogen'},
  {id: 2, name: 'Helium'},
  {id: 3, name: 'Lithium'},
  {id: 4, name: 'Beryllium'},
  {id: 5, name: 'Boron'},
  {id: 6, name: 'Carbon'},
  {id: 7, name: 'Nitrogen'},
  {id: 8, name: 'Oxygen'},
  {id: 9, name: 'Fluorine'},
  {id: 10, name: 'Neon'},
  {id: 11, name: 'Sodium'},
  {id: 12, name: 'Magnesium'},
  {id: 13, name: 'Aluminum'},
  {id: 14, name: 'Silicon'},
  {id: 15, name: 'Phosphorus'},
  {id: 16, name: 'Sulfur'},
  {id: 17, name: 'Chlorine'},
  {id: 18, name: 'Argon'},
  {id: 19, name: 'Potassium'},
  {id: 20, name: 'Calcium'},
];

export class <%= classify(name) %>DataSource extends DataSource<<%= classify(name) %>Item> {
  data: <%= classify(name) %>Item[] = EXAMPLE_DATA;

  constructor(private _paginator: MatPaginator, private _sort: MatSort) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<<%= classify(name) %>Item[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      observableOf(this.data),
      this._paginator.page,
      this._sort.sortChange
    ];

    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData(this.data));
    }));
  }

  disconnect() {
    // TODO: clean up any open connections, free any held resources, etc.
  }

  /**
   * Client-side page the data by slicing out the next from the data array.
   * If you are using external datasource for pagination, you would connect it here.
   */
  private getPagedData(data: <%= classify(name) %>Item[]) {
    const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
    return data.splice(startIndex, this._paginator.pageSize);
  }

  /**
   * Client-side sort the data array.
   * If you are using a external datasource for sorting, you would connect it here
   */
  private getSortedData(data: <%= classify(name) %>Item[]) {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this._sort.direction == 'asc';
      switch (this._sort.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        case 'id': return compare(+a.id, +b.id, isAsc);
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns. */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
