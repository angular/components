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
  ElementRef,
  ContentChildren,
  QueryList,
  AfterContentInit,
  Inject,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {_getShadowRoot} from '@angular/cdk/platform';
import {fromEvent, Observable, merge} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CdkMenuGroup} from './menu-group';
import {CDK_MENU, Menu} from './menu-interface';
import {CdkMenuItem} from './menu-item';
import {CloseEventCause} from './menu-item-trigger';

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
    'role': 'menubar',
    '[attr.aria-orientation]': 'orientation',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: CdkMenuBar},
    {provide: CDK_MENU, useExisting: CdkMenuBar},
  ],
})
export class CdkMenuBar extends CdkMenuGroup implements Menu, AfterContentInit, OnDestroy {
  /**
   * Sets the aria-orientation attribute and determines where menus will be opened.
   * Does not affect styling/layout.
   */
  @Input('cdkMenuBarOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

  /** All child MenuItem elements nested in this MenuBar. */
  @ContentChildren(CdkMenuItem, {descendants: true})
  private readonly _allItems: QueryList<CdkMenuItem>;

  /** Event emitter used to end the subscription to document click events. */
  private readonly _destroyDocumentSubscription: EventEmitter<void> = new EventEmitter();

  /** A reference to the document. */
  private readonly _document: Document;

  /** Whether the element is inside of a ShadowRoot component. */
  private _isInsideShadowRoot: boolean;

  constructor(
    private readonly _elementRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) document: any
  ) {
    super();

    this._document = document;
  }

  ngAfterContentInit() {
    super.ngAfterContentInit();

    this._configChildSubscriptions();
  }

  /**
   * Returns true if this MenuBar, or any open Menu triggered by a MenuItem in this MenuBar,
   * contains the given HTMLElement.
   * @param element the element to search for.
   */
  _contains(element: HTMLElement) {
    return (
      this._elementRef.nativeElement.contains(element) ||
      this._allItems
        .filter(menuItem => menuItem.hasMenu() && menuItem._menuTrigger!.isMenuOpen())
        .some(menuItem => menuItem._menuTrigger!._menuPanel!._menu!._contains(element))
    );
  }

  /**
   * Configure child MenuItem subscriptions and ensure that future child elements are also
   * subscribed to.
   */
  private _configChildSubscriptions() {
    this._allItems
      .filter(menuItem => menuItem.hasMenu())
      .forEach(menuItem => this._subscribeToTriggers(menuItem));

    this._allItems.changes.subscribe((menuItems: QueryList<CdkMenuItem>) => {
      menuItems
        .filter(menuItem => menuItem.hasMenu())
        .forEach(menuItem => this._subscribeToTriggers(menuItem));
    });
  }

  /**
   * Subscribe to the MenuItem open and close event emitters which toggle the subscription to
   * document click events.
   * @param menuItem the MenuItem to subscribe to.
   */
  private _subscribeToTriggers(menuItem: CdkMenuItem) {
    menuItem._menuTrigger!.opened.subscribe(() => this._requestDocumentSubscription(menuItem));
    menuItem._menuTrigger!.closed.subscribe((eventType: CloseEventCause) =>
      this._requestDocumentSubscriptionEnd(eventType)
    );
  }

  /**
   * Start listening to Document click events if there is no document click event listener
   * registered. The listener will close out the open menu when a click occurs outside the
   * menu tree.
   * @param menuItem the MenuItem which opened the menu.
   */
  private _requestDocumentSubscription(menuItem: CdkMenuItem) {
    if (!this._isListeningToDocument()) {
      merge(
        fromEvent(this._document, 'click') as Observable<MouseEvent>,
        fromEvent(this._document, 'touchend') as Observable<TouchEvent>
      )
        .pipe(takeUntil(this._destroyDocumentSubscription))
        .subscribe(event => {
          // we need to consider whether or not the outside click event occurred while the
          // element is in the Shadow DOM when fetching the click target.
          const clickTarget = (this._isShadowRoot() && event.composedPath
            ? event.composedPath()[0]
            : event.target) as HTMLElement;

          if (!this._contains(clickTarget)) {
            menuItem.trigger();
          }
        });
    }
  }

  /**
   * Stop the document click listener if one is configured.
   * @param eventType the type of event which closed the menu.
   */
  private _requestDocumentSubscriptionEnd(eventType: CloseEventCause) {
    // Since a hover from one MenuItemTrigger to another will cause the first menu to close and
    // second menu to open we ignore hover close events in order to prevent unnecessary
    /// re-subscriptions. We only want to unsubscribe when all menus are fully closed.
    if (eventType !== 'hover') {
      this._destroyDocumentSubscription.next();
    }
  }

  /** Return true if there is an active document click listener. */
  private _isListeningToDocument() {
    return this._destroyDocumentSubscription.observers.length > 0;
  }

  /**
   * Determine once whether the element is in the Shadow DOM and return the result. Note that the
   * result is cached and will be the same on subsequent calls to this method.
   */
  private _isShadowRoot() {
    if (this._isInsideShadowRoot === undefined) {
      this._isInsideShadowRoot = !!_getShadowRoot(this._elementRef.nativeElement);
    }
    return this._isInsideShadowRoot;
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this._destroyDocumentSubscription.next();
    this._destroyDocumentSubscription.complete();
  }
}
