import {Component, signal} from '@angular/core';
import {PageEvent, MatPaginatorModule} from '@angular/material/paginator';
import {JsonPipe} from '@angular/common';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

/**
 * @title Configurable paginator
 */
@Component({
  selector: 'paginator-configurable-example',
  templateUrl: 'paginator-configurable-example.html',
  styleUrl: 'paginator-configurable-example.css',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    JsonPipe,
  ],
})
export class PaginatorConfigurableExample {
  length = signal(50);
  pageSize = signal(10);
  pageIndex = signal(0);
  pageSizeOptions = signal([5, 10, 25]);

  hidePageSize = signal(false);
  showPageSizeOptions = signal(true);
  showFirstLastButtons = signal(true);
  disabled = signal(false);

  pageEvent = signal<PageEvent | undefined>(undefined);

  handlePageEvent(e: PageEvent) {
    this.pageEvent.set(e);
    this.length.set(e.length);
    this.pageSize.set(e.pageSize);
    this.pageIndex.set(e.pageIndex);
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions.set(setPageSizeOptionsInput.split(',').map(str => +str));
    }
  }
}
