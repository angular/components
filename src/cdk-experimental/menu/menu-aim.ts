/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone, OnDestroy, InjectionToken, Directive} from '@angular/core';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil, filter} from 'rxjs/operators';
import {PointerFocusTracker, FocusableElement} from './pointer-focus-tracker';
import {Menu} from './menu-interface';
import {throwMissingPointerFocusTracker, throwMissingMenuReference} from './menu-errors';

/**
 * MenuAim is responsible for determining if a sibling menuitem's menu should be closed when a
 * Toggler item is hovered into. It is up to the hovered in item to call the MenuAim service in
 * order to determine if it may perform its close actions.
 */
export interface MenuAim {
  /** Set the mouse manager tracking the menu's menu items. */
  withMouseManager(pointerTracker: PointerFocusTracker<FocusableElement & Toggler>): this;

  /** Set the menu for which this tracks mouse movements in. */
  withMenu(menu: Menu): this;

  /**
   * Calls the `doToggle` callback when it is deemed that the user is not moving towards
   * the submenu.
   * @param doToggle the function called when the user is not moving towards the submenu.
   */
  toggle(doToggle: () => void): void;
}

/** Injection token used for an implementation of MenuAim. */
export const MENU_AIM = new InjectionToken<MenuAim>('cdk-menu-aim');

/** Capture every nth mouse move event. */
const MOUSE_MOVE_SAMPLE_FREQUENCY = 5;

/**
 * How long to wait before closing a sibling menu if a user stops short of the submenu they were
 * predicted to go into.
 */
const CLOSE_DELAY = 300;

/**
 * An element which when hovered over may perform closing actions on the open submenu and
 * potentially open its own menu.
 */
export interface Toggler {
  getMenu(): Menu | undefined;
}

/**
 * Whether the target element opened to the right of the origin element.
 * @param origin the base element
 * @param target the relative element
 */
function isOpenedToRight(origin: HTMLElement, target: HTMLElement) {
  return target.getBoundingClientRect().right > origin.getBoundingClientRect().right;
}

/**  Whether the given points indicate that the users mouse is moving down the screen. */
function isMovingDown(currPoint: Point, prevPoint: Point) {
  // in a browser, the origin coordinates (0,0) are in the top-left corner.
  // Moving down means the y coordinate is getting bigger.
  return currPoint.y > prevPoint.y;
}

/** Calculate the absolute slope between point a and b. */
function slope(a: Point, b: Point) {
  return Math.abs((b.y - a.y) / (b.x - a.x));
}

/** Represents a coordinate of mouse travel. */
type Point = {x: number; y: number};

/**
 * TargetMenuAim attempts to predict if a user is moving into a submenu. It calculates the
 * trajectory of the users mouse movement in the current menu in order to determine if the
 * mouse is moving towards an opened submenu.
 *
 * This movement is predicted by selecting some target coordinate in the open submenu (nearest
 * corner of the direction the user is moving) and calculating the slope between the target
 * coordinate and the current mouse position, and the target and previous mouse position. If the
 * slope of the current mouse  position is steeper it is determined that the user is moving towards
 * to submenu and the submenu is not closed out.
 */
@Injectable()
export class TargetMenuAim implements MenuAim, OnDestroy {
  /** The latest sampled mouse move point */
  private _currPoint?: Point;

  /** The previous sampled mouse move point. */
  private _prevPoint?: Point;

  /** Reference to the root menu in which we are tracking mouse moves. */
  private _menu: Menu;

  /** Reference to the root menus mouse manager. */
  private _pointerTracker: PointerFocusTracker<Toggler & FocusableElement>;

  /** The id associated with the current timeout call waiting to resolve. */
  private _timeoutId: number | null;

  /** Emits when this service is destroyed. */
  private readonly _destroyed: Subject<void> = new Subject();

  constructor(private readonly _ngZone: NgZone) {}

  /** Set the mouse manager tracking the menu's menu items. */
  withMouseManager(pointerTracker: PointerFocusTracker<FocusableElement & Toggler>): this {
    this._pointerTracker = pointerTracker;
    return this;
  }

  /** Set the menu for which this tracks mouse movements in. */
  withMenu(menu: Menu): this {
    this._menu = menu;
    this._subscribeToMouseMoves();
    return this;
  }

  /**
   * Calls the `doToggle` callback when it is deemed that the user is not moving towards
   * the submenu.
   * @param doToggle the function called when the user is not moving towards the submenu.
   */
  toggle(doToggle: () => void) {
    // If the menu is horizontal the sub-menus open below and there is no risk of premature
    // closing of any sub-menus therefore we automatically resolve the callback.
    if (this._menu.orientation === 'horizontal') {
      doToggle();
    }

    this._checkConfigured();

    const siblingItemIsWaiting = !!this._timeoutId;
    const hasPoints = this._currPoint && this._prevPoint;

    if (hasPoints && !siblingItemIsWaiting) {
      if (this._isMovingToSubmenu()) {
        this._startTimeout(doToggle);
      } else {
        doToggle();
      }
    } else if (!siblingItemIsWaiting) {
      doToggle();
    }
  }

  /**
   * Start the delayed toggle handler if one isn't running already.
   *
   * The delayed toggle handler executes the `doToggle` callback after some period of time iff the
   * users mouse is on an item in the current menu.
   */
  private _startTimeout(doToggle: () => void) {
    // If the users mouse is moving towards a submenu we don't want to immediately resolve.
    // Wait for some period of time before determining if the previous menu should close in
    // cases where the user may have moved towards the submenu but stopped on a sibling menu
    // item intentionally.
    const timeoutId = (setTimeout(() => {
      // Resolve if the user is currently moused over some element in the root menu
      if (this._pointerTracker!.activeElement && timeoutId === this._timeoutId) {
        doToggle();
      }
      this._timeoutId = null;
    }, CLOSE_DELAY) as any) as number;

    this._timeoutId = timeoutId;
  }

  /** Whether the user is heading towards the open submenu. */
  private _isMovingToSubmenu() {
    const target = this._getSubmenuTarget();
    if (target && this._currPoint && this._prevPoint) {
      const currSlope = slope(target, this._currPoint);
      const prevSlope = slope(target, this._prevPoint);
      return currSlope > prevSlope;
    }
    return false;
  }

  /**
   * Get the target coordinates of the opened submenu based on where the submenu is opened and which
   * direction the users mouse is moving.
   *
   * If the menu opened to the right and,
   *  - the user is moving down, return the bottom left coordinates of the submenu
   *  - the user is moving up, return the top left coordinates of the submenu
   * If the menu opened to the left and,
   *  - the user is moving down, return the bottom right coordinates of the submenu
   *  - the user is moving up, return the top right coordinates of the submenu
   *
   * @return A corner of the opened submenu used to calculate the slope change, or null if no points
   * are set or no target or root menu is configured.
   */
  private _getSubmenuTarget(): Point | null {
    // Since we check if we can toggle the menu after we've hovered out of current sub-menus
    // trigger, the current active element is either a new trigger or a regular menu item.
    // Therefore the previous element is the one which opened the current open submenu.
    const target = this._pointerTracker?.previousElement?.getMenu()?._elementRef.nativeElement;
    const currentMenu = this._menu._elementRef.nativeElement;
    const curr = this._currPoint;
    const prev = this._prevPoint;

    if (!target || !curr || !prev) {
      return null;
    }

    const targetRect = target.getBoundingClientRect();
    const movingDown = isMovingDown(curr, prev);
    if (isOpenedToRight(currentMenu, target)) {
      if (movingDown) {
        return {x: targetRect.left, y: targetRect.bottom};
      } else {
        return {x: targetRect.left, y: targetRect.top};
      }
    } else {
      if (movingDown) {
        return {x: targetRect.right, y: targetRect.bottom};
      } else {
        return {x: targetRect.right, y: targetRect.top};
      }
    }
  }

  /**
   * Check if a reference to the PointerFocusTracker and menu element is provided.
   * @throws an error if neither reference is provided.
   */
  private _checkConfigured() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this._pointerTracker) {
        throwMissingPointerFocusTracker();
      }
      if (!this._menu) {
        throwMissingMenuReference();
      }
    }
  }

  /** Subscribe to the root menus mouse move events and update the tracked mouse points. */
  private _subscribeToMouseMoves() {
    this._ngZone.runOutsideAngular(() => {
      fromEvent<MouseEvent>(this._menu._elementRef.nativeElement, 'mousemove')
        .pipe(
          filter((_: MouseEvent, index: number) => index % MOUSE_MOVE_SAMPLE_FREQUENCY === 0),
          takeUntil(this._destroyed)
        )
        .subscribe((event: MouseEvent) => {
          this._prevPoint = this._currPoint;
          this._currPoint = {x: event.clientX, y: event.clientY};
        });
    });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
}

/**
 * CdkTargetMenuAim is a provider for the TargetMenuAim service. It should be added to an
 * element with either the `cdkMenu` or `cdkMenuBar` directive and child menu items.
 */
@Directive({
  selector: '[cdkTargetMenuAim]',
  exportAs: 'cdkTargetMenuAim',
  providers: [{provide: MENU_AIM, useClass: TargetMenuAim}],
})
export class CdkTargetMenuAim {}
