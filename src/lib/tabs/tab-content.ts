import {Directive, TemplateRef, ViewContainerRef} from '@angular/core';
import {TemplatePortalDirective} from '@angular2-material/core';

/** Used to flag tab contents for use with the portal directive */
@Directive({
  selector: '[mat-tab-content]'
})
export class MatTabContent extends TemplatePortalDirective {
  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    super(templateRef, viewContainerRef);
  }
}
