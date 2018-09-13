/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  Optional,
  Input,
  ViewChild,
  QueryList,
  ViewEncapsulation,
  OnChanges,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  CanDisableRipple,
  CanDisableRippleCtor,
  MatLine,
  setLines,
  mixinDisableRipple,
  MatRipple,
} from '@angular/material/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

// Boilerplate for applying mixins to MatList.
/** @docs-private */
class MatListBase {}
const _MatListMixinBase: CanDisableRippleCtor & typeof MatListBase =
    mixinDisableRipple(MatListBase);

// Boilerplate for applying mixins to MatListItem.
/** @docs-private */
class MatListItemBase {}
const _MatListItemMixinBase: CanDisableRippleCtor & typeof MatListItemBase =
    mixinDisableRipple(MatListItemBase);

@Component({
  moduleId: module.id,
  selector: 'mat-nav-list',
  exportAs: 'matNavList',
  host: {
    'role': 'navigation',
    'class': 'mat-nav-list mat-list-base'
  },
  templateUrl: 'list.html',
  styleUrls: ['list.css'],
  inputs: ['disableRipple'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatNavList extends _MatListMixinBase implements CanDisableRipple, OnChanges,
  OnDestroy {
  /** Emits when the state of the list changes. */
  _stateChanges = new Subject<void>();

  ngOnChanges() {
    this._stateChanges.next();
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }
}

@Component({
  moduleId: module.id,
  selector: 'mat-list, mat-action-list',
  exportAs: 'matList',
  templateUrl: 'list.html',
  host: {
    'class': 'mat-list mat-list-base'
  },
  styleUrls: ['list.css'],
  inputs: ['disableRipple'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatList extends _MatListMixinBase implements CanDisableRipple, OnChanges, OnDestroy {
  /** Emits when the state of the list changes. */
  _stateChanges = new Subject<void>();

  constructor(private _elementRef: ElementRef<HTMLElement>) {
    super();

    if (this._getListType() === 'action-list') {
      _elementRef.nativeElement.classList.add('mat-action-list');
    }
  }

  _getListType(): 'list' | 'action-list' | null {
    const nodeName = this._elementRef.nativeElement.nodeName.toLowerCase();

    if (nodeName === 'mat-list') {
      return 'list';
    }

    if (nodeName === 'mat-action-list') {
      return 'action-list';
    }

    return null;
  }

  ngOnChanges() {
    this._stateChanges.next();
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }
}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-avatar], [matListAvatar]',
  host: {'class': 'mat-list-avatar'}
})
export class MatListAvatarCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-list-icon], [matListIcon]',
  host: {'class': 'mat-list-icon'}
})
export class MatListIconCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-subheader], [matSubheader]',
  host: {'class': 'mat-subheader'}
})
export class MatListSubheaderCssMatStyler {}

/** An item within a Material Design list. */
@Component({
  moduleId: module.id,
  selector: 'mat-list-item, a[mat-list-item], button[mat-list-item]',
  exportAs: 'matListItem',
  host: {
    'class': 'mat-list-item',
    // @breaking-change 8.0.0 Remove `mat-list-item-avatar` in favor of `mat-list-item-with-avatar`.
    '[class.mat-list-item-avatar]': '_avatar || _icon',
    '[class.mat-list-item-with-avatar]': '_avatar || _icon',
    '[class.mat-list-item-active]': 'active',
    '(mousedown)': '_lastMouseDownEvent = $event',
  },
  inputs: ['disableRipple'],
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatListItem extends _MatListItemMixinBase implements AfterContentInit,
    CanDisableRipple, OnDestroy {
  private _isInteractiveList: boolean = false;
  private _list?: MatNavList | MatList;
  private _destroyed = new Subject<void>();
  private _isInitialized: boolean = false;

  /** The most recent mouse down event in the list item for positioning ripple start point. */
  _lastMouseDownEvent: MouseEvent|null = null;

  @ContentChildren(MatLine, {descendants: true}) _lines: QueryList<MatLine>;
  @ContentChild(MatListAvatarCssMatStyler, {static: false}) _avatar: MatListAvatarCssMatStyler;
  @ContentChild(MatListIconCssMatStyler, {static: false}) _icon: MatListIconCssMatStyler;
  @ViewChild(MatRipple, {static: false}) ripple: MatRipple;

  /** Whether this list item is active. */
  @Input()
  get active(): boolean {
    return this._active;
  }
  set active(value: boolean) {
    // If this item is becoming active, launch a persistent ripple, otherwise
    // remove existing ripple.
    if (value && !this._active && this._isInitialized) {
      const rippleOrigin = this._lastMouseDownEvent || {clientX: 0, clientY: 0};
      this.ripple.launch(
          rippleOrigin.clientX, rippleOrigin.clientY, {persistent: true});
      this.disableRipple = true;
    } else {
      this.ripple.fadeOutAll();
      this.disableRipple = false;
    }
    this._active = coerceBooleanProperty(value);
  }
  private _active = false;


  constructor(private _element: ElementRef<HTMLElement>,
              _changeDetectorRef: ChangeDetectorRef,
              @Optional() navList?: MatNavList,
              @Optional() list?: MatList) {
    super();
    this._isInteractiveList = !!(navList || (list && list._getListType() === 'action-list'));
    this._list = navList || list;

    // If no type attributed is specified for <button>, set it to "button".
    // If a type attribute is already specified, do nothing.
    const element = this._getHostElement();

    if (element.nodeName.toLowerCase() === 'button' && !element.hasAttribute('type')) {
      element.setAttribute('type', 'button');
    }

    if (this._list) {
      // React to changes in the state of the parent list since
      // some of the item's properties depend on it (e.g. `disableRipple`).
      this._list._stateChanges.pipe(takeUntil(this._destroyed)).subscribe(() => {
        _changeDetectorRef.markForCheck();
      });
    }
  }

  ngAfterContentInit() {
    setLines(this._lines, this._element);

    if (this.active) {
      // Set timeout must be used here to ensure that the ripple launch is called after the
      // ripple is finished initialized.
      setTimeout(() => {
        this.ripple.launch(0, 0, {
          persistent: true,
          animation: {enterDuration: 0},
        });
        this.disableRipple = true;
      });
    }
    this._isInitialized = true;
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Whether this list item should show a ripple effect when clicked. */
  _isRippleDisabled() {
    return !this._isInteractiveList || this.disableRipple ||
           !!(this._list && this._list.disableRipple);
  }

  /** Retrieves the DOM element of the component host. */
  _getHostElement(): HTMLElement {
    return this._element.nativeElement;
  }
}
