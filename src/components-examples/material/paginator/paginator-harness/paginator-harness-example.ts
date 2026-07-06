import {Component, signal} from '@angular/core';
import {PageEvent, MatPaginatorModule} from '@angular/material/paginator';

/**
 * @title Testing with MatPaginatorHarness
 */
@Component({
  selector: 'paginator-harness-example',
  templateUrl: 'paginator-harness-example.html',
  imports: [MatPaginatorModule],
})
export class PaginatorHarnessExample {
  length = signal(500);
  pageSize = signal(10);
  pageIndex = signal(0);
  pageSizeOptions = signal([5, 10, 25]);
  showFirstLastButtons = signal(true);

  handlePageEvent(event: PageEvent) {
    this.length.set(event.length);
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }
}
