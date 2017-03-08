import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/Rx';
import {MdTableSortOrder, MdTableDataSource, MdTableRows} from '@angular/material';

export interface Character {
  name: string;
  movie: string;
  villan?: boolean;
}

export const CHARACTERS = [
  {name: 'Goofy', movie: 'A Goofy Movie'},
  {name: 'Tinker Bell', movie: 'Peter Pan'},
  {name: 'Thumper', movie: 'Bambi'},
  {name: 'Mad Hatter', movie: 'Alice in Wonderland'},
  {name: 'Kronk', movie: 'The Emperor\'s New Groove', villan: true},
  {name: 'Gus Gus', movie: 'Cinderella'},
  {name: 'Jiminy Cricket', movie: 'Pinocchio'},
  {name: 'Tigger', movie: 'Winnie the Pooh'},
  {name: 'Gaston', movie: 'Beauty and the Beast', villan: true},
  {name: 'Dumbo', movie: 'Dumbo'},
  {name: 'Jafar', movie: 'Aladdin', villan: true},
  {name: 'Lilo', movie: 'Lilo and Stitch'},
  {name: 'Sebastian', movie: 'The Little Mermaid'},
  {name: 'Jane', movie: 'Tarzan'},
  {name: 'Pumbaa', movie: 'The Lion King'},
  {name: 'Mulan', movie: 'Mulan'},
];

export class TableDemoDataSource implements MdTableDataSource<Character> {
  private readonly rowSubject =
      new BehaviorSubject<MdTableRows<Character>>({rows: [], rowCount: 0});

  filter: string;
  sortOrder: MdTableSortOrder;
  sortColumn: string;

  constructor() {
    this.loadTableRows();
  }

  /**
   * Returns an observable the table watches in order to update rows.
   * @override
   */
  getRows(): Observable<MdTableRows<Character>> {
    return this.rowSubject.asObservable();
  }

  /**
   * Updates the table based on the table settings and filters.
   */
  loadTableRows() {
    this.getRowsFromServer().subscribe(filteredRows => {
      const rows = {rows: filteredRows, rowCount: filteredRows.length};
      this.rowSubject.next(rows);
    });
  }

  /**
   * Simulates getting a list of filtered rows from the server with a delay.
   */
  getRowsFromServer(): Observable<Character[]> {
    const filteredRows = CHARACTERS.filter(this.matchesSearchTerm.bind(this));
    if (this.sortColumn) {
      filteredRows.sort(this.compareRows.bind(this));
      if (this.sortOrder === 'descending') {
        filteredRows.reverse();
      }
    }

    return Observable.of(filteredRows);
  }

  private matchesSearchTerm(row: Character): boolean {
    if (!this.filter) {
      return true;  // Everything matches.
    }

    return (row.name + row.movie).toLowerCase().indexOf(this.filter.toLowerCase()) != -1;
  }

  private compareRows(a: Character, b: Character): number {
    if (!this.sortColumn) { return 0; }

    let valueA: string;
    let valueB: string;
    if (this.sortColumn == 'name') {
      valueA = a.name;
      valueB = b.name;
    } else if (this.sortColumn == 'movie') {
      valueA = a.movie;
      valueB = b.movie;
    }

    // For arbitrary objects, if the valueOf method is overridden, then
    // comparison will use that. Otherwise, sorting will do nothing.
    if (valueA < valueB) {
      return -1;
    } else if (valueA > valueB) {
      return 1;
    } else {
      return 0;
    }
  }
}