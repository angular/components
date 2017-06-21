/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input, Optional} from '@angular/core';
import {MdSort, MdSortable} from './sort';
import {CdkColumnDef} from '../core/data-table/cell';

@Component({
  moduleId: module.id,
  selector: '[md-sort-header], [mat-sort-header]',
  templateUrl: 'sort-header.html',
  styleUrls: ['sort-header.css'],
  host: {
    '(click)': '_sort.sort(this)',
    '[class.mat-sort-header-sorted]': '_sort.isSorted(this)'
  }
})
export class MdSortHeader implements MdSortable {
  @Input('md-sort-header') id: string;

  @Input('mat-sort-header')
  get _id() { return this.id; }
  set _id(v: string) { this.id = v; }

  constructor(public _sort: MdSort,
              @Optional() public _cdkColumnDef: CdkColumnDef) { }

  ngOnInit() {
    if (!this.id && this._cdkColumnDef) {
      this.id = this._cdkColumnDef.name;
    }
    this._sort.register(this);
  }

  ngOnDestroy() {
    this._sort.unregister(this);
  }
}
