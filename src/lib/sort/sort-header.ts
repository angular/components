/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MdSort, MdSortable} from './sort';

@Component({
  moduleId: module.id,
  selector: '[mdSortHeader], [matSortHeader]',
  templateUrl: 'sort-header.html',
  styleUrls: ['sort-header.css'],
  host: {
    '(click)': '_sort.sort(this)',
    '[class.sorted]': '_sort.isSorted(this)',
  }
})
export class MdSortHeader implements MdSortable {
  constructor(private _sort: MdSort) {
    _sort.register(this);
  }

  ngOnDestroy() {
    this._sort.unregister(this);
  }
}
