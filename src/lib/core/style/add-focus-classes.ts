import {Directive, Injectable, Optional, SkipSelf} from '@angular/core';


/** Singleton that allows all instances of CdkAddFocusClasses to share document event listeners. */
@Injectable()
export class CdkFocusCauseDetector {
  /** Whether a keydown event has just occurred. */
  get keydownOccurred() { return this._keydownOccurred; }
  private _keydownOccurred = false;

  get mousedownOccurred() { return this._mousedownOccurred; }
  private _mousedownOccurred = false;

  constructor() {
    document.addEventListener('keydown', () => {
      this._keydownOccurred = true;
      setTimeout(() => this._keydownOccurred = false, 0);
    }, true);

    document.addEventListener('mousedown', () => {
      this._mousedownOccurred = true;
      setTimeout(() => this._mousedownOccurred = false, 0);
    }, true);
  }
}


/**
 * Directive that determines how a particular element was focused (via keyboard, mouse, or
 * programmatically) and adds corresponding classes to the element.
 */
@Directive({
  selector: '[cdkAddFocusClasses]',
  host: {
    '[class.cdk-focused]': 'keyboardFocused || mouseFocused || programmaticallyFocused',
    '[class.cdk-keyboard-focused]': 'keyboardFocused',
    '[class.cdk-mouse-focused]': 'mouseFocused',
    '[class.cdk-programmatically-focused]': 'programmaticallyFocused',
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()',
  }
})
export class CdkAddFocusClasses {
  /** Whether the elmenet is focused due to a keyboard event. */
  keyboardFocused = false;

  /** Whether the element is focused due to a mouse event. */
  mouseFocused = false;

  /** Whether the has been programmatically focused. */
  programmaticallyFocused = false;

  constructor(private _focusCauseDetector: CdkFocusCauseDetector) {}

  /** Handles focus event on the element. */
  _onFocus() {
    this.keyboardFocused = this._focusCauseDetector.keydownOccurred;
    this.mouseFocused = this._focusCauseDetector.mousedownOccurred;
    this.programmaticallyFocused = !this.keyboardFocused && !this.mouseFocused;
  }

  /** Handles blur event on the element. */
  _onBlur() {
    this.keyboardFocused = this.mouseFocused = this.programmaticallyFocused = false;
  }
}


export function FOCUS_CAUSE_DETECTOR_PROVIDER_FACTORY(
    parentDispatcher: CdkFocusCauseDetector) {
  return parentDispatcher || new CdkFocusCauseDetector();
}


export const FOCUS_CAUSE_DETECTOR_PROVIDER = {
  // If there is already a CdkFocusCauseDetector available, use that. Otherwise, provide a new one.
  provide: CdkFocusCauseDetector,
  deps: [[new Optional(), new SkipSelf(), CdkFocusCauseDetector]],
  useFactory: FOCUS_CAUSE_DETECTOR_PROVIDER_FACTORY
};
