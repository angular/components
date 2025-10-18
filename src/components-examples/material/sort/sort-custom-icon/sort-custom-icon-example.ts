import {Component} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatSortModule} from '@angular/material/sort';

/**
 * @title Sort header with a custom icon
 */
@Component({
  selector: 'sort-custom-icon-example',
  templateUrl: 'sort-custom-icon-example.html',
  imports: [MatSortModule, MatIcon],
})
export class SortCustomIconExample {}
