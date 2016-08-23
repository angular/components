import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MdAccordion } from './accordionpanel';
import {MdAccordionTab } from './accordiontab';

export {MdAccordion} from './accordionpanel';
export {MdAccordionTab} from './accordiontab';

export const ACCORDION_DIRECTIVES: any[] = [MdAccordion, MdAccordionTab];

@NgModule({
  imports: [CommonModule],
  exports: ACCORDION_DIRECTIVES,
  declarations: ACCORDION_DIRECTIVES,
})
export class MdAccordionModule { }
