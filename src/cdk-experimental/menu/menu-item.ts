/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, Optional, Self, ElementRef, Output, EventEmitter} from '@angular/core';
import {coerceBooleanProperty, BooleanInput} from '@angular/cdk/coercion';
import {FocusableOption} from '@angular/cdk/a11y';
import {CdkMenuItemTrigger} from './menu-item-trigger';
import {Menu} from './menu-interface';

/**
 * Directive which provides the ability for an element to be focused and navigated to using the
 * keyboard when residing in a CdkMenu, CdkMenuBar, or CdkMenuGroup. It performs user defined
 * behavior when clicked.
 */
@Directive({
  selector: '[cdkMenuItem]',
  exportAs: 'cdkMenuItem',
  host: {
    'type': 'button',
    'role': 'menuitem',
    '[attr.aria-disabled]': 'disabled || null',
  },
})
export class CdkMenuItem implements FocusableOption {
  /**  Whether the CdkMenuItem is disabled - defaults to false */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  /**
   * If this MenuItem is a regular MenuItem, outputs when it is triggered by a keyboard or mouse
   * event.
   */
  @Output('cdkMenuItemTriggered') triggered: EventEmitter<void> = new EventEmitter();

  constructor(
    private readonly _elementRef: ElementRef<HTMLElement>,
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    @Self() @Optional() private readonly _menuTrigger?: CdkMenuItemTrigger
  ) {}

  /** Place focus on the element. */
  focus() {
    this._elementRef.nativeElement.focus();
  }

  /** If not disabled, toggle the menu if one is attached otherwise emits the OnTrigger event. */
  trigger() {
    if (this.disabled) {
      return;
    }

    if (this.hasMenu()) {
      this._menuTrigger!.toggle();
    } else {
      this.triggered.next();
    }
  }

  /** Whether the menu item opens a menu. */
  hasMenu() {
    return !!this._menuTrigger?.hasMenu();
  }

  /** Return true if this MenuItem has an attached menu and it is open. */
  isMenuOpen() {
    return !!this._menuTrigger?.isMenuOpen();
  }

  /**
   * Get a reference to the rendered Menu if the Menu is open and it is visible in the DOM.
   * @return the menu if it is open, otherwise undefined.
   */
  getMenu(): Menu | undefined {
    return this._menuTrigger?.getMenu();
  }

  /** Get the MenuItemTrigger associated with this element. */
  getMenuTrigger(): CdkMenuItemTrigger | undefined {
    return this._menuTrigger;
  }

  /** Get the label for this element which is required by the FocusableOption interface. */
  getLabel(): string {
    // TODO(andy): implement a more robust algorithm for determining nested text
    return this._elementRef.nativeElement.innerText;
  }

  static ngAcceptInputType_disabled: BooleanInput;
}
