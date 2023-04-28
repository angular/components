import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {TestComponentsModule} from '@angular/cdk/testing/tests';

@Component({
  selector: 'component-harness-e2e',
  template: `<test-main></test-main>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TestComponentsModule],
})
export class ComponentHarnessE2e {}
