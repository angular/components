import {Component, Input, NgModule, NgZone} from '@angular/core';
import {ExampleData} from '@angular/components-examples';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {StackBlitzWriter} from './stack-blitz-writer';
import {MatLegacySnackBar as MatSnackBar, MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';

@Component({
  selector: 'stack-blitz-button',
  templateUrl: './stack-blitz-button.html',
})
export class StackBlitzButton {
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

  @Input()
  set example(exampleId: string | undefined) {
    if (exampleId) {
      this.exampleData = new ExampleData(exampleId);
      this._prepareStackBlitzForExample(exampleId, this.exampleData);
    } else {
      this.exampleData = undefined;
      this._openStackBlitzFn = null;
    }
  }

  constructor(
    private stackBlitzWriter: StackBlitzWriter,
    private ngZone: NgZone,
    private snackBar: MatSnackBar) {}

  openStackBlitz(): void {
    if (this._openStackBlitzFn) {
      this._openStackBlitzFn();
    } else {
      this.snackBar.open('StackBlitz is not ready yet. Please try again in a few seconds.',
          undefined, {duration: 5000});
    }
  }

  private _prepareStackBlitzForExample(exampleId: string, data: ExampleData): void {
    this.ngZone.runOutsideAngular(async () => {
      const isTest = exampleId.includes('harness');
      this._openStackBlitzFn = await this.stackBlitzWriter
        .createStackBlitzForExample(exampleId, data, isTest);
    });
  }
}

@NgModule({
  imports: [MatTooltipModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  exports: [StackBlitzButton],
  declarations: [StackBlitzButton],
  providers: [StackBlitzWriter],
})
export class StackBlitzButtonModule {}
