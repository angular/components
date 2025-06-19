/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  booleanAttribute,
  Directive,
  DOCUMENT,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import {MatMenuTriggerBase} from './menu-trigger-base';
import {
  FlexibleConnectedPositionStrategy,
  OverlayRef,
  ScrollDispatcher,
  ViewportRuler,
} from '@angular/cdk/overlay';
import {_getEventTarget, _getShadowRoot} from '@angular/cdk/platform';
import {Subscription} from 'rxjs';
import {skipWhile} from 'rxjs/operators';
import {MatMenuPanel} from './menu-panel';
import {_animationsDisabled} from '../core';
import {MenuCloseReason} from './menu';

/**
 * Trigger that opens a menu whenever the user right-clicks within its host element.
 */
@Directive({
  selector: '[matContextMenuTriggerFor]',
  host: {
    'class': 'mat-context-menu-trigger',
    '[class.mat-context-menu-trigger-disabled]': 'disabled',
    '[attr.aria-controls]': 'menuOpen ? menu?.panelId : null',
    '(contextmenu)': '_handleContextMenuEvent($event)',
  },
  exportAs: 'matContextMenuTrigger',
})
export class MatContextMenuTrigger extends MatMenuTriggerBase implements OnDestroy {
  private _point = {x: 0, y: 0, initialX: 0, initialY: 0, initialScrollX: 0, initialScrollY: 0};
  private _triggerPressedControl = false;
  private _rootNode: DocumentOrShadowRoot | undefined;
  private _document = inject(DOCUMENT);
  private _viewportRuler = inject(ViewportRuler);
  private _scrollDispatcher = inject(ScrollDispatcher);
  private _scrollSubscription: Subscription | undefined;

  /** References the menu instance that the trigger is associated with. */
  @Input({alias: 'matContextMenuTriggerFor', required: true})
  get menu(): MatMenuPanel | null {
    return this._menu;
  }
  set menu(menu: MatMenuPanel | null) {
    this._menu = menu;
  }

  /** Data to be passed along to any lazily-rendered content. */
  @Input('matContextMenuTriggerData')
  override menuData: any;

  /**
   * Whether focus should be restored when the menu is closed.
   * Note that disabling this option can have accessibility implications
   * and it's up to you to manage focus, if you decide to turn it off.
   */
  @Input('matContextMenuTriggerRestoreFocus')
  override restoreFocus: boolean = true;

  /** Whether the context menu is disabled. */
  @Input({alias: 'matContextMenuTriggerDisabled', transform: booleanAttribute})
  disabled: boolean = false;

  /** Event emitted when the associated menu is opened. */
  @Output()
  readonly menuOpened: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted when the associated menu is closed. */
  @Output() readonly menuClosed: EventEmitter<void> = new EventEmitter<void>();

  constructor() {
    super(false);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this._scrollSubscription?.unsubscribe();
  }

  /** Handler for `contextmenu` events. */
  protected _handleContextMenuEvent(event: MouseEvent) {
    if (!this.disabled) {
      event.preventDefault();

      // If the menu is already open, only update its position.
      if (this.menuOpen) {
        this._initializePoint(event.clientX, event.clientY);
        this._updatePosition();
      } else {
        this._openContextMenu(event);
      }
    }
  }

  protected override _destroyMenu(reason: MenuCloseReason): void {
    super._destroyMenu(reason);
    this._scrollSubscription?.unsubscribe();
  }

  protected override _getOverlayOrigin() {
    return this._point;
  }

  protected override _getOutsideClickStream(overlayRef: OverlayRef) {
    return overlayRef.outsidePointerEvents().pipe(
      skipWhile((event, index) => {
        if (event.type === 'contextmenu') {
          // Do not close when attempting to open a context menu within the trigger.
          return this._isWithinMenuOrTrigger(_getEventTarget(event) as Element);
        } else if (event.type === 'auxclick') {
          // Skip the first `auxclick` since it happens at
          // the same time as the event that opens the menu.
          if (index === 0) {
            return true;
          }

          // Do not close on `auxclick` within the menu since we want to reposition the menu
          // instead. Note that we have to resolve the clicked element using its position,
          // rather than `event.target`, because the `target` is set to the `body`.
          this._rootNode ??= _getShadowRoot(this._element.nativeElement) || this._document;
          return this._isWithinMenuOrTrigger(
            this._rootNode.elementFromPoint(event.clientX, event.clientY),
          );
        }

        // Using a mouse, the `contextmenu` event can fire either when pressing the right button
        // or left button + control. Most browsers won't dispatch a `click` event right after
        // a `contextmenu` event triggered by left button + control, but Safari will (see #27832).
        // This closes the menu immediately. To work around it, we check that both the triggering
        // event and the current outside click event both had the control key pressed, and that
        // that this is the first outside click event.
        return this._triggerPressedControl && index === 0 && event.ctrlKey;
      }),
    );
  }

  /** Checks whether an element is within the trigger or the opened overlay. */
  private _isWithinMenuOrTrigger(target: Element | null): boolean {
    if (!target) {
      return false;
    }

    const element = this._element.nativeElement;
    if (target === element || element.contains(target)) {
      return true;
    }

    const overlay = this._overlayRef?.hostElement;
    return overlay === target || !!overlay?.contains(target);
  }

  /** Opens the context menu. */
  private _openContextMenu(event: MouseEvent) {
    // A context menu can be triggered via a mouse right click or a keyboard shortcut.
    if (event.button === 2) {
      this._openedBy = 'mouse';
    } else {
      this._openedBy = event.button === 0 ? 'keyboard' : undefined;
    }

    this._initializePoint(event.clientX, event.clientY);
    this._triggerPressedControl = event.ctrlKey;
    super._openMenu(true);
    this._scrollSubscription?.unsubscribe();
    this._scrollSubscription = this._scrollDispatcher.scrolled(0).subscribe(() => {
      // When passing a point to the connected position strategy, the position
      // won't update as the user is scrolling so we have to do it manually.
      const position = this._viewportRuler.getViewportScrollPosition();
      const point = this._point;
      point.y = point.initialY + (point.initialScrollY - position.top);
      point.x = point.initialX + (point.initialScrollX - position.left);
      this._updatePosition();
    });
  }

  /** Initializes the point representing the origin relative to which the menu will be rendered. */
  private _initializePoint(x: number, y: number) {
    const scrollPosition = this._viewportRuler.getViewportScrollPosition();
    const point = this._point;
    point.x = point.initialX = x;
    point.y = point.initialY = y;
    point.initialScrollX = scrollPosition.left;
    point.initialScrollY = scrollPosition.top;
  }

  /** Refreshes the position of the overlay. */
  private _updatePosition() {
    const overlayRef = this._overlayRef;

    if (overlayRef) {
      const positionStrategy = overlayRef.getConfig()
        .positionStrategy as FlexibleConnectedPositionStrategy;
      positionStrategy.setOrigin(this._point);
      overlayRef.updatePosition();
    }
  }
}
