import {Component, Input} from '@angular/core';


@Component({
  selector: 'example-viewer',
  template: 'EXAMPLE: {{example}}',
})
export class ExampleViewer {
  @Input()
  example: string;
}
