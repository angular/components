import {CdkTextareaAutosize, TextFieldModule} from '@angular/cdk/text-field';
import {afterNextRender, Component, inject, Injector, ViewChild} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

/** @title Programmatically resizing an autosize textarea */
@Component({
  selector: 'text-field-autosize-textarea-programmatic-example',
  templateUrl: './text-field-autosize-textarea-programmatic-example.html',
  styleUrl: './text-field-autosize-textarea-programmatic-example.css',
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, TextFieldModule],
})
export class TextFieldAutosizeTextareaProgrammaticExample {
  private _injector = inject(Injector);

  @ViewChild('autosize') autosize!: CdkTextareaAutosize;

  triggerResize() {
    // Wait for content to render, then trigger textarea resize.
    afterNextRender(
      () => {
        this.autosize.resizeToFitContent(true);
      },
      {
        injector: this._injector,
      },
    );
  }
}
