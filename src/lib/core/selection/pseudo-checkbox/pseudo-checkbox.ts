import {
  Component,
  Input,
  Renderer,
  ElementRef,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';

export type MdPseudoCheckboxState = 'unchecked' | 'checked' | 'indeterminate';

/**
 * Represents the different states that require custom transitions between them.
 * @docs-private
 */
export enum TransitionCheckState {
  /** The initial state of the component before any user interaction. */
  Init,
  /** The state representing the component when it's becoming checked. */
  Checked,
  /** The state representing the component when it's becoming unchecked. */
  Unchecked,
  /** The state representing the component when it's becoming indeterminate. */
  Indeterminate
}

/**
 * Represents a check box, without any of the underlying form control functionality.
 * Intended to be used for composing other components.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  encapsulation: ViewEncapsulation.None,
  selector: 'md-pseudo-checkbox',
  styleUrls: ['pseudo-checkbox.css'],
  templateUrl: 'pseudo-checkbox.html',
  host: {
    '[class.md-pseudo-checkbox-indeterminate]': 'indeterminate',
    '[class.md-pseudo-checkbox-checked]': 'checked',
    '[class.md-pseudo-checkbox-disabled]': 'disabled',
  },
})
export class MdPseudoCheckbox {
  constructor(
    private _renderer: Renderer,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef) {

    this.color = 'accent';
  }

  @Input() disabled: boolean = false;

  @Input()
  get checked() { return this._checked; }
  set checked(checked: boolean) {
    if (checked != this.checked) {
      this._indeterminate = false;
      this._checked = checked;
      this._transitionCheckState(
          this._checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
      this._changeDetectorRef.markForCheck();
    }
  }

  @Input()
  get indeterminate() { return this._indeterminate; }
  set indeterminate(indeterminate: boolean) {
    this._indeterminate = indeterminate;
    if (this._indeterminate) {
      this._transitionCheckState(TransitionCheckState.Indeterminate);
    } else {
      this._transitionCheckState(
          this.checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
    }
  }

  /** The color of the button. Can be `primary`, `accent`, or `warn`. */
  @Input()
  get color(): string { return this._color; }
  set color(value: string) { this._updateColor(value); }

  private _checked: boolean = false;

  private _indeterminate: boolean = false;

  private _currentCheckState: TransitionCheckState = TransitionCheckState.Init;

  private _currentAnimationClass: string = '';

  private _color: string;

  private _transitionCheckState(newState: TransitionCheckState) {
    let oldState = this._currentCheckState;
    let renderer = this._renderer;
    let elementRef = this._elementRef;

    if (oldState === newState) {
      return;
    }
    if (this._currentAnimationClass.length > 0) {
      renderer.setElementClass(elementRef.nativeElement, this._currentAnimationClass, false);
    }

    this._currentAnimationClass = this._getAnimationClassForCheckStateTransition(
        oldState, newState);
    this._currentCheckState = newState;

    if (this._currentAnimationClass.length > 0) {
      renderer.setElementClass(elementRef.nativeElement, this._currentAnimationClass, true);
    }
  }

  private _getAnimationClassForCheckStateTransition(
      oldState: TransitionCheckState, newState: TransitionCheckState): string {
    var animSuffix: string;

    switch (oldState) {
    case TransitionCheckState.Init:
      // Handle edge case where user interacts with checkbox that does not have [(ngModel)] or
      // [checked] bound to it.
      if (newState === TransitionCheckState.Checked) {
        animSuffix = 'unchecked-checked';
      } else {
        return '';
      }
      break;
    case TransitionCheckState.Unchecked:
      animSuffix = newState === TransitionCheckState.Checked ?
          'unchecked-checked' : 'unchecked-indeterminate';
      break;
    case TransitionCheckState.Checked:
      animSuffix = newState === TransitionCheckState.Unchecked ?
          'checked-unchecked' : 'checked-indeterminate';
      break;
    case TransitionCheckState.Indeterminate:
      animSuffix = newState === TransitionCheckState.Checked ?
          'indeterminate-checked' : 'indeterminate-unchecked';
    }

    return `md-pseudo-checkbox-anim-${animSuffix}`;
  }

  private _updateColor(newColor: string) {
    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  private _setElementColor(color: string, isAdd: boolean) {
    if (color != null && color != '') {
      this._renderer.setElementClass(this._elementRef.nativeElement, `md-${color}`, isAdd);
    }
  }
}
