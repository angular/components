import {runHarnessTests} from '@angular/material/progress-bar/testing/shared.spec';

import {MatProgressBarModule} from '../index';

import {MatProgressBarHarness} from './progress-bar-harness';

describe('MDC-based MatProgressBarHarness', () => {
  runHarnessTests(MatProgressBarModule, MatProgressBarHarness as any);
});
