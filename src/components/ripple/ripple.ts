import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer,
  SimpleChange,
  ViewEncapsulation,
} from '@angular/core';

enum RippleState {
  NEW,
  EXPANDING,
  FADING_OUT,
}

class Ripple {
  state = RippleState.NEW;
  constructor(public element: Element) {}
}

const RIPPLE_SPEED_PX_PER_SECOND = 500;
const MIN_RIPPLE_FILL_TIME_SECONDS = 0.2;
const MAX_RIPPLE_FILL_TIME_SECONDS = 0.6;

const sqr = (x: number) => x * x;

const distanceToFurthestCorner = (x: number, y: number, rect: ClientRect) => {
  const maxSquaredDistance = Math.max(
      sqr(x - rect.left) + sqr(y - rect.top),
      sqr(rect.right - x) + sqr(y - rect.top),
      sqr(x - rect.left) + sqr(rect.bottom - y),
      sqr(rect.right - x) + sqr(rect.bottom - y));
  return Math.sqrt(maxSquaredDistance);
};


@Component({
  moduleId: module.id,
  template: `<div class="md-ripple-background"></div>`,
  selector: 'md-ink-ripple',
  styleUrls: ['ripple.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdInkRipple implements OnInit, OnDestroy, OnChanges {
  /**
   * The element that triggers the ripple when click events are received. Defaults to the parent
   * of the <md-ink-rippple>.
   */
  @Input('trigger') trigger: Element;
  /**
   * Whether the ripple always originates from the center of the <md-ink-ripple> bounds rather
   * than originating from the location of the click event.
   */
  @Input('centered') centered: boolean;
  /**
   * Whether click events will not trigger the ripple. It can still be triggered by manually
   * calling start() and end().
   */
  @Input('disabled') disabled: boolean;
  /**
   * Custom color for ripples.
   */
  @Input('color') color: string;
  /**
   * Custom color for the ripple background.
   */
  @Input('backgroundColor') backgroundColor: string;
  /**
   * If set, the normal duration of ripple animations is divided by this value. For example,
   * setting it to 0.5 will cause the animations to take twice as long.
   */
  @Input('speedFactor') speedFactor: number = 1;

  /**
   * Whether the ripple background will be highlighted to indicated a focused state.
   */
  @HostBinding('class.md-ripple-focused') @Input('focused') focused: boolean;

  private _element: Element;
  /**
   * _triggerElement is the actual element that will cause a ripple to be created when clicked.
   * If the trigger input is set then it is that element, otherwise it is the parent element of
   * the <md-ink-ripple>.
   */
  private _triggerElement: Element;
  private _mouseDownHandler = (event: MouseEvent) => this.mouseDown(event);
  private _clickHandler = (event: MouseEvent) => this.click(event);
  private _mouseLeaveHandler = (event: MouseEvent) => this.mouseLeave(event);

  private _rippleContainer: Element;
  private _rippleBackground: Element;
  private _rippleManager: MdInkRippleManager;

  constructor(
      _elementRef: ElementRef,
      _renderer: Renderer) {
    this._element = _elementRef.nativeElement;
    this._rippleManager = new MdInkRippleManager(_renderer);
  }

  /** TODO: internal */
  ngOnInit() {
    this._rippleBackground = this._element.querySelector('.md-ripple-background');
    // If no trigger element was explicity set, use our parent.
    if (!this._triggerElement) {
      this._updateTriggerElement(this._element.parentElement);
    }
  }

  /** TODO: internal */
  ngOnDestroy() {
    // Remove event listeners on the trigger element.
    this._updateTriggerElement(null);
  }

  /** TODO: internal */
  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    // If the trigger element changed (or is being initially set), add event listeners to it.
    const changedInputs = Object.keys(changes);
    if (changedInputs.indexOf('trigger') !== -1) {
      const newTrigger = this.trigger || this._element.parentElement;
      this._updateTriggerElement(newTrigger);
    }
  }

  private _updateTriggerElement(newTrigger: Element) {
    if (this._triggerElement !== newTrigger) {
      if (this._triggerElement) {
        this._triggerElement.removeEventListener('mousedown', this._mouseDownHandler);
        this._triggerElement.removeEventListener('click', this._clickHandler);
        this._triggerElement.removeEventListener('mouseleave', this._mouseLeaveHandler);
      }
      this._triggerElement = newTrigger;
      if (this._triggerElement) {
        this._triggerElement.addEventListener('mousedown', this._mouseDownHandler);
        this._triggerElement.addEventListener('click', this._clickHandler);
        this._triggerElement.addEventListener('mouseleave', this._mouseLeaveHandler);
      }
    }
  }

  /**
   * Responds to the start of a ripple animation trigger by fading the background in.
   */
  start() {
    this._rippleManager.showRippleBackground(this._rippleBackground, this.backgroundColor);
  }

  /**
   * Responds to the end of a ripple animation trigger by fading the background out, and creating a
   * foreground ripple that expands from the event location (or from the center of the element if
   * the "centered" property is set or forceCenter is true).
   */
  end(left: number, top: number, forceCenter = true) {
    this._rippleManager.createForegroundRipple(
      this._element,
      left,
      top,
      this.color,
      this.centered || forceCenter,
      this.speedFactor,
      (ripple: Ripple, event: TransitionEvent) => this._rippleTransitionEnded(ripple, event));
    // Fade out the highlighted background.
    this._rippleManager.hideRippleBackground(this._rippleBackground);
  }

  private _rippleTransitionEnded(ripple: Ripple, event: TransitionEvent) {
    if (event.propertyName === 'opacity') {
      // If the ripple finished expanding, start fading it out. If it finished fading out,
      // remove it from the DOM.
      switch (ripple.state) {
        case RippleState.EXPANDING:
          this._rippleManager.fadeOutForegroundRipple(ripple.element);
          ripple.state = RippleState.FADING_OUT;
          break;
        case RippleState.FADING_OUT:
          this._rippleManager.removeRippleFromDom(ripple.element);
          break;
      }
    }
  }

  mouseDown(event: MouseEvent) {
    if (!this.disabled && event.button === 0) {
      this.start();
    }
  }

  click(event: MouseEvent) {
    if (!this.disabled && event.button === 0) {
      // If screen and page positions are all 0, this was probably triggered by a keypress.
      // In that case, use the center of the bounding rect as the ripple origin.
      // FIXME: This fails on IE11, which still sets pageX/Y and screenX/Y on keyboard clicks.
      const isKeyEvent =
          (event.screenX === 0 && event.screenY === 0 && event.pageX === 0 && event.pageY === 0);
      this.end(event.pageX, event.pageY, isKeyEvent);
    }
  }

  mouseLeave(event: MouseEvent) {
    // We can always fade out the background here; It's a no-op if it was already inactive.
    this._rippleManager.hideRippleBackground(this._rippleBackground);
  }

  // TODO: Reactivate the background div if the user drags out and back in.
}

/**
 * Helper service that performs DOM manipulations. Not intended to be used outside this module.
 * This will eventually become a custom renderer once Angular support exists.
 */
class MdInkRippleManager {
  constructor(private _renderer: Renderer) {}

  createForegroundRipple(
      container: Element,
      rippleOriginLeft: number,
      rippleOriginTop: number,
      color: string,
      centered: boolean,
      speedFactor: number,
      transitionEndCallback: (r: Ripple, e: TransitionEvent) => void) {
    const parentRect = container.getBoundingClientRect();
    // Create a foreground ripple div with the size and position of the fully expanded ripple.
    // When the div is created, it's given a transform style that causes the ripple to be displayed
    // small and centered on the event location (or the center of the bounding rect if the centered
    // input is true). Removing that transform causes the ripple to animate to its natural size.
    const startX = centered ? (parentRect.left + parentRect.width / 2) : rippleOriginLeft;
    const startY = centered ? (parentRect.top + parentRect.height / 2) : rippleOriginTop;
    const offsetX = startX - parentRect.left;
    const offsetY = startY - parentRect.top;
    const maxRadius = distanceToFurthestCorner(startX, startY, parentRect);

    const rippleDiv = this._renderer.createElement(container, 'div', null);
    this._renderer.setElementClass(rippleDiv, 'md-ripple-foreground', true);
    this._renderer.setElementStyle(rippleDiv, 'left', (offsetX - maxRadius) + 'px');
    this._renderer.setElementStyle(rippleDiv, 'top', (offsetY - maxRadius) + 'px');
    this._renderer.setElementStyle(rippleDiv, 'width', (2 * maxRadius) + 'px');
    this._renderer.setElementStyle(rippleDiv, 'height', (2 * maxRadius) + 'px');
    // If color input is not set, this will default to the background color defined in CSS.
    this._renderer.setElementStyle(rippleDiv, 'background-color', color);

    const translateX = offsetX - parentRect.width / 2;
    const translateY = offsetY - parentRect.height / 2;
    this._renderer.setElementStyle(rippleDiv,
        'transform', `scale(0.01) translate(${translateX}px, ${translateY}px)`);

    const fadeInSeconds = (1 / (speedFactor || 1)) * Math.max(
        MIN_RIPPLE_FILL_TIME_SECONDS,
        Math.min(MAX_RIPPLE_FILL_TIME_SECONDS, maxRadius / RIPPLE_SPEED_PX_PER_SECOND));
    this._renderer.setElementStyle(rippleDiv, 'transition-duration', `${fadeInSeconds}s`);

    // https://timtaubert.de/blog/2012/09/css-transitions-for-dynamically-created-dom-elements/
    window.getComputedStyle(rippleDiv).opacity;

    this._renderer.setElementClass(rippleDiv, 'md-ripple-fade-in', true);
    // Clearing the transform property causes the ripple to animate to its full size.
    this._renderer.setElementStyle(rippleDiv, 'transform', '');
    const ripple = new Ripple(rippleDiv);
    ripple.state = RippleState.EXPANDING;

    this._renderer.listen(rippleDiv, 'transitionend',
        (event: TransitionEvent) => transitionEndCallback(ripple, event));
  }

  fadeOutForegroundRipple(ripple: Element) {
    this._renderer.setElementClass(ripple, 'md-ripple-fade-in', false);
    this._renderer.setElementClass(ripple, 'md-ripple-fade-out', true);
  }

  removeRippleFromDom(ripple: Element) {
    ripple.parentElement.removeChild(ripple);
  }

  showRippleBackground(rippleBackground: Element, color: string) {
    this._renderer.setElementClass(rippleBackground, 'md-ripple-active', true);
    // If color is not set, this will default to the background color defined in CSS.
    this._renderer.setElementStyle(rippleBackground, 'background-color', color);
  }

  hideRippleBackground(rippleBackground: Element) {
    this._renderer.setElementClass(rippleBackground, 'md-ripple-active', false);
  }
}
