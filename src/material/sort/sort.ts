/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  booleanAttribute,
} from '@angular/core';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {SortDirection} from './sort-direction';
import {
  getSortDuplicateSortableIdError,
  getSortHeaderMissingIdError,
  getSortInvalidDirectionError,
} from './sort-errors';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

/** Position of the arrow that displays when sorted. */
export type SortHeaderArrowPosition = 'before' | 'after';

/** Interface for a directive that holds sorting state consumed by `MatSortHeader`. */
export interface MatSortable {
  /** The id of the column being sorted. */
  id: string;

  /** Starting sort direction. */
  start: SortDirection;

  /** Whether to disable clearing the sorting state. */
  disableClear: boolean;
}

/** The current sort state. */
export interface Sort {
  /** The id of the column being sorted. */
  active: string;

  /** The sort direction. */
  direction: SortDirection;
}

/** Default options for `mat-sort`.  */
export interface MatSortDefaultOptions {
  /** Whether to disable clearing the sorting state. */
  disableClear?: boolean;
  /** Position of the arrow that displays when sorted. */
  arrowPosition?: SortHeaderArrowPosition;
}

/** Injection token to be used to override the default options for `mat-sort`. */
export const MAT_SORT_DEFAULT_OPTIONS = new InjectionToken<MatSortDefaultOptions>(
  'MAT_SORT_DEFAULT_OPTIONS',
);

/** Container for MatSortables to manage the sort state and provide default sort parameters. */
@Directive({
  selector: '[matSort]',
  exportAs: 'matSort',
  host: {
    'class': 'mat-sort',
  },
})
export class MatSort implements OnChanges, OnDestroy, OnInit {
  private _initializedStream = new ReplaySubject<void>(1);

  /** Collection of all registered sortables that this directive manages. */
  sortables = new Map<string, MatSortable>();

  /** Map of sort state for each column */
  sortState = new Map<string, Sort>();

  /** Used to notify any child components listening to state changes. */
  readonly _stateChanges = new Subject<void>();

  /** The id of the most recently sorted MatSortable. */
  @Input('matSortActive') active: string;

  /**
   * The direction to set when an MatSortable is initially sorted.
   * May be overridden by the MatSortable's sort start.
   */
  @Input('matSortStart') start: SortDirection = 'asc';

  /** The sort direction of the currently active MatSortable. */
  @Input('matSortDirection')
  get direction(): SortDirection {
    return this._direction;
  }
  set direction(direction: SortDirection) {
    if (
      direction &&
      direction !== 'asc' &&
      direction !== 'desc' &&
      (typeof ngDevMode === 'undefined' || ngDevMode)
    ) {
      throw getSortInvalidDirectionError(direction);
    }
    this._direction = direction;
  }
  private _direction: SortDirection = '';

  /** Whether to enable the multi-sorting feature or not */
  @Input('matSortMultiple')
  get matSortMultiple(): boolean {
    return this._sortMultiple;
  }
  set matSortMultiple(value: any) {
    this._sortMultiple = coerceBooleanProperty(value);
  }
  private _sortMultiple = false;

  /**
   * Whether to disable the user from clearing the sort by finishing the sort direction cycle.
   * May be overridden by the MatSortable's disable clear input.
   */
  @Input({alias: 'matSortDisableClear', transform: booleanAttribute})
  disableClear: boolean;

  /** Whether the sortable is disabled. */
  @Input({alias: 'matSortDisabled', transform: booleanAttribute})
  disabled: boolean = false;

  /** Event emitted when the user changes either the active sort or sort direction. */
  @Output('matSortChange') readonly sortChange: EventEmitter<Sort> = new EventEmitter<Sort>();

  /** Emits when the paginator is initialized. */
  initialized: Observable<void> = this._initializedStream;

  constructor(
    @Optional()
    @Inject(MAT_SORT_DEFAULT_OPTIONS)
    private _defaultOptions?: MatSortDefaultOptions,
  ) {}

  /**
   * Register function to be used by the contained MatSortables. Adds the MatSortable to the
   * collection of MatSortables.
   */
  register(sortable: MatSortable): void {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!sortable.id) {
        throw getSortHeaderMissingIdError();
      }

      if (this.sortables.has(sortable.id)) {
        throw getSortDuplicateSortableIdError(sortable.id);
      }
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
    let sortableDirection;
    if (!this.isActive(sortable.id)) {
      sortableDirection = sortable.start ?? this.start;
    } else {
      sortableDirection = this.getNextSortDirection(sortable);
    }

    // Avoid keeping multiple sorts if not required;
    if (!this._sortMultiple) {
      this.sortState.clear();
    }

    // Update active and direction to keep backwards compatibility
    if (this.active != sortable.id) {
      this.active = sortable.id;
    }

    this.direction = sortableDirection;

    const currentSort: Sort = {
      active: sortable.id,
      direction: sortableDirection,
    };

    // When unsorted, remove from state
    if (sortableDirection !== '') {
      this.sortState.set(sortable.id, currentSort);
    } else {
      this.sortState.delete(sortable.id);
    }

    this.sortChange.emit({active: this.active, direction: this.direction});
  }

  /** Checks whether the provided column is currently active (has been sorted). */
  isActive(id: string): boolean {
    return this.sortState.has(id);
  }

  /** Returns the current SortDirection of the supplied column id, defaults to unsorted if no state is found. */
  getCurrentSortDirection(id: string): SortDirection {
    return this.sortState.get(id)?.direction ?? this.sortables.get(id)?.start ?? this.start;
  }

  /** Returns the next sort direction of the active sortable, checking for potential overrides. */
  getNextSortDirection(sortable: MatSortable): SortDirection {
    if (!sortable) {
      return '';
    }

    const currentSortableDirection = this.getCurrentSortDirection(sortable.id);

    // Get the sort direction cycle with the potential sortable overrides.
    const disableClear =
      sortable?.disableClear ?? this.disableClear ?? !!this._defaultOptions?.disableClear;
    let sortDirectionCycle = getSortDirectionCycle(sortable.start || this.start, disableClear);

    // Get and return the next direction in the cycle
    let nextDirectionIndex = sortDirectionCycle.indexOf(currentSortableDirection) + 1;
    if (nextDirectionIndex >= sortDirectionCycle.length) {
      nextDirectionIndex = 0;
    }
    return sortDirectionCycle[nextDirectionIndex];
  }

  ngOnInit() {
    this._initializedStream.next();
  }

  ngOnChanges(changes: SimpleChanges) {
    /** Update sortState with active and direction values, otherwise sorting won't work */
    if (changes['active'] || changes['direction']) {
      const currentActive = changes['active']?.currentValue ?? this.active;
      const currentDirection = changes['active']?.currentValue ?? this.direction ?? this.start;

      if ((!currentActive || currentActive == '') && changes['active']?.previousValue) {
        this.sortState.delete(changes['active'].previousValue);
      } else {
        this.sortState.set(currentActive, {
          active: currentActive,
          direction: currentDirection,
        });
      }
    }

    this._stateChanges.next();
  }

  ngOnDestroy() {
    this._stateChanges.complete();
    this._initializedStream.complete();
  }
}

/** Returns the sort direction cycle to use given the provided parameters of order and clear. */
function getSortDirectionCycle(start: SortDirection, disableClear: boolean): SortDirection[] {
  let sortOrder: SortDirection[] = ['asc', 'desc'];
  if (start == 'desc') {
    sortOrder.reverse();
  }
  if (!disableClear) {
    sortOrder.push('');
  }

  return sortOrder;
}
