import {Component} from '@angular/core';
import {TestMainComponent} from '../../cdk/testing/tests';

@Component({
  selector: 'component-harness-e2e',
  template: `
    <button id="reset-state" (click)="reset()">Reset state</button>

    @if (isShown) {
      <test-main></test-main>
    }
  `,
  imports: [TestMainComponent],
})
export class ComponentHarnessE2e {
  protected isShown = true;

  /**
   * Resets the test component state without the need to refresh the page.
   * Used by Webdriver integration tests.
   */
  protected reset(): void {
    this.isShown = false;
    setTimeout(() => (this.isShown = true), 100);
  }
}
