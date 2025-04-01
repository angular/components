/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ENTER} from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
  afterNextRender,
} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {MatChip, MatChipEvent} from './chip';
import {MatChipAction} from './chip-action';
import {MatChipEditInput} from './chip-edit-input';
import {MAT_CHIP} from './tokens';

/** Represents an event fired on an individual `mat-chip` when it is edited. */
export interface MatChipEditedEvent extends MatChipEvent {
  /** The final edit value. */
  value: string;
}

/**
 * An extension of the MatChip component used with MatChipGrid and
 * the matChipInputFor directive.
 */
@Component({
  selector: 'mat-chip-row, [mat-chip-row], mat-basic-chip-row, [mat-basic-chip-row]',
  templateUrl: 'chip-row.html',
  styleUrl: 'chip.css',
  host: {
    'class': 'mat-mdc-chip mat-mdc-chip-row mdc-evolution-chip',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-chip-editing]': '_isEditing',
    '[class.mat-mdc-chip-editable]': 'editable',
    '[class.mdc-evolution-chip--disabled]': 'disabled',
    '[class.mdc-evolution-chip--with-trailing-action]': '_hasTrailingIcon()',
    '[class.mdc-evolution-chip--with-primary-graphic]': 'leadingIcon',
    '[class.mdc-evolution-chip--with-primary-icon]': 'leadingIcon',
    '[class.mdc-evolution-chip--with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-with-trailing-icon]': '_hasTrailingIcon()',
    '[id]': 'id',
    // Has to have a negative tabindex in order to capture
    // focus and redirect it to the primary action.
    '[attr.tabindex]': 'disabled ? null : -1',
    '[attr.aria-label]': 'null',
    '[attr.aria-description]': 'null',
    '[attr.role]': 'role',
    '(focus)': '_handleFocus($event)',
    '(dblclick)': '_handleDoubleclick($event)',
  },
  providers: [
    {provide: MatChip, useExisting: MatChipRow},
    {provide: MAT_CHIP, useExisting: MatChipRow},
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatChipAction, MatChipEditInput],
})
export class MatChipRow extends MatChip implements AfterViewInit {
  protected override basicChipAttrName = 'mat-basic-chip-row';

  /**
   * The editing action has to be triggered in a timeout. While we're waiting on it, a blur
   * event might occur which will interrupt the editing. This flag is used to avoid interruptions
   * while the editing action is being initialized.
   */
  private _editStartPending = false;

  @Input() editable: boolean = false;

  /** Emitted when the chip is edited. */
  @Output() readonly edited: EventEmitter<MatChipEditedEvent> =
    new EventEmitter<MatChipEditedEvent>();

  /** The default chip edit input that is used if none is projected into this chip row. */
  @ViewChild(MatChipEditInput) defaultEditInput?: MatChipEditInput;

  /** The projected chip edit input. */
  @ContentChild(MatChipEditInput) contentEditInput?: MatChipEditInput;

  _isEditing = false;

  constructor(...args: unknown[]);

  constructor() {
    super();

    this.role = 'row';
    this._onBlur.pipe(takeUntil(this.destroyed)).subscribe(() => {
      if (this._isEditing && !this._editStartPending) {
        this._onEditFinish();
      }
    });
  }

  override _hasTrailingIcon() {
    // The trailing icon is hidden while editing.
    return !this._isEditing && super._hasTrailingIcon();
  }

  /** Sends focus to the first gridcell when the user clicks anywhere inside the chip. */
  _handleFocus() {
    if (!this._isEditing && !this.disabled) {
      this.focus();
    }
  }

  override _handleKeydown(event: KeyboardEvent): void {
    if (event.keyCode === ENTER && !this.disabled) {
      if (this._isEditing) {
        event.preventDefault();
        this._onEditFinish();
      } else if (this.editable) {
        this._startEditing(event);
      }
    } else if (this._isEditing) {
      // Stop the event from reaching the chip set in order to avoid navigating.
      event.stopPropagation();
    } else {
      super._handleKeydown(event);
    }
  }

  _handleDoubleclick(event: MouseEvent) {
    if (!this.disabled && this.editable) {
      this._startEditing(event);
    }
  }

  private _startEditing(event: Event) {
    if (
      !this.primaryAction ||
      (this.removeIcon && this._getSourceAction(event.target as Node) === this.removeIcon)
    ) {
      return;
    }

    // The value depends on the DOM so we need to extract it before we flip the flag.
    const value = this.value;

    this._isEditing = this._editStartPending = true;

    // Defer initializing the input until after it has been added to the DOM.
    afterNextRender(
      () => {
        this._getEditInput().initialize(value);
        this._editStartPending = false;
      },
      {injector: this._injector},
    );
  }

  private _onEditFinish() {
    this._isEditing = this._editStartPending = false;
    this.edited.emit({chip: this, value: this._getEditInput().getValue()});

    // If the edit input is still focused or focus was returned to the body after it was destroyed,
    // return focus to the chip contents.
    if (
      this._document.activeElement === this._getEditInput().getNativeElement() ||
      this._document.activeElement === this._document.body
    ) {
      this.primaryAction.focus();
    }
  }

  override _isRippleDisabled(): boolean {
    return super._isRippleDisabled() || this._isEditing;
  }

  /**
   * Gets the projected chip edit input, or the default input if none is projected in. One of these
   * two values is guaranteed to be defined.
   */
  private _getEditInput(): MatChipEditInput {
    return this.contentEditInput || this.defaultEditInput!;
  }
}
