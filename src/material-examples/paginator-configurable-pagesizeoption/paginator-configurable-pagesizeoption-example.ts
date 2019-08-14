import { Component } from '@angular/core';
import { PageEvent, PageSizeOption } from '@angular/material/paginator';
import { coerceNumberProperty } from '@angular/cdk/coercion';

/**
 * @title Configurable paginator
 */
@Component({
  selector: 'paginator-configurable-pagesizeoption-example',
  templateUrl: 'paginator-configurable-pagesizeoption-example.html',
  styleUrls: ['paginator-configurable-pagesizeoption-example.css'],
})
export class PaginatorConfigurablePageSizeOptionExample {
  // MatPaginator Inputs
  length = 100;
  pageSize = 10;
  pageSizeOptions: PageSizeOption[] = [
    { value: 5, text: '5' },
    { value: 10, text: '10' },
    { value: 25, text: '25' },
    { value: 100, text: '100' },
    { value: -1, text: 'All' }
  ];

  // MatPaginator Output
  pageEvent: PageEvent;

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => this._makePageSizeOption(str));
  }

  private _makePageSizeOption(setPageSizeOptionsInput: string): PageSizeOption {
    let pageSizeOption = new PageSizeOption();
    pageSizeOption.value = coerceNumberProperty(setPageSizeOptionsInput);
    pageSizeOption.text = setPageSizeOptionsInput;

    return pageSizeOption;
  }
}
