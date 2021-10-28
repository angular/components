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
   * The button becomes disabled if the user hovers over the button before the StackBlitz
   * is ready for opening. After the StackBlitz is ready, the button becomes enabled again.
   *
   * The StackBlitz preparation usually happens extremely quickly, but we handle the case of the
   * StackBlitz not yet being ready for people with poor network connections or slow devices.
   */
  isDisabled = false;

  exampleData: ExampleData | undefined;

  /**
   * Function that can be invoked to open the StackBlitz window synchronously.
   *
   * **Note**: All files for the StackBlitz need to be loaded and prepared ahead-of-time,
   * because doing so on-demand will cause Firefox to block the submit as a popup as the
   * form submission (used internally to create the StackBlitz) didn't happen within the
   * same tick as the user interaction.
   */
  private _openStackBlitzFn: (() => void) | null = null;

  @HostListener('mouseover')
  onMouseOver() {
    this.isDisabled = this._openStackBlitzFn === null;
  }

  @Input()
  set example(example: string | undefined) {
    if (example) {
      const isTest = example.includes('harness');
      this.exampleData = new ExampleData(example);
      this.stackBlitzWriter.createStackBlitzForExample(example, this.exampleData, isTest)
        .then(openFn => {
          this._openStackBlitzFn = openFn;
          this.isDisabled = false;
        });
    } else {
      this.isDisabled = true;
    }
  }

  constructor(private stackBlitzWriter: StackBlitzWriter) {}

  async openStackBlitz(): Promise<void> {
    this._openStackBlitzFn?.();
  }
}

@NgModule({
  imports: [MatTooltipModule, MatButtonModule, MatIconModule],
  exports: [StackBlitzButton],
  declarations: [StackBlitzButton],
  providers: [StackBlitzWriter],
})
export class StackBlitzButtonModule {}
