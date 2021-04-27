import {Component, HostListener, Input, NgModule} from '@angular/core';
import {ExampleData} from '@angular/components-examples';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {StackBlitzWriter} from './stack-blitz-writer';

@Component({
  selector: 'stack-blitz-button',
  templateUrl: './stack-blitz-button.html',
})
export class StackBlitzButton {
  /**
   * The button becomes disabled if the user hovers over the button before the StackBlitz form
   * is created. After the form is created, the button becomes enabled again.
   * The form creation usually happens extremely quickly, but we handle the case of the
   * StackBlitz not yet being ready for people with poor network connections or slow devices.
   */
  isDisabled = false;
  exampleData: ExampleData | undefined;

  /**
   * Form used to submit the data to Stackblitz.
   * Important! it needs to be constructed ahead-of-time, because doing so on-demand
   * will cause Firefox to block the submit as a popup, because it didn't happen within
   * the same tick as the user interaction.
   */
  private _stackBlitzForm: HTMLFormElement | undefined;

  @HostListener('mouseover')
  onMouseOver() {
    this.isDisabled = !this._stackBlitzForm;
  }

  @Input()
  set example(example: string | undefined) {
    if (example) {
      const isTest = example.includes('harness');
      this.exampleData = new ExampleData(example);
      this.stackBlitzWriter.constructStackBlitzForm(example, this.exampleData, isTest)
        .then(form => {
          this._stackBlitzForm = form;
          this.isDisabled = false;
        });
    } else {
      this.isDisabled = true;
    }
  }

  constructor(private stackBlitzWriter: StackBlitzWriter) {}

  openStackBlitz(): void {
    // When the form is submitted, it must be in the document body. The standard of forms is not
    // to submit if it is detached from the document. See the following chromium commit for
    // more details:
    // https://chromium.googlesource.com/chromium/src/+/962c2a22ddc474255c776aefc7abeba00edc7470%5E!
    if (this._stackBlitzForm) {
      document.body.appendChild(this._stackBlitzForm);
      this._stackBlitzForm.submit();
      document.body.removeChild(this._stackBlitzForm);
    }
  }
}

@NgModule({
  imports: [MatTooltipModule, MatButtonModule, MatIconModule],
  exports: [StackBlitzButton],
  declarations: [StackBlitzButton],
  providers: [StackBlitzWriter],
})
export class StackBlitzButtonModule {}
