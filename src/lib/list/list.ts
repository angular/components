import {
  Component,
  ViewEncapsulation,
  ContentChildren,
  ContentChild,
  QueryList,
  Directive,
  ElementRef,
  Input,
  Optional,
  Renderer2,
  AfterContentInit,
  Self,
} from '@angular/core';
import {MdLine, MdLineSetter, coerceBooleanProperty} from '../core';

@Directive({
  selector: 'md-divider, mat-divider'
})
export class MdListDivider {}

@Component({
  moduleId: module.id,
  selector: 'md-list, mat-list, md-nav-list, mat-nav-list',
  host: {
    'role': 'list'
  },
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdList {
  // By default ripples are disabled for all lists. For nav-lists the ripples will be enabled later.
  private _disableRipple: boolean = true;

  /**
   * Whether the ripple effect should be disabled on the list-items or not.
   * Ripples are disabled for normal lists by default.
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
  host: {
    '[class.mat-list]': 'true'
  }
})
export class MdListCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'md-nav-list, mat-nav-list',
  host: {
    '[class.mat-nav-list]': 'true'
  }
})
export class MdNavList {
  constructor(@Self() list: MdList) {
    // For nav lists the ripples are enabled by default.
    list.disableRipple = false;
  }
}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'md-divider, mat-divider',
  host: {
    '[class.mat-divider]': 'true'
  }
})
export class MdDividerCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[md-list-avatar], [mat-list-avatar]',
  host: {
    '[class.mat-list-avatar]': 'true'
  }
})
export class MdListAvatarCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[md-list-icon], [mat-list-icon]',
  host: {
    '[class.mat-list-icon]': 'true'
  }
})
export class MdListIconCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[md-subheader], [mat-subheader]',
  host: {
    '[class.mat-subheader]': 'true'
  }
})
export class MdListSubheaderCssMatStyler {}

@Component({
  moduleId: module.id,
  selector: 'md-list-item, mat-list-item, a[md-list-item], a[mat-list-item]',
  host: {
    'role': 'listitem',
    '(focus)': '_handleFocus()',
    '(blur)': '_handleBlur()',
    '[class.mat-list-item]': 'true',
  },
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None
})
export class MdListItem implements AfterContentInit {
  private _lineSetter: MdLineSetter;
  private _disableRipple: boolean = false;

  _hasFocus: boolean = false;

  /**
   * Whether the ripple effect on click should be disabled.
   * Ripples must be enabled on the list. By default nav lists have ripples enabled.
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
              @Optional() private _list: MdList) {}

  ngAfterContentInit() {
    this._lineSetter = new MdLineSetter(this._lines, this._renderer, this._element);
  }

  /** Whether this list item should show a ripple effect when clicked.  */
  isRippleEnabled() {
    return !this.disableRipple && !this._list.disableRipple;
  }

  _handleFocus() {
    this._hasFocus = true;
  }

  _handleBlur() {
    this._hasFocus = false;
  }
}
