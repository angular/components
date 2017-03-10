import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer
} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {Focusable} from '../core/a11y/focus-key-manager';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';
import {SPACE, BACKSPACE, DELETE} from '../core/keyboard/keycodes';

export interface MdChipEvent {
  chip: MdChip;
}

/**
 * Material design styled Chip component. Used inside the MdChipList component.
 */
@Component({
  selector: `md-basic-chip, [md-basic-chip], md-chip, [md-chip],
             mat-basic-chip, [mat-basic-chip], mat-chip, [mat-chip]`,
  template: `<ng-content></ng-content><div class="md-chip-focus-border"></div>`,
  host: {
    '[class.mat-chip]': 'true',
    'tabindex': '-1',
    'role': 'option',

    '[class.mat-chip-selected]': 'selected',
    '[class.mat-chip-has-remove-icon]': '_hasRemoveIcon',
    '[attr.disabled]': 'disabled',
    '[attr.aria-disabled]': '_isAriaDisabled',

    '(click)': '_handleClick($event)',
    '(keydown)': '_handleKeydown($event)'
  }
})
export class MdChip implements Focusable, OnInit, OnDestroy {

  /** Whether or not the chip is disabled. Disabled chips cannot be focused. */
  protected _disabled: boolean = null;

  /** Whether or not the chip is selectable. */
  protected _selectable: boolean = true;

  /** Whether or not the chip is removable. */
  protected _removable: boolean = true;

  /** Whether or not the chip is selected. */
  protected _selected: boolean = false;

  /** The palette color of selected chips. */
  protected _color: string = 'primary';

  /** Whether or not the chip is displaying the remove icon. */
  _hasRemoveIcon: boolean = false;

  /** Emitted when the removable property changes. */
  private _onRemovableChange = new EventEmitter<boolean>();
  onRemovableChange$: Observable<boolean> = this._onRemovableChange.asObservable();

  /** Emitted when the chip is focused. */
  onFocus = new EventEmitter<MdChipEvent>();

  /** Emitted when the chip is selected. */
  @Output() select = new EventEmitter<MdChipEvent>();

  /** Emitted when the chip is deselected. */
  @Output() deselect = new EventEmitter<MdChipEvent>();

  /** Emitted when the chip is destroyed. */
  @Output() destroy = new EventEmitter<MdChipEvent>();

  /** Emitted when a chip is to be removed. */
  @Output('remove') onRemove = new EventEmitter<MdChipEvent>();

  constructor(protected _renderer: Renderer, protected _elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this._addDefaultCSSClass();
    this._updateColor(this._color);
  }

  ngOnDestroy(): void {
    this.destroy.emit({chip: this});
  }

  /** Whether or not the chip is disabled. */
  @Input() get disabled(): boolean {
    return this._disabled;
  }

  /** Sets the disabled state of the chip. */
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value) ? true : null;
  }

  /** A String representation of the current disabled state. */
  get _isAriaDisabled(): string {
    return String(coerceBooleanProperty(this.disabled));
  }

  /**
   * Whether or not the chips are selectable. When a chip is not selectable,
   * changes to it's selected state are always ignored.
   */
  @Input() get selectable(): boolean {
    return this._selectable;
  }

  set selectable(value: boolean) {
    this._selectable = coerceBooleanProperty(value);
  }

  /**
   * Determines whether or not the chip displays the remove styling and emits (remove) events.
   */
  @Input() get removable(): boolean {
    return this._removable;
  }

  set removable(value: boolean) {
    this._removable = coerceBooleanProperty(value);
    this._onRemovableChange.emit(this._removable);
  }

  /** Whether or not this chip is selected. */
  @Input() get selected(): boolean {
    return this._selected;
  }

  set selected(value: boolean) {
    this._selected = coerceBooleanProperty(value);

    if (this._selected) {
      this.select.emit({chip: this});
    } else {
      this.deselect.emit({chip: this});
    }
  }

  /** Toggles the current selected state of this chip. */
  toggleSelected(): boolean {
    this.selected = !this.selected;
    return this.selected;
  }

  /** The color of the chip. Can be `primary`, `accent`, or `warn`. */
  @Input() get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._updateColor(value);
  }

  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    this._renderer.invokeElementMethod(this._elementRef.nativeElement, 'focus');
    this.onFocus.emit({chip: this});
  }

  /**
   * Allows for programmatic removal of the chip. Called by the MdChipList when the DELETE or
   * BACKSPACE keys are pressed.
   *
   * Note: This only informs any listeners of the removal request, it does **not** actually remove
   * the chip from the DOM.
   */
  remove(): void {
    if (this.removable) {
      this.onRemove.emit({chip: this});
    }
  }

  /** Ensures events fire properly upon click. */
  _handleClick(event: Event) {
    // Check disabled
    if (this._checkDisabled(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.focus();
  }

  /** Handle custom key presses. */
  _handleKeydown(event: KeyboardEvent) {
    if (this._checkDisabled(event)) {
      return;
    }

    switch (event.keyCode) {
      case DELETE:
      case BACKSPACE:
        // If we are removable, remove the focused chip
        if (this.removable) {
          this.onRemove.emit();
        }

        // Always prevent so page navigation does not occur
        event.preventDefault();
        break;
      case SPACE:
        // If we are selectable, toggle the focused chip
        if (this.selectable) {
          this.toggleSelected();
        }

        // Always prevent space from scrolling the page since the list has focus
        event.preventDefault();
        break;
    }
  }

  /**
   * Sets whether or not this chip is displaying a remove icon. Adds/removes the
   * `md-chip-has-remove-icon` class.
   */
  _setHasRemoveIcon(value: boolean) {
    this._hasRemoveIcon = value;
  }

  protected _checkDisabled(event: Event): boolean {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }

    return this.disabled;
  }

  /** Initializes the appropriate CSS classes based on the chip type (basic or standard). */
  private _addDefaultCSSClass() {
    let el: HTMLElement = this._elementRef.nativeElement;

    // If we are a basic chip, also add the `mat-basic-chip` class for :not() targeting
    if (el.nodeName.toLowerCase() == 'mat-basic-chip' || el.hasAttribute('mat-basic-chip') ||
        el.nodeName.toLowerCase() == 'md-basic-chip' || el.hasAttribute('md-basic-chip')) {
      el.classList.add('mat-basic-chip');
    }
  }

  /** Updates the private _color variable and the native element. */
  private _updateColor(newColor: string) {
    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  /** Sets the mat-color on the native element. */
  private _setElementColor(color: string, isAdd: boolean) {
    if (color != null && color != '') {
      this._renderer.setElementClass(this._elementRef.nativeElement, `mat-${color}`, isAdd);
    }
  }
}
