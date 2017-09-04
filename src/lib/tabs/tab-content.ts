import {Directive, TemplateRef} from '@angular/core';

@Directive({ selector: '[mdTabContent]' })
export class MdTabContent {
  constructor(public template: TemplateRef<any>) { }
}
