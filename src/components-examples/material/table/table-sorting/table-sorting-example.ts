import {LiveAnnouncer} from '@angular/cdk/a11y';
import {AfterViewInit, Component, ViewChild, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

export interface EmployeeData {
  firstName: string;
  lastName: string;
  position: string;
  office: string;
  salary: number;
}

const EMPLOYEE_DATA: EmployeeData[] = [
  {
    firstName: 'Garrett',
    lastName: 'Winters',
    position: 'Accountant',
    office: 'Tokyo',
    salary: 170750,
  },
  {firstName: 'Airi', lastName: 'Satou', position: 'Accountant', office: 'Tokyo', salary: 162700},
  {
    firstName: 'Donna',
    lastName: 'Snider',
    position: 'Customer Support',
    office: 'New York',
    salary: 112000,
  },
  {
    firstName: 'Serge',
    lastName: 'Baldwin',
    position: 'Data Coordinator',
    office: 'Singapore',
    salary: 138575,
  },
  {firstName: 'Thor', lastName: 'Walton', position: 'Developer', office: 'New York', salary: 98540},
  {
    firstName: 'Gavin',
    lastName: 'Joyce',
    position: 'Developer',
    office: 'Edinburgh',
    salary: 92575,
  },
  {firstName: 'Suki', lastName: 'Burks', position: 'Developer', office: 'London', salary: 114500},
  {
    firstName: 'Jonas',
    lastName: 'Alexander',
    position: 'Developer',
    office: 'San Francisco',
    salary: 86500,
  },
  {
    firstName: 'Jackson',
    lastName: 'Bradshaw',
    position: 'Director',
    office: 'New York',
    salary: 645750,
  },
  {
    firstName: 'Brielle',
    lastName: 'Williamson',
    position: 'Integration Specialist',
    office: 'New York',
    salary: 372000,
  },
  {
    firstName: 'Michelle',
    lastName: 'House',
    position: 'Integration Specialist',
    office: 'Sydney',
    salary: 95400,
  },
  {
    firstName: 'Michael',
    lastName: 'Bruce',
    position: 'Javascript Developer',
    office: 'Singapore',
    salary: 183000,
  },
  {
    firstName: 'Ashton',
    lastName: 'Cox',
    position: 'Junior Technical Author',
    office: 'San Francisco',
    salary: 86000,
  },
  {
    firstName: 'Michael',
    lastName: 'Silva',
    position: 'Marketing Designer',
    office: 'London',
    salary: 198500,
  },
  {
    firstName: 'Timothy',
    lastName: 'Mooney',
    position: 'Office Manager',
    office: 'London',
    salary: 136200,
  },
];
/**
 * @title Table with sorting
 */
@Component({
  selector: 'table-sorting-example',
  styleUrl: 'table-sorting-example.css',
  templateUrl: 'table-sorting-example.html',
  imports: [MatTableModule, MatSortModule, FormsModule, MatButtonToggleModule],
})
export class TableSortingExample implements AfterViewInit {
  private _liveAnnouncer = inject(LiveAnnouncer);

  multiSortEnabled = false;
  displayedColumns: string[] = ['firstName', 'lastName', 'position', 'office', 'salary'];
  dataSource = new MatTableDataSource(EMPLOYEE_DATA);

  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
