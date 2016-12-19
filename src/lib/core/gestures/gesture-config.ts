import {Injectable, isDevMode} from '@angular/core';
import {HammerGestureConfig} from '@angular/platform-browser';

/* Adjusts configuration of our gesture library, Hammer. */
@Injectable()
export class GestureConfig extends HammerGestureConfig {
  private _hammer = typeof window !== 'undefined' ? (window as any).Hammer : null;

  /* List of new event names to add to the gesture support list */
  events: string[] = this._hammer ? [
    'longpress',
    'slide',
    'slidestart',
    'slideend',
    'slideright',
    'slideleft'
  ] : [];

  constructor() {
    super();

    if (!this._hammer && isDevMode()) {
      console.warn('Could not find HammerJS. Certain Angular Material may not work correctly.');
    }
  }

  /*
   * Builds Hammer instance manually to add custom recognizers that match the Material Design spec.
   *
   * Our gesture names come from the Material Design gestures spec:
   * https://www.google.com/design/spec/patterns/gestures.html#gestures-touch-mechanics
   *
   * More information on default recognizers can be found in Hammer docs:
   * http://hammerjs.github.io/recognizer-pan/
   * http://hammerjs.github.io/recognizer-press/
   *
   * TODO: Confirm threshold numbers with Material Design UX Team
   * */
  buildHammer(element: HTMLElement) {
    const mc: any = super.buildHammer(element);

    // Default Hammer Recognizers.
    let pan = new this._hammer.Pan();
    let swipe = new this._hammer.Swipe();
    let press = new this._hammer.Press();

    // Notice that a HammerJS recognizer can only depend on one other recognizer once.
    // Otherwise the previous `recognizeWith` will be dropped.
    let slide = this._createRecognizer(pan, {event: 'slide', threshold: 0}, swipe);
    let longpress = this._createRecognizer(press, {event: 'longpress', time: 500});

    // Overwrite the default `pan` event to use the swipe event.
    pan.recognizeWith(swipe);

    // Add customized gestures to Hammer manager
    mc.add([swipe, press, pan, slide, longpress]);

    return mc;
  }

  /** Creates a new recognizer, without affecting the default recognizers of HammerJS */
  private _createRecognizer(base: any, options: any, ...inheritances: any[]) {
    let recognizer = new base.constructor(options);

    inheritances.push(base);
    inheritances.forEach(item => recognizer.recognizeWith(item));

    return recognizer;
  }

}

/**
 * Stripped-down annotation to be used as alternative
 * to the one from HammerJS.
 * @docs-private
 */
export interface MdHammerEvent {
  preventDefault: () => {};
  deltaX: number;
  deltaY: number;
  center: {
    x: number;
    y: number;
  };
}
