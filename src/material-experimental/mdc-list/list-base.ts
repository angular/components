/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {
  AfterContentInit,
  Directive,
  ElementRef,
  forwardRef,
  HostBinding,
  NgZone,
  OnDestroy,
  QueryList,
  ViewChildren
} from '@angular/core';
import {RippleConfig, RippleRenderer, RippleTarget, setLines} from '@angular/material/core';
import {MDCListAdapter} from '@material/list';
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
export abstract class MatListBase {
  // @HostBinding is used in the class as it is expected to be extended. Since @Component decorator
  // metadata is not inherited by child classes, instead the host binding data is defined in a way
  // that can be inherited.
  // tslint:disable-next-line:no-host-decorator-in-concrete
  @HostBinding('class.mdc-list--non-interactive')
  _isNonInteractive: boolean = false;

  @ViewChildren(forwardRef(() => MatListItemBase)) _items: QueryList<MatListItemBase>;

  protected adapter: MDCListAdapter = {
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
        (index, value) => this._itemAtIndex(index)._element.tabIndex = value as unknown as number,
    getFocusedElementIndex:
        () => this._items.map(i => i._element).findIndex(e => e === this.doc?.activeELement),
    isFocusInsideList: () => this.element.nativeElement.contains(this.doc?.activeElement),
    isRootFocused: () => this.element.nativeElement === this.doc?.activeElement,
    focusItemAtIndex: index =>  this._itemAtIndex(index)._element.focus(),

    // The following methods have a dummy implementation in the base class because they are only
    // applicable to certain types of lists
    hasCheckboxAtIndex: () => false,
    hasRadioAtIndex: () => false,
    setCheckedCheckboxOrRadioAtIndex: () => {},
    isCheckboxCheckedAtIndex: () => false,
    notifyAction: () => {},

    // TODO(mmalerba): Determine if we need to implement this.
    getPrimaryTextAtIndex: () => '',
  };

  constructor(protected element: ElementRef<HTMLElement>, protected doc: any) {}

  private _itemAtIndex(index: number): MatListItemBase {
    return this._items.toArray()[index];
  }
}

@Directive()
/** @docs-private */
export abstract class MatListItemBase implements AfterContentInit, OnDestroy, RippleTarget {
  lines: QueryList<ElementRef<Element>>;

  rippleConfig: RippleConfig = {};

  // TODO(mmalerba): Add @Input for disabling ripple.
  rippleDisabled: boolean;

  _element: HTMLElement;

  private _subscriptions = new Subscription();

  private _rippleRenderer: RippleRenderer;

  constructor(private _elementRef: ElementRef<HTMLElement>, protected _ngZone: NgZone,
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

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this._rippleRenderer._removeTriggerEvents();
  }
}
