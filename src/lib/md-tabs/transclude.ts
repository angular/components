import {
  Directive,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[md2Transclude]',
  properties: ['md2Transclude']
})
export class Md2Transclude {

  private _md2Transclude: TemplateRef<any>;

  constructor(public viewRef: ViewContainerRef) { }

  private set md2Transclude(templateRef: TemplateRef<any>) {
    this._md2Transclude = templateRef;
    if (templateRef) {
      this.viewRef.createEmbeddedView(templateRef);
    }
  }

  private get md2Transclude() {
    return this._md2Transclude;
  }
}
