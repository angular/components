/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isFakeMousedownFromScreenReader, isFakeTouchstartFromScreenReader} from '@angular/cdk/a11y';
import {ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  Directive,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  Renderer2,
} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import {Subscription} from 'rxjs';
import {MatMenuPanel} from './menu-panel';
import {_animationsDisabled} from '../core';
import {MatMenuTriggerBase} from './menu-trigger-base';

/** Directive applied to an element that should trigger a `mat-menu`. */
@Directive({
  selector: '[mat-menu-trigger-for], [matMenuTriggerFor]',
  host: {
    'class': 'mat-mdc-menu-trigger',
    '[attr.aria-haspopup]': 'menu ? "menu" : null',
    '[attr.aria-expanded]': 'menuOpen',
    '[attr.aria-controls]': 'menuOpen ? menu?.panelId : null',
    '(click)': '_handleClick($event)',
    '(mousedown)': '_handleMousedown($event)',
    '(keydown)': '_handleKeydown($event)',
  },
  exportAs: 'matMenuTrigger',
})
export class MatMenuTrigger extends MatMenuTriggerBase implements AfterContentInit, OnDestroy {
  private _cleanupTouchstart: () => void;
  private _hoverSubscription = Subscription.EMPTY;

  /**
   * @deprecated
   * @breaking-change 8.0.0
   */
  @Input('mat-menu-trigger-for')
  get _deprecatedMatMenuTriggerFor(): MatMenuPanel | null {
    return this.menu;
  }
  set _deprecatedMatMenuTriggerFor(v: MatMenuPanel | null) {
    this.menu = v;
  }

  /** References the menu instance that the trigger is associated with. */
  @Input('matMenuTriggerFor')
  get menu(): MatMenuPanel | null {
    return this._menu;
  }
  set menu(menu: MatMenuPanel | null) {
    this._menu = menu;
  }

  /** Data to be passed along to any lazily-rendered content. */
  @Input('matMenuTriggerData')
  override menuData: any;

  /**
   * Whether focus should be restored when the menu is closed.
   * Note that disabling this option can have accessibility implications
   * and it's up to you to manage focus, if you decide to turn it off.
   */
  @Input('matMenuTriggerRestoreFocus')
  override restoreFocus: boolean = true;

  /** Event emitted when the associated menu is opened. */
  @Output() readonly menuOpened: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Event emitted when the associated menu is opened.
   * @deprecated Switch to `menuOpened` instead
   * @breaking-change 8.0.0
   */
  // tslint:disable-next-line:no-output-on-prefix
  @Output() readonly onMenuOpen: EventEmitter<void> = this.menuOpened;

  /** Event emitted when the associated menu is closed. */
  @Output() readonly menuClosed: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Event emitted when the associated menu is closed.
   * @deprecated Switch to `menuClosed` instead
   * @breaking-change 8.0.0
   */
  // tslint:disable-next-line:no-output-on-prefix
  @Output() readonly onMenuClose: EventEmitter<void> = this.menuClosed;

  constructor(...args: unknown[]);

  constructor() {
    super(true);

    const renderer = inject(Renderer2);
    this._cleanupTouchstart = renderer.listen(
      this._element.nativeElement,
      'touchstart',
      (event: TouchEvent) => {
        if (!isFakeTouchstartFromScreenReader(event)) {
          this._openedBy = 'touch';
        }
      },
      {passive: true},
    );
  }

  /** Whether the menu triggers a sub-menu or a top-level one. */
  triggersSubmenu(): boolean {
    return super._triggersSubmenu();
  }

  /** Toggles the menu between the open and closed states. */
  toggleMenu(): void {
    return this.menuOpen ? this.closeMenu() : this.openMenu();
  }

  /** Opens the menu. */
  openMenu(): void {
    this._openMenu(true);
  }

  /** Closes the menu. */
  closeMenu(): void {
    this._closeMenu();
  }

  /**
   * Updates the position of the menu to ensure that it fits all options within the viewport.
   */
  updatePosition(): void {
    this._overlayRef?.updatePosition();
  }

  ngAfterContentInit() {
    this._handleHover();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._cleanupTouchstart();
    this._hoverSubscription.unsubscribe();
  }

  protected override _getOverlayOrigin() {
    return this._element;
  }

  protected override _getOutsideClickStream(overlayRef: OverlayRef) {
    return overlayRef.backdropClick();
  }

  /** Handles mouse presses on the trigger. */
  _handleMousedown(event: MouseEvent): void {
    if (!isFakeMousedownFromScreenReader(event)) {
      // Since right or middle button clicks won't trigger the `click` event,
      // we shouldn't consider the menu as opened by mouse in those cases.
      this._openedBy = event.button === 0 ? 'mouse' : undefined;

      // Since clicking on the trigger won't close the menu if it opens a sub-menu,
      // we should prevent focus from moving onto it via click to avoid the
      // highlight from lingering on the menu item.
      if (this.triggersSubmenu()) {
        event.preventDefault();
      }
    }
  }

  /** Handles key presses on the trigger. */
  _handleKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;

    // Pressing enter on the trigger will trigger the click handler later.
    if (keyCode === ENTER || keyCode === SPACE) {
      this._openedBy = 'keyboard';
    }

    if (
      this.triggersSubmenu() &&
      ((keyCode === RIGHT_ARROW && this.dir === 'ltr') ||
        (keyCode === LEFT_ARROW && this.dir === 'rtl'))
    ) {
      this._openedBy = 'keyboard';
      this.openMenu();
    }
  }

  /** Handles click events on the trigger. */
  _handleClick(event: MouseEvent): void {
    if (this.triggersSubmenu()) {
      // Stop event propagation to avoid closing the parent menu.
      event.stopPropagation();
      this.openMenu();
    } else {
      this.toggleMenu();
    }
  }

  /** Handles the cases where the user hovers over the trigger. */
  private _handleHover() {
    // Subscribe to changes in the hovered item in order to toggle the panel.
    if (this.triggersSubmenu() && this._parentMaterialMenu) {
      this._hoverSubscription = this._parentMaterialMenu._hovered().subscribe(active => {
        if (active === this._menuItemInstance && !active.disabled) {
          this._openedBy = 'mouse';
          // Open the menu, but do NOT auto-focus on first item when just hovering.
          // When VoiceOver is enabled, this is particularly confusing as the focus will
          // cause another hover event, and continue opening sub-menus without interaction.
          this._openMenu(false);
        }
      });
    }
  }
}
