import {Component} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/Rx';
import {
  NgForContext,
  MdTableDataSource,
  MdTableRows,
  MdTableInvalidDataSourceError,
  MdTableSortData,
  MdTableSortOrder,
  MdDataTableModule
} from './index';


export interface Character {
  name: string;
  movie: string;
}

export const CHARACTERS = [
  {name: 'Goofy', movie: 'A Goofy Movie'},
  {name: 'Tinker Bell', movie: 'Peter Pan'},
  {name: 'Thumper', movie: 'Bambi'},
  {name: 'Mad Hatter', movie: 'Alice in Wonderland'},
  {name: 'Kronk', movie: 'The Emperor\'s New Groove'},
  {name: 'Gus Gus', movie: 'Cinderella'},
  {name: 'Jiminy Cricket', movie: 'Pinocchio'},
  {name: 'Tigger', movie: 'Winnie the Pooh'},
  {name: 'Gaston', movie: 'Beauty and the Beast'},
  {name: 'Dumbo', movie: 'Dumbo'},
  {name: 'Jafar', movie: 'Aladdin'},
  {name: 'Lilo', movie: 'Lilo and Stitch'},
  {name: 'Sebastian', movie: 'The Little Mermaid'},
  {name: 'Jane', movie: 'Tarzan'},
  {name: 'Pumbaa', movie: 'The Lion King'},
  {name: 'Mulan', movie: 'Mulan'},
];

export const CHARACTERS_SORTED_BY_NAME_ASC = CHARACTERS.slice().sort(
    (item1, item2) => item1.name.localeCompare(item2.name));

export const CHARACTERS_SORTED_BY_NAME_DESC =
    CHARACTERS_SORTED_BY_NAME_ASC.slice().reverse();

export const CHARACTERS_SORTED_BY_MOVIE_ASC = CHARACTERS.slice().sort(
    (item1, item2) => item1.movie.localeCompare(item2.movie));

function verifyRows(tableElement: HTMLElement, expectedRows: Character[]) {
  const rows = tableElement.querySelectorAll('.mat-table-row');
  expect(rows.length).toBe(expectedRows.length);

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const cells = row.querySelectorAll('.mat-table-cell');
    expect(cells.length).toBe(2);
    expect(cells[0].textContent).toBe(expectedRows[rowIndex].name);
    expect(cells[1].textContent).toBe(expectedRows[rowIndex].movie);
  }
}


describe('MdTable should error when', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MdDataTableModule,
      ],
      declarations: [
        MdTableMissingDataSource,
      ],
    });
  });

  it('no dataSource is provided', async(() => {
    TestBed.compileComponents().catch(error => {
      expect(error).toBe(new MdTableInvalidDataSourceError());
    });
  }));
});

describe('MdTable', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MdDataTableModule,
      ],
      declarations: [
        MdTableSimple,
        MdTableWithCustomClasses,
        MdTableWithEvents,
        MdTableWithWhen,
        MdTableWithSearch,
        MdTableWithSort,
      ],
    });

    TestBed.compileComponents();
  }));

  it('should render a table with rows and cells', () => {
    const fixture = TestBed.createComponent(MdTableSimple);
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('.mat-table');

    const header = tableElement.querySelectorAll('.mat-table-header-row');
    expect(header.length).toBe(1);

    const headerCells = header[0].querySelectorAll('.mat-table-header-cell');
    expect(headerCells.length).toBe(2);
    expect(headerCells[0].textContent).toBe('Name');
    expect(headerCells[1].textContent).toBe('Movie');

    verifyRows(tableElement, CHARACTERS);
  });

  it('should allow custom classes on md-row and md-cell', () => {
    const fixture = TestBed.createComponent(MdTableWithCustomClasses);
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('.mat-table');

    const customHeader = tableElement.querySelectorAll('.my-custom-header');
    expect(customHeader.length).toBe(1);

    const customRow = tableElement.querySelectorAll('.my-custom-row');
    expect(customRow.length).toBe(CHARACTERS.length);

    const customCells = tableElement.querySelectorAll('.my-custom-cell');
    expect(customCells.length).toBe(CHARACTERS.length);
  });

  it('should conditionally render rows based on "when" clause', () => {
    const fixture = TestBed.createComponent(MdTableWithWhen);
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('.mat-table');

    const rows = tableElement.querySelectorAll('.mat-table-row');
    expect(rows.length).toBe(CHARACTERS.length);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (rowIndex === 0) {
        expect(row.textContent).toContain('First Name');
      } else if (rowIndex === CHARACTERS.length - 1) {
        expect(row.textContent).toContain('Last Name');
      } else {
        expect(row.textContent).toContain('Other Name');
      }
    }
  });

  it('should reload rows when emit is called - search', () => {
    const fixture = TestBed.createComponent(MdTableWithSearch);
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('.mat-table');
    const tableComponent = fixture.componentInstance;

    let rows = tableElement.querySelectorAll('.mat-table-row');
    expect(rows.length).toBe(CHARACTERS.length);

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const cells = row.querySelectorAll('.mat-table-cell');
      expect(cells.length).toBe(2);
      expect(cells[0].textContent).toBe(CHARACTERS[rowIndex].name);
    }

    tableComponent.updateSearch('Tinker Bell');
    fixture.detectChanges();

    rows = tableElement.querySelectorAll('.mat-table-row');
    expect(rows.length).toBe(1);

    const cells = rows[0].querySelectorAll('.mat-table-cell');
    expect(cells[0].textContent).toBe('Tinker Bell');
  });

  describe('sort', () => {
    it('should set initialSortColumn', () => {
      const fixture = TestBed.createComponent(MdTableWithSort);
      const tableComponent = fixture.componentInstance;

      tableComponent.dataSource.initialSortColumn = 'name';
      fixture.detectChanges();

      const tableElement = fixture.nativeElement.querySelector('.mat-table');

      verifyRows(tableElement, CHARACTERS_SORTED_BY_NAME_ASC);
    });

    it('should set defaultSortOrder', () => {
      const fixture = TestBed.createComponent(MdTableWithSort);
      const tableComponent = fixture.componentInstance;

      tableComponent.dataSource.initialSortColumn = 'name';
      tableComponent.dataSource.defaultSortOrder = 'descending';
      fixture.detectChanges();

      const tableElement = fixture.nativeElement.querySelector('.mat-table');

      verifyRows(tableElement, CHARACTERS_SORTED_BY_NAME_DESC);
    });

    it('should change sort order when a sorted header is clicked', () => {
      const fixture = TestBed.createComponent(MdTableWithSort);
      const tableComponent = fixture.componentInstance;
      const onSortSpy = spyOn(tableComponent, 'onSort').and.callThrough();

      tableComponent.dataSource.initialSortColumn = 'name';
      tableComponent.dataSource.defaultSortOrder = 'ascending';
      fixture.detectChanges();

      expect(onSortSpy).toHaveBeenCalledWith(
          {sortOrder: 'ascending', sortColumn: 'name'});

      const tableElement = fixture.nativeElement.querySelector('.mat-table');

      verifyRows(tableElement, CHARACTERS_SORTED_BY_NAME_ASC);

      const headerCell =
          tableElement.querySelectorAll('.mat-table-header-cell')[0];
      headerCell.click();
      fixture.detectChanges();

      expect(onSortSpy).toHaveBeenCalledWith(
          {sortOrder: 'descending', sortColumn: 'name'});
      verifyRows(tableElement, CHARACTERS_SORTED_BY_NAME_DESC);
    });

    it('should change sort column when a unsorted header is clicked', () => {
      const fixture = TestBed.createComponent(MdTableWithSort);
      const tableComponent = fixture.componentInstance;
      const onSortSpy = spyOn(tableComponent, 'onSort').and.callThrough();

      tableComponent.dataSource.initialSortColumn = 'name';
      tableComponent.dataSource.defaultSortOrder = 'ascending';
      fixture.detectChanges();

      expect(onSortSpy).toHaveBeenCalledWith(
          {sortOrder: 'ascending', sortColumn: 'name'});

      const tableElement = fixture.nativeElement.querySelector('.mat-table');

      verifyRows(tableElement, CHARACTERS_SORTED_BY_NAME_ASC);

      const headerCell =
          tableElement.querySelectorAll('.mat-table-header-cell')[1];
      headerCell.click();
      fixture.detectChanges();

      expect(onSortSpy).toHaveBeenCalledWith(
          {sortOrder: 'ascending', sortColumn: 'movie'});
      verifyRows(tableElement, CHARACTERS_SORTED_BY_MOVIE_ASC);
    });
  });

  describe('events', () => {
    it('should call onReload when rows are loaded', () => {
      const fixture = TestBed.createComponent(MdTableWithEvents);
      const tableComponent = fixture.componentInstance;

      expect(tableComponent.onReload).not.toHaveBeenCalled();

      fixture.detectChanges();

      expect(tableComponent.onReload).toHaveBeenCalled();

      tableComponent.onReload.calls.reset();
      tableComponent.dataSource.loadTableRows();

      expect(tableComponent.onReload).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    let fixture: ComponentFixture<MdTableSimple>;
    let tableElement: HTMLElement;
    let rowElements: HTMLElement[];
    let cellElements: HTMLElement[];
    let headerElement: HTMLElement;
    let headerCellElements: HTMLElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(MdTableSimple);
      tableElement = fixture.nativeElement.querySelector('md-data-table');
      rowElements = fixture.nativeElement.querySelectorAll('md-row');
      cellElements = fixture.nativeElement.querySelectorAll('md-cell');
      headerElement = fixture.nativeElement.querySelector('md-header-row');
      headerCellElements = fixture.nativeElement.querySelectorAll('md-header-cell');
      fixture.detectChanges();
    });

    it('should assign roles to table elements', () => {
      expect(tableElement.getAttribute('role')).toBe('grid');
      expect(headerElement.getAttribute('role')).toBe('row');

      for (let row of rowElements) {
        expect(row.getAttribute('role')).toBe('row');
      }

      for (let cell of cellElements) {
        expect(cell.getAttribute('role')).toBe('gridcell');
      }

      for (let headerCell of headerCellElements) {
        expect(headerCell.getAttribute('role')).toBe('columnheader');
      }
    });
  });
});


/** Test component that contains an MdDataTable. */
@Component({
  template: `
    <md-data-table [dataSource]="dataSource">
      <md-header-row>
        <md-header-cell>Name</md-header-cell>
        <md-header-cell>Movie</md-header-cell>
      </md-header-row>
      <md-row *mdRowContext="let row = row">
        <md-cell>{{row.name}}</md-cell>
        <md-cell>{{row.movie}}</md-cell>
      </md-row>
    </md-data-table>
  `
})
class MdTableSimple {
  dataSource = new CharacterDataSource();
}

/** Test component with a missing dataSource. */
@Component({
  template: `
    <md-data-table>
      <md-header-row>
        <md-header-cell>Name</md-header-cell>
        <md-header-cell>Movie</md-header-cell>
      </md-header-row>
      <md-row *mdRowContext="let row = row">
        <md-cell>{{row.name}}</md-cell>
        <md-cell>{{row.movie}}</md-cell>
      </md-row>
    </md-data-table>
  `
})
class MdTableMissingDataSource {
}

/** Test component with custom classes. */
@Component({
  template: `
    <md-data-table [dataSource]="dataSource">
      <md-header-row class="my-custom-header">
        <md-header-cell>Name</md-header-cell>
        <md-header-cell>Movie</md-header-cell>
      </md-header-row>
      <md-row *mdRowContext="let row = row" class="my-custom-row">
        <md-cell class="my-custom-cell">{{row.name}}</md-cell>
        <md-cell>{{row.movie}}</md-cell>
      </md-row>
    </md-data-table>
  `
})
class MdTableWithCustomClasses {
  dataSource = new CharacterDataSource();
}

/** Test component that contains multiple row templates. */
@Component({
  template: `
    <md-data-table [dataSource]="dataSource">
      <md-row *mdRowContext="let row = row; when: firstRowFn">
        <md-cell>First Name: {{row.name}}</md-cell>
        <md-cell>{{row.movie}}</md-cell>
      </md-row>
      <md-row *mdRowContext="let row = row; when: lastRowFn">
        <md-cell>Last Name: {{row.name}}</md-cell>
        <md-cell>{{row.movie}}</md-cell>
      </md-row>
      <md-row *mdRowContext="let row = row">
        <md-cell>Other Name: {{row.name}}</md-cell>
        <md-cell>{{row.movie}}</md-cell>
      </md-row>
    </md-data-table>
  `
})
class MdTableWithWhen {
  dataSource = new CharacterDataSource();

  firstRowFn(row: Character, context: NgForContext) {
    return context.index === 0;
  }

  lastRowFn(row: Character, context: NgForContext) {
    return context.last;
  }
}

/** Test component with search. */
@Component({
  template: `
    <md-data-table [dataSource]="dataSource">
      <md-header-row>
        <md-header-cell>Name</md-header-cell>
        <md-header-cell>Movie</md-header-cell>
      </md-header-row>
      <md-row *mdRowContext="let row = row">
        <md-cell>{{row.name}}</md-cell>
        <md-cell>{{row.movie}}</md-cell>
      </md-row>
    </md-data-table>
  `
})
class MdTableWithSearch {
  dataSource = new CharacterDataSource();

  updateSearch(val: string) {
    this.dataSource.filter = val;
    this.dataSource.loadTableRows();
  }
}

/** Test component with sort. */
@Component({
  template: `
    <md-data-table [dataSource]="dataSource"
                   (onSort)="onSort($event)"
                   [initialSortColumn]="dataSource.initialSortColumn"
                   [defaultSortOrder]="dataSource.defaultSortOrder">
      <md-header-row>
        <md-header-cell sortKey="name">Name</md-header-cell>
        <md-header-cell sortKey="movie">Movie</md-header-cell>
      </md-header-row>
      <md-row *mdRowContext="let row = row">
        <md-cell>{{row.name}}</md-cell>
        <md-cell>{{row.movie}}</md-cell>
      </md-row>
    </md-data-table>
  `
})
class MdTableWithSort {
  dataSource = new CharacterDataSource();

  onSort(event: MdTableSortData) {
    this.dataSource.sortColumn = event.sortColumn;
    this.dataSource.sortOrder = event.sortOrder;
    this.dataSource.loadTableRows();
  }
}

/** Test component with events. */
@Component({
  template: `
    <md-data-table [dataSource]="dataSource"
                   (onReload)="onReload()">
      <md-header-row>
        <md-header-cell>Name</md-header-cell>
        <md-header-cell>Movie</md-header-cell>
      </md-header-row>
      <md-row *mdRowContext="let row = row">
        <md-cell>{{row.name}}</md-cell>
        <md-cell>{{row.movie}}</md-cell>
      </md-row>
    </md-data-table>
  `
})
class MdTableWithEvents {
  dataSource = new CharacterDataSource();
  onReload = jasmine.createSpy('onReload');
}


export interface Params {
  searchTerm?: string;
  sortOrder?: MdTableSortOrder;
  sortColumn?: string;
}

/** Shared datasource for all tests. */
class CharacterDataSource implements MdTableDataSource<Character> {
  private readonly rowSubject =
      new BehaviorSubject<MdTableRows<Character>>({rows: [], rowCount: 0});

  initialSortColumn: string;
  defaultSortOrder: MdTableSortOrder;

  filter: string;
  sortOrder: MdTableSortOrder;
  sortColumn: string;

  constructor() {
    this.loadTableRows();
  }

  getRows(): Observable<MdTableRows<Character>> {
    return this.rowSubject.asObservable();
  }

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

  loadTableRows() {
    this.getRowsFromServer().subscribe(filteredRows => {
      const rows = {rows: filteredRows, rowCount: filteredRows.length};
      this.rowSubject.next(rows);
    });
  }

  private matchesSearchTerm(row: Character): boolean {
    if (!this.filter) {
      return true;  // Everything matches.
    }

    return (row.name + row.movie).toLowerCase().indexOf(this.filter.toLowerCase()) != -1;
  }

  private compareRows(a: Character, b: Character): number {
    if (!this.sortColumn) {
      return 0;
    }

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