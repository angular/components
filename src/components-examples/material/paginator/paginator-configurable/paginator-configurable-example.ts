import {Component, OnInit} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';

/**
 * @title Configurable paginator
 */
@Component({
  selector: 'paginator-configurable-example',
  templateUrl: 'paginator-configurable-example.html',
  styleUrls: ['paginator-configurable-example.css'],
})
export class PaginatorConfigurableExample implements OnInit {
  // MatPaginator Inputs
  length = 100;
  pageSize = 10;
  pageSizeOptionsString = `5: '5', 10: '10', 25: '25', 100: 'All'`;
  pageSizeOptions: {[key: string]: string};

  // MatPaginator Output
  pageEvent: PageEvent;

  ngOnInit(): void {
    this.setPageSizeOptions(this.pageSizeOptionsString);
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      let options: {[key: string]: string} = {};

      setPageSizeOptionsInput.split(',').forEach(p => {
        const kv = p.split(':');
        options[kv[0].replace(/['"]+/g, '').trim()] = kv[1].replace(/['"]+/g, '').trim();
      });

      this.pageSizeOptions = options;
    }
  }
}
