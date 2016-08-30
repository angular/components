import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MdAccordion } from './accordionpanel';
import {MdAccordionTab } from './accordiontab';

export {MdAccordion} from './accordionpanel';
export {MdAccordionTab} from './accordiontab';

export const MD_ACCORDION_DIRECTIVES: any[] = [MdAccordion, MdAccordionTab];

@NgModule({
  imports: [CommonModule],
  exports: MD_ACCORDION_DIRECTIVES,
  declarations: MD_ACCORDION_DIRECTIVES,
})
export class MdAccordionModule { }
