/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit, AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  Input, OnInit,
  Optional,
  QueryList,
  Renderer2, ViewChild, ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {coerceBooleanProperty, MdLine, MdLineSetter, MdPseudoCheckbox, MdSelectionModule, SelectionModel} from '../core';
import {CommonModule} from '@angular/common';
import {MdCheckbox} from '../checkbox';
import {MdCheckboxModule} from '../checkbox';

@Directive({
  selector: 'md-divider, mat-divider',
  host: {
    'role': 'separator',
    'aria-orientation': 'horizontal'
  }
})
export class MdListDivider {}

@Component({
  moduleId: module.id,
  selector: 'md-list, mat-list, md-nav-list, mat-nav-list',
  host: {'role': 'list'},
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdList {
  private _disableRipple: boolean = false;

  /**
   * Whether the ripple effect should be disabled on the list-items or not.
   * This flag only has an effect for `md-nav-list` components.
   */
  @Input()
  get disableRipple() { return this._disableRipple; }
  set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }
}

@Component({
  moduleId: module.id,
  selector: 'md-selection-list, mat-selection-list',
  host: {'role': 'listbox'},
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdSelectionList {
  private _disableRipple: boolean = false;

  /**
   * Whether the ripple effect should be disabled on the list-items or not.
   * This flag only has an effect for `md-nav-list` components.
   */
  @Input()
  get disableRipple() { return this._disableRipple; }
  set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }
}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'md-list, mat-list',
  host: {'class': 'mat-list'}
})
export class MdListCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'md-nav-list, mat-nav-list',
  host: {'class': 'mat-nav-list'}
})
export class MdNavListCssMatStyler {}

@Directive({
  selector: 'md-selection-list, mat-selection-list',
  host: {'class': 'mat-selection-list'}
})
export class MdSelectionListCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'md-divider, mat-divider',
  host: {'class': 'mat-divider'}
})
export class MdDividerCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[md-list-avatar], [mat-list-avatar], [mdListAvatar], [matListAvatar]',
  host: {'class': 'mat-list-avatar'}
})
export class MdListAvatarCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[md-list-icon], [mat-list-icon], [mdListIcon], [matListIcon]',
  host: {'class': 'mat-list-icon'}
})
export class MdListIconCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[md-subheader], [mat-subheader]',
  host: {'class': 'mat-subheader'}
})
export class MdListSubheaderCssMatStyler {}

@Component({
  moduleId: module.id,
  selector: 'md-list-item, mat-list-item, a[md-list-item], a[mat-list-item]',
  host: {
    'role': 'listitem',
    'class': 'mat-list-item',
    '(focus)': '_handleFocus()',
    '(blur)': '_handleBlur()',
  },
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None
})
export class MdListItem implements AfterContentInit {
  private _lineSetter: MdLineSetter;
  private _disableRipple: boolean = false;
  private _isNavList: boolean = false;

  /**
   * Whether the ripple effect on click should be disabled. This applies only to list items that are
   * part of a nav list. The value of `disableRipple` on the `md-nav-list` overrides this flag.
   */
  @Input()
  get disableRipple() { return this._disableRipple; }
  set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }

  @ContentChildren(MdLine) _lines: QueryList<MdLine>;

  @ContentChild(MdListAvatarCssMatStyler)
  set _hasAvatar(avatar: MdListAvatarCssMatStyler) {
    if (avatar != null) {
      this._renderer.addClass(this._element.nativeElement, 'mat-list-item-avatar');
    } else {
      this._renderer.removeClass(this._element.nativeElement, 'mat-list-item-avatar');
    }
  }

  constructor(private _renderer: Renderer2,
              private _element: ElementRef,
              @Optional() private _list: MdList,
              @Optional() navList: MdNavListCssMatStyler) {
    this._isNavList = !!navList;
  }

  ngAfterContentInit() {
    this._lineSetter = new MdLineSetter(this._lines, this._renderer, this._element);
  }

  /** Whether this list item should show a ripple effect when clicked.  */
  isRippleEnabled() {
    return !this.disableRipple && this._isNavList && !this._list.disableRipple;
  }

  _handleFocus() {
    this._renderer.addClass(this._element.nativeElement, 'mat-list-item-focus');
  }

  _handleBlur() {
    this._renderer.removeClass(this._element.nativeElement, 'mat-list-item-focus');
  }

  /** Retrieves the DOM element of the component host. */
  _getHostElement(): HTMLElement {
    return this._element.nativeElement;
  }
}

@Component({
  moduleId: module.id,
  selector: 'md-list-option',
  host: {
    'role': 'option',
    'class': 'mat-list-item',
    '(focus)': '_handleFocus()',
    '(blur)': '_handleBlur()',
    '(click)': 'onchange()',
    '(keydown)':'onKeydown($event)',
    '[tabIndex]': 'disabled ? -1 : 0',
    '[attr.aria-selected]': '',

  },
  templateUrl: 'list-option.html',
  encapsulation: ViewEncapsulation.None
})
export class MdListOption implements AfterContentInit {
  private _lineSetter: MdLineSetter;
  private _disableRipple: boolean = false;
  private _isNavList: boolean = false;
  private _isSelectionList: boolean = false;
  isSelected: boolean = false;

  /**
   * Whether the ripple effect on click should be disabled. This applies only to list items that are
   * part of a nav list. The value of `disableRipple` on the `md-nav-list` overrides this flag.
   */
  @Input()
  get disableRipple() { return this._disableRipple; }
  set disableRipple(value: boolean) { this._disableRipple = coerceBooleanProperty(value); }

  @ContentChildren(MdLine) _lines: QueryList<MdLine>;

  /** Whether the label should appear after or before the checkbox. Defaults to 'after' */

  @Input() checkboxPosition: 'before' | 'after' = 'after';

  @ViewChild('autocheckbox') pCheckbox;

  constructor(private _renderer: Renderer2,
              private _element: ElementRef,
              @Optional() private _slist: MdSelectionList,
              @Optional() navList: MdNavListCssMatStyler,
              @Optional() selectionListStyler: MdSelectionListCssMatStyler,
              @Optional() public selectionList: MdSelectionListCheckboxer) {
    this._isNavList = !!navList;
    this._isSelectionList = !!selectionListStyler;
  }


  ngAfterContentInit() {
    this._lineSetter = new MdLineSetter(this._lines, this._renderer, this._element);
  }
}

@Directive({
  selector: 'md-selection-list, mat-selection-list',
})
export class MdSelectionListCheckboxer {

  checkedItems: SelectionModel<HTMLElement> = new SelectionModel<HTMLElement>(true);

  constructor(public _element: ElementRef) { }
}

