/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EventEmitter, Input, Output} from '@angular/core';

export interface MdSortable {
  id: string;
}

export interface Sort {
  direction: string;
  sortable: MdSortable;
}

@Directive({
  selector: '[mdSort], [matSort]',
})
export class MdSort {
  sortables = new Map<string, MdSortable>();

  active: MdSortable;

  @Input('mdSortOrder') order: string[] = ['ascending', 'descending'];

  @Input('mdSortDirection') direction: string = '';

  @Output() sortChange = new EventEmitter<Sort>();

  register(sortable: MdSortable) {
    this.sortables.set(sortable.id, sortable);
  }

  unregister(sortable: MdSortable) {
    this.sortables.delete(sortable.id);
  }

  isSorted(sortable: MdSortable) {
    return this.active == sortable;
  }

  sort(sortable: MdSortable) {
    if (this.active != sortable) {
      this.direction = this.order[0];
      this.active = sortable;
    } else {
      let nextDirectionIndex = this.order.indexOf(this.direction) + 1;
      this.direction = this.order[nextDirectionIndex < this.order.length ? nextDirectionIndex : 0];
    }

    this.sortChange.next({direction: this.direction, sortable});
  }
}
