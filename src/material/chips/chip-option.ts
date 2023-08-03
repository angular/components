/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  OnInit,
  inject,
} from '@angular/core';
import {MatChip} from './chip';
import {MAT_CHIP, MAT_CHIPS_DEFAULT_OPTIONS} from './tokens';

/** Event object emitted by MatChipOption when selected or deselected. */
export class MatChipSelectionChange {
  constructor(
    /** Reference to the chip that emitted the event. */
    public source: MatChipOption,
    /** Whether the chip that emitted the event is selected. */
    public selected: boolean,
    /** Whether the selection change was a result of a user interaction. */
    public isUserInput = false,
  ) {}
}

/**
 * An extension of the MatChip component that supports chip selection. Used with MatChipListbox.
 *
 * Unlike other chips, the user can focus on disabled chip options inside a MatChipListbox. The
 * user cannot click disabled chips.
 */
@Component({
  selector: 'mat-basic-chip-option, [mat-basic-chip-option], mat-chip-option, [mat-chip-option]',
  templateUrl: 'chip-option.html',
  styleUrls: ['chip.css'],
  inputs: ['color', 'disabled', 'disableRipple', 'tabIndex'],
  host: {
    'class': 'mat-mdc-chip mat-mdc-chip-option',
    '[class.mdc-evolution-chip]': '!_isBasicChip',
    '[class.mdc-evolution-chip--filter]': '!_isBasicChip',
    '[class.mdc-evolution-chip--selectable]': '!_isBasicChip',
    '[class.mat-mdc-chip-selected]': 'selected',
    '[class.mat-mdc-chip-multiple]': '_chipListMultiple',
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mdc-evolution-chip--disabled]': 'disabled',
    '[class.mdc-evolution-chip--selected]': 'selected',
    // This class enables the transition on the checkmark. Usually MDC adds it when selection
    // starts and removes it once the animation is finished. We don't need to go through all
    // the trouble, because we only care about the selection animation. MDC needs to do it,
    // because they also have an exit animation that we don't care about.
    '[class.mdc-evolution-chip--selecting]': '!_animationsDisabled',
    '[class.mdc-evolution-chip--with-trailing-action]': '_hasTrailingIcon()',
    '[class.mdc-evolution-chip--with-primary-icon]': 'leadingIcon',
    '[class.mdc-evolution-chip--with-primary-graphic]': '_hasLeadingGraphic()',
    '[class.mdc-evolution-chip--with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-with-trailing-icon]': '_hasTrailingIcon()',
    '[attr.tabindex]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-description]': 'null',
    '[attr.role]': 'role',
    '[id]': 'id',
  },
  providers: [
    {provide: MatChip, useExisting: MatChipOption},
    {provide: MAT_CHIP, useExisting: MatChipOption},
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipOption extends MatChip implements OnInit {
  /** Default chip options. */
  private _defaultOptions = inject(MAT_CHIPS_DEFAULT_OPTIONS, {optional: true});

  /** Whether the chip list is selectable. */
  chipListSelectable: boolean = true;

  /** Whether the chip list is in multi-selection mode. */
  _chipListMultiple: boolean = false;

  /** Whether the chip list hides single-selection indicator. */
  _chipListHideSingleSelectionIndicator: boolean =
    this._defaultOptions?.hideSingleSelectionIndicator ?? false;

  /**
   * Whether or not the chip is selectable.
   *
   * When a chip is not selectable, changes to its selected state are always
   * ignored. By default an option chip is selectable, and it becomes
   * non-selectable if its parent chip list is not selectable.
   */
  @Input()
  get selectable(): boolean {
    return this._selectable && this.chipListSelectable;
  }
  set selectable(value: BooleanInput) {
    this._selectable = coerceBooleanProperty(value);
    this._changeDetectorRef.markForCheck();
  }
  protected _selectable: boolean = true;

  /** Whether the chip is selected. */
  @Input()
  get selected(): boolean {
    return this._selected;
  }
  set selected(value: BooleanInput) {
    this._setSelectedState(coerceBooleanProperty(value), false, true);
  }
  private _selected = false;

  /**
   * The ARIA selected applied to the chip. Conforms to WAI ARIA best practices for listbox
   * interaction patterns.
   *
   * From [WAI ARIA Listbox authoring practices guide](
   * https://www.w3.org/WAI/ARIA/apg/patterns/listbox/):
   *  "If any options are selected, each selected option has either aria-selected or aria-checked
   *  set to true. All options that are selectable but not selected have either aria-selected or
   *  aria-checked set to false."
   *
   * Set `aria-selected="false"` on not-selected listbox options that are selectable to fix
   * VoiceOver reading every option as "selected" (#25736).
   */
  get ariaSelected(): string | null {
    return this.selectable ? this.selected.toString() : null;
  }

  /** The unstyled chip selector for this component. */
  protected override basicChipAttrName = 'mat-basic-chip-option';

  /** Emitted when the chip is selected or deselected. */
  @Output() readonly selectionChange: EventEmitter<MatChipSelectionChange> =
    new EventEmitter<MatChipSelectionChange>();

  override ngOnInit() {
    super.ngOnInit();
    this.role = 'presentation';
  }

  /** Selects the chip. */
  select(): void {
    this._setSelectedState(true, false, true);
  }

  /** Deselects the chip. */
  deselect(): void {
    this._setSelectedState(false, false, true);
  }

  /** Selects this chip and emits userInputSelection event */
  selectViaInteraction(): void {
    this._setSelectedState(true, true, true);
  }

  /** Toggles the current selected state of this chip. */
  toggleSelected(isUserInput: boolean = false): boolean {
    this._setSelectedState(!this.selected, isUserInput, true);
    return this.selected;
  }

  override _handlePrimaryActionInteraction() {
    if (!this.disabled) {
      // Interacting with the primary action implies that the chip already has focus, however
      // there's a bug in Safari where focus ends up lingering on the previous chip (see #27544).
      // We work around it by explicitly focusing the primary action of the current chip.
      this.focus();

      if (this.selectable) {
        this.toggleSelected(true);
      }
    }
  }

  _hasLeadingGraphic() {
    if (this.leadingIcon) {
      return true;
    }

    // The checkmark graphic communicates selected state for both single-select and multi-select.
    // Include checkmark in single-select to fix a11y issue where selected state is communicated
    // visually only using color (#25886).
    return !this._chipListHideSingleSelectionIndicator || this._chipListMultiple;
  }

  _setSelectedState(isSelected: boolean, isUserInput: boolean, emitEvent: boolean) {
    if (isSelected !== this.selected) {
      this._selected = isSelected;

      if (emitEvent) {
        this.selectionChange.emit({
          source: this,
          isUserInput,
          selected: this.selected,
        });
      }

      this._changeDetectorRef.markForCheck();
    }
  }
}
