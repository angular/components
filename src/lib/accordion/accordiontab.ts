import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Md2Accordion } from './accordionpanel';

@Component({
  moduleId: module.id,
  selector: 'md2-accordion-tab',
  template: `
    <div class="md2-accordion-header" (click)="toggle($event)">
      <span class="md2-accordion-title">{{header}}</span>
      <span class="md2-accordion-header-icon"></span>
    </div>
    <div class="md2-accordion-tab-content">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .md2-accordion-tab { position: relative; display: block; outline: 0; border: 0; border-width: 1px 0; border-style: solid; border-color: transparent; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; }
    .md2-accordion-tab.md2-accordion-tab-active { border-color: rgba(0, 0, 0, 0.12); }
    .md2-accordion-tab .md2-accordion-header { position: relative; border-radius: 0; color: rgba(0, 0, 0, 0.54); font-weight: 500; cursor: pointer; display: block; align-items: inherit; line-height: 40px; margin: 0; max-height: 40px; overflow: hidden; padding: 0 35px 0 16px; text-align: left; text-decoration: none; white-space: nowrap; width: 100%; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-user-drag: none; }
    .md2-accordion-tab.md2-accordion-tab-disabled .md2-accordion-header { color: rgba(0,0,0,0.26); pointer-events: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-user-drag: none; opacity: 0.5; cursor: default; }
    .md2-accordion-tab .md2-accordion-title { color: rgba(0,0,0,0.85); }
    .md2-accordion-tab.md2-accordion-tab-active .md2-accordion-title { color: #106cc8; }
    .md2-accordion-tab .md2-accordion-header-icon { position: absolute; top: 12px; right: 17px; width: 8px; height: 8px; overflow: hidden; display: inline-block; border-width: 0 2px 2px 0; border-style: solid; border-color: rgba(0, 0, 0, 0.54); -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); -o-transform: rotate(45deg); -webkit-transform: rotate(45deg); transform: rotate(45deg); -moz-transition: 0.3s ease-in-out; -o-transition: 0.3s ease-in-out; -webkit-transition: 0.3s ease-in-out; transition: 0.3s ease-in-out; }
    .md2-accordion-tab.md2-accordion-tab-active .md2-accordion-header-icon { -moz-transform: rotate(225deg); -ms-transform: rotate(225deg); -o-transform: rotate(225deg); -webkit-transform: rotate(225deg); transform: rotate(225deg); top: 16px; }
    .md2-accordion-tab .md2-accordion-tab-content { position: relative; display: none; padding: 16px; }
    .md2-accordion-tab.md2-accordion-tab-active .md2-accordion-tab-content { display: block; }
  `],
  host: {
    'role': 'accordion-tab',
    '[class]': 'mdClass',
    '[class.md2-accordion-tab]': 'true',
    '[class.md2-accordion-tab-active]': 'active',
    '[class.md2-accordion-tab-disabled]': 'disabled'
  },
  encapsulation: ViewEncapsulation.None
})
export class Md2AccordionTab {

  @Input('class') mdClass: string = '';

  @Input() header: string;

  @Input() active: boolean;

  @Input() disabled: boolean;

  constructor(private accordion: Md2Accordion) {
    this.accordion.addTab(this);
  }

  /**
   * Toggle the accordion
   * @param event
   * @return if it is disabled
   */
  toggle(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    let index = this.findTabIndex();

    if (this.active) {
      this.active = !this.active;
      this.accordion.close.emit({ originalEvent: event, index: index });
    } else if (!this.accordion.multiple) {
      for (let i = 0; i < this.accordion.tabs.length; i++) {
        this.accordion.tabs[i].active = false;
      }
      this.active = true;
      this.accordion.open.emit({ originalEvent: event, index: index });
    } else {
      this.active = true;
      this.accordion.open.emit({ originalEvent: event, index: index });
    }

    event.preventDefault();
  }

  /**
   * Find index of specific tab of accordion
   * @return index number of this tab
   */
  findTabIndex() {
    let index = -1;
    for (let i = 0; i < this.accordion.tabs.length; i++) {
      if (this.accordion.tabs[i] === this) {
        index = i;
        break;
      }
    }
    return index;
  }
}
