import {Component} from '@angular/core';
import {PageChangeEvent} from '@angular/material';

@Component({
  selector: 'paginator-configurable-example',
  templateUrl: 'paginator-configurable-example.html',
})
export class PaginatorConfigurableExample {
  // MdPaginator Inputs
  listLength = 100;
  pageLength = 10;
  pageLengthOptions = [5, 10, 25, 100];

  // MdPaginator Output
  pageChangeEvent: PageChangeEvent;

  setPageLengthOptions(pageLengthOptionsInput: string) {
    this.pageLengthOptions = pageLengthOptionsInput.split(',').map(str => +str);
  }
}
