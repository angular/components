import {
  ElementRef,
} from '@angular/core';

/** TODO: internal */
export enum ForegroundRippleState {
  NEW,
  EXPANDING,
  FADING_OUT,
}

/**
 * Wrapper for a foreground ripple DOM element and its animation state.
 * TODO: internal
 */
export class ForegroundRipple {
  state = ForegroundRippleState.NEW;
  constructor(public rippleElement: Element) {}
}

const RIPPLE_SPEED_PX_PER_SECOND = 1000;
const MIN_RIPPLE_FILL_TIME_SECONDS = 0.1;
const MAX_RIPPLE_FILL_TIME_SECONDS = 0.3;

const sqr = (x: number) => x * x;

/**
 * Returns the distance from the point (x, y) to the furthest corner of a rectangle.
 */
const distanceToFurthestCorner = (x: number, y: number, rect: ClientRect) => {
  const maxSquaredDistance = Math.max(
      sqr(x - rect.left) + sqr(y - rect.top),
      sqr(rect.right - x) + sqr(y - rect.top),
      sqr(x - rect.left) + sqr(rect.bottom - y),
      sqr(rect.right - x) + sqr(rect.bottom - y));
  return Math.sqrt(maxSquaredDistance);
};

/**
 * Helper service that performs DOM manipulations. Not intended to be used outside this module.
 * The constructor takes a reference to the <md-ink-ripple> element and a map of DOM event handlers
 * to be installed on the element that triggers ripple animations.
 * This will eventually become a custom renderer once Angular support exists.
 * TODO: internal
 */
export class RippleRenderer {
  private _rippleElement: Element;
  private _triggerElement: Element;

  constructor(_elementRef: ElementRef, private _eventHandlers: Map<string, (e: Event) => void>) {
    this._rippleElement = _elementRef.nativeElement;
  }

  /**
   * Installs event handlers on the given trigger element, and removes event handlers from the
   * previous trigger if needed.
   */
  setTriggerElement(newTrigger: Element) {
    if (this._triggerElement !== newTrigger) {
      if (this._triggerElement) {
        this._eventHandlers.forEach((eventHandler, eventName) => {
          this._triggerElement.removeEventListener(eventName, eventHandler);
        });
      }
      this._triggerElement = newTrigger;
      if (this._triggerElement) {
        this._eventHandlers.forEach((eventHandler, eventName) => {
          this._triggerElement.addEventListener(eventName, eventHandler);
        });
      }
    }
  }

  /**
   * Installs event handlers on the parent of the <md-ink-ripple> element.
   */
  setTriggerElementToParent() {
    this.setTriggerElement(this._rippleElement.parentElement);
  }

  /**
   * Removes event handlers from the current trigger element if needed.
   */
  clearTriggerElement() {
    this.setTriggerElement(null);
  }

  /**
   * Creates a foreground ripple and sets its animation to expand and fade in from the position
   * given by rippleOriginLeft and rippleOriginTop (or from the center of the <md-ink-ripple>
   * bounding rect if centered is true).
   */
  createForegroundRipple(
      rippleOriginLeft: number,
      rippleOriginTop: number,
      color: string,
      centered: boolean,
      radius: number,
      speedFactor: number,
      transitionEndCallback: (r: ForegroundRipple, e: TransitionEvent) => void) {
    const parentRect = this._rippleElement.getBoundingClientRect();
    // Create a foreground ripple div with the size and position of the fully expanded ripple.
    // When the div is created, it's given a transform style that causes the ripple to be displayed
    // small and centered on the event location (or the center of the bounding rect if the centered
    // argument is true). Removing that transform causes the ripple to animate to its natural size.
    const startX = centered ? (parentRect.left + parentRect.width / 2) : rippleOriginLeft;
    const startY = centered ? (parentRect.top + parentRect.height / 2) : rippleOriginTop;
    const offsetX = startX - parentRect.left;
    const offsetY = startY - parentRect.top;
    const maxRadius = radius > 0 ? radius : distanceToFurthestCorner(startX, startY, parentRect);

    const rippleDiv = document.createElement('div');
    this._rippleElement.appendChild(rippleDiv);
    rippleDiv.classList.add('md-ripple-foreground');
    rippleDiv.style.left = `${offsetX - maxRadius}px`;
    rippleDiv.style.top = `${offsetY - maxRadius}px`;
    rippleDiv.style.width = `${2 * maxRadius}px`;
    rippleDiv.style.height = rippleDiv.style.width;
    // If color input is not set, this will default to the background color defined in CSS.
    rippleDiv.style.backgroundColor = color;
    // Start the ripple tiny.
    rippleDiv.style.transform = `scale(0.001)`;

    const fadeInSeconds = (1 / (speedFactor || 1)) * Math.max(
        MIN_RIPPLE_FILL_TIME_SECONDS,
        Math.min(MAX_RIPPLE_FILL_TIME_SECONDS, maxRadius / RIPPLE_SPEED_PX_PER_SECOND));
    rippleDiv.style.transitionDuration = `${fadeInSeconds}s`;

    // https://timtaubert.de/blog/2012/09/css-transitions-for-dynamically-created-dom-elements/
    window.getComputedStyle(rippleDiv).opacity;

    rippleDiv.classList.add('md-ripple-fade-in');
    // Clearing the transform property causes the ripple to animate to its full size.
    rippleDiv.style.transform = '';
    const ripple = new ForegroundRipple(rippleDiv);
    ripple.state = ForegroundRippleState.EXPANDING;

    rippleDiv.addEventListener('transitionend',
        (event: TransitionEvent) => transitionEndCallback(ripple, event));
  }

  /**
   * Fades out a foreground ripple after it has fully expanded and faded in.
   */
  fadeOutForegroundRipple(ripple: Element) {
    ripple.classList.remove('md-ripple-fade-in');
    ripple.classList.add('md-ripple-fade-out');
  }

  /**
   * Removes a foreground ripple from the DOM after it has faded out.
   */
  removeRippleFromDom(ripple: Element) {
    ripple.parentElement.removeChild(ripple);
  }

  /**
   * Fades in the <md-ink-ripple> background.
   */
  fadeInRippleBackground(color: string) {
    const background = <HTMLElement>this._rippleElement.querySelector('.md-ripple-background');
    background.classList.add('md-ripple-active');
    // If color is not set, this will default to the background color defined in CSS.
    background.style.backgroundColor = color;
  }

  /**
   * Fades out the <md-ink-ripple> background.
   */
  fadeOutRippleBackground() {
    const background = <HTMLElement>this._rippleElement.querySelector('.md-ripple-background');
    background.classList.remove('md-ripple-active');
  }
}
