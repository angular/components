import {
  ContentChild,
  Directive,
  ElementRef,
  Host,
  HostListener,
  OnDestroy,
  NgModule
} from '@angular/core';
import {CommonModule} from '@angular/common';

@Directive({ selector: '[md-menu-not-closable]' })
export class MdMenuNotClosable {

  constructor(private elementRef: ElementRef) { }

  /**
   * contains
   * @param element
   */
  public contains(element: HTMLElement) {
    let thisElement: HTMLElement = this.elementRef.nativeElement;
    return thisElement.contains(element);
  }
}

@Directive({
  selector: '[md-menu]',
  host: {
    'role': 'menu',
    '[class.md-menu]': 'true',
    '[class.open]': 'isVisible'
  }
})
export class MdMenu {

  private isVisible: boolean = false;

  @ContentChild(MdMenuNotClosable) notClosable: MdMenuNotClosable;

  constructor(private elementRef: ElementRef) { }

  /**
   * open menu
   */
  public open() { this.isVisible = true; }

  /**
   * close menu
   */
  public close() { this.isVisible = false; }

  /**
   * check closeble
   * @param element
   */
  isInClosableZone(element: HTMLElement) {
    if (!this.notClosable) { return false; }
    return this.notClosable.contains(element);
  }

}

@Directive({ selector: '[md-menu-open]' })
export class MdMenuOpen implements OnDestroy {

  private close = (event: MouseEvent) => {
    if (!this.menu.isInClosableZone(<HTMLElement>event.target) &&
      event.target !== this.elementRef.nativeElement) {
      this.menu.close();
      document.removeEventListener('click', this.close);
    }
  };

  constructor( @Host() private menu: MdMenu, private elementRef: ElementRef) { }

  @HostListener('click')
  private open() {
    this.menu.open();
    document.addEventListener('click', this.close, true);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.close);
  }

}

export const MD_MENU_DIRECTIVES: any[] = [MdMenuNotClosable, MdMenu, MdMenuOpen];

@NgModule({
  imports: [CommonModule],
  exports: MD_MENU_DIRECTIVES,
  declarations: MD_MENU_DIRECTIVES,
})
export class MdMenuModule { }
