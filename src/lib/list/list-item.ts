import {
    Component,
    ViewEncapsulation,
    ContentChildren,
    ContentChild,
    QueryList,
    ElementRef,
    Renderer,
    AfterContentInit,
} from '@angular/core';
import {MdLine, MdLineSetter} from '../core';
import {MdListAvatar} from './list-directives';
import {MdFocusable} from '../core/a11y/list-key-manager';


@Component({
  moduleId: module.id,
  selector: 'md-list-item, a[md-list-item]',
  host: {
    'role': 'listitem',
    '(focus)': '_handleFocus()',
    '(blur)': '_handleBlur()',
    'tabIndex': '-1'
  },
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None
})
export class MdListItem implements AfterContentInit, MdFocusable {
  _hasFocus: boolean = false;

  private _lineSetter: MdLineSetter;

  @ContentChildren(MdLine) _lines: QueryList<MdLine>;

  @ContentChild(MdListAvatar)
  set _hasAvatar(avatar: MdListAvatar) {
    this._renderer.setElementClass(this._element.nativeElement, 'md-list-avatar', avatar != null);
  }

  constructor(private _renderer: Renderer, private _element: ElementRef) { }

  /** TODO: internal */
  ngAfterContentInit() {
    this._lineSetter = new MdLineSetter(this._lines, this._renderer, this._element);
  }

  _handleFocus() {
    this._hasFocus = true;
  }

  _handleBlur() {
    this._hasFocus = false;
  }

  focus() {
    this._renderer.invokeElementMethod(this._element.nativeElement, 'focus');
  }
}
