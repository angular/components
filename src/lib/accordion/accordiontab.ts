import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MdAccordion } from './accordionpanel';

@Component({
  selector: 'md-accordion-tab',
  template: `
    <div class="md-accordion-header" (click)="toggle($event)">
      <span class="md-accordion-title">{{header}}</span>
      <span class="md-accordion-header-icon"></span>
    </div>
    <div class="md-accordion-tab-content">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .md-accordion-tab { position: relative; display: block; outline: 0; border: 0; border-width: 1px 0; border-style: solid; border-color: transparent; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; }
    .md-accordion-tab.md-accordion-tab-active { border-color: rgba(0, 0, 0, 0.12); }
    .md-accordion-tab .md-accordion-header { position: relative; border-radius: 0; color: rgba(0, 0, 0, 0.54); font-weight: 500; cursor: pointer; display: block; align-items: inherit; line-height: 40px; margin: 0; max-height: 40px; overflow: hidden; padding: 0 35px 0 16px; text-align: left; text-decoration: none; white-space: nowrap; width: 100%; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-user-drag: none; }
    .md-accordion-tab.md-accordion-tab-disabled .md-accordion-header { color: rgba(0,0,0,0.26); pointer-events: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-user-drag: none; opacity: 0.5; cursor: default; }
    .md-accordion-tab .md-accordion-title { color: rgba(0,0,0,0.85); }
    .md-accordion-tab.md-accordion-tab-active .md-accordion-title { color: #106cc8; }
    .md-accordion-tab .md-accordion-header-icon { position: absolute; top: 12px; right: 17px; width: 8px; height: 8px; overflow: hidden; display: inline-block; border-width: 0 2px 2px 0; border-style: solid; border-color: rgba(0, 0, 0, 0.54); -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); -o-transform: rotate(45deg); -webkit-transform: rotate(45deg); transform: rotate(45deg); -moz-transition: 0.3s ease-in-out; -o-transition: 0.3s ease-in-out; -webkit-transition: 0.3s ease-in-out; transition: 0.3s ease-in-out; }
    .md-accordion-tab.md-accordion-tab-active .md-accordion-header-icon { -moz-transform: rotate(225deg); -ms-transform: rotate(225deg); -o-transform: rotate(225deg); -webkit-transform: rotate(225deg); transform: rotate(225deg); top: 16px; }
    .md-accordion-tab .md-accordion-tab-content { position: relative; display: none; padding: 16px; }
    .md-accordion-tab.md-accordion-tab-active .md-accordion-tab-content { display: block; }
  `],
  host: {
    'role': 'accordion-tab',
    '[class]': 'mdClass',
    '[class.md-accordion-tab]': 'true',
    '[class.md-accordion-tab-active]': 'active',
    '[class.md-accordion-tab-disabled]': 'disabled'
  },
  encapsulation: ViewEncapsulation.None
})
export class MdAccordionTab {

  @Input('class') mdClass: string = '';

  @Input() header: string;

  @Input() active: boolean;

  @Input() disabled: boolean;

  constructor(private accordion: MdAccordion) {
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
