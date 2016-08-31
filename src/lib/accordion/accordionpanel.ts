import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Md2AccordionTab } from './accordiontab';

@Component({
  moduleId: module.id,
  selector: 'md2-accordion',
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'mdClass',
    '[class.md2-accordion]': 'true'
  },
  styles: [`
    .md2-accordion { display: block; }
  `],
  encapsulation: ViewEncapsulation.None
})

export class Md2Accordion {

  @Input() multiple: boolean;

  @Input('class') mdClass: string = '';

  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  @Output() open: EventEmitter<any> = new EventEmitter<any>();

  public tabs: Md2AccordionTab[] = [];

  /**
   * Add or append tab in accordion
   * @param tab object of Md2AccordionTab
   */
  addTab(tab: Md2AccordionTab) {
    this.tabs.push(tab);
  }
}
