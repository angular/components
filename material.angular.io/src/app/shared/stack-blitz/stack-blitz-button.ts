import {Component, Input, NgZone} from '@angular/core';
import {ExampleData} from '@angular/components-examples';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {StackBlitzWriter} from './stack-blitz-writer';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'stack-blitz-button',
  templateUrl: './stack-blitz-button.html',
  standalone: true,
  imports: [MatIconButton, MatTooltip, MatIcon],
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
    private snackBar: MatSnackBar,
  ) {}

  openStackBlitz(): void {
    if (this._openStackBlitzFn) {
      this._openStackBlitzFn();
    } else {
      this.snackBar.open(
        'StackBlitz is not ready yet. Please try again in a few seconds.',
        undefined,
        {duration: 5000},
      );
    }
  }

  private _prepareStackBlitzForExample(exampleId: string, data: ExampleData): void {
    this.ngZone.runOutsideAngular(async () => {
      const isTest = exampleId.includes('harness');
      this._openStackBlitzFn = await this.stackBlitzWriter.createStackBlitzForExample(
        exampleId,
        data,
        isTest,
      );
    });
  }
}
