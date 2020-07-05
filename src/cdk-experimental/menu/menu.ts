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
  Output,
  EventEmitter,
  QueryList,
  ContentChildren,
  AfterContentInit,
  OnDestroy,
  Optional,
  Inject,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {Subject} from 'rxjs';
import {take} from 'rxjs/operators';
import {CdkMenuGroup} from './menu-group';
import {CdkMenuPanel} from './menu-panel';
import {Menu, CDK_MENU} from './menu-interface';
import {throwMissingMenuPanelError} from './menu-errors';
import {CdkMenuItem} from './menu-item';
import {MenuKeyManager, TYPE_AHEAD_DEBOUNCE} from './menu-key-manager';

/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
@Directive({
  selector: '[cdkMenu]',
  exportAs: 'cdkMenu',
  host: {
    '(keydown)': '_handleKeyEvent($event)',
    'role': 'menu',
    '[attr.aria-orientation]': 'orientation',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: CdkMenu},
    {provide: CDK_MENU, useExisting: CdkMenu},
  ],
})
export class CdkMenu extends CdkMenuGroup implements Menu, AfterContentInit, OnDestroy {
  /**
   * Sets the aria-orientation attribute and determines where menus will be opened.
   * Does not affect styling/layout.
   */
  @Input('cdkMenuOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';

  /** Event emitted when the menu is closed. */
  @Output() readonly closed: EventEmitter<void | 'click' | 'tab' | 'escape'> = new EventEmitter();

  /** Handles keyboard events for the menu. */
  private _keyManager?: MenuKeyManager;

  /** List of nested CdkMenuGroup elements */
  @ContentChildren(CdkMenuGroup, {descendants: true})
  private readonly _nestedGroups: QueryList<CdkMenuGroup>;

  /** All child MenuItem elements nested in this Menu. */
  @ContentChildren(CdkMenuItem, {descendants: true})
  private readonly _allItems: QueryList<CdkMenuItem>;

  /**
   * A reference to the enclosing parent menu panel.
   *
   * Required to be set when using ViewEngine since ViewEngine does support injecting a reference to
   * the parent directive if the parent directive is placed on an `ng-template`. If using Ivy, the
   * injected value will be used over this one.
   */
  @Input('cdkMenuPanel') private readonly _explicitPanel?: CdkMenuPanel;

  constructor(
    private readonly _dir: Directionality,
    @Inject(TYPE_AHEAD_DEBOUNCE) private readonly _debounceInterval: number,
    @Optional() private readonly _menuPanel?: CdkMenuPanel
  ) {
    super();
  }

  ngAfterContentInit() {
    super.ngAfterContentInit();

    this._completeChangeEmitter();
    this._registerWithParentPanel();

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

  /**
   * Place focus on the given MenuItem in the menu.
   * @param child the MenuItem to place focus on
   */
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

  /** Register this menu with its enclosing parent menu panel */
  private _registerWithParentPanel() {
    const parent = this._getMenuPanel();
    if (parent) {
      parent._registerMenu(this);
    } else {
      throwMissingMenuPanelError();
    }
  }

  /**
   * Get the enclosing CdkMenuPanel defaulting to the injected reference over the developer
   * provided reference.
   */
  private _getMenuPanel() {
    return this._menuPanel || this._explicitPanel;
  }

  /**
   * Complete the change emitter if there are any nested MenuGroups or register to complete the
   * change emitter if a MenuGroup is rendered at some point
   */
  private _completeChangeEmitter() {
    if (this._hasNestedGroups()) {
      this.change.complete();
    } else {
      this._nestedGroups.changes.pipe(take(1)).subscribe(() => this.change.complete());
    }
  }

  /** Return true if there are nested CdkMenuGroup elements within the Menu */
  private _hasNestedGroups() {
    // view engine has a bug where @ContentChildren will return the current element
    // along with children if the selectors match - not just the children.
    // Here, if there is at least one element, we check to see if the first element is a CdkMenu in
    // order to ensure that we return true iff there are child CdkMenuGroup elements.
    return this._nestedGroups.length > 0 && !(this._nestedGroups.first instanceof CdkMenu);
  }

  ngOnDestroy() {
    this._emitClosedEvent();
    this._keyManager!.destroy();
  }

  /** Emit and complete the closed event emitter */
  private _emitClosedEvent() {
    this.closed.next();
    this.closed.complete();
  }
}
