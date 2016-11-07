import {Directive, Output, EventEmitter, Renderer, ElementRef, Input} from '@angular/core';
import {ENTER} from '../core/keyboard/keycodes';

export interface MdChipInputEvent {
  input: HTMLInputElement;
  value: string;
}

@Directive({
  selector: '[mdChipInput], [matChipInput]',
  host: {
    '(keydown)': '_keydown($event)',
    '(blur)': '_blur()'
  }
})
export class MdChipInput {

  /**
   * Whether or not the chipAdded event will be emitted when the input is blurred.
   *
   * Default `false`.
   */
  @Input() addOnBlur = false;

  /**
   * The list of key codes that will trigger a chipAdded event.
   *
   * Defaults to `[ENTER]`.
   */
  @Input() separatorKeys: number[] = [ENTER];

  /** Emitted when a chip is to be added. */
  @Output() chipAdded = new EventEmitter<MdChipInputEvent>();

  /** The native input element to which this directive is attached. */
  protected _inputElement: HTMLInputElement;

  constructor(protected _renderer: Renderer, protected _elementRef: ElementRef) {
    this._inputElement = this._elementRef.nativeElement as HTMLInputElement;
  }

  /**
   * Utility method to make host definition/tests more clear.
   *
   * @private
   */
  _keydown(event?: KeyboardEvent) {
    this._add(event);
  }

  /**
   * Checks to see if the blur should emit the (chipAdded) event.
   *
   * @private
   */
  _blur() {
    if (this.addOnBlur) {
      this._add();
    }
  }

  /**
   * Checks to see if the (chipAdded) event needs to be emitted.
   *
   * @private
   */
  _add(event?: KeyboardEvent) {
    if (!event || this.separatorKeys.indexOf(event.keyCode) > -1) {
      this.chipAdded.emit({ input: this._inputElement, value: this._inputElement.value });

      if (event) {
        event.preventDefault();
      }
    }
  }
}
