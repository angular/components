import {Component, Input, NgModule} from '@angular/core';
import {StackblitzWriter} from './stackblitz-writer';
import {ExampleData} from '@angular/material-examples';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'stackblitz-button',
  templateUrl: './stackblitz-button.html',
  providers: [StackblitzWriter],
  host: {
    '(mouseover)': 'isDisabled = !stackblitzForm'
  }
})
export class StackblitzButton {
  /**
   * The button becomes disabled if the user hovers over the button before the stackblitz form
   * is created. After the form is created, the button becomes enabled again.
   * The form creation usually happens extremely quickly, but we handle the case of the
   * stackblitz not yet being ready for people with poor network connections or slow devices.
   */
  isDisabled = false;
  stackblitzForm: HTMLFormElement;

  @Input()
  set example(example: string) {
    const exampleData = new ExampleData(example);

    if (example) {
      this.stackblitzWriter.constructStackblitzForm(exampleData).then(stackblitzForm => {
        this.stackblitzForm = stackblitzForm;
        this.isDisabled = false;
      });
    } else {
      this.isDisabled = true;
    }
  }

  constructor(private stackblitzWriter: StackblitzWriter) {}

  openStackblitz(): void {
    // When the form is submitted, it must be in the document body. The standard of forms is not
    // to submit if it is detached from the document. See the following chromium commit for
    // more details:
    // https://chromium.googlesource.com/chromium/src/+/962c2a22ddc474255c776aefc7abeba00edc7470%5E!
    document.body.appendChild(this.stackblitzForm);
    this.stackblitzForm.submit();
    document.body.removeChild(this.stackblitzForm);
  }
}

@NgModule({
  imports: [MatTooltipModule, MatButtonModule, MatIconModule],
  exports: [StackblitzButton],
  declarations: [StackblitzButton],
  providers: [StackblitzWriter],
})
export class StackblitzButtonModule {}
