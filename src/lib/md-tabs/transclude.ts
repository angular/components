import {
  Directive,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mdTransclude]',
  properties: ['mdTransclude']
})
export class MdTransclude {

  private _mdTransclude: TemplateRef<any>;

  constructor(public viewRef: ViewContainerRef) { }

  private set mdTransclude(templateRef: TemplateRef<any>) {
    this._mdTransclude = templateRef;
    if (templateRef) {
      this.viewRef.createEmbeddedView(templateRef);
    }
  }

  private get mdTransclude() {
    return this._mdTransclude;
  }
}
