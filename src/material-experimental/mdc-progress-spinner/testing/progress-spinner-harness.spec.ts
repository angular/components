import {runHarnessTests} from '@angular/material/progress-spinner/testing/shared.spec';

import {MatProgressSpinnerModule} from '../index';

import {MatProgressSpinnerHarness} from './progress-spinner-harness';

describe('MDC-based MatProgressSpinnerHarness', () => {
  runHarnessTests(MatProgressSpinnerModule, MatProgressSpinnerHarness);
});
