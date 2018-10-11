/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
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
  CanDisableCtor,
  HasInitialized,
  HasInitializedCtor,
  mixinDisabled,
  mixinInitialized,
} from '@angular/material/core';
import {Subject} from 'rxjs';
import {SortDirection} from './sort-direction';
import {
  getSortDuplicateSortableIdError,
  getSortHeaderMissingIdError,
  getSortInvalidDirectionError,
} from './sort-errors';

/** Interface for a directive that holds sorting state consumed by `MatSortHeader`. */
export interface MatSortable {
  /** The id of the column being sorted. */
  id: string;

  /** Starting sort direction. */
  start: 'asc' | 'desc';

  /** Whether to disable clearing the sorting state. */
  disableClear: boolean;
}

/** The current sort state. */
export interface Sort {
  /** The id of the column being sorted. */
  active: string | string[];

  /** The sort direction. */
  direction: SortDirection | { [id: string]: SortDirection };
}

// Boilerplate for applying mixins to MatSort.
/** @docs-private */
export class MatSortBase {}
export const _MatSortMixinBase: HasInitializedCtor & CanDisableCtor & typeof MatSortBase =
    mixinInitialized(mixinDisabled(MatSortBase));

/** Container for MatSortables to manage the sort state and provide default sort parameters. */
@Directive({
  selector: '[matSort]',
  exportAs: 'matSort',
  inputs: ['disabled: matSortDisabled']
})
export class MatSort extends _MatSortMixinBase
    implements CanDisable, HasInitialized, OnChanges, OnDestroy, OnInit {
  /** Collection of all registered sortables that this directive manages. */
  sortables = new Map<string, MatSortable>();

  /** Used to notify any child components listening to state changes. */
  readonly _stateChanges = new Subject<void>();

  /**
   * The id of the most recently sorted MatSortable or an array of
   * active sort properties if multicolumn is enabled
   */
  @Input('matSortActive') active: string | string[];

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
  get direction(): SortDirection | { [id: string]: SortDirection } { return this._direction; }
  set direction(direction: SortDirection | { [id: string]: SortDirection }) {
    if (isDevMode() && direction && !this.isSortDirectionValid(direction)) {
      throw getSortInvalidDirectionError(direction);
    }
    this._direction = direction;
  }
  private _direction: SortDirection | { [id: string]: SortDirection } = '';

  isSortDirectionValid(direction: SortDirection | { [id: string]: SortDirection }): boolean {
    if (this.multiColumn) {
      return typeof direction === 'object' &&
        Object.keys(direction).every((id) => this.isIndividualSortDirectionValid(direction[id]));
    } else {
      return typeof direction === 'string' && this.isIndividualSortDirectionValid(direction);
    }
  }

  isIndividualSortDirectionValid(direction: string): boolean {
    return !direction || direction === 'asc' || direction === 'desc';
  }

  /**
   * Whether to disable the user from clearing the sort by finishing the sort direction cycle.
   * May be overriden by the MatSortable's disable clear input.
   */
  @Input('matSortDisableClear')
  get disableClear(): boolean { return this._disableClear; }
  set disableClear(v: boolean) { this._disableClear = coerceBooleanProperty(v); }
  private _disableClear: boolean;

  /**
   * Whether to enable sorting by multiple columns.
   */
  @Input('matMultiColumn') multiColumn: boolean = false;

  /** Event emitted when the user changes either the active sort or sort direction. */
  @Output('matSortChange') readonly sortChange: EventEmitter<Sort> = new EventEmitter<Sort>();

  /**
   * Register function to be used by the contained MatSortables. Adds the MatSortable to the
   * collection of MatSortables.
   */
  register(sortable: MatSortable): void {
    if (!sortable.id) {
      throw getSortHeaderMissingIdError();
    }

    if (this.sortables.has(sortable.id)) {
      throw getSortDuplicateSortableIdError(sortable.id);
    }
    this.sortables.set(sortable.id, sortable);
  }

  /**
   * Unregister function to be used by the contained MatSortables. Removes the MatSortable from the
   * collection of contained MatSortables.
   */
  deregister(sortable: MatSortable): void {
    this.sortables.delete(sortable.id);
  }

  /** Sets the active sort id and determines the new sort direction. */
  sort(sortable: MatSortable): void {
    if (this.multiColumn) {
      if (typeof this.direction !== 'object') {
        this.direction = {};
      }

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
    } else {
      if (this.active != sortable.id) {
        this.active = sortable.id;
        this.direction = sortable.start ? sortable.start : this.start;
      } else {
        this.direction = this.getNextSortDirection(sortable);
      }
    }

    this.sortChange.emit({active: this.active, direction: this.direction});
  }

  /** Returns the next sort direction of the active sortable, checking for potential overrides. */
  getNextSortDirection(sortable: MatSortable): SortDirection {
    if (!sortable) { return ''; }

    // Get the sort direction cycle with the potential sortable overrides.
    const disableClear = sortable.disableClear != null ? sortable.disableClear : this.disableClear;
    let sortDirectionCycle = getSortDirectionCycle(sortable.start || this.start, disableClear);

    // Get and return the next direction in the cycle
    let direction = typeof this.direction === 'object' ?
      this.direction[sortable.id] :
      this.direction;
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
function getSortDirectionCycle(start: 'asc' | 'desc',
                               disableClear: boolean): SortDirection[] {
  let sortOrder: SortDirection[] = ['asc', 'desc'];
  if (start == 'desc') { sortOrder.reverse(); }
  if (!disableClear) { sortOrder.push(''); }

  return sortOrder;
}
