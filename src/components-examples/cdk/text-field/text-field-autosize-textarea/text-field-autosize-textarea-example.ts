import {CdkTextareaAutosize, TextFieldModule} from '@angular/cdk/text-field';
import {afterNextRender, Component, inject, Injector, ViewChild} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

/** @title Auto-resizing textarea */
@Component({
  selector: 'text-field-autosize-textarea-example',
  templateUrl: './text-field-autosize-textarea-example.html',
  styleUrl: './text-field-autosize-textarea-example.css',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, TextFieldModule],
})
export class TextFieldAutosizeTextareaExample {
  private _injector = inject(Injector);

  @ViewChild('autosize') autosize: CdkTextareaAutosize;

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
