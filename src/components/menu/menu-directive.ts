// TODO(kara): prevent-close functionality

import {
  Attribute,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MenuPositionX, MenuPositionY} from './menu-positions';
import {MdMenuInvalidPositionX, MdMenuInvalidPositionY} from './menu-errors';
import {MdMenuItem} from './menu-item';
import {UP_ARROW, DOWN_ARROW, TAB} from '@angular2-material/core/keyboard/keycodes';

@Component({
  moduleId: module.id,
  selector: 'md-menu',
  host: {'role': 'menu'},
  templateUrl: 'menu.html',
  styleUrls: ['menu.css'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'mdMenu'
})
export class MdMenu {
  _showClickCatcher: boolean = false;
  private _focusedItemIndex: number = 0;

  // config object to be passed into the menu's ngClass
  _classList: Object;

  positionX: MenuPositionX = 'after';
  positionY: MenuPositionY = 'below';

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
  @ContentChildren(MdMenuItem) items: QueryList<MdMenuItem>;

  constructor(@Attribute('x-position') posX: MenuPositionX,
              @Attribute('y-position') posY: MenuPositionY) {
    if (posX) { this._setPositionX(posX); }
    if (posY) { this._setPositionY(posY); }
  }

  /**
   * This method takes classes set on the host md-menu element and applies them on the
   * menu template that displays in the overlay container.  Otherwise, it's difficult
   * to style the containing menu from outside the component.
   * @param classes list of class names
   */
  @Input('class')
  set classList(classes: string) {
    this._classList = classes.split(' ').reduce((obj: any, className: string) => {
      obj[className] = true;
      return obj;
    }, {});
  }

  @Output() close = new EventEmitter;

  /**
   * This function toggles the display of the menu's click catcher element.
   * This element covers the viewport when the menu is open to detect clicks outside the menu.
   * TODO: internal
   */
  _setClickCatcher(bool: boolean): void {
    this._showClickCatcher = bool;
  }

  /**
   * Focus the first item in the menu. This method is used by the menu trigger
   * to focus the first item when the menu is opened by the ENTER key.
   * TODO: internal
   */
  _focusFirstItem() { this.items.first.focus(); }

  // TODO(kara): update this when (keydown.downArrow) testability is fixed
  // TODO: internal
  _handleKeydown(event: KeyboardEvent): void {
    if (event.keyCode === DOWN_ARROW) {
      this._focusNextItem();
    } else if (event.keyCode === UP_ARROW) {
      this._focusPreviousItem();
    } else if (event.keyCode === TAB) {
      this._handleTabKeypress(event.shiftKey);
    }
  }

  /**
   *  When the tab key is pressed (changing focus natively), this function syncs up
   *  the focusedItemIndex to match the currently focused item.  If the shift key is
   *  also pressed, we know that the focus has changed to the previous tabindex. If not,
   *  focus has changed to the next tabindex.
   */
  private _handleTabKeypress(shiftPressed: boolean): void {
    shiftPressed ? this._updateFocusedItemIndex(-1) : this._updateFocusedItemIndex(1);
  }

  /**
   * This emits a close event to which the trigger is subscribed. When emitted, the
   * trigger will close the menu.
   */
  private _emitCloseEvent(): void {
    this._focusedItemIndex = 0;
    this.close.emit(null);
  }

  // When focus would shift past the start or end of the menu, close the menu.
  private _closeIfFocusLeavesMenu(): void {
    if (this._focusedItemIndex >= this.items.length || this._focusedItemIndex < 0) {
      this._emitCloseEvent();
    }
  }

  private _focusNextItem(): void {
    this._updateFocusedItemIndex(1);
    this.items.toArray()[this._focusedItemIndex].focus();
  }

  private _focusPreviousItem(): void {
    this._updateFocusedItemIndex(-1);
    this.items.toArray()[this._focusedItemIndex].focus();
  }

  private _updateFocusedItemIndex(delta: number, itemArray: MdMenuItem[] = this.items.toArray()) {
    this._focusedItemIndex += delta;
    this._closeIfFocusLeavesMenu();

    // skip all disabled menu items recursively until an active one
    // is reached or the menu closes for overreaching bounds
    while (itemArray[this._focusedItemIndex].disabled) {
      this._updateFocusedItemIndex(delta, itemArray);
    }
  }

  private _setPositionX(pos: MenuPositionX): void {
    if ( pos !== 'before' && pos !== 'after') {
      throw new MdMenuInvalidPositionX();
    }
    this.positionX = pos;
  }

  private _setPositionY(pos: MenuPositionY): void {
    if ( pos !== 'above' && pos !== 'below') {
      throw new MdMenuInvalidPositionY();
    }
    this.positionY = pos;
  }
}
