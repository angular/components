import {MatProgressBarModule} from '@angular/material/legacy-progress-bar';
import {runHarnessTests} from '@angular/material/legacy-progress-bar/testing/shared.spec';
import {MatProgressBarHarness} from './progress-bar-harness';

describe('MatProgressBarHarness', () => {
  runHarnessTests(MatProgressBarModule, MatProgressBarHarness);
});
