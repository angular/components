/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  booleanAttribute,
  ChangeDetectorRef,
  Directive,
  inject,
  Injector,
  Input,
  OnDestroy,
} from '@angular/core';
import {Directionality} from '../bidi';
import {
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  FlexibleConnectedPositionStrategy,
  OverlayConfig,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '../overlay';
import {_getEventTarget} from '../platform';
import {merge, partition} from 'rxjs';
import {skip, takeUntil, skipWhile} from 'rxjs/operators';
import {MENU_STACK, MenuStack} from './menu-stack';
import {CdkMenuTriggerBase, MENU_TRIGGER, MenuTracker} from './menu-trigger-base';

/** The preferred menu positions for the context menu. */
const CONTEXT_MENU_POSITIONS = STANDARD_DROPDOWN_BELOW_POSITIONS.map(position => {
  // In cases where the first menu item in the context menu is a trigger the submenu opens on a
  // hover event. We offset the context menu 2px by default to prevent this from occurring.
  const offsetX = position.overlayX === 'start' ? 2 : -2;
  const offsetY = position.overlayY === 'top' ? 2 : -2;
  return {...position, offsetX, offsetY};
});

/**
 * @deprecated Will be removed. Use `MenuTracker` instead.
 * @breaking-change 22.0.0
 */
export {MenuTracker as ContextMenuTracker};

/** The coordinates where the context menu should open. */
export type ContextMenuCoordinates = {x: number; y: number};

/**
 * A directive that opens a menu when a user right-clicks within its host element.
 * It is aware of nested context menus and will trigger only the lowest level non-disabled context menu.
 */
@Directive({
  selector: '[cdkContextMenuTriggerFor]',
  exportAs: 'cdkContextMenuTriggerFor',
  host: {
    '[attr.data-cdk-menu-stack-id]': 'null',
    '(contextmenu)': '_openOnContextMenu($event)',
  },
  inputs: [
    {name: 'menuTemplateRef', alias: 'cdkContextMenuTriggerFor'},
    {name: 'menuPosition', alias: 'cdkContextMenuPosition'},
    {name: 'menuData', alias: 'cdkContextMenuTriggerData'},
  ],
  outputs: ['opened: cdkContextMenuOpened', 'closed: cdkContextMenuClosed'],
  providers: [
    {provide: MENU_TRIGGER, useExisting: CdkContextMenuTrigger},
    {provide: MENU_STACK, useClass: MenuStack},
  ],
})
export class CdkContextMenuTrigger extends CdkMenuTriggerBase implements OnDestroy {
  private readonly _injector = inject(Injector);
  private readonly _directionality = inject(Directionality, {optional: true});

  /** The app's menu tracking registry */
  private readonly _menuTracker = inject(MenuTracker);

  private readonly _changeDetectorRef = inject(ChangeDetectorRef);

  /** Whether the context menu is disabled. */
  @Input({alias: 'cdkContextMenuDisabled', transform: booleanAttribute}) disabled: boolean = false;

  constructor() {
    super();
    this._setMenuStackCloseListener();
  }

  /**
   * Open the attached menu at the specified location.
   * @param coordinates where to open the context menu
   */
  open(coordinates: ContextMenuCoordinates) {
    this._open(null, coordinates);
    this._changeDetectorRef.markForCheck();
  }

  /** Close the currently opened context menu. */
  close() {
    this.menuStack.closeAll();
  }

  /**
   * Open the context menu and closes any previously open menus.
   * @param event the mouse event which opens the context menu.
   */
  _openOnContextMenu(event: MouseEvent) {
    if (!this.disabled) {
      // Prevent the native context menu from opening because we're opening a custom one.
      event.preventDefault();

      // Stop event propagation to ensure that only the closest enabled context menu opens.
      // Otherwise, any context menus attached to containing elements would *also* open,
      // resulting in multiple stacked context menus being displayed.
      event.stopPropagation();

      this._menuTracker.update(this);
      this._open(event, {x: event.clientX, y: event.clientY});

      // A context menu can be triggered via a mouse right click or a keyboard shortcut.
      if (event.button === 2) {
        this.childMenu?.focusFirstItem('mouse');
      } else if (event.button === 0) {
        this.childMenu?.focusFirstItem('keyboard');
      } else {
        this.childMenu?.focusFirstItem('program');
      }
    }
  }

  /**
   * Get the configuration object used to create the overlay.
   * @param coordinates the location to place the opened menu
   */
  private _getOverlayConfig(coordinates: ContextMenuCoordinates) {
    return new OverlayConfig({
      positionStrategy: this._getOverlayPositionStrategy(coordinates),
      scrollStrategy: this.menuScrollStrategy(),
      direction: this._directionality || undefined,
    });
  }

  /**
   * Get the position strategy for the overlay which specifies where to place the menu.
   * @param coordinates the location to place the opened menu
   */
  private _getOverlayPositionStrategy(
    coordinates: ContextMenuCoordinates,
  ): FlexibleConnectedPositionStrategy {
    return createFlexibleConnectedPositionStrategy(this._injector, coordinates)
      .withLockedPosition()
      .withGrowAfterOpen()
      .withPositions(this.menuPosition ?? CONTEXT_MENU_POSITIONS);
  }

  /** Subscribe to the menu stack close events and close this menu when requested. */
  private _setMenuStackCloseListener() {
    this.menuStack.closed.pipe(takeUntil(this.destroyed)).subscribe(({item}) => {
      if (item === this.childMenu && this.isOpen()) {
        this.closed.next();
        this.overlayRef!.detach();
        this.childMenu = undefined;
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  /**
   * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
   * click occurs outside the menus.
   * @param userEvent User-generated event that opened the menu.
   */
  private _subscribeToOutsideClicks(userEvent: MouseEvent | null) {
    if (this.overlayRef) {
      let outsideClicks = this.overlayRef.outsidePointerEvents();

      if (userEvent) {
        const [auxClicks, nonAuxClicks] = partition(outsideClicks, ({type}) => type === 'auxclick');
        outsideClicks = merge(
          // Using a mouse, the `contextmenu` event can fire either when pressing the right button
          // or left button + control. Most browsers won't dispatch a `click` event right after
          // a `contextmenu` event triggered by left button + control, but Safari will (see #27832).
          // This closes the menu immediately. To work around it, we check that both the triggering
          // event and the current outside click event both had the control key pressed, and that
          // that this is the first outside click event.
          nonAuxClicks.pipe(
            skipWhile((event, index) => userEvent.ctrlKey && index === 0 && event.ctrlKey),
          ),

          // If the menu was triggered by the `contextmenu` event, skip the first `auxclick` event
          // because it fires when the mouse is released on the same click that opened the menu.
          auxClicks.pipe(skip(1)),
        );
      }

      outsideClicks.pipe(takeUntil(this.stopOutsideClicksListener)).subscribe(event => {
        if (!this.isElementInsideMenuStack(_getEventTarget(event)!)) {
          this.menuStack.closeAll();
        }
      });
    }
  }

  /**
   * Open the attached menu at the specified location.
   * @param userEvent User-generated event that opened the menu
   * @param coordinates where to open the context menu
   */
  private _open(userEvent: MouseEvent | null, coordinates: ContextMenuCoordinates) {
    if (this.disabled) {
      return;
    }
    if (this.isOpen()) {
      // since we're moving this menu we need to close any submenus first otherwise they end up
      // disconnected from this one.
      this.menuStack.closeSubMenuOf(this.childMenu!);

      (
        this.overlayRef!.getConfig().positionStrategy as FlexibleConnectedPositionStrategy
      ).setOrigin(coordinates);
      this.overlayRef!.updatePosition();
    } else {
      this.opened.next();

      if (this.overlayRef) {
        (
          this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy
        ).setOrigin(coordinates);
        this.overlayRef.updatePosition();
      } else {
        this.overlayRef = createOverlayRef(this._injector, this._getOverlayConfig(coordinates));
      }

      this.overlayRef.attach(this.getMenuContentPortal());
      this._subscribeToOutsideClicks(userEvent);
    }
  }
}
