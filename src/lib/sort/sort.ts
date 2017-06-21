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
  active: string;
  direction: SortDirection;
}

export type SortDirection = 'ascending' | 'descending' | '';

@Directive({
  selector: '[mdSort], [matSort]',
})
export class MdSort {
  sortables = new Map<string, MdSortable>();

  @Input('mdSortActive') active: string;

  @Input('mdSortStart') sortStart: SortDirection = 'ascending';

  @Input('mdSortDirection') direction: SortDirection = '';

  @Input('mdSortDisableClear') disableClear: boolean;

  @Input('mdSortReverseOrder') reverseOrder: boolean;

  @Output() mdSortChange = new EventEmitter<Sort>();

  register(sortable: MdSortable) {
    this.sortables.set(sortable.id, sortable);
  }

  unregister(sortable: MdSortable) {
    if (this.active === sortable.id) {
      this.active = null;
    }

    this.sortables.delete(sortable.id);
  }

  isSorted(sortable: MdSortable) {
    return this.active == sortable.id && this.direction != '';
  }

  sort(sortable: MdSortable) {
    if (this.active != sortable.id) {
      this.direction = this.sortStart;
      this.active = sortable.id;
    } else {
      let sortDirectionCycle = this._getSortDirectionCycle();

      // Take the next direction in the cycle
      let nextDirectionIndex = sortDirectionCycle.indexOf(this.direction) + 1;
      if (nextDirectionIndex >= sortDirectionCycle.length) { nextDirectionIndex = 0; }

      this.direction = sortDirectionCycle[nextDirectionIndex];
    }

    this.mdSortChange.next({
      active: this.active,
      direction: this.direction
    });
  }

  _getSortDirectionCycle(): SortDirection[] {
    let sortOrder: SortDirection[] = ['ascending', 'descending'];
    if (this.reverseOrder) { sortOrder.reverse(); }
    if (!this.disableClear) { sortOrder.push(''); }

    return sortOrder;
  }
}
