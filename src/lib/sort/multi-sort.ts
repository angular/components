/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  EventEmitter,
  Input,
  isDevMode,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  CanDisable,
  HasInitialized
} from '@angular/material/core';
import {Subject} from 'rxjs';
import {SortDirection} from './sort-direction';
import {
  getSortInvalidDirectionError,
} from './sort-errors';
import {
  MatSortable,
  _MatSortMixinBase
} from './sort';

/** The current sort state. */
export interface MultiSort {
  /** The id of the column being sorted. */
  active: string[];

  /** The sort direction. */
  direction: { [id: string]: SortDirection };
}

/** Container for MatSortables to manage the sort state and provide default sort parameters. */
@Directive({
  selector: '[matMultiSort]',
  exportAs: 'matMultiSort',
  inputs: ['disabled: matSortDisabled']
})
export class MatMultiSort extends _MatSortMixinBase
    implements CanDisable, HasInitialized, OnChanges, OnDestroy, OnInit {

  /** Used to notify any child components listening to state changes. */
  readonly _stateChanges = new Subject<void>();

  /**
   * The array of active sort ids. Order defines sorting precedence.
   */
  @Input('matSortActive') active: string[];

  /**
   * The direction to set when an MatSortable is initially sorted.
   * May be overriden by the MatSortable's sort start.
   */
  @Input('matSortStart') start: 'asc' | 'desc' = 'asc';

  /**
   * The sort direction of the currently active MatSortable. If multicolumn sort is enabled
   * this will contain a dictionary of sort directions for active MatSortables.
   */
  @Input('matSortDirection')
  get direction(): { [id: string]: SortDirection } { return this._direction; }
  set direction(direction: { [id: string]: SortDirection }) {
    if (isDevMode() && direction && !this.isSortDirectionValid(direction)) {
      throw getSortInvalidDirectionError(direction);
    }
    this._direction = direction;
  }
  private _direction: { [id: string]: SortDirection } = {};

  isSortDirectionValid(direction: { [id: string]: SortDirection }): boolean {
    return Object.keys(direction).every((id) => this.isIndividualSortDirectionValid(direction[id]));
  }

  isIndividualSortDirectionValid(direction: string): boolean {
    return !direction || direction === 'asc' || direction === 'desc';
  }

  /** Event emitted when the user changes either the active sort or sort direction. */
  @Output('matSortChange')
  readonly sortChange: EventEmitter<MultiSort> = new EventEmitter<MultiSort>();

  /** Sets the active sort id and determines the new sort direction. */
  sort(sortable: MatSortable): void {
    if (!Array.isArray(this.active)) {
      this.active = [sortable.id];
      this.direction[sortable.id] = sortable.start ? sortable.start : this.start;
    } else {
      const index = this.active.indexOf(sortable.id);
      if (index === -1) {
        this.active.push(sortable.id);
        this.direction[sortable.id] = sortable.start ? sortable.start : this.start;
      } else {
        this.direction[sortable.id] = this.getNextSortDirection(sortable);
        if (!this.direction[sortable.id]) {
          this.active.splice(index, 1);
        }
      }
    }
    this.sortChange.emit({active: this.active, direction: this.direction});
  }

  /** Returns the next sort direction of the active sortable, checking for potential overrides. */
  getNextSortDirection(sortable: MatSortable): SortDirection {
    if (!sortable) { return ''; }

    // Get the sort direction cycle with the potential sortable overrides.
    let sortDirectionCycle = getSortDirectionCycle(sortable.start || this.start);

    // Get and return the next direction in the cycle
    let direction = this.direction[sortable.id];
    let nextDirectionIndex = sortDirectionCycle.indexOf(direction) + 1;
    if (nextDirectionIndex >= sortDirectionCycle.length) { nextDirectionIndex = 0; }
    return sortDirectionCycle[nextDirectionIndex];
  }

  ngOnInit() {
    this._markInitialized();
  }

  ngOnChanges() {
    this._stateChanges.next();
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }
}

/** Returns the sort direction cycle to use given the provided parameters of order and clear. */
function getSortDirectionCycle(start: 'asc' | 'desc'): SortDirection[] {
  let sortOrder: SortDirection[] = ['asc', 'desc'];
  if (start == 'desc') { sortOrder.reverse(); }
  sortOrder.push('');

  return sortOrder;
}
