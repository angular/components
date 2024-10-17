/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FocusKeyManager} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  ViewEncapsulation,
  booleanAttribute,
  numberAttribute,
  inject,
} from '@angular/core';
import {Observable, Subject, merge} from 'rxjs';
import {startWith, switchMap, takeUntil} from 'rxjs/operators';
import {MatChip, MatChipEvent} from './chip';
import {MatChipAction} from './chip-action';

/**
 * Basic container component for the MatChip component.
 *
 * Extended by MatChipListbox and MatChipGrid for different interaction patterns.
 */
@Component({
  selector: 'mat-chip-set',
  template: `
    <div class="mdc-evolution-chip-set__chips" role="presentation">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: 'chip-set.css',
  host: {
    'class': 'mat-mdc-chip-set mdc-evolution-chip-set',
    '(keydown)': '_handleKeydown($event)',
    '[attr.role]': 'role',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipSet implements AfterViewInit, OnDestroy {
  protected _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected _changeDetectorRef = inject(ChangeDetectorRef);
  private _dir = inject(Directionality, {optional: true});

  /** Index of the last destroyed chip that had focus. */
  private _lastDestroyedFocusedChipIndex: number | null = null;

  /** Used to manage focus within the chip list. */
  protected _keyManager: FocusKeyManager<MatChipAction>;

  /** Subject that emits when the component has been destroyed. */
  protected _destroyed = new Subject<void>();

  /** Role to use if it hasn't been overwritten by the user. */
  protected _defaultRole = 'presentation';

  /** Combined stream of all of the child chips' focus events. */
  get chipFocusChanges(): Observable<MatChipEvent> {
    return this._getChipStream(chip => chip._onFocus);
  }

  /** Combined stream of all of the child chips' destroy events. */
  get chipDestroyedChanges(): Observable<MatChipEvent> {
    return this._getChipStream(chip => chip.destroyed);
  }

  /** Combined stream of all of the child chips' remove events. */
  get chipRemovedChanges(): Observable<MatChipEvent> {
    return this._getChipStream(chip => chip.removed);
  }

  /** Whether the chip set is disabled. */
  @Input({transform: booleanAttribute})
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
    this._syncChipsState();
  }
  protected _disabled: boolean = false;

  /** Whether the chip list contains chips or not. */
  get empty(): boolean {
    return !this._chips || this._chips.length === 0;
  }

  /** The ARIA role applied to the chip set. */
  @Input()
  get role(): string | null {
    if (this._explicitRole) {
      return this._explicitRole;
    }

    return this.empty ? null : this._defaultRole;
  }

  /** Tabindex of the chip set. */
  @Input({
    transform: (value: unknown) => (value == null ? 0 : numberAttribute(value)),
  })
  tabIndex: number = 0;

  set role(value: string | null) {
    this._explicitRole = value;
  }
  private _explicitRole: string | null = null;

  /** Whether any of the chips inside of this chip-set has focus. */
  get focused(): boolean {
    return this._hasFocusedChip();
  }

  /** The chips that are part of this chip set. */
  @ContentChildren(MatChip, {
    // We need to use `descendants: true`, because Ivy will no longer match
    // indirect descendants if it's left as false.
    descendants: true,
  })
  _chips: QueryList<MatChip>;

  /** Flat list of all the actions contained within the chips. */
  _chipActions = new QueryList<MatChipAction>();

  constructor(...args: unknown[]);
  constructor() {}

  ngAfterViewInit() {
    this._setUpFocusManagement();
    this._trackChipSetChanges();
    this._trackDestroyedFocusedChip();
  }

  ngOnDestroy() {
    this._keyManager?.destroy();
    this._chipActions.destroy();
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Checks whether any of the chips is focused. */
  protected _hasFocusedChip() {
    return this._chips && this._chips.some(chip => chip._hasFocus());
  }

  /** Syncs the chip-set's state with the individual chips. */
  protected _syncChipsState() {
    this._chips?.forEach(chip => {
      chip._chipListDisabled = this._disabled;
      chip._changeDetectorRef.markForCheck();
    });
  }

  /** Dummy method for subclasses to override. Base chip set cannot be focused. */
  focus() {}

  /** Handles keyboard events on the chip set. */
  _handleKeydown(event: KeyboardEvent) {
    if (this._originatesFromChip(event)) {
      this._keyManager.onKeydown(event);
    }
  }

  /**
   * Utility to ensure all indexes are valid.
   *
   * @param index The index to be checked.
   * @returns True if the index is valid for our list of chips.
   */
  protected _isValidIndex(index: number): boolean {
    return index >= 0 && index < this._chips.length;
  }

  /**
   * Removes the `tabindex` from the chip set and resets it back afterwards, allowing the
   * user to tab out of it. This prevents the set from capturing focus and redirecting
   * it back to the first chip, creating a focus trap, if it user tries to tab away.
   */
  protected _allowFocusEscape() {
    const previous = this._elementRef.nativeElement.tabIndex;

    if (previous !== -1) {
      // Set the tabindex directly on the element, instead of going through
      // the data binding, because we aren't guaranteed that change detection
      // will run quickly enough to allow focus to escape.
      this._elementRef.nativeElement.tabIndex = -1;

      // Note that this needs to be a `setTimeout`, because a `Promise.resolve`
      // doesn't allow enough time for the focus to escape.
      setTimeout(() => (this._elementRef.nativeElement.tabIndex = previous));
    }
  }

  /**
   * Gets a stream of events from all the chips within the set.
   * The stream will automatically incorporate any newly-added chips.
   */
  protected _getChipStream<T, C extends MatChip = MatChip>(
    mappingFunction: (chip: C) => Observable<T>,
  ): Observable<T> {
    return this._chips.changes.pipe(
      startWith(null),
      switchMap(() => merge(...(this._chips as QueryList<C>).map(mappingFunction))),
    );
  }

  /** Checks whether an event comes from inside a chip element. */
  protected _originatesFromChip(event: Event): boolean {
    let currentElement = event.target as HTMLElement | null;

    while (currentElement && currentElement !== this._elementRef.nativeElement) {
      if (currentElement.classList.contains('mat-mdc-chip')) {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
  }

  /** Sets up the chip set's focus management logic. */
  private _setUpFocusManagement() {
    // Create a flat `QueryList` containing the actions of all of the chips.
    // This allows us to navigate both within the chip and move to the next/previous
    // one using the existing `ListKeyManager`.
    this._chips.changes.pipe(startWith(this._chips)).subscribe((chips: QueryList<MatChip>) => {
      const actions: MatChipAction[] = [];
      chips.forEach(chip => chip._getActions().forEach(action => actions.push(action)));
      this._chipActions.reset(actions);
      this._chipActions.notifyOnChanges();
    });

    this._keyManager = new FocusKeyManager(this._chipActions)
      .withVerticalOrientation()
      .withHorizontalOrientation(this._dir ? this._dir.value : 'ltr')
      .withHomeAndEnd()
      .skipPredicate(action => this._skipPredicate(action));

    // Keep the manager active index in sync so that navigation picks
    // up from the current chip if the user clicks into the list directly.
    this.chipFocusChanges.pipe(takeUntil(this._destroyed)).subscribe(({chip}) => {
      const action = chip._getSourceAction(document.activeElement as Element);

      if (action) {
        this._keyManager.updateActiveItem(action);
      }
    });

    this._dir?.change
      .pipe(takeUntil(this._destroyed))
      .subscribe(direction => this._keyManager.withHorizontalOrientation(direction));
  }

  /**
   * Determines if key manager should avoid putting a given chip action in the tab index. Skip
   * non-interactive and disabled actions since the user can't do anything with them.
   */
  protected _skipPredicate(action: MatChipAction): boolean {
    // Skip chips that the user cannot interact with. `mat-chip-set` does not permit focusing disabled
    // chips.
    return !action.isInteractive || action.disabled;
  }

  /** Listens to changes in the chip set and syncs up the state of the individual chips. */
  private _trackChipSetChanges() {
    this._chips.changes.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => {
      if (this.disabled) {
        // Since this happens after the content has been
        // checked, we need to defer it to the next tick.
        Promise.resolve().then(() => this._syncChipsState());
      }

      this._redirectDestroyedChipFocus();
    });
  }

  /** Starts tracking the destroyed chips in order to capture the focused one. */
  private _trackDestroyedFocusedChip() {
    this.chipDestroyedChanges.pipe(takeUntil(this._destroyed)).subscribe((event: MatChipEvent) => {
      const chipArray = this._chips.toArray();
      const chipIndex = chipArray.indexOf(event.chip);

      // If the focused chip is destroyed, save its index so that we can move focus to the next
      // chip. We only save the index here, rather than move the focus immediately, because we want
      // to wait until the chip is removed from the chip list before focusing the next one. This
      // allows us to keep focus on the same index if the chip gets swapped out.
      if (this._isValidIndex(chipIndex) && event.chip._hasFocus()) {
        this._lastDestroyedFocusedChipIndex = chipIndex;
      }
    });
  }

  /**
   * Finds the next appropriate chip to move focus to,
   * if the currently-focused chip is destroyed.
   */
  private _redirectDestroyedChipFocus() {
    if (this._lastDestroyedFocusedChipIndex == null) {
      return;
    }

    if (this._chips.length) {
      const newIndex = Math.min(this._lastDestroyedFocusedChipIndex, this._chips.length - 1);
      const chipToFocus = this._chips.toArray()[newIndex];

      if (chipToFocus.disabled) {
        // If we're down to one disabled chip, move focus back to the set.
        if (this._chips.length === 1) {
          this.focus();
        } else {
          this._keyManager.setPreviousItemActive();
        }
      } else {
        chipToFocus.focus();
      }
    } else {
      this.focus();
    }

    this._lastDestroyedFocusedChipIndex = null;
  }
}
