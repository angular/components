import {Component, Input, NgModule} from '@angular/core';
import {PlunkerWriter} from './plunker-writer';
import {ExampleData} from '@angular/material-examples';
import {MdButtonModule, MdIconModule, MdTooltipModule} from '@angular/material';

@Component({
  selector: 'plunker-button',
  templateUrl: './plunker-button.html',
  providers: [PlunkerWriter],
  host: {
    '(mouseover)': 'isDisabled = !plunkerForm'
  }
})
export class PlunkerButton {
  /**
   * The button becomes disabled if the user hovers over the button before the plunker form
   * is created. After the form is created, the button becomes enabled again.
   * The form creation usually happens extremely quickly, but we handle the case of the
   * plunker not yet being ready for people will poor network connections or slow devices.
   */
  isDisabled: boolean = false;
  plunkerForm: HTMLFormElement;

  @Input()
  set example(example: string) {
    const exampleData = new ExampleData(example);

    this.plunkerWriter.constructPlunkerForm(exampleData).then(plunkerForm => {
      this.plunkerForm = plunkerForm;
      this.isDisabled = false;
    });
  }

  constructor(private plunkerWriter: PlunkerWriter) {}

  openPlunker(): void {
    // When the form is submitted, it must be in the document body. The standard of forms is not
    // to submit if it is detached from the document. See the following chromium commit for
    // more details:
    // https://chromium.googlesource.com/chromium/src/+/962c2a22ddc474255c776aefc7abeba00edc7470%5E!
    document.body.appendChild(this.plunkerForm);
    this.plunkerForm.submit();
    document.body.removeChild(this.plunkerForm);
  }
}

@NgModule({
  imports: [MdTooltipModule, MdButtonModule, MdIconModule],
  exports: [PlunkerButton],
  declarations: [PlunkerButton],
  providers: [PlunkerWriter],
})
export class PlunkerButtonModule {}
