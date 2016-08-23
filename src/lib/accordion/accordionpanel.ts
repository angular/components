import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MdAccordionTab } from './accordiontab';

@Component({
  moduleId: module.id,
  selector: 'md-accordion',
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'mdClass',
    '[class.md-accordion]': 'true'
  },
  styles: [`
    .md-accordion { display: block; }
  `],
  encapsulation: ViewEncapsulation.None
})

export class MdAccordion {

  @Input() multiple: boolean;

  @Input('class') mdClass: string = '';

  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  @Output() open: EventEmitter<any> = new EventEmitter<any>();

  public tabs: MdAccordionTab[] = [];

  /**
   * Add or append tab in accordion
   * @param tab object of MdAccordionTab
   */
  addTab(tab: MdAccordionTab) {
    this.tabs.push(tab);
  }
}
