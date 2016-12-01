<<<<<<< 7c4fabca4851582b2701e6f5dce86e8c8bd867de
import {Directive, ElementRef, Renderer, Input} from '@angular/core';


/** Used in the `md-tab-group` view to display tab labels */
@Directive({
  selector: '[md-tab-label-wrapper], [mat-tab-label-wrapper]'
})
export class MdTabLabelWrapper {
  constructor(public elementRef: ElementRef, private _renderer: Renderer) {}

  @Input() disabled: boolean;

  /** Sets focus on the wrapper element */
  focus(): void {
    this._renderer.invokeElementMethod(this.elementRef.nativeElement, 'focus');
  }

  getOffsetLeft(): number {
    return this.elementRef.nativeElement.offsetLeft;
  }

  getOffsetWidth(): number {
    return this.elementRef.nativeElement.offsetWidth;
  }
}
