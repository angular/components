/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusKeyManager} from '@angular/cdk/a11y';
import {QueryList, InjectionToken} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {
  SPACE,
  ENTER,
  LEFT_ARROW,
  RIGHT_ARROW,
  UP_ARROW,
  DOWN_ARROW,
  END,
  HOME,
  ESCAPE,
  TAB,
  hasModifierKey,
} from '@angular/cdk/keycodes';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CdkMenuItemSelectable} from './menu-item-selectable';
import {CdkMenuItem} from './menu-item';

/**
 * How long to wait in ms after the last character keystroke before reacting and changing the
 * focused element.
 */
export const defaultTypeAheadDebounce = 200;

/** Injection token used to customize the TypeAhead debounce interval. */
export const TYPE_AHEAD_DEBOUNCE = new InjectionToken('cdk-menu-typeahead-debounce');

/** Specifies the configuration options for the MenuKeyManager. */
export type MenuKeyManagerConfig = {
  /** Specifies the layout direction. */
  directionality: Directionality;
  /** Layout of the menu using the MenuKeyManager. */
  menuOrientation: 'horizontal' | 'vertical';
  /** Delay in milliseconds before handling character keys. */
  typeAheadDebounce: number;
};

/**
 * Handles Keyboard Events by setting focus to the appropriate MenuItems and/or triggering focused
 * MenuItems based on the outlined behavior in the aria spec
 * (https://www.w3.org/TR/wai-aria-practices-1.2/#menu) for the given key codes. It emits events
 * which should be handled by parent Menu's MenuKeyManagers and internally hooks into submenu
 * events.
 *
 * The MenuKeyManager handles both horizontal and vertical Menu orientation along with support for
 * ltr and rtl layouts.
 *
 */
export class MenuKeyManager {
  /**
   * Emits events which should be processed by the next Keyboard Manager. These may be events which
   * are processed by this MenuKeyManager and should also be processed by the parent menus
   * MenuKeyManager, or they may be events which cannot be processed by this MenuKeyManager.
   */
  readonly _bubbledEvents = new Subject<KeyboardEvent>();

  /** End subscriptions to any open submenu's Keyboard Manager bubbled events emitter. */
  private readonly _destroyKeyManagerListener = new Subject<void>();

  /** Handles focus for the managed menu items. */
  private readonly _keyManager: FocusKeyManager<CdkMenuItem>;

  constructor(children: QueryList<CdkMenuItem>, private readonly _config: MenuKeyManagerConfig) {
    this._keyManager = new FocusKeyManager(children)
      .withWrap()
      .withTypeAhead(_config.typeAheadDebounce);

    if (this._isHorizontal()) {
      this._keyManager.withHorizontalOrientation(_config.directionality.value);
    } else {
      this._keyManager.withVerticalOrientation();
    }

    this._keyManager.change.subscribe(() =>
      this._subscribeToBubbledEvents(this._keyManager.activeItem!)
    );
  }

  /**
   * If the MenuItem opens a menu, subscribe to that menu's bubbled keyboard events emitter.
   * @param menuItem the triggering menu item whose attached menu's Keyboard Manager it subscribes
   * to.
   */
  private _subscribeToBubbledEvents(menuItem: CdkMenuItem) {
    // Stop any existing subscriptions since the focus has changed and any open menu has closed.
    this._destroyKeyManagerListener.next();

    if (menuItem.hasMenu()) {
      // If the provided menu item has a menu, when the menu opens subscribe to its
      // bubbled events emitter allowing this Keyboard Manager to react to events which
      // occurred in the submenu. For example, a TAB key event should close out the entire
      // menu tree therefore when TAB is detected in a submenu, its Keyboard Manager emits the
      // TAB event along with closing its open menu. Next, the listening Keyboard Managers higher
      // up in the chain can react to this event by closing out its open menus and further
      // bubbling up the event. In essence mimicking the default event bubbling behavior provided by
      // nesting elements.
      menuItem
        .getMenuTrigger()!
        .opened.pipe(takeUntil(this._destroyKeyManagerListener))
        .subscribe(() => {
          const menu = menuItem.getMenu();
          if (menu?._getBubbledKeyboardEvents()) {
            menu
              ._getBubbledKeyboardEvents()!
              .pipe(takeUntil(this._destroyKeyManagerListener))
              .subscribe((keyboardEvent: KeyboardEvent) => this.onKeydown(keyboardEvent, true));
          }
        });
    }
  }

  /** Place focus on the first menu item. */
  focusFirstItem() {
    this._keyManager.setFirstItemActive();
  }

  /** Place focus on the last menu item. */
  focusLastItem() {
    this._keyManager.setLastItemActive();
  }

  /**
   * Place focus on the given menu item.
   * @param item the menu item to focus.
   */
  focusItem(item: CdkMenuItem) {
    this._keyManager.setActiveItem(item);
  }

  /**
   * Process the given KeyboardEvent which may result in a Menu being open/closed and/or focus
   * changing between the managed MenuItems.
   *
   * @param event the KeyboardEvent to process
   * @param bubbled whether or not the KeyboardEvent has bubbled up from a submenu
   */
  onKeydown(event: KeyboardEvent, bubbled = false) {
    let activeItem = this._keyManager.activeItem;

    switch (event.keyCode) {
      case ENTER:
      case SPACE:
        if (activeItem && !bubbled) {
          if (activeItem.hasMenu()) {
            this._openActiveMenu();
            this._focusFirstSubmenuItem();
          } else {
            activeItem.trigger();

            // Triggering a CdkMenuitemSelectable should not close the menu tree
            if (!(activeItem instanceof CdkMenuItemSelectable)) {
              this._bubbledEvents.next(event);
            }
          }
        } else {
          this._closeActiveMenu();
          this._bubbledEvents.next(event);
        }
        break;

      case LEFT_ARROW:
        if (this._isHorizontal()) {
          this._focusNext(event);
        } else if (this._config.directionality.value === 'ltr') {
          this._closeOnHorizontalArrow(event);
        } else {
          this._openOnHorizontalArrow(event, bubbled);
        }
        break;

      case RIGHT_ARROW:
        if (this._isHorizontal()) {
          this._focusNext(event);
        } else if (this._config.directionality.value === 'ltr') {
          this._openOnHorizontalArrow(event, bubbled);
        } else {
          this._closeOnHorizontalArrow(event);
        }
        break;

      case UP_ARROW:
      case DOWN_ARROW:
        if (this._isHorizontal() && activeItem?.hasMenu()) {
          event.preventDefault();

          this._openActiveMenu();
          event.keyCode === DOWN_ARROW
            ? this._focusFirstSubmenuItem()
            : this._focusLastSubmenuItem();
        } else {
          this._keyManager.onKeydown(event);
        }
        break;

      case HOME:
      case END:
        if (!hasModifierKey(event)) {
          event.keyCode === HOME ? this.focusFirstItem() : this.focusLastItem();
          event.preventDefault();
        }
        break;

      case ESCAPE:
        if (hasModifierKey(event)) {
          break;
        } else if (this._isActiveMenuOpen()) {
          this._closeActiveMenu();
        } else {
          this._bubbledEvents.next(event);
        }
        event.preventDefault();
        break;

      case TAB:
        this._closeActiveMenu();
        this._bubbledEvents.next(event);
        this._keyManager.onKeydown(event);
        break;

      default:
        this._keyManager.onKeydown(event);
    }
  }

  /**
   * If the key is of type LEFT or RIGHT arrow, open the current active item if it has a menu and
   * this is the primary event handler. Otherwise bubble up the event to the next handler.
   * @param event the keyboard event to handle.
   * @param bubbled whether or not the event has bubbled up from a child.
   */
  private _openOnHorizontalArrow(event: KeyboardEvent, bubbled: boolean) {
    const keycode = event.keyCode;
    if (keycode === LEFT_ARROW || keycode === RIGHT_ARROW) {
      const activeItem = this._keyManager.activeItem;
      if (activeItem?.hasMenu() && !bubbled) {
        this._openActiveMenu();
        this._focusFirstSubmenuItem();
      } else {
        this._closeActiveMenu();
        this._bubbledEvents.next(event);
      }
    }
  }

  /**
   * If the key is of type LEFT or RIGHT arrow, close the active items menu if the active item has
   * an open menu, otherwise bubble up the event to the next handler.
   * @param event the keyboard event to handle.
   */
  private _closeOnHorizontalArrow(event: KeyboardEvent) {
    const keycode = event.keyCode;
    if (keycode === LEFT_ARROW || keycode === RIGHT_ARROW) {
      this._isActiveMenuOpen() ? this._closeActiveMenu() : this._bubbledEvents.next(event);
    }
  }

  /** Close the active items menu and place focus on it if its menu is open. */
  private _closeActiveMenu() {
    const activeItem = this._keyManager.activeItem;
    if (activeItem?.isMenuOpen()) {
      activeItem.trigger();
      this.focusItem(activeItem);
    }
  }

  /** Open the active items menu if it has a menu and it's currently closed. */
  private _openActiveMenu() {
    const activeItem = this._keyManager.activeItem;
    if (activeItem?.hasMenu() && !activeItem.isMenuOpen()) {
      activeItem.trigger();
    }
  }

  /** Place focus on the first item in the current active items menu. */
  private _focusFirstSubmenuItem() {
    const activeItem = this._keyManager.activeItem;
    if (activeItem?.isMenuOpen()) {
      activeItem.getMenu()?.focusFirstItem();
    }
  }

  /** Place focus on the last item in the current active items menu. */
  private _focusLastSubmenuItem() {
    const activeItem = this._keyManager.activeItem;
    if (activeItem?.isMenuOpen()) {
      activeItem.getMenu()?.focusLastItem();
    }
  }

  /** Return true if the current active item has a menu and it's open. */
  private _isActiveMenuOpen() {
    const activeItem = this._keyManager.activeItem;
    return !!(activeItem?.hasMenu() && activeItem.isMenuOpen());
  }

  /**
   * Place focus on the next element. If the currently focused element is open, close it and open
   * the next element, otherwise do nothing else.
   * @param event the keyboard event which trigged the focus action.
   */
  private _focusNext(event: KeyboardEvent) {
    const previous = this._keyManager.activeItem;
    this._keyManager.onKeydown(event);
    const current = this._keyManager.activeItem;

    if (previous !== current && previous?.isMenuOpen()) {
      // close the previous menu and since previous was open, open the next one if it has one
      previous.trigger();
      this._openActiveMenu();
    }
  }

  /**
   * Return true if the menu for which this manager is enabled is configured in a horizontal
   * orientation.
   */
  private _isHorizontal() {
    return this._config.menuOrientation === 'horizontal';
  }

  /** Cleanup all subscriptions */
  destroy() {
    this._destroyKeyManagerListener.next();
    this._destroyKeyManagerListener.complete();

    this._bubbledEvents.complete();
  }
}
