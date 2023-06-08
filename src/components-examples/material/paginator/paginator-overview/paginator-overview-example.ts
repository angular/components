import {Component} from '@angular/core';
import {MatPaginatorModule} from '@angular/material/paginator';

/**
 * @title Paginator
 */
@Component({
  selector: 'paginator-overview-example',
  templateUrl: 'paginator-overview-example.html',
  standalone: true,
  imports: [MatPaginatorModule],
})
export class PaginatorOverviewExample {}
