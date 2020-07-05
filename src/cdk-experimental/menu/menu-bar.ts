/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  Input,
  ContentChildren,
  QueryList,
  AfterContentInit,
  OnDestroy,
  Inject,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {_getShadowRoot} from '@angular/cdk/platform';
import {Subject} from 'rxjs';
import {CdkMenuGroup} from './menu-group';
import {CDK_MENU, Menu} from './menu-interface';
import {CdkMenuItem} from './menu-item';
import {MenuKeyManager, TYPE_AHEAD_DEBOUNCE} from './menu-key-manager';

/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessible keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
@Directive({
  selector: '[cdkMenuBar]',
  exportAs: 'cdkMenuBar',
  host: {
    '(keydown)': '_handleKeyEvent($event)',
    '(focus)': 'focusFirstItem()',
    'role': 'menubar',
    'tabindex': '0',
    '[attr.aria-orientation]': 'orientation',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: CdkMenuBar},
    {provide: CDK_MENU, useExisting: CdkMenuBar},
  ],
})
export class CdkMenuBar extends CdkMenuGroup implements Menu, OnDestroy, AfterContentInit {
  /**
   * Sets the aria-orientation attribute and determines where menus will be opened.
   * Does not affect styling/layout.
   */
  @Input('cdkMenuBarOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

  /** Handles keyboard events for the MenuBar. */
  private _keyManager?: MenuKeyManager;

  /** All child MenuItem elements nested in this MenuBar. */
  @ContentChildren(CdkMenuItem, {descendants: true})
  private readonly _allItems: QueryList<CdkMenuItem>;

  constructor(
    private readonly _dir: Directionality,
    @Inject(TYPE_AHEAD_DEBOUNCE) private readonly _debounceInterval: number
  ) {
    super();
  }

  ngAfterContentInit() {
    super.ngAfterContentInit();

    this._keyManager = new MenuKeyManager(this._allItems, {
      directionality: this._dir,
      menuOrientation: this.orientation,
      typeAheadDebounce: this._debounceInterval,
    });
  }

  /** Place focus on the first MenuItem in the menu. */
  focusFirstItem() {
    this._keyManager?.focusFirstItem();
  }

  /** Place focus on the last MenuItem in the menu. */
  focusLastItem() {
    this._keyManager?.focusLastItem();
  }

  /** Place focus on the given MenuItem in the menu. */
  focusItem(child: CdkMenuItem) {
    this._keyManager?.focusItem(child);
  }

  /** Get an emitter which emits bubbled-up keyboard events from the keyboard manager. */
  _getBubbledKeyboardEvents(): Subject<KeyboardEvent> | undefined {
    return this._keyManager?._bubbledEvents;
  }

  /** Direct the MenuKeyManager to handle the keyboard event. */
  _handleKeyEvent(event: KeyboardEvent) {
    this._keyManager?.onKeydown(event);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this._keyManager!.destroy();
  }
}
