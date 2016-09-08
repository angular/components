import {Directive, ElementRef} from '@angular/core';


/** Used in the `mat-tab-group` view to display tab labels */
@Directive({
  selector: '[mat-tab-label-wrapper]'
})
export class MatTabLabelWrapper {
  constructor(public elementRef: ElementRef) {}

  /**
   * Sets focus on the wrapper element
   */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }
}
