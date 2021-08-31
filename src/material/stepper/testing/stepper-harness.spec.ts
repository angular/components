import {MatStepperModule} from '@angular/material/stepper';
import {runHarnessTests} from '@angular/material/stepper/testing/shared.spec';

import {MatStepperNextHarness, MatStepperPreviousHarness} from './stepper-button-harnesses';
import {MatStepperHarness} from './stepper-harness';

describe('Non-MDC-based MatStepperHarness', () => {
  runHarnessTests(
      MatStepperModule, MatStepperHarness, MatStepperNextHarness, MatStepperPreviousHarness);
});
