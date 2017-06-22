/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EventEmitter, Input, Output} from '@angular/core';
import {SortDirection} from './sort-direction';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';
import {getMdSortDuplicateMdSortableIdError, getMdSortHeaderMissingIdError} from './sort-errors';

export interface MdSortable {
  id: string;
  start: SortDirection;
  disableClear: boolean;
  reverseOrder: boolean;
}

export interface Sort {
  active: string;
  direction: SortDirection;
}

/** Container for MdSortables to manage the sort state and provide default sort parameters. */
@Directive({
  selector: '[mdSort], [matSort]',
})
export class MdSort {
  /** Collection of all registered sortables that this directive manages. */
  sortables = new Map<string, MdSortable>();

  /** The id of the most recently sorted MdSortable. */
  @Input('mdSortActive') active: string;

  /**
   * The direction to set when an MdSortable is initially sorted.
   * May be overriden by the MdSortable's sort start.
   */
  @Input('mdSortStart') start: SortDirection = 'ascending';

  /** The sort direction of the currently active MdSortable. */
  @Input('mdSortDirection') direction: SortDirection = '';

  /**
   * Whether to disable the user from clearing the sort by finishing the sort direction cycle.
   * May be overriden by the MdSortable's disable clear input.
   */
  @Input('mdSortDisableClear')
  get disableClear() { return this._disableClear; }
  set disableClear(v) { this._disableClear = coerceBooleanProperty(v); }
  private _disableClear: boolean;

  /**
   * Whether to reverse the default sort direction order cycle.
   * May be overriden by the MdSortable's reverse order input.
   */
  @Input('mdSortReverseOrder')
  get reverseOrder() { return this._reverseOrder; }
  set reverseOrder(v) { this._reverseOrder = coerceBooleanProperty(v); }
  private _reverseOrder: boolean;

  /** Event emitted when the user changes either the active sort or sort direction. */
  @Output() mdSortChange = new EventEmitter<Sort>();

  /**
   * Register function to be used by the contained MdSortables. Adds the MdSortable to the
   * collection of MdSortables.
   * @docs-private
   */
  register(sortable: MdSortable) {
    if (!sortable.id) {
      throw getMdSortHeaderMissingIdError();
    }

    if (this.sortables.has(sortable.id)) {
      throw getMdSortDuplicateMdSortableIdError(sortable.id);
    }
    this.sortables.set(sortable.id, sortable);
  }

  /**
   * Unregister function to be used by the contained MdSortables. Removes the MdSortable from the
   * collection of contained MdSortables.
   * @docs-private
   */
  unregister(sortable: MdSortable) {
    this.sortables.delete(sortable.id);
  }

  /** Sets the active sort id and determines the new sort direction. */
  sort(sortable: MdSortable) {
    if (this.active != sortable.id) {
      this.active = sortable.id;
      this.direction = this._getInitialDirection();
    } else {
      this.direction = this._getNextSortDirection();
    }

    this.mdSortChange.next({active: this.active, direction: this.direction});
  }

  /** Returns the first sort direction to be used for the active sortable. */
  _getInitialDirection() {
    const sortable = this.sortables.get(this.active);
    if (!sortable) { return ''; }

    if (sortable.start) { return sortable.start; }

    // If the sortable is reversed, the start direction should be opposite of the MdSort start.
    if (sortable.reverseOrder) {
      return this.start == 'ascending' ? 'descending' : 'ascending';
    }

    return this.start;
  }

  /** Returns the next sort direction of the active sortable, checking for potential overrides. */
  _getNextSortDirection(): SortDirection {
    const sortable = this.sortables.get(this.active);
    if (!sortable) { return ''; }

    // Get the sort direction cycle with the potential sortable overrides.
    const reverseOrder = sortable.reverseOrder != undefined ?
        sortable.reverseOrder :
        this.reverseOrder;
    const disableClear = sortable.disableClear != undefined ?
        sortable.disableClear :
        this.disableClear;
    let sortDirectionCycle = getSortDirectionCycle(reverseOrder, disableClear);

    // Get and return the next direction in the cycle
    let nextDirectionIndex = sortDirectionCycle.indexOf(this.direction) + 1;
    if (nextDirectionIndex >= sortDirectionCycle.length) { nextDirectionIndex = 0; }
    return sortDirectionCycle[nextDirectionIndex];
  }
}

/** Returns the sort direction cycle to use given the provided parameters of order and clear. */
function getSortDirectionCycle(reverseOrder: boolean, disableClear: boolean): SortDirection[] {
  let sortOrder: SortDirection[] = ['ascending', 'descending'];
  if (reverseOrder) { sortOrder.reverse(); }
  if (!disableClear) { sortOrder.push(''); }

  return sortOrder;
}
