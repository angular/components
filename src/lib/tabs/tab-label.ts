import {Directive, TemplateRef, ViewContainerRef} from '@angular/core';
import {TemplatePortalDirective} from '@angular2-material/core';

/** Used to flag tab labels for use with the portal directive */
@Directive({
  selector: '[mat-tab-label]',
})
export class MatTabLabel extends TemplatePortalDirective {
  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    super(templateRef, viewContainerRef);
  }
}
