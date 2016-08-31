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

@Directive({ selector: '[md2-menu-not-closable]' })
export class Md2MenuNotClosable {

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
  selector: '[md2-menu]',
  host: {
    'role': 'menu',
    '[class.md2-menu]': 'true',
    '[class.open]': 'isVisible'
  }
})
export class Md2Menu {

  private isVisible: boolean = false;

  @ContentChild(Md2MenuNotClosable) notClosable: Md2MenuNotClosable;

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

@Directive({ selector: '[md2-menu-open]' })
export class Md2MenuOpen implements OnDestroy {

  private close = (event: MouseEvent) => {
    if (!this.menu.isInClosableZone(<HTMLElement>event.target) &&
      event.target !== this.elementRef.nativeElement) {
      this.menu.close();
      document.removeEventListener('click', this.close);
    }
  };

  constructor( @Host() private menu: Md2Menu, private elementRef: ElementRef) { }

  @HostListener('click')
  private open() {
    this.menu.open();
    document.addEventListener('click', this.close, true);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.close);
  }

}

export const MD2_MENU_DIRECTIVES: any[] = [Md2MenuNotClosable, Md2Menu, Md2MenuOpen];

@NgModule({
  imports: [CommonModule],
  exports: MD2_MENU_DIRECTIVES,
  declarations: MD2_MENU_DIRECTIVES,
})
export class Md2MenuModule { }
