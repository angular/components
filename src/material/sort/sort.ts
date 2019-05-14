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
  Output
} from '@angular/core';
import {
  CanDisable,
  CanDisableCtor,
  HasInitialized,
  HasInitializedCtor,
  mixinDisabled,
  mixinInitialized
} from '@angular/material/core';
import {Subject} from 'rxjs';

import {SortDirection} from './sort-direction';
import {
  getSortDuplicateSortableIdError,
  getSortHeaderMissingIdError,
  getSortInvalidDirectionError
} from './sort-errors';
import {MatSortable, SortableState} from './sortable';
import {MAT_SORT_CONTAINER, MatSortContainer} from './sort-container';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

/** State provided to a `MatSortable`, includes the current `MatSort` active sortable. */
export interface MatSortSortableState extends SortableState {
  /** The id of the currently activated sortable. */
  active: string;
}

/** The current sort state. */
export interface Sort {
  /** The id of the column being sorted. */
  active: string;

  /** The sort direction. */
  direction: SortDirection;
}

// Boilerplate for applying mixins to MatSort.
/** @docs-private */
class MatSortBase {}
const _MatSortMixinBase: HasInitializedCtor & CanDisableCtor & typeof MatSortBase =
    mixinInitialized(mixinDisabled(MatSortBase));

/** Container for MatSortables to manage the sort state and provide default sort parameters. */
@Directive({
  selector: '[matSort]',
  exportAs: 'matSort',
  inputs: ['disabled: matSortDisabled'],
  providers: [{provide: MAT_SORT_CONTAINER, useExisting: MatSort}]
})
export class MatSort extends _MatSortMixinBase implements CanDisable, HasInitialized, OnChanges,
                                                          OnDestroy, OnInit,
                                                          MatSortContainer<MatSortSortableState> {
  /** Collection of all registered sortables that this directive manages. */
  sortables = new Map<string, MatSortable>();

  /** Used to notify any child components listening to state changes. */
  readonly stateChanges = new Subject<void>();

  /** The id of the most recently sorted MatSortable. */
  @Input('matSortActive') active: string;

  /**
   * The direction to set when an MatSortable is initially sorted.
   * May be overriden by the MatSortable's sort start.
   */
  @Input('matSortStart') start: 'asc'|'desc' = 'asc';

  /** The sort direction of the currently active MatSortable. */
  @Input('matSortDirection')
  get direction(): SortDirection {
    return this._direction;
  }
  set direction(direction: SortDirection) {
    if (isDevMode() && direction && direction !== 'asc' && direction !== 'desc') {
      throw getSortInvalidDirectionError(direction);
    }
    this._direction = direction;
  }
  private _direction: SortDirection = '';

  /**
   * Whether to disable the user from clearing the sort by finishing the sort direction cycle.
   * May be overriden by the MatSortable's disable clear input.
   */
  @Input('matSortDisableClear')
  get disableClear(): boolean {
    return this._disableClear;
  }
  set disableClear(v: boolean) {
    this._disableClear = coerceBooleanProperty(v);
  }
  private _disableClear: boolean;

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
    if (this.active != sortable.id) {
      this.active = sortable.id;
      this.direction = sortable.start ? sortable.start : this.start;
    } else {
      this.direction = this.getNextSortDirection(sortable);
    }

    this.sortChange.emit({active: this.active, direction: this.direction});
    this.stateChanges.next();
  }

  /** Returns the next sort direction of the active sortable, checking for potential overrides. */
  getNextSortDirection(sortable: MatSortable): SortDirection {
    if (!sortable) {
      return '';
    }

    // Get the sort direction cycle with the potential sortable overrides.
    const disableClear = sortable.disableClear != null ? sortable.disableClear : this.disableClear;
    let sortDirectionCycle = getSortDirectionCycle(sortable.start || this.start, disableClear);

    // Get and return the next direction in the cycle
    let nextDirectionIndex = sortDirectionCycle.indexOf(this.direction) + 1;
    if (nextDirectionIndex >= sortDirectionCycle.length) {
      nextDirectionIndex = 0;
    }
    return sortDirectionCycle[nextDirectionIndex];
  }

  /** Provides the current state of the sortable. */
  getSortableState(sortable: MatSortable): MatSortSortableState {
    const active = this.active || '';
    const isDisabled = this.disabled || sortable.disabled;

    const hasDirection = (this.direction === 'asc' || this.direction === 'desc');
    const isSorted = this.active == sortable.id && hasDirection;

    const direction: SortDirection = isSorted ? this.direction : '';
    const start = sortable.start || this.start;
    const nextDirection = isSorted ? this.getNextSortDirection(sortable) : start;

    return {active, isSorted, direction, isDisabled, nextDirection};
  }

  ngOnInit() {
    this._markInitialized();
  }

  ngOnChanges() {
    this.stateChanges.next();
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }
}

/** Returns the sort direction cycle to use given the provided parameters of order and clear. */
function getSortDirectionCycle(start: 'asc'|'desc', disableClear: boolean): SortDirection[] {
  let sortOrder: SortDirection[] = ['asc', 'desc'];
  if (start == 'desc') {
    sortOrder.reverse();
  }
  if (!disableClear) {
    sortOrder.push('');
  }

  return sortOrder;
}
