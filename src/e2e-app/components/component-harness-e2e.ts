import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {TestMainComponent} from '@angular/cdk/testing/tests';

@Component({
  selector: 'component-harness-e2e',
  template: `<test-main></test-main>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TestMainComponent],
})
export class ComponentHarnessE2e {}
