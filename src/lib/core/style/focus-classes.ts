import {Directive, Injectable, Optional, SkipSelf, Renderer, ElementRef} from '@angular/core';


export type FocusOrigin = 'mouse' | 'keyboard' | 'programmatic';


/** Monitors mouse and keyboard events to determine the cause of focus events. */
@Injectable()
export class FocusOriginMonitor {
  /** Whether a keydown event has just occurred. */
  private _keydownOccurred = false;

  /** Whether a mousedown event has just occurred. */
  private _mousedownOccurred = false;

  /** The focus origin that we're pretending the next focus event is a result of. */
  private _fakeOrigin: FocusOrigin = null;

  /** A function to clear the fake origin. */
  private _clearFakeOrigin = (): void => {
    setTimeout(() => this._fakeOrigin = null, 0);
    document.removeEventListener('focus', this._clearFakeOrigin, true);
  };

  constructor() {
    // Listen to keydown and mousedown in the capture phase so we can detect them even if the user
    // stops propagation.
    // TODO(mmalerba): Figure out how to handle touchstart
    document.addEventListener('keydown', () => {
      this._keydownOccurred = true;
      setTimeout(() => this._keydownOccurred = false, 0);
    }, true);

    document.addEventListener('mousedown', () => {
      this._mousedownOccurred = true;
      setTimeout(() => this._mousedownOccurred = false, 0);
    }, true);
  }

  /** Register an element to receive focus classes. */
  registerElementForFocusClasses(element: Element, renderer: Renderer) {
    renderer.listen(element, 'focus', () => {
      let isKeyboard = this._fakeOrigin ? this._fakeOrigin === 'keyboard' : this._keydownOccurred;
      let isMouse = this._fakeOrigin ? this._fakeOrigin === 'mouse' : this._mousedownOccurred;
      let isProgrammatic = this._fakeOrigin ?
          this._fakeOrigin === 'programmatic' : !this._keydownOccurred && !this._mousedownOccurred;

      renderer.setElementClass(element, 'cdk-focused', true);
      renderer.setElementClass(element, 'cdk-keyboard-focused', isKeyboard);
      renderer.setElementClass(element, 'cdk-mouse-focused', isMouse);
      renderer.setElementClass(element, 'cdk-programmatically-focused', isProgrammatic);
    });

    renderer.listen(element, 'blur', () => {
      renderer.setElementClass(element, 'cdk-focused', false);
      renderer.setElementClass(element, 'cdk-keyboard-focused', false);
      renderer.setElementClass(element, 'cdk-mouse-focused', false);
      renderer.setElementClass(element, 'cdk-programmatically-focused', false);
    });
  }

  /** Focuses the element via the specified focus origin. */
  focusVia(element: Node, renderer: Renderer, focusOrigin: FocusOrigin) {
    this._fakeOrigin = focusOrigin;
    document.addEventListener('focus', this._clearFakeOrigin, true);
    renderer.invokeElementMethod(element, 'focus');
  }
}


/**
 * Directive that determines how a particular element was focused (via keyboard, mouse, or
 * programmatically) and adds corresponding classes to the element.
 */
@Directive({
  selector: '[cdkFocusClasses]',
})
export class CdkFocusClasses {
  constructor(elementRef: ElementRef, focusOriginMonitor: FocusOriginMonitor, renderer: Renderer) {
    focusOriginMonitor.registerElementForFocusClasses(elementRef.nativeElement, renderer);
  }
}


export function FOCUS_ORIGIN_MONITOR_PROVIDER_FACTORY(parentDispatcher: FocusOriginMonitor) {
  return parentDispatcher || new FocusOriginMonitor();
}


export const FOCUS_ORIGIN_MONITOR_PROVIDER = {
  // If there is already a FocusOriginMonitor available, use that. Otherwise, provide a new one.
  provide: FocusOriginMonitor,
  deps: [[new Optional(), new SkipSelf(), FocusOriginMonitor]],
  useFactory: FOCUS_ORIGIN_MONITOR_PROVIDER_FACTORY
};
