/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  FocusMonitor,
  FocusOrigin,
  isFakeMousedownFromScreenReader,
  isFakeTouchstartFromScreenReader,
} from '@angular/cdk/a11y';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE} from '@angular/cdk/keycodes';
import {
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
  FlexibleConnectedPositionStrategy,
  HorizontalConnectionPos,
  OverlayConfig,
  OverlayRef,
  ScrollStrategy,
  VerticalConnectionPos,
} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {
  AfterContentInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  inject,
  InjectionToken,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  Output,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import {merge, Observable, of as observableOf, Subscription} from 'rxjs';
import {filter, take, takeUntil} from 'rxjs/operators';
import {_animationsDisabled} from '../core';
import {MatMenu, MenuCloseReason} from './menu';
import {throwMatMenuRecursiveError} from './menu-errors';
import {MatMenuItem} from './menu-item';
import {MAT_MENU_PANEL, MatMenuPanel} from './menu-panel';
import {MenuPositionX, MenuPositionY} from './menu-positions';

/** Injection token that determines the scroll handling while the menu is open. */
export const MAT_MENU_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
  'mat-menu-scroll-strategy',
  {
    providedIn: 'root',
    factory: () => {
      const injector = inject(Injector);
      return () => createRepositionScrollStrategy(injector);
    },
  },
);

/**
 * @nodoc
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export function MAT_MENU_SCROLL_STRATEGY_FACTORY(_overlay: unknown): () => ScrollStrategy {
  const injector = inject(Injector);
  return () => createRepositionScrollStrategy(injector);
}

/**
 * @nodoc
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export const MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER = {
  provide: MAT_MENU_SCROLL_STRATEGY,
  deps: [] as any[],
  useFactory: MAT_MENU_SCROLL_STRATEGY_FACTORY,
};

/**
 * Default top padding of the menu panel.
 * @deprecated No longer being used. Will be removed.
 * @breaking-change 15.0.0
 */
export const MENU_PANEL_TOP_PADDING = 8;

/** Mapping between menu panels and the last trigger that opened them. */
const PANELS_TO_TRIGGERS = new WeakMap<MatMenuPanel, MatMenuTrigger>();

/** Directive applied to an element that should trigger a `mat-menu`. */
@Directive({
  selector: `[mat-menu-trigger-for], [matMenuTriggerFor]`,
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
export class MatMenuTrigger implements AfterContentInit, OnDestroy {
  private _element = inject<ElementRef<HTMLElement>>(ElementRef);
  private _viewContainerRef = inject(ViewContainerRef);
  private _menuItemInstance = inject(MatMenuItem, {optional: true, self: true})!;
  private _dir = inject(Directionality, {optional: true});
  private _focusMonitor = inject(FocusMonitor);
  private _ngZone = inject(NgZone);
  private _injector = inject(Injector);
  private _scrollStrategy = inject(MAT_MENU_SCROLL_STRATEGY);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _animationsDisabled = _animationsDisabled();
  private _cleanupTouchstart: () => void;

  private _portal: TemplatePortal;
  private _overlayRef: OverlayRef | null = null;
  private _menuOpen: boolean = false;
  private _closingActionsSubscription = Subscription.EMPTY;
  private _hoverSubscription = Subscription.EMPTY;
  private _menuCloseSubscription = Subscription.EMPTY;
  private _pendingRemoval: Subscription | undefined;

  /**
   * We're specifically looking for a `MatMenu` here since the generic `MatMenuPanel`
   * interface lacks some functionality around nested menus and animations.
   */
  private _parentMaterialMenu: MatMenu | undefined;

  /**
   * Cached value of the padding of the parent menu panel.
   * Used to offset sub-menus to compensate for the padding.
   */
  private _parentInnerPadding: number | undefined;

  // Tracking input type is necessary so it's possible to only auto-focus
  // the first item of the list when the menu is opened via the keyboard
  _openedBy: Exclude<FocusOrigin, 'program' | null> | undefined = undefined;

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
    if (menu === this._menu) {
      return;
    }

    this._menu = menu;
    this._menuCloseSubscription.unsubscribe();

    if (menu) {
      if (menu === this._parentMaterialMenu && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throwMatMenuRecursiveError();
      }

      this._menuCloseSubscription = menu.close.subscribe((reason: MenuCloseReason) => {
        this._destroyMenu(reason);

        // If a click closed the menu, we should close the entire chain of nested menus.
        if ((reason === 'click' || reason === 'tab') && this._parentMaterialMenu) {
          this._parentMaterialMenu.closed.emit(reason);
        }
      });
    }

    this._menuItemInstance?._setTriggersSubmenu(this.triggersSubmenu());
  }
  private _menu: MatMenuPanel | null;

  /** Data to be passed along to any lazily-rendered content. */
  @Input('matMenuTriggerData') menuData: any;

  /**
   * Whether focus should be restored when the menu is closed.
   * Note that disabling this option can have accessibility implications
   * and it's up to you to manage focus, if you decide to turn it off.
   */
  @Input('matMenuTriggerRestoreFocus') restoreFocus: boolean = true;

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
    const parentMenu = inject<MatMenuPanel>(MAT_MENU_PANEL, {optional: true});
    const renderer = inject(Renderer2);

    this._parentMaterialMenu = parentMenu instanceof MatMenu ? parentMenu : undefined;
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

  ngAfterContentInit() {
    this._handleHover();
  }

  ngOnDestroy() {
    if (this.menu && this._ownsMenu(this.menu)) {
      PANELS_TO_TRIGGERS.delete(this.menu);
    }

    this._cleanupTouchstart();
    this._pendingRemoval?.unsubscribe();
    this._menuCloseSubscription.unsubscribe();
    this._closingActionsSubscription.unsubscribe();
    this._hoverSubscription.unsubscribe();

    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }

  /** Whether the menu is open. */
  get menuOpen(): boolean {
    return this._menuOpen;
  }

  /** The text direction of the containing app. */
  get dir(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Whether the menu triggers a sub-menu or a top-level one. */
  triggersSubmenu(): boolean {
    return !!(this._menuItemInstance && this._parentMaterialMenu && this.menu);
  }

  /** Toggles the menu between the open and closed states. */
  toggleMenu(): void {
    return this._menuOpen ? this.closeMenu() : this.openMenu();
  }

  /** Opens the menu. */
  openMenu(): void {
    const menu = this.menu;

    if (this._menuOpen || !menu) {
      return;
    }

    this._pendingRemoval?.unsubscribe();
    const previousTrigger = PANELS_TO_TRIGGERS.get(menu);
    PANELS_TO_TRIGGERS.set(menu, this);

    // If the same menu is currently attached to another trigger,
    // we need to close it so it doesn't end up in a broken state.
    if (previousTrigger && previousTrigger !== this) {
      previousTrigger.closeMenu();
    }

    const overlayRef = this._createOverlay(menu);
    const overlayConfig = overlayRef.getConfig();
    const positionStrategy = overlayConfig.positionStrategy as FlexibleConnectedPositionStrategy;

    this._setPosition(menu, positionStrategy);
    overlayConfig.hasBackdrop =
      menu.hasBackdrop == null ? !this.triggersSubmenu() : menu.hasBackdrop;

    // We need the `hasAttached` check for the case where the user kicked off a removal animation,
    // but re-entered the menu. Re-attaching the same portal will trigger an error otherwise.
    if (!overlayRef.hasAttached()) {
      overlayRef.attach(this._getPortal(menu));
      menu.lazyContent?.attach(this.menuData);
    }

    this._closingActionsSubscription = this._menuClosingActions().subscribe(() => this.closeMenu());
    menu.parentMenu = this.triggersSubmenu() ? this._parentMaterialMenu : undefined;
    menu.direction = this.dir;
    menu.focusFirstItem(this._openedBy || 'program');
    this._setIsMenuOpen(true);

    if (menu instanceof MatMenu) {
      menu._setIsOpen(true);
      menu._directDescendantItems.changes.pipe(takeUntil(menu.close)).subscribe(() => {
        // Re-adjust the position without locking when the amount of items
        // changes so that the overlay is allowed to pick a new optimal position.
        positionStrategy.withLockedPosition(false).reapplyLastPosition();
        positionStrategy.withLockedPosition(true);
      });
    }
  }

  /** Closes the menu. */
  closeMenu(): void {
    this.menu?.close.emit();
  }

  /**
   * Focuses the menu trigger.
   * @param origin Source of the menu trigger's focus.
   */
  focus(origin?: FocusOrigin, options?: FocusOptions) {
    if (this._focusMonitor && origin) {
      this._focusMonitor.focusVia(this._element, origin, options);
    } else {
      this._element.nativeElement.focus(options);
    }
  }

  /**
   * Updates the position of the menu to ensure that it fits all options within the viewport.
   */
  updatePosition(): void {
    this._overlayRef?.updatePosition();
  }

  /** Closes the menu and does the necessary cleanup. */
  private _destroyMenu(reason: MenuCloseReason) {
    const overlayRef = this._overlayRef;
    const menu = this._menu;

    if (!overlayRef || !this.menuOpen) {
      return;
    }

    this._closingActionsSubscription.unsubscribe();
    this._pendingRemoval?.unsubscribe();

    // Note that we don't wait for the animation to finish if another trigger took
    // over the menu, because the panel will end up empty which looks glitchy.
    if (menu instanceof MatMenu && this._ownsMenu(menu)) {
      this._pendingRemoval = menu._animationDone.pipe(take(1)).subscribe(() => {
        overlayRef.detach();
        menu.lazyContent?.detach();
      });
      menu._setIsOpen(false);
    } else {
      overlayRef.detach();
      menu?.lazyContent?.detach();
    }

    if (menu && this._ownsMenu(menu)) {
      PANELS_TO_TRIGGERS.delete(menu);
    }

    // Always restore focus if the user is navigating using the keyboard or the menu was opened
    // programmatically. We don't restore for non-root triggers, because it can prevent focus
    // from making it back to the root trigger when closing a long chain of menus by clicking
    // on the backdrop.
    if (this.restoreFocus && (reason === 'keydown' || !this._openedBy || !this.triggersSubmenu())) {
      this.focus(this._openedBy);
    }

    this._openedBy = undefined;
    this._setIsMenuOpen(false);
  }

  // set state rather than toggle to support triggers sharing a menu
  private _setIsMenuOpen(isOpen: boolean): void {
    if (isOpen !== this._menuOpen) {
      this._menuOpen = isOpen;
      this._menuOpen ? this.menuOpened.emit() : this.menuClosed.emit();

      if (this.triggersSubmenu()) {
        this._menuItemInstance._setHighlighted(isOpen);
      }

      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * This method creates the overlay from the provided menu's template and saves its
   * OverlayRef so that it can be attached to the DOM when openMenu is called.
   */
  private _createOverlay(menu: MatMenuPanel): OverlayRef {
    if (!this._overlayRef) {
      const config = this._getOverlayConfig(menu);
      this._subscribeToPositions(
        menu,
        config.positionStrategy as FlexibleConnectedPositionStrategy,
      );
      this._overlayRef = createOverlayRef(this._injector, config);
      this._overlayRef.keydownEvents().subscribe(event => {
        if (this.menu instanceof MatMenu) {
          this.menu._handleKeydown(event);
        }
      });
    }

    return this._overlayRef;
  }

  /**
   * This method builds the configuration object needed to create the overlay, the OverlayState.
   * @returns OverlayConfig
   */
  private _getOverlayConfig(menu: MatMenuPanel): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: createFlexibleConnectedPositionStrategy(this._injector, this._element)
        .withLockedPosition()
        .withGrowAfterOpen()
        .withTransformOriginOn('.mat-menu-panel, .mat-mdc-menu-panel'),
      backdropClass: menu.backdropClass || 'cdk-overlay-transparent-backdrop',
      panelClass: menu.overlayPanelClass,
      scrollStrategy: this._scrollStrategy(),
      direction: this._dir || 'ltr',
      disableAnimations: this._animationsDisabled,
    });
  }

  /**
   * Listens to changes in the position of the overlay and sets the correct classes
   * on the menu based on the new position. This ensures the animation origin is always
   * correct, even if a fallback position is used for the overlay.
   */
  private _subscribeToPositions(menu: MatMenuPanel, position: FlexibleConnectedPositionStrategy) {
    if (menu.setPositionClasses) {
      position.positionChanges.subscribe(change => {
        this._ngZone.run(() => {
          const posX: MenuPositionX =
            change.connectionPair.overlayX === 'start' ? 'after' : 'before';
          const posY: MenuPositionY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';
          menu.setPositionClasses!(posX, posY);
        });
      });
    }
  }

  /**
   * Sets the appropriate positions on a position strategy
   * so the overlay connects with the trigger correctly.
   * @param positionStrategy Strategy whose position to update.
   */
  private _setPosition(menu: MatMenuPanel, positionStrategy: FlexibleConnectedPositionStrategy) {
    let [originX, originFallbackX]: HorizontalConnectionPos[] =
      menu.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'];

    let [overlayY, overlayFallbackY]: VerticalConnectionPos[] =
      menu.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];

    let [originY, originFallbackY] = [overlayY, overlayFallbackY];
    let [overlayX, overlayFallbackX] = [originX, originFallbackX];
    let offsetY = 0;

    if (this.triggersSubmenu()) {
      // When the menu is a sub-menu, it should always align itself
      // to the edges of the trigger, instead of overlapping it.
      overlayFallbackX = originX = menu.xPosition === 'before' ? 'start' : 'end';
      originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';

      if (this._parentMaterialMenu) {
        if (this._parentInnerPadding == null) {
          const firstItem = this._parentMaterialMenu.items.first;
          this._parentInnerPadding = firstItem ? firstItem._getHostElement().offsetTop : 0;
        }

        offsetY = overlayY === 'bottom' ? this._parentInnerPadding : -this._parentInnerPadding;
      }
    } else if (!menu.overlapTrigger) {
      originY = overlayY === 'top' ? 'bottom' : 'top';
      originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
    }

    positionStrategy.withPositions([
      {originX, originY, overlayX, overlayY, offsetY},
      {originX: originFallbackX, originY, overlayX: overlayFallbackX, overlayY, offsetY},
      {
        originX,
        originY: originFallbackY,
        overlayX,
        overlayY: overlayFallbackY,
        offsetY: -offsetY,
      },
      {
        originX: originFallbackX,
        originY: originFallbackY,
        overlayX: overlayFallbackX,
        overlayY: overlayFallbackY,
        offsetY: -offsetY,
      },
    ]);
  }

  /** Returns a stream that emits whenever an action that should close the menu occurs. */
  private _menuClosingActions() {
    const backdrop = this._overlayRef!.backdropClick();
    const detachments = this._overlayRef!.detachments();
    const parentClose = this._parentMaterialMenu ? this._parentMaterialMenu.closed : observableOf();
    const hover = this._parentMaterialMenu
      ? this._parentMaterialMenu
          ._hovered()
          .pipe(filter(active => this._menuOpen && active !== this._menuItemInstance))
      : observableOf();

    return merge(backdrop, parentClose as Observable<MenuCloseReason>, hover, detachments);
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
          this.openMenu();
        }
      });
    }
  }

  /** Gets the portal that should be attached to the overlay. */
  private _getPortal(menu: MatMenuPanel): TemplatePortal {
    // Note that we can avoid this check by keeping the portal on the menu panel.
    // While it would be cleaner, we'd have to introduce another required method on
    // `MatMenuPanel`, making it harder to consume.
    if (!this._portal || this._portal.templateRef !== menu.templateRef) {
      this._portal = new TemplatePortal(menu.templateRef, this._viewContainerRef);
    }

    return this._portal;
  }

  /**
   * Determines whether the trigger owns a specific menu panel, at the current point in time.
   * This allows us to distinguish the case where the same panel is passed into multiple triggers
   * and multiple are open at a time.
   */
  private _ownsMenu(menu: MatMenuPanel): boolean {
    return PANELS_TO_TRIGGERS.get(menu) === this;
  }
}
