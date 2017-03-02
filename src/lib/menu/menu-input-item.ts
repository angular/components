import {Directive} from '@angular/core';


/**
 * Directive to allow users to use menu for user input by holding
 * menu open when input containers are focused via click or tab.
 */
@Directive({
  selector: '[md-menu-intput-item], [mdMenuInputItem], [mat-menu-intput-item], [matMenuInputItem]',
  exportAs: 'mdMenuInputItem',
  host: {
    '(click)': 'onClickFocus($event)',
    '(keydown)': 'onTabFocus($event)',
    'class': 'mat-menu-input-item'
  },
})
export class MdMenuInputItem  {

  constructor() { }

  /** Keep menu open */
  holdMenuOpen(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
  }

  onClickFocus(event: MouseEvent) {
    this.holdMenuOpen(event);
  }

  onTabFocus(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      this.holdMenuOpen(event);
    }
  }
}
