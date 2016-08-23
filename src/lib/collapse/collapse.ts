import {Directive, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

@Directive({
  selector: '[collapse]',
  properties: ['collapse'],
  host: {
    '[class.in]': 'isExpanded',
    '[class.collapse]': 'true',
    '[class.collapsing]': 'isCollapsing',
    '[attr.aria-expanded]': 'isExpanded',
    '[attr.aria-hidden]': '!isExpanded',
  }
})

export class MdCollapse {
  private height: string;
  private isExpanded: boolean = true;
  private isCollapsing: boolean = false;

  get collapse(): boolean { return this.isExpanded; }
  set collapse(value: boolean) {
    this.isExpanded = value;
    this.toggle();
  }

  /**
   * toggle collapse
   */
  toggle() {
    if (this.isExpanded) { this.hide(); } else { this.show(); }
  }

  /**
   * hide collapse
   */
  hide() {
    this.isCollapsing = true;
    this.isExpanded = false;
    setTimeout(() => {
      this.isCollapsing = false;
    }, 4);
  }

  /**
   * show collapse
   */
  show() {
    this.isCollapsing = true;
    this.isExpanded = true;
    setTimeout(() => {
      this.isCollapsing = false;
    }, 4);
  }
}

export const MD_COLLAPSE_DIRECTIVES: any[] = [MdCollapse];

@NgModule({
  imports: [CommonModule],
  exports: MD_COLLAPSE_DIRECTIVES,
  declarations: MD_COLLAPSE_DIRECTIVES,
})
export class MdCollapseModule { }
