import {Component, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

/**
 * @title Buttons with progress indicators
 */
@Component({
  selector: 'button-progress-indicator-example',
  templateUrl: 'button-progress-indicator-example.html',
  imports: [MatButton, MatProgressSpinner],
})
export class ButtonProgressIndicatorExample {
  protected readonly showProgress = signal(false);

  protected toggleShowProgress() {
    this.showProgress.update(show => !show);
  }
}
