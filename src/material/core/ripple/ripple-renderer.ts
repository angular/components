/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ElementRef, NgZone} from '@angular/core';
import {Platform, normalizePassiveListenerOptions, _getEventTarget} from '@angular/cdk/platform';
import {isFakeMousedownFromScreenReader, isFakeTouchstartFromScreenReader} from '@angular/cdk/a11y';
import {coerceElement} from '@angular/cdk/coercion';
import {RippleRef, RippleState, RippleConfig} from './ripple-ref';
import {RippleEventManager} from './ripple-event-manager';

/**
 * Interface that describes the target for launching ripples.
 * It defines the ripple configuration and disabled state for interaction ripples.
 * @docs-private
 */
export interface RippleTarget {
  /** Configuration for ripples that are launched on pointer down. */
  rippleConfig: RippleConfig;
  /** Whether ripples on pointer down should be disabled. */
  rippleDisabled: boolean;
}

/** Interfaces the defines ripple element transition event listeners. */
interface RippleEventListeners {
  onTransitionEnd: EventListener;
  onTransitionCancel: EventListener;
  fallbackTimer: ReturnType<typeof setTimeout> | null;
}

/**
 * Default ripple animation configuration for ripples without an explicit
 * animation config specified.
 */
export const defaultRippleAnimationConfig = {
  enterDuration: 450,
  exitDuration: 375,
};

/**
 * Timeout for ignoring mouse events. Mouse events will be temporary ignored after touch
 * events to avoid synthetic mouse events.
 */
const ignoreMouseEventsTimeout = 800;

/** Options used to bind a passive capturing event. */
const passiveCapturingEventOptions = normalizePassiveListenerOptions({
  passive: true,
  capture: true,
});

/** Events that signal that the pointer is down. */
const pointerDownEvents = ['mousedown', 'touchstart'];

/** Events that signal that the pointer is up. */
const pointerUpEvents = ['mouseup', 'mouseleave', 'touchend', 'touchcancel'];

const PRESSED_OPACITY = 0.12;
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
const SOFT_EDGE_MINIMUM_SIZE = 75;
const SOFT_EDGE_CONTAINER_RATIO = 0.35;

/**
 * Helper service that performs DOM manipulations. Not intended to be used outside this module.
 * The constructor takes a reference to the ripple directive's host element and a map of DOM
 * event handlers to be installed on the element that triggers ripple animations.
 * This will eventually become a custom renderer once Angular support exists.
 * @docs-private
 */
export class RippleRenderer implements EventListenerObject {
  /** Element where the ripples are being added to. */
  private _containerElement: HTMLElement;

  /** Element which triggers the ripple elements on mouse events. */
  private _triggerElement: HTMLElement | null;

  /** Whether the pointer is currently down or not. */
  private _isPointerDown = false;

  /**
   * Map of currently active ripple references.
   * The ripple reference is mapped to its element event listeners.
   * The reason why `| null` is used is that event listeners are added only
   * when the condition is truthy (see the `_startFadeOutTransition` method).
   */
  private _activeRipples = new Map<RippleRef, RippleEventListeners | null>();

  /** Latest non-persistent ripple that was triggered. */
  private _mostRecentTransientRipple: RippleRef | null;

  /** Time in milliseconds when the last touchstart event happened. */
  private _lastTouchStartEvent: number;

  /** Whether pointer-up event listeners have been registered. */
  private _pointerUpEventsRegistered = false;

  /**
   * Cached dimensions of the ripple container. Set when the first
   * ripple is shown and cleared once no more ripples are visible.
   */
  private _containerRect: DOMRect | null;

  private static _eventManager = new RippleEventManager();

  constructor(
    private _target: RippleTarget,
    private _ngZone: NgZone,
    elementOrElementRef: HTMLElement | ElementRef<HTMLElement>,
    private _platform: Platform,
  ) {
    // Only do anything if we're on the browser.
    if (_platform.isBrowser) {
      this._containerElement = coerceElement(elementOrElementRef);
    }
  }

  /**
   * Fades in a ripple at the given coordinates.
   * @param x Coordinate within the element, along the X axis at which to start the ripple.
   * @param y Coordinate within the element, along the Y axis at which to start the ripple.
   * @param config Extra ripple options.
   */
  fadeInRipple(x: number, y: number, config: RippleConfig = {}): RippleRef {
    const containerRect = (this._containerRect =
      this._containerRect || this._containerElement.getBoundingClientRect());
    const animationConfig = {...defaultRippleAnimationConfig, ...config.animation};

    const radius = config.radius || distanceToFurthestCorner(x, y, containerRect);
    const { height, width } = containerRect;
    const maxDim = Math.max(height, width);
    const softEdgeSize = Math.max(
      SOFT_EDGE_CONTAINER_RATIO * maxDim,
      SOFT_EDGE_MINIMUM_SIZE,
    );

    const initialSize = Math.floor(maxDim * INITIAL_ORIGIN_SCALE);
    const hypotenuse = radius * 2;
    const maxRadius = hypotenuse + PADDING;

    const rippleScale = `${(maxRadius + softEdgeSize) / initialSize}`;
    const rippleSize = `${initialSize}px`;

    const endPoint = {
      x: (width - initialSize) / 2,
      y: (height - initialSize) / 2,
    };

    let startPoint;
    if (config.centered) {
      startPoint = endPoint;
    } else {
      startPoint = {
        x: (x - containerRect.left) - initialSize / 2,
        y: (y - containerRect.top) - initialSize / 2
      };
    }

    const enterDuration = animationConfig.enterDuration;

    const ripple = document.createElement('div');
    ripple.classList.add('mat-ripple-element');

    ripple.style.transition = ``;
    ripple.style.opacity = "0";
    ripple.style.left = `0px`;
    ripple.style.top = `0px`;
    ripple.style.height = `${rippleSize}`;
    ripple.style.width = `${rippleSize}`;
    ripple.style.transform = `translate(${startPoint.x}px, ${startPoint.y}px) scale(1)`;

    // If a custom color has been specified, set it as inline style. If no color is
    // set, the default color will be applied through the ripple theme styles.
    if (config.color != null) {
      ripple.style.background = `radial-gradient(closest-side, ${config.color} ` +
        `max(calc(100% - 70px), 65%), transparent 100%)`;
    }

    ripple.style.transition =
      `opacity 105ms linear, transform ${enterDuration}ms cubic-bezier(0.2, 0, 0, 1)`;

    this._containerElement.appendChild(ripple);

    // By default the browser does not recalculate the styles of dynamically created
    // ripple elements. This is critical to ensure that the `scale` animates properly.
    // We enforce a style recalculation by calling `getComputedStyle` and *accessing* a property.
    // See: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
    const computedStyles = window.getComputedStyle(ripple);
    const userTransitionProperty = computedStyles.transitionProperty;
    const userTransitionDuration = computedStyles.transitionDuration;

    // Note: We detect whether animation is forcibly disabled through CSS (e.g. through
    // `transition: none` or `display: none`). This is technically unexpected since animations are
    // controlled through the animation config, but this exists for backwards compatibility. This
    // logic does not need to be super accurate since it covers some edge cases which can be easily
    // avoided by users.
    const animationForciblyDisabledThroughCss =
      userTransitionProperty === 'none' ||
      // Note: The canonical unit for serialized CSS `<time>` properties is seconds. Additionally
      // some browsers expand the duration for every property (in our case `opacity` and `transform`).
      userTransitionDuration === '0s' ||
      userTransitionDuration === '0s, 0s' ||
      // If the container is 0x0, it's likely `display: none`.
      (containerRect.width === 0 && containerRect.height === 0);

    // Exposed reference to the ripple that will be returned.
    const rippleRef = new RippleRef(this, ripple, config, animationForciblyDisabledThroughCss);

    ripple.style.transform = 
      `translate(${endPoint.x}px, ${endPoint.y}px) scale(${rippleScale})`;
    ripple.style.opacity = `${PRESSED_OPACITY}`;

    rippleRef.state = RippleState.FADING_IN;

    if (!config.persistent) {
      this._mostRecentTransientRipple = rippleRef;
    }

    let eventListeners: RippleEventListeners | null = null;

    // Do not register the `transition` event listener if fade-in and fade-out duration
    // are set to zero. The events won't fire anyway and we can save resources here.
    if (!animationForciblyDisabledThroughCss && (enterDuration || animationConfig.exitDuration)) {
      this._ngZone.runOutsideAngular(() => {
        const onTransitionEnd = () => {
          // Clear the fallback timer since the transition fired correctly.
          if (eventListeners) {
            eventListeners.fallbackTimer = null;
          }
          clearTimeout(fallbackTimer);
          this._finishRippleTransition(rippleRef);
        };
        const onTransitionCancel = () => this._destroyRipple(rippleRef);

        // In some cases where there's a higher load on the browser, it can choose not to dispatch
        // neither `transitionend` nor `transitioncancel` (see b/227356674). This timer serves as a
        // fallback for such cases so that the ripple doesn't become stuck. We add a 100ms buffer
        // because timers aren't precise. Note that another approach can be to transition the ripple
        // to the `VISIBLE` state immediately above and to `FADING_IN` afterwards inside
        // `transitionstart`. We go with the timer because it's one less event listener and
        // it's less likely to break existing tests.
        const fallbackTimer = setTimeout(onTransitionCancel, enterDuration + 100);

        ripple.addEventListener('transitionend', onTransitionEnd);
        // If the transition is cancelled (e.g. due to DOM removal), we destroy the ripple
        // directly as otherwise we would keep it part of the ripple container forever.
        // https://www.w3.org/TR/css-transitions-1/#:~:text=no%20longer%20in%20the%20document.
        ripple.addEventListener('transitioncancel', onTransitionCancel);
        eventListeners = {onTransitionEnd, onTransitionCancel, fallbackTimer};
      });
    }

    // Add the ripple reference to the list of all active ripples.
    this._activeRipples.set(rippleRef, eventListeners);

    // In case there is no fade-in transition duration, we need to manually call the transition
    // end listener because `transitionend` doesn't fire if there is no transition.
    if (animationForciblyDisabledThroughCss || !enterDuration) {
      this._finishRippleTransition(rippleRef);
    }

    return rippleRef;
  }

  /** Fades out a ripple reference. */
  fadeOutRipple(rippleRef: RippleRef) {
    // For ripples already fading out or hidden, this should be a noop.
    if (rippleRef.state === RippleState.FADING_OUT || rippleRef.state === RippleState.HIDDEN) {
      return;
    }

    const rippleEl = rippleRef.element;
    const animationConfig = {...defaultRippleAnimationConfig, ...rippleRef.config.animation};

    // This starts the fade-out transition and will fire the transition end listener that
    // removes the ripple element from the DOM.
    rippleEl.style.transitionDuration = `${animationConfig.exitDuration}ms`;
    rippleEl.style.opacity = '0';
    rippleRef.state = RippleState.FADING_OUT;

    // In case there is no fade-out transition duration, we need to manually call the
    // transition end listener because `transitionend` doesn't fire if there is no transition.
    if (rippleRef._animationForciblyDisabledThroughCss || !animationConfig.exitDuration) {
      this._finishRippleTransition(rippleRef);
    }
  }

  /** Fades out all currently active ripples. */
  fadeOutAll() {
    this._getActiveRipples().forEach(ripple => ripple.fadeOut());
  }

  /** Fades out all currently active non-persistent ripples. */
  fadeOutAllNonPersistent() {
    this._getActiveRipples().forEach(ripple => {
      if (!ripple.config.persistent) {
        ripple.fadeOut();
      }
    });
  }

  /** Sets up the trigger event listeners */
  setupTriggerEvents(elementOrElementRef: HTMLElement | ElementRef<HTMLElement>) {
    const element = coerceElement(elementOrElementRef);

    if (!this._platform.isBrowser || !element || element === this._triggerElement) {
      return;
    }

    // Remove all previously registered event listeners from the trigger element.
    this._removeTriggerEvents();
    this._triggerElement = element;

    // Use event delegation for the trigger events since they're
    // set up during creation and are performance-sensitive.
    pointerDownEvents.forEach(type => {
      RippleRenderer._eventManager.addHandler(this._ngZone, type, element, this);
    });
  }

  /**
   * Handles all registered events.
   * @docs-private
   */
  handleEvent(event: Event) {
    if (event.type === 'mousedown') {
      this._onMousedown(event as MouseEvent);
    } else if (event.type === 'touchstart') {
      this._onTouchStart(event as TouchEvent);
    } else {
      this._onPointerUp();
    }

    // If pointer-up events haven't been registered yet, do so now.
    // We do this on-demand in order to reduce the total number of event listeners
    // registered by the ripples, which speeds up the rendering time for large UIs.
    if (!this._pointerUpEventsRegistered) {
      // The events for hiding the ripple are bound directly on the trigger, because:
      // 1. Some of them occur frequently (e.g. `mouseleave`) and any advantage we get from
      // delegation will be diminished by having to look through all the data structures often.
      // 2. They aren't as performance-sensitive, because they're bound only after the user
      // has interacted with an element.
      this._ngZone.runOutsideAngular(() => {
        pointerUpEvents.forEach(type => {
          this._triggerElement!.addEventListener(type, this, passiveCapturingEventOptions);
        });
      });

      this._pointerUpEventsRegistered = true;
    }
  }

  /** Method that will be called if the fade-in or fade-in transition completed. */
  private _finishRippleTransition(rippleRef: RippleRef) {
    if (rippleRef.state === RippleState.FADING_IN) {
      this._startFadeOutTransition(rippleRef);
    } else if (rippleRef.state === RippleState.FADING_OUT) {
      this._destroyRipple(rippleRef);
    }
  }

  /**
   * Starts the fade-out transition of the given ripple if it's not persistent and the pointer
   * is not held down anymore.
   */
  private _startFadeOutTransition(rippleRef: RippleRef) {
    const isMostRecentTransientRipple = rippleRef === this._mostRecentTransientRipple;
    const {persistent} = rippleRef.config;

    rippleRef.state = RippleState.VISIBLE;

    // When the timer runs out while the user has kept their pointer down, we want to
    // keep only the persistent ripples and the latest transient ripple. We do this,
    // because we don't want stacked transient ripples to appear after their enter
    // animation has finished.
    if (!persistent && (!isMostRecentTransientRipple || !this._isPointerDown)) {
      rippleRef.fadeOut();
    }
  }

  /** Destroys the given ripple by removing it from the DOM and updating its state. */
  private _destroyRipple(rippleRef: RippleRef) {
    const eventListeners = this._activeRipples.get(rippleRef) ?? null;
    this._activeRipples.delete(rippleRef);

    // Clear out the cached bounding rect if we have no more ripples.
    if (!this._activeRipples.size) {
      this._containerRect = null;
    }

    // If the current ref is the most recent transient ripple, unset it
    // avoid memory leaks.
    if (rippleRef === this._mostRecentTransientRipple) {
      this._mostRecentTransientRipple = null;
    }

    rippleRef.state = RippleState.HIDDEN;
    if (eventListeners !== null) {
      rippleRef.element.removeEventListener('transitionend', eventListeners.onTransitionEnd);
      rippleRef.element.removeEventListener('transitioncancel', eventListeners.onTransitionCancel);
      if (eventListeners.fallbackTimer !== null) {
        clearTimeout(eventListeners.fallbackTimer);
      }
    }
    rippleRef.element.remove();
  }

  /** Function being called whenever the trigger is being pressed using mouse. */
  private _onMousedown(event: MouseEvent) {
    // Screen readers will fire fake mouse events for space/enter. Skip launching a
    // ripple in this case for consistency with the non-screen-reader experience.
    const isFakeMousedown = isFakeMousedownFromScreenReader(event);
    const isSyntheticEvent =
      this._lastTouchStartEvent &&
      Date.now() < this._lastTouchStartEvent + ignoreMouseEventsTimeout;

    if (!this._target.rippleDisabled && !isFakeMousedown && !isSyntheticEvent) {
      this._isPointerDown = true;
      this.fadeInRipple(event.clientX, event.clientY, this._target.rippleConfig);
    }
  }

  /** Function being called whenever the trigger is being pressed using touch. */
  private _onTouchStart(event: TouchEvent) {
    if (!this._target.rippleDisabled && !isFakeTouchstartFromScreenReader(event)) {
      // Some browsers fire mouse events after a `touchstart` event. Those synthetic mouse
      // events will launch a second ripple if we don't ignore mouse events for a specific
      // time after a touchstart event.
      this._lastTouchStartEvent = Date.now();
      this._isPointerDown = true;

      // Use `changedTouches` so we skip any touches where the user put
      // their finger down, but used another finger to tap the element again.
      const touches = event.changedTouches as TouchList | undefined;

      // According to the typings the touches should always be defined, but in some cases
      // the browser appears to not assign them in tests which leads to flakes.
      if (touches) {
        for (let i = 0; i < touches.length; i++) {
          this.fadeInRipple(touches[i].clientX, touches[i].clientY, this._target.rippleConfig);
        }
      }
    }
  }

  /** Function being called whenever the trigger is being released. */
  private _onPointerUp() {
    if (!this._isPointerDown) {
      return;
    }

    this._isPointerDown = false;

    // Fade-out all ripples that are visible and not persistent.
    this._getActiveRipples().forEach(ripple => {
      // By default, only ripples that are completely visible will fade out on pointer release.
      // If the `terminateOnPointerUp` option is set, ripples that still fade in will also fade out.
      const isVisible =
        ripple.state === RippleState.VISIBLE ||
        (ripple.config.terminateOnPointerUp && ripple.state === RippleState.FADING_IN);

      if (!ripple.config.persistent && isVisible) {
        ripple.fadeOut();
      }
    });
  }

  private _getActiveRipples(): RippleRef[] {
    return Array.from(this._activeRipples.keys());
  }

  /** Removes previously registered event listeners from the trigger element. */
  _removeTriggerEvents() {
    const trigger = this._triggerElement;

    if (trigger) {
      pointerDownEvents.forEach(type =>
        RippleRenderer._eventManager.removeHandler(type, trigger, this),
      );

      if (this._pointerUpEventsRegistered) {
        pointerUpEvents.forEach(type =>
          trigger.removeEventListener(type, this, passiveCapturingEventOptions),
        );

        this._pointerUpEventsRegistered = false;
      }
    }
  }
}

/**
 * Returns the distance from the point (x, y) to the furthest corner of a rectangle.
 */
function distanceToFurthestCorner(x: number, y: number, rect: DOMRect) {
  const distX = Math.max(Math.abs(x - rect.left), Math.abs(x - rect.right));
  const distY = Math.max(Math.abs(y - rect.top), Math.abs(y - rect.bottom));
  return Math.sqrt(distX * distX + distY * distY);
}
