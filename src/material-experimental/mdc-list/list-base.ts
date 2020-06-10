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

@Directive()
/** @docs-private */
export abstract class MatListItemBase implements AfterContentInit, OnDestroy, RippleTarget {
  @HostBinding('tabindex')
  _tabIndex = -1;

  lines: QueryList<ElementRef<Element>>;

  rippleConfig: RippleConfig = {};

  // TODO(mmalerba): Add @Input for disabling ripple.
  rippleDisabled: boolean;

  _element: HTMLElement;

  private _subscriptions = new Subscription();

  private _rippleRenderer: RippleRenderer;

  protected constructor(private _elementRef: ElementRef<HTMLElement>, protected _ngZone: NgZone,
                        listBase: MatListBase, platform: Platform) {
    this._element = this._elementRef.nativeElement;
    this.rippleDisabled = listBase._isNonInteractive;
    if (!listBase._isNonInteractive) {
      this._element.classList.add('mat-mdc-list-item-interactive');
    }
    this._rippleRenderer =
        new RippleRenderer(this, this._ngZone, this._element, platform);
    this._rippleRenderer.setupTriggerEvents(this._element);
  }

  ngAfterContentInit() {
    this._monitorLines();
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this._rippleRenderer._removeTriggerEvents();
  }

  _setTabIndexForChildren(value: number) {
    this._element.querySelectorAll('a, button').forEach(el => (el as HTMLElement).tabIndex = value);
  }

  /**
   * Subscribes to changes in `MatLine` content children and annotates them appropriately when they
   * change.
   */
  private _monitorLines() {
    this._ngZone.runOutsideAngular(() => {
      this._subscriptions.add(this.lines.changes.pipe(startWith(this.lines))
          .subscribe((lines: QueryList<ElementRef<Element>>) => {
            this._element.classList
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
        event, this._itemAtIndex(index)._element === event.target, index);
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

  @ContentChildren(MatListItemBase) _items: QueryList<MatListItemBase>;

  protected _adapter: MDCListAdapter = {
    getListItemCount: () => this._items.length,
    listItemAtIndexHasClass:
        (index, className) => this._itemAtIndex(index)._element.classList.contains(className),
    addClassForElementIndex:
        (index, className) => this._itemAtIndex(index)._element.classList.add(className),
    removeClassForElementIndex:
        (index, className) => this._itemAtIndex(index)._element.classList.remove(className),
    getAttributeForElementIndex:
        (index, attr) => this._itemAtIndex(index)._element.getAttribute(attr),
    setAttributeForElementIndex:
        (index, attr, value) => this._itemAtIndex(index)._element.setAttribute(attr, value),
    setTabIndexForListItemChildren:
        (index, value) => this._itemAtIndex(index)._setTabIndexForChildren(Number(value)),
    getFocusedElementIndex: () => this._indexForElement(this._document?.activeELement),
    isFocusInsideList: () => this._element.nativeElement.contains(this._document?.activeElement),
    isRootFocused: () => this._element.nativeElement === this._document?.activeElement,
    focusItemAtIndex: index =>  this._itemAtIndex(index)._element.focus(),

    // The following methods have a dummy implementation in the base class because they are only
    // applicable to certain types of lists. They should be implemented for the concrete classes
    // where they are applicable.
    hasCheckboxAtIndex: () => false,
    hasRadioAtIndex: () => false,
    setCheckedCheckboxOrRadioAtIndex: () => {},
    isCheckboxCheckedAtIndex: () => false,

    // TODO(mmalerba): Determine if we need to implement these.
    getPrimaryTextAtIndex: () => '',
    notifyAction: () => {},
  };

  protected _foundation: MDCListFoundation;

  constructor(protected _element: ElementRef<HTMLElement>,
                        @Inject(DOCUMENT) protected _document: any) {
    super();
    this._isNonInteractive = false;
    this._foundation = new MDCListFoundation(this._adapter);
  }

  ngAfterViewInit() {
    this._foundation.init();
    const first = this._items.toArray()[0]?._element;
    if (first) {
      first.tabIndex = 0;
    }
    this._foundation.layout();
  }

  ngOnDestroy() {
    this._foundation.destroy();
  }

  private _itemAtIndex(index: number): MatListItemBase {
    return this._items.toArray()[index];
  }

  private _indexForElement(element: HTMLElement | null) {
    return element ? this._items.toArray().findIndex(i => i._element.contains(element)) : -1;
  }
}

