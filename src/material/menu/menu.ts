/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  NgZone,
  OnDestroy,
  Output,
  TemplateRef,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
  booleanAttribute,
  afterNextRender,
  AfterRenderRef,
  inject,
  Injector,
} from '@angular/core';
import {AnimationEvent} from '@angular/animations';
import {FocusKeyManager, FocusOrigin} from '@angular/cdk/a11y';
import {Direction} from '@angular/cdk/bidi';
import {
  ESCAPE,
  LEFT_ARROW,
  RIGHT_ARROW,
  DOWN_ARROW,
  UP_ARROW,
  hasModifierKey,
} from '@angular/cdk/keycodes';
import {merge, Observable, Subject} from 'rxjs';
import {startWith, switchMap} from 'rxjs/operators';
import {MatMenuItem} from './menu-item';
import {MatMenuPanel, MAT_MENU_PANEL} from './menu-panel';
import {MenuPositionX, MenuPositionY} from './menu-positions';
import {throwMatMenuInvalidPositionX, throwMatMenuInvalidPositionY} from './menu-errors';
import {MatMenuContent, MAT_MENU_CONTENT} from './menu-content';
import {matMenuAnimations} from './menu-animations';

let menuPanelUid = 0;

/** Reason why the menu was closed. */
export type MenuCloseReason = void | 'click' | 'keydown' | 'tab';

/** Default `mat-menu` options that can be overridden. */
export interface MatMenuDefaultOptions {
  /** The x-axis position of the menu. */
  xPosition: MenuPositionX;

  /** The y-axis position of the menu. */
  yPosition: MenuPositionY;

  /** Whether the menu should overlap the menu trigger. */
  overlapTrigger: boolean;

  /** Class to be applied to the menu's backdrop. */
  backdropClass: string;

  /** Class or list of classes to be applied to the menu's overlay panel. */
  overlayPanelClass?: string | string[];

  /** Whether the menu has a backdrop. */
  hasBackdrop?: boolean;
}

/** Injection token to be used to override the default options for `mat-menu`. */
export const MAT_MENU_DEFAULT_OPTIONS = new InjectionToken<MatMenuDefaultOptions>(
  'mat-menu-default-options',
  {
    providedIn: 'root',
    factory: MAT_MENU_DEFAULT_OPTIONS_FACTORY,
  },
);

/** @docs-private */
export function MAT_MENU_DEFAULT_OPTIONS_FACTORY(): MatMenuDefaultOptions {
  return {
    overlapTrigger: false,
    xPosition: 'after',
    yPosition: 'below',
    backdropClass: 'cdk-overlay-transparent-backdrop',
  };
}

@Component({
  selector: 'mat-menu',
  templateUrl: 'menu.html',
  styleUrl: 'menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matMenu',
  host: {
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
  },
  animations: [matMenuAnimations.transformMenu, matMenuAnimations.fadeInItems],
  providers: [{provide: MAT_MENU_PANEL, useExisting: MatMenu}],
  standalone: true,
})
export class MatMenu implements AfterContentInit, MatMenuPanel<MatMenuItem>, OnInit, OnDestroy {
  private _keyManager: FocusKeyManager<MatMenuItem>;
  private _xPosition: MenuPositionX;
  private _yPosition: MenuPositionY;
  private _firstItemFocusRef?: AfterRenderRef;
  private _previousElevation: string;
  private _elevationPrefix = 'mat-elevation-z';
  private _baseElevation: number | null = null;

  /** All items inside the menu. Includes items nested inside another menu. */
  @ContentChildren(MatMenuItem, {descendants: true}) _allItems: QueryList<MatMenuItem>;

  /** Only the direct descendant menu items. */
  _directDescendantItems = new QueryList<MatMenuItem>();

  /** Classes to be applied to the menu panel. */
  _classList: {[key: string]: boolean} = {};

  /** Current state of the panel animation. */
  _panelAnimationState: 'void' | 'enter' = 'void';

  /** Emits whenever an animation on the menu completes. */
  readonly _animationDone = new Subject<AnimationEvent>();

  /** Whether the menu is animating. */
  _isAnimating: boolean;

  /** Parent menu of the current menu panel. */
  parentMenu: MatMenuPanel | undefined;

  /** Layout direction of the menu. */
  direction: Direction;

  /** Class or list of classes to be added to the overlay panel. */
  overlayPanelClass: string | string[];

  /** Class to be added to the backdrop element. */
  @Input() backdropClass: string;

  /** aria-label for the menu panel. */
  @Input('aria-label') ariaLabel: string;

  /** aria-labelledby for the menu panel. */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** aria-describedby for the menu panel. */
  @Input('aria-describedby') ariaDescribedby: string;

  /** Position of the menu in the X axis. */
  @Input()
  get xPosition(): MenuPositionX {
    return this._xPosition;
  }
  set xPosition(value: MenuPositionX) {
    if (
      value !== 'before' &&
      value !== 'after' &&
      (typeof ngDevMode === 'undefined' || ngDevMode)
    ) {
      throwMatMenuInvalidPositionX();
    }
    this._xPosition = value;
    this.setPositionClasses();
  }

  /** Position of the menu in the Y axis. */
  @Input()
  get yPosition(): MenuPositionY {
    return this._yPosition;
  }
  set yPosition(value: MenuPositionY) {
    if (value !== 'above' && value !== 'below' && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throwMatMenuInvalidPositionY();
    }
    this._yPosition = value;
    this.setPositionClasses();
  }

  /** @docs-private */
  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  /**
   * List of the items inside of a menu.
   * @deprecated
   * @breaking-change 8.0.0
   */
  @ContentChildren(MatMenuItem, {descendants: false}) items: QueryList<MatMenuItem>;

  /**
   * Menu content that will be rendered lazily.
   * @docs-private
   */
  @ContentChild(MAT_MENU_CONTENT) lazyContent: MatMenuContent;

  /** Whether the menu should overlap its trigger. */
  @Input({transform: booleanAttribute}) overlapTrigger: boolean;

  /** Whether the menu has a backdrop. */
  @Input({transform: (value: any) => (value == null ? null : booleanAttribute(value))})
  hasBackdrop?: boolean;

  /**
   * This method takes classes set on the host mat-menu element and applies them on the
   * menu template that displays in the overlay container.  Otherwise, it's difficult
   * to style the containing menu from outside the component.
   * @param classes list of class names
   */
  @Input('class')
  set panelClass(classes: string) {
    const previousPanelClass = this._previousPanelClass;
    const newClassList = {...this._classList};

    if (previousPanelClass && previousPanelClass.length) {
      previousPanelClass.split(' ').forEach((className: string) => {
        newClassList[className] = false;
      });
    }

    this._previousPanelClass = classes;

    if (classes && classes.length) {
      classes.split(' ').forEach((className: string) => {
        newClassList[className] = true;
      });

      this._elementRef.nativeElement.className = '';
    }

    this._classList = newClassList;
  }
  private _previousPanelClass: string;

  /**
   * This method takes classes set on the host mat-menu element and applies them on the
   * menu template that displays in the overlay container.  Otherwise, it's difficult
   * to style the containing menu from outside the component.
   * @deprecated Use `panelClass` instead.
   * @breaking-change 8.0.0
   */
  @Input()
  get classList(): string {
    return this.panelClass;
  }
  set classList(classes: string) {
    this.panelClass = classes;
  }

  /** Event emitted when the menu is closed. */
  @Output() readonly closed: EventEmitter<MenuCloseReason> = new EventEmitter<MenuCloseReason>();

  /**
   * Event emitted when the menu is closed.
   * @deprecated Switch to `closed` instead
   * @breaking-change 8.0.0
   */
  @Output() readonly close: EventEmitter<MenuCloseReason> = this.closed;

  readonly panelId = `mat-menu-panel-${menuPanelUid++}`;

  private _injector = inject(Injector);

  constructor(
    elementRef: ElementRef<HTMLElement>,
    ngZone: NgZone,
    defaultOptions: MatMenuDefaultOptions,
    changeDetectorRef: ChangeDetectorRef,
  );

  /**
   * @deprecated `_changeDetectorRef` to become a required parameter.
   * @breaking-change 15.0.0
   */
  constructor(
    elementRef: ElementRef<HTMLElement>,
    ngZone: NgZone,
    defaultOptions: MatMenuDefaultOptions,
    changeDetectorRef?: ChangeDetectorRef,
  );

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    /**
     * @deprecated Unused param, will be removed.
     * @breaking-change 19.0.0
     */
    _unusedNgZone: NgZone,
    @Inject(MAT_MENU_DEFAULT_OPTIONS) defaultOptions: MatMenuDefaultOptions,
    // @breaking-change 15.0.0 `_changeDetectorRef` to become a required parameter.
    private _changeDetectorRef?: ChangeDetectorRef,
  ) {
    this.overlayPanelClass = defaultOptions.overlayPanelClass || '';
    this._xPosition = defaultOptions.xPosition;
    this._yPosition = defaultOptions.yPosition;
    this.backdropClass = defaultOptions.backdropClass;
    this.overlapTrigger = defaultOptions.overlapTrigger;
    this.hasBackdrop = defaultOptions.hasBackdrop;
  }

  ngOnInit() {
    this.setPositionClasses();
  }

  ngAfterContentInit() {
    this._updateDirectDescendants();
    this._keyManager = new FocusKeyManager(this._directDescendantItems)
      .withWrap()
      .withTypeAhead()
      .withHomeAndEnd();
    this._keyManager.tabOut.subscribe(() => this.closed.emit('tab'));

    // If a user manually (programmatically) focuses a menu item, we need to reflect that focus
    // change back to the key manager. Note that we don't need to unsubscribe here because _focused
    // is internal and we know that it gets completed on destroy.
    this._directDescendantItems.changes
      .pipe(
        startWith(this._directDescendantItems),
        switchMap(items => merge(...items.map((item: MatMenuItem) => item._focused))),
      )
      .subscribe(focusedItem => this._keyManager.updateActiveItem(focusedItem as MatMenuItem));

    this._directDescendantItems.changes.subscribe((itemsList: QueryList<MatMenuItem>) => {
      // Move focus to another item, if the active item is removed from the list.
      // We need to debounce the callback, because multiple items might be removed
      // in quick succession.
      const manager = this._keyManager;

      if (this._panelAnimationState === 'enter' && manager.activeItem?._hasFocus()) {
        const items = itemsList.toArray();
        const index = Math.max(0, Math.min(items.length - 1, manager.activeItemIndex || 0));

        if (items[index] && !items[index].disabled) {
          manager.setActiveItem(index);
        } else {
          manager.setNextItemActive();
        }
      }
    });
  }

  ngOnDestroy() {
    this._keyManager?.destroy();
    this._directDescendantItems.destroy();
    this.closed.complete();
    this._firstItemFocusRef?.destroy();
  }

  /** Stream that emits whenever the hovered menu item changes. */
  _hovered(): Observable<MatMenuItem> {
    // Coerce the `changes` property because Angular types it as `Observable<any>`
    const itemChanges = this._directDescendantItems.changes as Observable<QueryList<MatMenuItem>>;
    return itemChanges.pipe(
      startWith(this._directDescendantItems),
      switchMap(items => merge(...items.map((item: MatMenuItem) => item._hovered))),
    ) as Observable<MatMenuItem>;
  }

  /*
   * Registers a menu item with the menu.
   * @docs-private
   * @deprecated No longer being used. To be removed.
   * @breaking-change 9.0.0
   */
  addItem(_item: MatMenuItem) {}

  /**
   * Removes an item from the menu.
   * @docs-private
   * @deprecated No longer being used. To be removed.
   * @breaking-change 9.0.0
   */
  removeItem(_item: MatMenuItem) {}

  /** Handle a keyboard event from the menu, delegating to the appropriate action. */
  _handleKeydown(event: KeyboardEvent) {
    const keyCode = event.keyCode;
    const manager = this._keyManager;

    switch (keyCode) {
      case ESCAPE:
        if (!hasModifierKey(event)) {
          event.preventDefault();
          this.closed.emit('keydown');
        }
        break;
      case LEFT_ARROW:
        if (this.parentMenu && this.direction === 'ltr') {
          this.closed.emit('keydown');
        }
        break;
      case RIGHT_ARROW:
        if (this.parentMenu && this.direction === 'rtl') {
          this.closed.emit('keydown');
        }
        break;
      default:
        if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
          manager.setFocusOrigin('keyboard');
        }

        manager.onKeydown(event);
        return;
    }

    // Don't allow the event to propagate if we've already handled it, or it may
    // end up reaching other overlays that were opened earlier (see #22694).
    event.stopPropagation();
  }

  /**
   * Focus the first item in the menu.
   * @param origin Action from which the focus originated. Used to set the correct styling.
   */
  focusFirstItem(origin: FocusOrigin = 'program'): void {
    // Wait for `afterNextRender` to ensure iOS VoiceOver screen reader focuses the first item (#24735).
    this._firstItemFocusRef?.destroy();
    this._firstItemFocusRef = afterNextRender(
      () => {
        let menuPanel: HTMLElement | null = null;

        if (this._directDescendantItems.length) {
          // Because the `mat-menuPanel` is at the DOM insertion point, not inside the overlay, we don't
          // have a nice way of getting a hold of the menuPanel panel. We can't use a `ViewChild` either
          // because the panel is inside an `ng-template`. We work around it by starting from one of
          // the items and walking up the DOM.
          menuPanel = this._directDescendantItems.first!._getHostElement().closest('[role="menu"]');
        }

        // If an item in the menuPanel is already focused, avoid overriding the focus.
        if (!menuPanel || !menuPanel.contains(document.activeElement)) {
          const manager = this._keyManager;
          manager.setFocusOrigin(origin).setFirstItemActive();

          // If there's no active item at this point, it means that all the items are disabled.
          // Move focus to the menuPanel panel so keyboard events like Escape still work. Also this will
          // give _some_ feedback to screen readers.
          if (!manager.activeItem && menuPanel) {
            menuPanel.focus();
          }
        }
      },
      {injector: this._injector},
    );
  }

  /**
   * Resets the active item in the menu. This is used when the menu is opened, allowing
   * the user to start from the first option when pressing the down arrow.
   */
  resetActiveItem() {
    this._keyManager.setActiveItem(-1);
  }

  /**
   * Sets the menu panel elevation.
   * @param depth Number of parent menus that come before the menu.
   */
  setElevation(depth: number): void {
    // The base elevation depends on which version of the spec
    // we're running so we have to resolve it at runtime.
    if (this._baseElevation === null) {
      const styles =
        typeof getComputedStyle === 'function'
          ? getComputedStyle(this._elementRef.nativeElement)
          : null;
      const value = styles?.getPropertyValue('--mat-menu-base-elevation-level') || '8';
      this._baseElevation = parseInt(value);
    }

    // The elevation starts at the base and increases by one for each level.
    // Capped at 24 because that's the maximum elevation defined in the Material design spec.
    const elevation = Math.min(this._baseElevation + depth, 24);
    const newElevation = `${this._elevationPrefix}${elevation}`;
    const customElevation = Object.keys(this._classList).find(className => {
      return className.startsWith(this._elevationPrefix);
    });

    if (!customElevation || customElevation === this._previousElevation) {
      const newClassList = {...this._classList};

      if (this._previousElevation) {
        newClassList[this._previousElevation] = false;
      }

      newClassList[newElevation] = true;
      this._previousElevation = newElevation;
      this._classList = newClassList;
    }
  }

  /**
   * Adds classes to the menu panel based on its position. Can be used by
   * consumers to add specific styling based on the position.
   * @param posX Position of the menu along the x axis.
   * @param posY Position of the menu along the y axis.
   * @docs-private
   */
  setPositionClasses(posX: MenuPositionX = this.xPosition, posY: MenuPositionY = this.yPosition) {
    this._classList = {
      ...this._classList,
      ['mat-menu-before']: posX === 'before',
      ['mat-menu-after']: posX === 'after',
      ['mat-menu-above']: posY === 'above',
      ['mat-menu-below']: posY === 'below',
    };

    // @breaking-change 15.0.0 Remove null check for `_changeDetectorRef`.
    this._changeDetectorRef?.markForCheck();
  }

  /** Starts the enter animation. */
  _startAnimation() {
    // @breaking-change 8.0.0 Combine with _resetAnimation.
    this._panelAnimationState = 'enter';
  }

  /** Resets the panel animation to its initial state. */
  _resetAnimation() {
    // @breaking-change 8.0.0 Combine with _startAnimation.
    this._panelAnimationState = 'void';
  }

  /** Callback that is invoked when the panel animation completes. */
  _onAnimationDone(event: AnimationEvent) {
    this._animationDone.next(event);
    this._isAnimating = false;
  }

  _onAnimationStart(event: AnimationEvent) {
    this._isAnimating = true;

    // Scroll the content element to the top as soon as the animation starts. This is necessary,
    // because we move focus to the first item while it's still being animated, which can throw
    // the browser off when it determines the scroll position. Alternatively we can move focus
    // when the animation is done, however moving focus asynchronously will interrupt screen
    // readers which are in the process of reading out the menu already. We take the `element`
    // from the `event` since we can't use a `ViewChild` to access the pane.
    if (event.toState === 'enter' && this._keyManager.activeItemIndex === 0) {
      event.element.scrollTop = 0;
    }
  }

  /**
   * Sets up a stream that will keep track of any newly-added menu items and will update the list
   * of direct descendants. We collect the descendants this way, because `_allItems` can include
   * items that are part of child menus, and using a custom way of registering items is unreliable
   * when it comes to maintaining the item order.
   */
  private _updateDirectDescendants() {
    this._allItems.changes
      .pipe(startWith(this._allItems))
      .subscribe((items: QueryList<MatMenuItem>) => {
        this._directDescendantItems.reset(items.filter(item => item._parentMenu === this));
        this._directDescendantItems.notifyOnChanges();
      });
  }
}
