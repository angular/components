/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  ContentChildren,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Inject,
  NgZone,
  OnDestroy,
  QueryList
} from '@angular/core';
import {RippleConfig, RippleRenderer, RippleTarget, setLines} from '@angular/material/core';
import {MDCListAdapter, MDCListFoundation} from '@material/list';
import {Subscription} from 'rxjs';
import {startWith} from 'rxjs/operators';

function toggleClass(el: Element, className: string, on: boolean) {
  if (on) {
    el.classList.add(className);
  } else {
    el.classList.remove(className);
  }
}

class ListAdapter implements MDCListAdapter {
  constructor(private _delegate: MatInteractiveListBase) {}

  getListItemCount() {
    return this._delegate._items.length;
  }
  listItemAtIndexHasClass(index: number, className: string) {
    return this._delegate._elementAtIndex(index).classList.contains(className);
  }
  addClassForElementIndex(index: number, className: string) {
    return this._delegate._elementAtIndex(index).classList.add(className);
  }
  removeClassForElementIndex(index: number, className: string) {
    return this._delegate._elementAtIndex(index).classList.remove(className);
  }
  getAttributeForElementIndex(index: number, attr: string) {
    return this._delegate._elementAtIndex(index).getAttribute(attr);
  }
  setAttributeForElementIndex(index: number, attr: string, value: string) {
    return this._delegate._elementAtIndex(index).setAttribute(attr, value);
  }
  getFocusedElementIndex() {
    return this._delegate._indexForElement(this._delegate.getDocument()?.activeElement);
  }
  isFocusInsideList() {
    return this._delegate.getElement().nativeElement.contains(
      this._delegate.getDocument()?.activeElement);
  }
  isRootFocused() {
    return this._delegate.getElement().nativeElement ===
      this._delegate.getDocument()?.activeElement;
  }
  focusItemAtIndex(index: number) {
    return this._delegate._elementAtIndex(index).focus();
  }

  // MDC uses this method to disable focusable children of list items. However, we believe that
  // this is not an accessible pattern and should be avoided, therefore we intentionally do not
  // implement this method. In addition, implementing this would require violating Angular
  // Material's general principle of not having components modify DOM elements they do not own.
  // A user who feels they really need this feature can simply listen to the `(focus)` and
  // `(blur)` events on the list item and enable/disable focus on the children themselves as
  // appropriate.
  setTabIndexForListItemChildren() {}

  // The following methods have a dummy implementation in the base class because they are only
  // applicable to certain types of lists. They should be implemented for the concrete classes
  // where they are applicable.
  hasCheckboxAtIndex() {
    return false;
  }
  hasRadioAtIndex() {
    return false;
  }
  setCheckedCheckboxOrRadioAtIndex() {}
  isCheckboxCheckedAtIndex() {
    return false;
  }

  // TODO(mmalerba): Determine if we need to implement these.
  getPrimaryTextAtIndex() {
    return '';
  }
  notifyAction() {}
}

@Directive()
/** @docs-private */
export abstract class MatListItemBase implements AfterContentInit, OnDestroy, RippleTarget {
  lines: QueryList<ElementRef<Element>>;

  rippleConfig: RippleConfig = {};

  // TODO(mmalerba): Add @Input for disabling ripple.
  rippleDisabled: boolean;

  private _subscriptions = new Subscription();

  private _rippleRenderer: RippleRenderer;

  protected constructor(public _elementRef: ElementRef<HTMLElement>, protected _ngZone: NgZone,
                        private _listBase: MatListBase, private _platform: Platform) {
    this._initRipple();
  }

  ngAfterContentInit() {
    this._monitorLines();
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this._rippleRenderer._removeTriggerEvents();
  }

  _initDefaultTabIndex(tabIndex: number) {
    const el = this._elementRef.nativeElement;
    if (!el.hasAttribute('tabIndex')) {
      el.tabIndex = tabIndex;
    }
  }

  private _initRipple() {
    this.rippleDisabled = this._listBase._isNonInteractive;
    if (!this._listBase._isNonInteractive) {
      this._elementRef.nativeElement.classList.add('mat-mdc-list-item-interactive');
    }
    this._rippleRenderer =
        new RippleRenderer(this, this._ngZone, this._elementRef.nativeElement, this._platform);
    this._rippleRenderer.setupTriggerEvents(this._elementRef.nativeElement);
  }

  /**
   * Subscribes to changes in `MatLine` content children and annotates them appropriately when they
   * change.
   */
  private _monitorLines() {
    this._ngZone.runOutsideAngular(() => {
      this._subscriptions.add(this.lines.changes.pipe(startWith(this.lines))
          .subscribe((lines: QueryList<ElementRef<Element>>) => {
            this._elementRef.nativeElement.classList
                .toggle('mat-mdc-list-item-single-line', lines.length <= 1);
            lines.forEach((line: ElementRef<Element>, index: number) => {
              toggleClass(line.nativeElement,
                  'mdc-list-item__primary-text', index === 0 && lines.length > 1);
              toggleClass(line.nativeElement, 'mdc-list-item__secondary-text', index !== 0);
            });
            setLines(lines, this._elementRef, 'mat-mdc');
          }));
    });
  }
}

@Directive()
/** @docs-private */
export abstract class MatListBase {
  @HostBinding('class.mdc-list--non-interactive')
  _isNonInteractive: boolean = true;
}

@Directive()
export abstract class MatInteractiveListBase extends MatListBase
    implements AfterViewInit, OnDestroy {
  @HostListener('keydown', ['$event'])
  _handleKeydown(event: KeyboardEvent) {
    const index = this._indexForElement(event.target as HTMLElement);
    this._foundation.handleKeydown(
        event, this._elementAtIndex(index) === event.target, index);
  }

  @HostListener('click', ['$event'])
  _handleClick(event: MouseEvent) {
    this._foundation.handleClick(this._indexForElement(event.target as HTMLElement), false);
  }

  @HostListener('focusin', ['$event'])
  _handleFocusin(event: FocusEvent) {
    this._foundation.handleFocusIn(event, this._indexForElement(event.target as HTMLElement));
  }

  @HostListener('focusout', ['$event'])
  _handleFocusout(event: FocusEvent) {
    this._foundation.handleFocusOut(event, this._indexForElement(event.target as HTMLElement));
  }

  @ContentChildren(MatListItemBase, {descendants: true}) _items: QueryList<MatListItemBase>;

  protected _adapter: MDCListAdapter;

  protected _foundation: MDCListFoundation;

  protected _document: Document;

  private _itemsArr: MatListItemBase[] = [];

  private _subscriptions = new Subscription();

  constructor(protected _element: ElementRef<HTMLElement>, @Inject(DOCUMENT) document: any) {
    super();
    this._document = document;
    this._isNonInteractive = false;
    this._adapter = new ListAdapter(this);
    this._foundation = new MDCListFoundation(this._adapter);
  }

  ngAfterViewInit() {
    this._initItems();
    this._foundation.init();
    this._foundation.layout();
  }

  ngOnDestroy() {
    this._foundation.destroy();
    this._subscriptions.unsubscribe();
  }

  getItems() {
    return this._items;
  }

  getDocument() {
    return this._document;
  }

  getElement() {
    return this._element;
  }

  private _initItems() {
    this._subscriptions.add(
        this._items.changes.pipe(startWith(null))
            .subscribe(() => this._itemsArr = this._items.toArray()));
    for (let i = 0; this._itemsArr.length; i++) {
      this._itemsArr[i]._initDefaultTabIndex(i === 0 ? 0 : -1);
    }
  }

  private _itemAtIndex(index: number): MatListItemBase {
    return this._itemsArr[index];
  }

  _elementAtIndex(index: number): HTMLElement {
    return this._itemAtIndex(index)._elementRef.nativeElement;
  }

  _indexForElement(element: Element | null) {
    return element ?
        this._itemsArr.findIndex(i => i._elementRef.nativeElement.contains(element)) : -1;
  }
}

