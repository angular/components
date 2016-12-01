import {
    Component,
    ViewEncapsulation,
    ContentChildren,
    QueryList,
    ElementRef,
    AfterContentInit,
    Input,
} from '@angular/core';
import {ListKeyManager} from '../core/a11y/list-key-manager';
import {DOWN_ARROW} from '../core/keyboard/keycodes';
import {MdListItem} from './list-item';


@Component({
  moduleId: module.id,
  selector: 'md-list, md-nav-list',
  host: {
    'role': 'list',
    '[attr.tabIndex]': 'tabindex',
    '(keydown)': '_handleKeydown($event)'
  },
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdList implements AfterContentInit {
  @ContentChildren(MdListItem) _items: QueryList<MdListItem>;
  @Input() tabindex: number = 0;

  /** Manages the keyboard events between list items. */
  private _keyManager: ListKeyManager;

  constructor(private _elementRef: ElementRef) { }

  ngAfterContentInit() {
    this._keyManager = new ListKeyManager(this._items);
  }

  /**
   * Shifts focus to the appropriate list item.
   */
  _handleKeydown(event: KeyboardEvent) {
    if (event.target === this._elementRef.nativeElement && event.keyCode === DOWN_ARROW) {
      this._keyManager.focusFirstItem();
    } else {
      this._keyManager.onKeydown(event);
    }
  }
}
