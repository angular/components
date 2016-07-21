// TODO(kara): keyboard events for menu navigation
// TODO(kara): prevent-close functionality
// TODO(kara): set position of menu

import {
    Attribute,
    Component,
    EventEmitter,
    Output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MdMenuInvalidPositionX, MdMenuInvalidPositionY} from './menu-errors';

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
  private _showClickCatcher: boolean = false;
  private _classList: Object;
  positionX: 'before' | 'after' = 'after';
  positionY: 'above' | 'below' = 'below';

  @Output() close = new EventEmitter;
  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor(@Attribute('x-position') posX: 'before' | 'after',
              @Attribute('y-position') posY: 'above' | 'below',
              @Attribute('class') classes: string) {
    if (posX) { this._setPositionX(posX); }
    if (posY) { this._setPositionY(posY); }
    this._mirrorHostClasses(classes);
  }

  /**
   * This function toggles the display of the menu's click catcher element.
   * This element covers the viewport when the menu is open to detect clicks outside the menu.
   * TODO: internal
   */
  _setClickCatcher(bool: boolean): void {
    this._showClickCatcher = bool;
  }

  /**
   * This method takes classes set on the host md-menu element and applies them on the
   * menu template that displays in the overlay container.  Otherwise, it's difficult
   * to style the containing menu from outside the component.
   * @param classes: list of class names
   */
  private _mirrorHostClasses(classes: string): void {
    if (!classes) { return; }

    this._classList = classes.split(' ').reduce((obj: any, className: string) => {
      obj[className] = true;
      return obj;
    }, {});
  }

  private _setPositionX(pos: 'before' | 'after'): void {
    if ( pos !== 'before' && pos !== 'after') {
      throw new MdMenuInvalidPositionX();
    }
    this.positionX = pos;
  }

  private _setPositionY(pos: 'above' | 'below'): void {
    if ( pos !== 'above' && pos !== 'below') {
      throw new MdMenuInvalidPositionY();
    }
    this.positionY = pos;
  }

  private _emitCloseEvent(): void {
    this.close.emit(null);
  }
}

